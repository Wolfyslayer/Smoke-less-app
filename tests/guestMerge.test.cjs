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
 assert.deepEqual(JSON.parse(JSON.stringify(result.added)),{entries:1,cravings:1,checkins:1});
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


test('existing account plan wins over a newly created guest onboarding plan',()=>{
 const accountPlan={mode:'quit',baseline:5,startAt:'2026-09-01T10:00:00Z'};
 const onboardingPlan={mode:'reduce',baseline:30,startAt:'2026-11-03T10:00:00Z'};
 const account=data([entry('saved-account')],[],[],accountPlan);
 const guest=data([entry('guest-only')],[],[],onboardingPlan);
 const result=preview(account,guest);
 assert.equal(result.merged.profile,accountPlan);
 assert.equal(result.merged.profile.baseline,5);
 assert.deepEqual(Array.from(result.merged.entries,x=>x.id),['saved-account','guest-only']);
 assert.equal(guest.profile,onboardingPlan);
});

test('guest history import keeps the existing account quit plan and does not mutate source data',()=>{
 const accountPlan={mode:'reduce',baseline:8,speed:'balanced',plannedQuitAt:'2026-12-24T12:00:00.000Z'};
 const guestPlan={mode:'reduce',baseline:20,speed:'fast',plannedQuitAt:'2027-01-15T12:00:00.000Z'};
 const account=data([entry('account-only')],[],[],accountPlan);
 const guest=data([entry('guest-only')],[{id:'urge-1',at:'2026-11-02T10:00:00Z',intensity:3,trigger:'stress'}],[],guestPlan);
 const beforeAccount=JSON.stringify(account),beforeGuest=JSON.stringify(guest);
 const result=preview(account,guest);
 assert.equal(result.conflicts.length,0);
 assert.equal(result.merged.profile,accountPlan);
 assert.equal(result.merged.profile.plannedQuitAt,accountPlan.plannedQuitAt);
 assert.deepEqual(Array.from(result.merged.entries,x=>x.id),['account-only','guest-only']);
 assert.equal(result.added.entries,1);
 assert.equal(result.added.cravings,1);
 assert.equal(JSON.stringify(account),beforeAccount);
 assert.equal(JSON.stringify(guest),beforeGuest);
});

test('guest record ID conflict is surfaced while the account plan and conflicting entry remain intact',()=>{
 const plan={mode:'reduce',baseline:10,plannedQuitAt:'2026-12-01T12:00:00.000Z'};
 const account=data([entry('same','2026-11-01T10:00:00Z')],[],[],plan);
 const guest=data([entry('same','2026-11-02T10:00:00Z'),entry('new')],[],[],{mode:'quit',baseline:25});
 const result=preview(account,guest);
 assert.equal(result.conflicts.length,1);
 assert.equal(result.merged.profile,plan);
 assert.equal(result.merged.entries.find(x=>x.id==='same').at,'2026-11-01T10:00:00Z');
 assert.equal(result.merged.entries.find(x=>x.id==='new').id,'new');
 assert.equal(account.entries.length,1);
});
