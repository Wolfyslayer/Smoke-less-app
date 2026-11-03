const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync('src/guestMerge.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleExports={};
vm.runInNewContext(source,{exports:moduleExports});
const preview=moduleExports.previewGuestMerge;
const entry=(id,at='2026-11-01T10:00:00Z')=>({id,at});
const data=(entries=[],cravings=[],checkins=[],profile=null)=>({entries,cravings,checkins,profile});

test('merges new guest records but keeps existing account records and plan',()=>{
 const plan={mode:'quit',baseline:20};
 const account=data([entry('a')],[],[],plan);
 const guest=data([entry('a'),entry('b')],[{id:'c',at:'2026-11-01T10:00:00Z',intensity:2,trigger:'stress'}],[{date:'2026-11-01',complete:true,smokeFree:false}]);
 const result=preview(account,guest);
 assert.deepEqual(result.added,{entries:1,cravings:1,checkins:1});
 assert.equal(result.merged.profile,plan);
 assert.deepEqual(Array.from(result.merged.entries,x=>x.id),['a','b']);
 assert.equal(result.conflicts.length,0);
});
test('conflicting IDs are reported, not overwritten',()=>{
 const result=preview(data([entry('a')]),data([entry('a','2026-11-02T10:00:00Z')]));
 assert.equal(result.conflicts.length,1);
 assert.equal(result.merged.entries[0].at,'2026-11-01T10:00:00Z');
});
test('repeat merge adds no duplicate records',()=>{
 const original=data([entry('a')]);
 const once=preview(original,data([entry('b')]));
 const twice=preview(once.merged,data([entry('b')]));
 assert.equal(twice.added.entries,0);
 assert.equal(twice.merged.entries.length,2);
});
