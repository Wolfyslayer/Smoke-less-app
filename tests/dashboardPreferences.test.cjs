const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const code=ts.transpileModule(fs.readFileSync('src/dashboardPreferences.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const safetyContext={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/accountDeletionSafety.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,safetyContext);
const context={exports:{},require:id=>{if(id==='./accountDeletionSafety')return safetyContext.exports;throw Error(id);}};
vm.runInNewContext(code,context);
const {defaultDashboardPreferences:defaults,normalizeDashboardPreferences:normalize,toggleDashboardCard:toggle,moveDashboardCard:move,createDashboardStore,dashboardStorageKey:key}=context.exports;
const plain=value=>JSON.parse(JSON.stringify(value));

test('dashboard defaults are independent and unknown versions recover safely',()=>{
 const a=defaults();a.cards.length=0;
 assert.equal(defaults().cards.length,4);
 for(const value of [null,{},'bad',{version:2,cards:[]},{version:1,cards:null}])assert.deepEqual(plain(normalize(value)),plain(defaults()));
 assert.deepEqual(plain(normalize({version:1,cards:['savings','bad','goal','savings',null]})),{version:1,cards:['savings','goal']});
 assert.deepEqual(plain(normalize({version:1,cards:[]})),{version:1,cards:[]});
});
test('card selection and order remain immutable and restore exact defaults',()=>{
 const initial=defaults(),hidden=toggle(initial,'goal'),enabled=toggle(hidden,'goal');
 assert.equal(initial.cards[0],'goal');
 assert.equal(enabled.cards.at(-1),'goal');
 assert.deepEqual(plain(move(enabled,'goal',-1).cards),['time','savings','goal','progress']);
 assert.deepEqual(plain(move(initial,'goal',-1)),plain(initial));
 assert.deepEqual(plain(move(initial,'cravings',1)),plain(initial));
 assert.deepEqual(plain(defaults().cards),['goal','time','savings','progress']);
});
test('guest and accounts persist independently without touching history',async()=>{
 const records=new Map([['smoke-less-v6','history-sentinel']]);
 const store=createDashboardStore({getItem:async k=>records.get(k)??null,setItem:async(k,v)=>records.set(k,v)});
 for(const [uid,cards] of [[null,['goal']],['guest',['time']],['user/a',['savings']]])await store.save(uid,{version:1,cards});
 assert.deepEqual(plain((await store.load(null)).cards),['goal']);
 assert.deepEqual(plain((await store.load('guest')).cards),['time']);
 assert.deepEqual(plain((await store.load('user/a')).cards),['savings']);
 assert.equal(records.get('smoke-less-v6'),'history-sentinel');
 assert.notEqual(key(null),key('guest'));
 assert.notEqual(key('a/b'),key('a%2Fb'));
 await store.save('guest',defaults());
 assert.deepEqual(plain((await store.load(null)).cards),['goal']);
});
test('rapid edits are serialized and returning to an account waits for its pending save',async()=>{
 let release;
 const gate=new Promise(r=>release=r),records=new Map();let writes=0;
 const store=createDashboardStore({getItem:async k=>records.get(k)??null,setItem:async(k,v)=>{if(++writes===1)await gate;records.set(k,v);}});
 const first=store.save('a',{version:1,cards:['goal']}),last=store.save('a',{version:1,cards:['time']});
 const loaded=store.load('a');
 await store.save('b',{version:1,cards:['savings']});
 release();await Promise.all([first,last]);
 assert.deepEqual(plain((await loaded).cards),['time']);
 assert.deepEqual(plain((await store.load('b')).cards),['savings']);
});
test('read failures surface and failed saves do not poison later edits',async()=>{
 let failed=true;
 const store=createDashboardStore({getItem:async()=>{throw Error('offline storage');},setItem:async()=>{if(failed){failed=false;throw Error('disk full');}}});
 await assert.rejects(store.load(null),/offline storage/);
 await assert.rejects(store.save(null,defaults()),/disk full/);
 await store.save(null,{version:1,cards:[]});
});
test('malformed disk data recovers to defaults without an automatic overwrite',async()=>{
 let writes=0;
 const store=createDashboardStore({getItem:async()=>'{broken',setItem:async()=>writes++});
 assert.deepEqual(plain(await store.load(null)),plain(defaults()));
 assert.equal(writes,0);
});
test('account transition hides old layout and editor retains labelled accessible controls',()=>{
 const hook=fs.readFileSync('src/hooks/useDashboardPreferences.ts','utf8');
 assert.match(hook,/state\.key===key\?state\.value:defaultDashboardPreferences\(\)/);
 assert.match(hook,/currentKey\.current===key&&generation\.current===request/);
 const editor=fs.readFileSync('src/components/DashboardEditor.tsx','utf8');
 assert.match(editor,/accessibilityRole="switch"/);
 assert.match(editor,/minHeight:48,minWidth:48/);
 assert.match(editor,/moveDashboardCard\(value,id,direction\)/);
});
