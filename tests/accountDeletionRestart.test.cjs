const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function compile(file,deps){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,{exports,require:id=>{if(!(id in deps))throw Error(id);return deps[id];}});return exports;}
function mount(reset,restartOperation=async()=>{}){
 const slots=[],effects=[];let index=0,effectIndex=0,started=false,reads=0,closed=0;
 const react={useRef:value=>{const i=index++;return slots[i]??(slots[i]={current:value});},useState:value=>{const i=index++;if(!(i in slots))slots[i]=value;return [slots[i],next=>{slots[i]=typeof next==='function'?next(slots[i]):next;}];},useEffect:fn=>{if(!started)effects.push(fn);effectIndex++;}};
 const {useAccountDeletion}=compile('src/hooks/useAccountDeletion.ts',{'react':react,'@react-native-async-storage/async-storage':{__esModule:true,default:{getItem:async()=>{reads++;return null;}}},'../accountDeletionFlow':{createAccountDeletionFlow:()=>({})},'../accountDeletionSafety':{DeletionError:class extends Error{},localDeletionState:async()=>null,observeLocalDeletion:()=>()=>{}},'../accountDeletionBackend':{deletionEnabled:true,finishDeletionCacheReset:async()=>reset,restartDeletedApp:async()=>{closed++;return restartOperation();}},'../authService':{},'../cloudSync':{resetObservedCloudPlans:()=>{}}});
 const props={uid:null,verifyCurrentUid:()=>null,storageRef:{current:{}},busyElsewhere:false,ask:()=>{},showMessage:()=>{}};
 const render=()=>{index=0;effectIndex=0;return useAccountDeletion(props);};
 render();started=true;effects.forEach(fn=>fn());return {render,reads:()=>reads,closed:()=>closed};
}
test('new guest session after deletion stays blocked until the native process is restarted',async()=>{
 const f=mount('restart-required');await new Promise(resolve=>setImmediate(resolve));const state=f.render();
 assert.equal(state.ready,false);assert.equal(state.state.phase,'restart');assert.equal(state.state.confirmed,false);assert.equal(f.reads(),0,'never clear recovery or resume guest work in the terminated process');
 state.restartApp();await new Promise(resolve=>setImmediate(resolve));assert.equal(f.closed(),1);
});
test('fresh process may resume guest work only after the adapter completed cache reset',async()=>{
 const f=mount('ready');await new Promise(resolve=>setImmediate(resolve));assert.equal(f.render().ready,true);assert.equal(f.render().state.phase,'idle');assert.ok(f.reads()>0);
});
test('double tap starts only one native restart while the handover is pending',async()=>{
 let finish;const pending=new Promise(resolve=>{finish=resolve;}),f=mount('restart-required',()=>pending);
 await new Promise(resolve=>setImmediate(resolve));const state=f.render();state.restartApp();state.restartApp();assert.equal(f.closed(),1);finish();
});
test('missing native lifecycle fails closed instead of pretending Activity exit restarts Firestore',async()=>{
 const {DeletionError}=require('node:vm').runInNewContext('({DeletionError:class extends Error{}})');
 const off=compile('src/accountDeletionLifecycle.native.ts',{'react-native':{NativeModules:{}},'./accountDeletionSafety':{DeletionError}});
 await assert.rejects(off.markDeletionRestart());await assert.rejects(off.deletionRestartRequired());await assert.rejects(off.restartDeletedApp());
 const calls=[],native={markRestartRequired:async()=>calls.push('mark'),isRestartRequired:async()=>true,restartAfterDeletion:async()=>calls.push('close')};
 const on=compile('src/accountDeletionLifecycle.native.ts',{'react-native':{NativeModules:{SmokeLessDeletionLifecycle:native}},'./accountDeletionSafety':{DeletionError}});
 await on.markDeletionRestart();assert.equal(await on.deletionRestartRequired(),true);await on.restartDeletedApp();assert.deepEqual(calls,['mark','close']);
});
