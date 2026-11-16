const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function fixture(){
 const states=[],refs=[],effects=[],timers=new Map();let si,ri,ei,rendered,uid='account-a',id=0,resolveSync,listenerError;
 const react={useState:initial=>{const n=si++;if(!(n in states))states[n]=initial;return [states[n],value=>{states[n]=typeof value==='function'?value(states[n]):value}]},useRef:initial=>{const n=ri++;return refs[n]??(refs[n]={current:initial})},useEffect:(fn,deps)=>{const n=ei++,old=effects[n];if(old&&deps.every((x,i)=>Object.is(x,old.deps[i])))return;old?.cleanup?.();effects[n]={deps,cleanup:fn()}}};
 const deps={react,'../cloudSync':{syncCloudData:()=>new Promise(resolve=>resolveSync=resolve),resetObservedCloudPlans(){},subscribeCloudChanges:(_,change,error)=>{listenerError=error;return()=>{}}},'../storage':{backupBeforeCloudImport:async()=>{}},'./useAppResumeTrigger':{useAppResumeTrigger(){}},'../userMessage.cjs':require('../src/userMessage.cjs')};
 const scope={exports:{},require:key=>{assert(key in deps,key);return deps[key]},setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:n=>timers.delete(n)};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/hooks/useCloudSync.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,scope);
 const data={entries:[]},dataRef={current:data};
 const render=()=>{si=ri=ei=0;rendered=scope.exports.useCloudSync({data,dataRef,setData:()=>{},ready:true,sessionUser:uid?{uid}:null,migrationBusy:false,cloudPreviewBusy:false,verifyCurrentUid:()=>uid});return rendered};
 return {render,account:value=>uid=value,start:()=>{const fn=[...timers.values()].at(-1);assert(fn);timers.clear();fn()},finish:async()=>{resolveSync(data);await new Promise(setImmediate)},error:()=>listenerError(new Error('private-sdk-token'))};
}
test('a successful account sync cannot authorize onboarding or migration for a different account',async()=>{
 const f=fixture();f.render();f.start();await f.finish();assert.equal(f.render().syncStatus,'Historiken är synkroniserad');
 f.account('account-b');assert.equal(f.render().syncStatus,'');assert.equal(f.render().syncPhase,'idle');
});
test('semantic sync state follows retry, success, listener failure and guest transition',async()=>{
 const f=fixture();assert.equal(f.render().syncPhase,'idle');f.start();assert.equal(f.render().syncPhase,'syncing');await f.finish();assert.equal(f.render().syncPhase,'synced');
 f.error();assert.equal(f.render().syncPhase,'error');assert.doesNotMatch(f.render().syncStatus,/private-sdk-token/);f.render().retrySync();assert.equal(f.render().syncPhase,'idle');
 f.account(null);assert.equal(f.render().syncStatus,'');assert.equal(f.render().syncPhase,'idle');
});
test('completion from the previous account cannot publish ready status into the new account',async()=>{
 const f=fixture();f.render();f.start();f.account('account-b');f.render();await f.finish();assert.equal(f.render().syncPhase,'idle');assert.equal(f.render().syncStatus,'');
 f.start();await f.finish();assert.equal(f.render().syncPhase,'synced');
});
