const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');

function loadModule(file,deps){
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};
 vm.runInNewContext(js,{exports,require:id=>{if(!(id in deps))throw Error('Unexpected dependency '+id);return deps[id];}},{filename:file});
 return exports;
}
function setup(){
 const values=new Map();const events=[];let failBackup=false;let onWrite=()=>{};
 const asyncStorage={
  async getItem(k){events.push('get:'+k);return values.has(k)?values.get(k):null},
  async setItem(k,v){events.push('set:'+k);if(failBackup&&k.startsWith('smoke-less-v6-migration-backup:'))throw Error('disk full');onWrite(k);values.set(k,v)}
 };
 const mod=loadModule('src/accountMigration.ts',{
  '@react-native-async-storage/async-storage':{default:asyncStorage},
  './domain':{validateData:x=>!!x&&Array.isArray(x.entries)},
  './accountStorage':{accountStorageKey:uid=>{if(!/^[a-z0-9]+$/i.test(uid))throw Error('bad uid');return 'account:'+uid}}
 });
 return {migrate:mod.migrateGuestHistoryWithBackup,values,events,setFailBackup:v=>{failBackup=v},setOnWrite:fn=>{onWrite=fn}};
}
const guest=()=>({profile:null,entries:[{id:'guest',at:'2026-10-31T10:00:00Z'}],cravings:[],checkins:[]});

test('explicit consent required and no account data written without it',async()=>{
 const x=setup();
 await assert.rejects(x.migrate('alice',guest(),()=> 'alice',false),/godkännande/);
 assert.equal(x.values.size,0);
});
test('copies guest history with backup, never deletes guest',async()=>{
 const x=setup();x.values.set('smoke-less-v6','original-guest');
 const result=await x.migrate('alice',guest(),()=> 'alice',true);
 assert.equal(result.status,'copied');
 assert.equal(x.values.get('smoke-less-v6'),'original-guest');
 assert.deepEqual(JSON.parse(x.values.get('account:alice')),guest());
 assert.deepEqual(JSON.parse(x.values.get(result.backupKey)),guest());
 assert.ok(x.events.indexOf('set:'+result.backupKey)<x.events.indexOf('set:account:alice'));
});
test('existing destination is never overwritten',async()=>{
 const x=setup();x.values.set('account:alice','existing');
 const result=await x.migrate('alice',guest(),()=> 'alice',true);
 assert.equal(result.status,'already-exists');
 assert.equal(x.values.get('account:alice'),'existing');
 assert.equal(x.events.filter(e=>e.startsWith('set:')).length,0);
});
test('failed backup aborts before account write',async()=>{
 const x=setup();x.setFailBackup(true);
 await assert.rejects(x.migrate('alice',guest(),()=> 'alice',true),/disk full/);
 assert.equal(x.values.has('account:alice'),false);
});
test('account change during backup aborts destination write',async()=>{
 const x=setup();let uid='alice';
 x.setOnWrite(k=>{if(k.startsWith('smoke-less-v6-migration-backup:'))uid='bob'});
 await assert.rejects(x.migrate('alice',guest(),()=>uid,true),/Kontot ändrades/);
 assert.equal(x.values.has('account:alice'),false);
});
test('account appearing during backup is preserved',async()=>{
 const x=setup();
 x.setOnWrite(k=>{if(k.startsWith('smoke-less-v6-migration-backup:'))x.values.set('account:alice','new-existing')});
 const result=await x.migrate('alice',guest(),()=> 'alice',true);
 assert.equal(result.status,'already-exists');
 assert.equal(x.values.get('account:alice'),'new-existing');
});
