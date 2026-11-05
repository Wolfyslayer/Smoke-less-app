const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync('src/widgets/widgetPreferences.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const map=new Map();
const native={published:[],clears:0,publishNativeWidget:async snapshot=>{native.published.push(snapshot)},clearNativeWidget:async()=>{native.clears++}};
const storage={getItem:async key=>map.has(key)?map.get(key):null,setItem:async(k,v)=>{map.set(k,v)},removeItem:async key=>{map.delete(key)}};
const makeWidgetSnapshot=({enabled,date,todayCount,dailyGoal})=>enabled?{version:1,date,todayCount,dailyGoal,remaining:Math.max(0,dailyGoal-todayCount),progressPercent:dailyGoal?Math.min(100,Math.round(todayCount/dailyGoal*100)):todayCount?100:0}:null;
const readWidgetSnapshot=(x,date)=>x?.date===date?x:null;
const dayKey=d=>d.toISOString().slice(0,10);
const target=p=>p.baseline;
const context={exports:{},Date,JSON,Number,Promise,require:name=>{
 if(name==='@react-native-async-storage/async-storage')return storage;
 if(name==='./nativeWidgetBridge')return native;
 if(name==='../domain')return {dayKey,target};
 if(name==='../domain/widgetSnapshot')return {makeWidgetSnapshot,readWidgetSnapshot};
 throw Error(name);
}};
vm.runInNewContext(js,context);
const {widgetOptedIn,setWidgetOptIn,refreshWidgetSnapshot,loadWidgetSnapshot,clearWidgetPrivacy}=context.exports;
const now=new Date('2026-11-05T12:00:00.000Z');
const data={profile:{baseline:19},entries:[{at:'2026-11-05T09:00:00Z'},{at:'2026-11-04T09:00:00Z'}]};
test('widget remains opt-out until user enables it',async()=>{
 map.clear();assert.equal(await widgetOptedIn(),false);
 assert.equal(await refreshWidgetSnapshot(data,now),null);
 assert.equal(map.has('smokeless:widget-snapshot:v1'),false);
});
test('approved snapshot has only daily aggregates and no account data',async()=>{
 map.clear();await setWidgetOptIn(true);
 const card=await refreshWidgetSnapshot({...data,email:'private@example.com'},now);
 assert.equal(card.remaining,18);assert.equal(card.progressPercent,5);
 assert.doesNotMatch(map.get('smokeless:widget-snapshot:v1'),/private|email|entries/);
 assert.equal((await loadWidgetSnapshot(now)).remaining,18);
 assert.equal(await loadWidgetSnapshot(new Date('2026-11-06T12:00:00Z')),null);
});
test('disabling or changing account clears both preference and snapshot',async()=>{
 map.clear();await setWidgetOptIn(true);await refreshWidgetSnapshot(data,now);
 await setWidgetOptIn(false);assert.equal(map.size,0);
 await setWidgetOptIn(true);await refreshWidgetSnapshot(data,now);
 await clearWidgetPrivacy();assert.equal(map.size,0);
});
test('without a profile the widget must not misrepresent missing data as a smoke-free day',async()=>{
 map.clear();await setWidgetOptIn(true);
 assert.equal(await refreshWidgetSnapshot({profile:null,entries:[]},now),null);
 assert.equal(await loadWidgetSnapshot(now),null);
});

test('native widget publishes approved aggregates and clears before opt-out',async()=>{
 map.clear();native.published.length=0;native.clears=0;
 await setWidgetOptIn(true);
 await refreshWidgetSnapshot(data,now);
 assert.equal(native.published.length,1);
 assert.equal(native.published[0].todayCount,1);
 await setWidgetOptIn(false);
 assert.ok(native.clears>=1);
 assert.equal(map.size,0);
});

test('pending native publish cannot overwrite a subsequent privacy clear',async()=>{
 map.clear();native.published.length=0;
 await setWidgetOptIn(true);
 let release;
 let launcherSnapshot=null;
 const original=native.publishNativeWidget;
 const originalClear=native.clearNativeWidget;
 native.clearNativeWidget=async()=>{launcherSnapshot=null;await originalClear()};
 native.publishNativeWidget=async snapshot=>{
  await new Promise(resolve=>{release=resolve});
  native.published.push(snapshot);
  launcherSnapshot=snapshot;
 };
 try{
  const refresh=refreshWidgetSnapshot(data,now);
  // Wait for the queued native write to begin.
  for(let i=0;i<20&&!release;i++)await new Promise(resolve=>setImmediate(resolve));
  assert.equal(typeof release,'function');
  const clear=clearWidgetPrivacy();
  release();
  await Promise.all([refresh,clear]);
  assert.equal(map.size,0);
  assert.ok(native.clears>0);
  assert.equal(launcherSnapshot,null,'privacy clear must be the final native operation');
 }finally{native.publishNativeWidget=original;native.clearNativeWidget=originalClear}
});
