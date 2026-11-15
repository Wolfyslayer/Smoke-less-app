const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function setup(raw,failRead=false){let writes=0;const scope={exports:{},require:id=>{
 if(id==='@react-native-async-storage/async-storage')return {__esModule:true,default:{getItem:async()=>{if(failRead)throw Error('disk');return raw;},setItem:async()=>writes++}};
 if(id==='./domain')return {validateData:v=>!!v&&v.profile===null&&Array.isArray(v.entries)&&Array.isArray(v.cravings)&&Array.isArray(v.checkins)};
 throw Error(id);
 }};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/storage.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,scope);return {...scope.exports,writes:()=>writes};}
test('only a missing guest record creates empty history, with fresh arrays each time',async()=>{const f=setup(null),a=await f.load(),b=await f.load();assert.equal(a.entries.length,0);assert.notEqual(a.entries,b.entries);assert.equal(f.writes(),0);});
test('read errors and corrupted guest records surface without falling back to an empty plan or overwriting bytes',async()=>{for(const [raw,fail] of [[null,true],['broken',false],['{}',false],['',false]]){const f=setup(raw,fail);await assert.rejects(f.load(),/Ingen data har ändrats/);assert.equal(f.writes(),0);}});
test('valid guest history round-trips and invalid writes are rejected before storage',async()=>{const data={profile:null,entries:[{id:'keep'}],cravings:[],checkins:[]},f=setup(JSON.stringify(data));assert.equal(JSON.stringify(await f.load()),JSON.stringify(data));await f.save(data);assert.equal(f.writes(),1);await assert.rejects(f.save({}),/Ogiltig/);assert.equal(f.writes(),1);});
