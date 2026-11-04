const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const load=(path)=>{
 const source=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(source,{exports,Date,Math});return exports;
};
const {isCloudCraving,isCloudData}=load('src/cloudSchema.ts');
const {validateData}=load('src/domain.ts');
const {addCravingEntry}=load('src/utils/cravingActions.ts');
const base={id:'craving-1',at:'2026-11-04T12:00:00.000Z',intensity:3,trigger:'Stress'};

test('older craving records remain valid for local and cloud sync',()=>{
 assert.equal(isCloudCraving(base),true);
 assert.equal(isCloudData({profile:null,entries:[],cravings:[base],checkins:[]}),true);
 assert.equal(validateData({profile:null,entries:[],cravings:[base],checkins:[]}),true);
});
test('new SOS outcome fields are accepted including a negative result',()=>{
 for(const helpful of [true,false]){
  const record={...base,startIntensity:5,strategy:'Drick ett glas vatten',helpful};
  assert.equal(isCloudCraving(record),true);
  assert.equal(isCloudData({profile:null,entries:[],cravings:[record],checkins:[]}),true);
 }
});
test('invalid SOS outcome fields are rejected before cloud writes',()=>{
 const invalid=[{startIntensity:0},{startIntensity:6},{startIntensity:2.5},{strategy:''},{strategy:'x'.repeat(201)},{helpful:'yes'},{unknown:true}];
 for(const patch of invalid)assert.equal(isCloudCraving({...base,...patch}),false,JSON.stringify(patch));
});
test('SOS append retains history and optional outcome details',()=>{
 const original={profile:null,entries:[],cravings:[base],checkins:[]};
 const updated=addCravingEntry(original,2,'Vana',{startIntensity:4,strategy:'Byt miljö',helpful:false});
 assert.equal(original.cravings.length,1);
 assert.equal(updated.cravings.length,2);
 assert.equal(updated.cravings[0],base);
 assert.equal(updated.cravings[1].helpful,false);
 assert.equal(updated.cravings[1].strategy,'Byt miljö');
 assert.equal(isCloudCraving(updated.cravings[1]),true);
});
