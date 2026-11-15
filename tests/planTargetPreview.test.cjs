const test=require('node:test');
process.env.TZ='Europe/Stockholm';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
function load(file,deps={}){const context={exports:{},Date,require:id=>{if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);return context.exports;}
const domain=load('src/domain.ts'),{previewDailyTarget:preview,applyDailyTargetPreview:apply}=load('src/planTargetPreview.ts',{'./domain':domain});
const profile=(patch={})=>({mode:'reduce',baseline:20,packSize:20,packPrice:80,speed:'balanced',startAt:'2026-10-01T12:00:00.000Z',dailyTargetOverride:null,...patch});
const now=new Date('2026-11-15T12:00:00Z');
const data=p=>({profile:p,entries:[{id:'a',at:now.toISOString()}],cravings:[{id:'b',at:now.toISOString(),intensity:3,trigger:'Stress'}],checkins:[{date:'2026-11-14',complete:true,smokeFree:false}]});

test('expired fixed dates cannot create an invalid profile through direct target adjustment',()=>{
 const p=profile({plannedQuitAt:'2026-11-14T12:00:00Z'});
 assert.equal(domain.adjustReductionTarget(p,5,now),p);
 assert.equal(preview(p,5,'keep',now),null);
 const draft=preview(p,5,'automatic',now);
 assert.ok(draft);assert.equal(draft.next.plannedQuitAt,undefined);
 assert.equal(domain.validateData(data(draft.next)),true);
 assert.equal(draft.goals[0].goal,5);
});
test('fixed future date can be retained or deliberately replaced by automatic pace',()=>{
 const p=profile({plannedQuitAt:'2026-12-01T12:00:00Z'});
 const fixed=preview(p,8,'keep',now),automatic=preview(p,8,'automatic',now);
 assert.equal(fixed.next.plannedQuitAt,p.plannedQuitAt);
 assert.equal(fixed.quitAt,'2026-12-01');
 assert.equal(automatic.next.plannedQuitAt,undefined);
 assert.notEqual(automatic.quitAt,fixed.quitAt);
 assert.equal(fixed.goals.length,7);assert.equal(fixed.goals[0].goal,8);
 assert.equal(fixed.next.baseline,p.baseline);assert.equal(fixed.next.originalStartAt,p.startAt);
});
test('confirmed preview preserves all latest history including records added during preview',()=>{
 const p=profile(),original=data(p),draft=preview(p,9,'automatic',now);
 const current={...original,entries:[...original.entries,{id:'new',at:now.toISOString()}]};
 const result=apply(current,draft,now);
 assert.notEqual(result,current);
 assert.equal(result.entries,current.entries);assert.equal(result.cravings,current.cravings);assert.equal(result.checkins,current.checkins);
 assert.equal(result.profile.originalStartAt,p.startAt);assert.equal(original.profile,p);
});
test('changed profiles and crossing a local calendar day invalidate confirmation',()=>{
 const p=profile(),draft=preview(p,9,'automatic',now),changed=data({...p,speed:'gentle'});
 assert.equal(apply(changed,draft,now),changed);
 const original=data(p),tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
 assert.equal(apply(original,draft,tomorrow),original);
});
test('direct quit, invalid values and impossible date ranges cannot generate a preview',()=>{
 assert.equal(preview(profile({mode:'quit'}),8,'keep',now),null);
 for(const n of [-1,.5,Infinity,NaN,Number.MAX_SAFE_INTEGER])assert.equal(preview(profile(),n,'automatic',now),null);
 assert.equal(preview(profile(),8,'unknown',now),null);
 const zero=preview(profile(),0,'automatic',now);assert.ok(zero);assert.equal(zero.goals[0].goal,0);
});
test('local-date handling works around both Swedish daylight-saving boundaries',()=>{
 for(const text of ['2026-03-28T12:00:00','2026-10-24T12:00:00']){
  const date=new Date(text),draft=preview(profile({startAt:'2026-01-01T12:00:00Z'}),9,'automatic',date);
  assert.equal(draft.goals[0].day,domain.dayKey(date));
  for(let i=1;i<7;i++){const next=new Date(date);next.setDate(next.getDate()+i);assert.equal(draft.goals[i].day,domain.dayKey(next));}
 }
});

test('calendar keeps a stable incoming timestamp and rechecks future date at confirmation',()=>{
 const source=fs.readFileSync('src/components/CompactDateModal.tsx','utf8');
 assert.match(source,/\[visible,valueTime\]/);
 assert.match(source,/disabled=new Date\(year,month,day\)\.getTime\(\)<=today\.getTime\(\)/);
 assert.match(source,/if\(chosen&&parseFutureQuitDate\(dayKey\(chosen\),new Date\(\)\)\)onConfirm\(chosen\)/);
 const settings=fs.readFileSync('src/screens/SettingsPlanSection.tsx','utf8');
 assert.match(settings,/disabled=\{!preview\|\|stale\|\|!!submitted\}/);
 assert.match(settings,/JSON\.stringify\(p\)===JSON\.stringify\(submitted\.next\)\)\{setDraft\(null\);setSubmitted\(null\);\}/);
 assert.match(settings,/onPress=\{\(\)=>\{setDraft\(null\);setSubmitted\(null\);setPolicy\('keep'\);\}\}/);
});
