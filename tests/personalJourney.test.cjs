const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(path){const context={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return context.exports;}
const {normalizeJourney:normalize,journeySupport:support,JOURNEY_PHASES:phases}=load('src/domain/personalJourney.ts');
const {createLocalPreferences:create}=load('src/localPreferences.ts');
const plain=v=>JSON.parse(JSON.stringify(v));
test('journey is opt-in, versioned and only stores a whitelisted phase',()=>{
 for(const value of [null,{},'early',{version:2,phase:'early'},{version:1,phase:'unknown'}])assert.equal(normalize(value).phase,null);
 for(const phase of phases)assert.equal(normalize({version:1,phase,email:'private',history:['secret']}).phase,phase);
 assert.deepEqual(Object.keys(normalize({version:1,phase:'early',email:'private'})).sort(),['phase','version']);
});
test('phase choices yield concrete voluntary steps without assuming health or smoke-free days',()=>{
 assert.equal(support(null,0,false).action,'plan');
 for(const phase of phases){const result=support(phase,0,false);assert.ok(['plan','sos','checkin'].includes(result.action));assert.match(result.checkin,/när du är klar/);}
 for(const phase of ['early','maintenance','quit-day']){const result=support(phase,1,false);assert.equal(result.action,'sos');assert.match(result.text,/inte bort tidigare framsteg/);}
 assert.match(support('early',0,true).checkin,/registreringar är avstämda/);
 assert.doesNotMatch(support('early',0,true).checkin,/rökfri dag/);
});
test('local choices are isolated by namespace and identity and never touch existing history',async()=>{
 const records=new Map([['smoke-less-v6','history']]),storage={getItem:async k=>records.get(k)??null,setItem:async(k,v)=>records.set(k,v)};
 const a=create('journey',storage,normalize),b=create('other',storage,normalize);
 await a.save(null,{version:1,phase:'early'});await a.save('guest',{version:1,phase:'maintenance'});await b.save(null,{version:1,phase:'preparing'});
 assert.equal((await a.load(null)).phase,'early');assert.equal((await a.load('guest')).phase,'maintenance');assert.equal((await a.load('new-user')).phase,null);
 assert.equal((await b.load(null)).phase,'preparing');assert.equal(records.get('smoke-less-v6'),'history');
 await a.save(null,{version:1,phase:null});assert.equal((await a.load(null)).phase,null);assert.equal((await a.load('guest')).phase,'maintenance');
});
test('pending choices cannot reorder saves and reopening waits for latest choice',async()=>{
 const records=new Map();let release,started;const began=new Promise(r=>started=r),gate=new Promise(r=>release=r);let n=0;
 const store=create('journey',{getItem:async k=>records.get(k)??null,setItem:async(k,v)=>{if(++n===1){started();await gate;}records.set(k,v);}},normalize);
 const first=store.save('a',{version:1,phase:'early'});await began;const last=store.save('a',{version:1,phase:'reducing'}),read=store.load('a');
 await store.save('b',{version:1,phase:'maintenance'});release();await Promise.all([first,last]);
 assert.equal((await read).phase,'reducing');assert.equal((await store.load('b')).phase,'maintenance');
});
test('read errors surface, corrupt data recovers without writes and a failed write can be retried',async()=>{
 let failed=true,writes=0;
 const store=create('journey',{getItem:async()=>'{bad',setItem:async()=>{writes++;if(failed){failed=false;throw Error('full');}}},normalize);
 assert.deepEqual(plain(await store.load(null)),{version:1,phase:null});assert.equal(writes,0);
 await assert.rejects(store.save(null,{version:1,phase:'early'}),/full/);await store.save(null,{version:1,phase:null});
 const broken=create('journey',{getItem:async()=>{throw Error('read');},setItem:async()=>{}},normalize);await assert.rejects(broken.load(null),/read/);
});
test('session identity guard and check-in use current data rather than a captured count',()=>{
 const hook=fs.readFileSync('src/hooks/useLocalPreferences.ts','utf8');assert.match(hook,/state\.key===key\?state\.value:store\.defaults\(\)/);assert.match(hook,/request===generation\.current/);
 const routes=fs.readFileSync('src/components/ProgressScreenRoutes.tsx','utf8');assert.match(routes,/countOn\(v\.entries\.filter/);assert.match(routes,/journeyPanel=\{journeyPanel\}/);
 const view=fs.readFileSync('src/components/PersonalJourney.tsx','utf8');assert.match(view,/accessibilityRole="radio"/);assert.match(view,/minHeight:48/);
});
test('registration with skipped questions uses the same check-in invalidation and duplicate guard',()=>{
 const hook=fs.readFileSync('src/hooks/useCigaretteRegistration.ts','utf8');
 assert.match(hook,/const record=\(skip:boolean\)=>\{/);
 assert.match(hook,/if\(busy\.current\)return/);
 assert.match(hook,/addCigaretteEntry\(v,skip\?null:feeling,skip\?null:cigTrigger\)/);
 assert.match(hook,/const skipRegister=\(\)=>record\(true\)/);
 const context={exports:{},require:()=>({dayKey:d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')})};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/utils/entryActions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const now=new Date(),day=context.require().dayKey(now),old={profile:null,entries:[],cravings:[],checkins:[{date:day,complete:true,smokeFree:true}]};
 const result=context.exports.addCigaretteEntry(old,null,null);
 assert.equal(result.entries.length,1);assert.equal(result.checkins.length,0);assert.equal(old.checkins.length,1);
 assert.equal(result.entries[0].feeling,undefined);assert.equal(result.entries[0].trigger,undefined);
});
