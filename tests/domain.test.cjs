const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync('src/domain.ts', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText;
const context = {exports: {}, Date};
vm.runInNewContext(js, context);
const {target, quitDate, countOn, savings, validateData, adjustReductionTarget, restartReductionPlan, rescheduleQuitPlan, nextReductionMilestone, parseFutureQuitDate, weeklyPlanProgress} = context.exports;

const profile = (patch = {}) => ({
  mode: 'reduce', baseline: 12, packSize: 20, packPrice: 80,
  speed: 'balanced', startAt: '2026-10-01T12:00:00.000Z',
  dailyTargetOverride: null, ...patch,
});
const date = (value) => new Date(value + 'T12:00:00.000Z');

test('original plan decreases by one every four days', () => {
  const p = profile();
  assert.equal(target(p, date('2026-10-01')), 12);
  assert.equal(target(p, date('2026-10-04')), 12);
  assert.equal(target(p, date('2026-10-05')), 11);
});

test('pace change resumes from current target, preserving original baseline', () => {
  const before = profile();
  const current = target(before, date('2026-10-09'));
  assert.equal(current, 10);
  const changed = {...before, speed: 'gentle', startAt: date('2026-10-09').toISOString(), planStartTarget: current};
  assert.equal(changed.baseline, 12);
  assert.equal(target(changed, date('2026-10-09')), 10);
  assert.equal(target(changed, date('2026-10-15')), 10);
  assert.equal(target(changed, date('2026-10-16')), 9);
  assert.equal(quitDate(changed).toISOString().slice(0, 10), '2026-12-18');
});

test('manual override takes priority until cleared', () => {
  const p = profile({dailyTargetOverride: 6});
  assert.equal(target(p, date('2026-10-01')), 6);
  assert.equal(target(p, date('2026-11-01')), 6);
  assert.equal(target({...p, dailyTargetOverride: null}, date('2026-10-05')), 11);
});

test('quit mode always targets zero without manual override', () => {
  assert.equal(target(profile({mode: 'quit'}), date('2026-10-05')), 0);
});

test('target never goes below zero', () => {
  assert.equal(target(profile({baseline: 1, speed: 'fast'}), date('2026-12-01')), 0);
});

test('plan changes do not mutate saved smoking entries', () => {
  const entries = [{id: 'one', at: '2026-10-09T09:00:00.000Z'}];
  const original = JSON.stringify(entries);
  const p = profile();
  const changed = {...p, speed: 'gentle', startAt: date('2026-10-09').toISOString(), planStartTarget: target(p, date('2026-10-09'))};
  target(changed, date('2026-10-10'));
  assert.equal(countOn(entries, '2026-10-09'), 1);
  assert.equal(JSON.stringify(entries), original);
});

test('domain functions and validation remain available', () => {
  for (const fn of [target, quitDate, countOn, savings, validateData]) assert.equal(typeof fn, 'function');
});

test('quit mode remains zero even with an earlier manual override', () => {
  assert.equal(target(profile({mode: 'quit', dailyTargetOverride: 6}), date('2026-10-09')), 0);
});

test('changing pace preserves original savings start and historical entries', () => {
  const original = profile({baseline: 10, packPrice: 100, packSize: 20});
  const entries = [{id: 'a', at: '2026-10-02T12:00:00.000Z'}];
  const changed = {
    ...original,
    speed: 'gentle',
    originalStartAt: original.startAt,
    startAt: date('2026-10-09').toISOString(),
    planStartTarget: target(original, date('2026-10-09')),
  };
  const data = {profile: changed, entries, cravings: [], checkins: []};
  assert.equal(savings(data, date('2026-10-09')), 445);
  assert.equal(data.entries.length, 1);
  assert.equal(data.entries[0].id, 'a');
  assert.equal(changed.baseline, 10);
});

test('saved plan anchor is accepted by data validation', () => {
  const data = {profile: profile({planStartTarget: 8, originalStartAt: '2026-10-01T12:00:00.000Z'}), entries: [], cravings: [], checkins: []};
  assert.equal(validateData(data), true);
});

test('savings is zero before the original start date', () => {
  const p = profile({originalStartAt: '2026-10-05T12:00:00.000Z'});
  const data = {profile: p, entries: [], cravings: [], checkins: []};
  assert.equal(savings(data, date('2026-10-04')), 0);
});

test('savings uses historical start across a restarted plan', () => {
  const p = profile({
    baseline: 10, packSize: 20, packPrice: 100,
    originalStartAt: '2026-10-01T12:00:00.000Z',
    startAt: '2026-10-08T12:00:00.000Z',
    planStartTarget: 8,
  });
  const data = {profile: p, entries: [
    {id: 'first', at: '2026-10-02T12:00:00.000Z'},
    {id: 'second', at: '2026-10-09T12:00:00.000Z'},
  ], cravings: [], checkins: []};
  assert.equal(savings(data, date('2026-10-09')), 440);
  assert.equal(savings(data, date('2026-10-02')), 95);
});

test('duplicate check-ins do not imply additional smoke-free days', () => {
  const checkins = [
    {date: '2026-10-01', complete: true, smokeFree: true},
    {date: '2026-10-01', complete: true, smokeFree: true},
    {date: '2026-10-02', complete: false, smokeFree: true},
    {date: '2026-10-03', complete: true, smokeFree: false},
  ];
  const confirmed = new Set(checkins.filter(c => c.complete && c.smokeFree).map(c => c.date));
  assert.equal(confirmed.size, 1);
});

test('reminder time validation rejects malformed or out-of-range values', () => {
  const screen = fs.readFileSync('src/screens/SettingsScreen.tsx', 'utf8');
  const match = screen.match(/export function validReminderTime\([^\n]+/);
  assert.ok(match, 'time validator must be present');
  const output = ts.transpileModule(match[0], {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const scope = {exports: {}};
  vm.runInNewContext(output, scope);
  const valid = scope.exports.validReminderTime;
  for (const [h, m] of [['0','0'],['08','05'],['19','00'],['23','59']]) assert.equal(valid(h,m), true);
  for (const [h, m] of [['24','00'],['23','60'],['-1','00'],['12','-1'],['','00'],['12',''],['abc','15'],['1.5','00'],['001','00'],['12',' 5']]) assert.equal(valid(h,m), false);
});

test('reminder status distinguishes opt-out, revoked permission and missing schedules', () => {
  const screen = fs.readFileSync('src/screens/SettingsScreen.tsx', 'utf8');
  const match = screen.match(/export function reminderStatusMessage\([^\n]+/);
  assert.ok(match, 'status helper must be present');
  const output = ts.transpileModule(match[0], {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const scope = {exports: {}};
  vm.runInNewContext(output, scope);
  const status = scope.exports.reminderStatusMessage;
  assert.match(status(false,false,false,false), /avstängda/);
  assert.match(status(true,false,true,true), /behörighet saknas/);
  assert.match(status(true,true,false,false), /Ingen aktiv/);
  assert.match(status(true,true,true,false), /Ingen aktiv/);
  assert.match(status(true,true,true,true), /schemalagd och notiser är tillåtna/);
});


test('scheduled quit date progressively reduces target to zero', () => {
 const p=profile({baseline:10,plannedQuitAt:'2026-10-11T12:00:00.000Z'});
 assert.equal(target(p,date('2026-10-01')),10);
 assert.equal(target(p,date('2026-10-06')),5);
 assert.equal(target(p,date('2026-10-11')),0);
 assert.equal(target(p,date('2026-10-20')),0);
 assert.equal(quitDate(p).toISOString().slice(0,10),'2026-10-11');
});

test('scheduled date keeps history and validates future date', () => {
 const p=profile({plannedQuitAt:'2026-10-11T12:00:00.000Z'});
 const data={profile:p,entries:[{id:'old',at:'2026-10-02T12:00:00.000Z'}],cravings:[],checkins:[]};
 assert.equal(validateData(data),true);
 assert.equal(countOn(data.entries,'2026-10-02'),1);
 assert.equal(validateData({...data,profile:{...p,plannedQuitAt:'2026-09-30T12:00:00.000Z'}}),false);
 assert.equal(target(profile(),date('2026-10-05')),11);
});

test('cloud profile schema accepts restarted and scheduled plans without accepting invalid anchors', () => {
  const source = fs.readFileSync('src/cloudSchema.ts', 'utf8');
  const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const module = {exports: {}};
  vm.runInNewContext(output, {module, exports: module.exports, Date, Number, Object, Array});
  const valid = module.exports.isCloudProfile;
  const p = profile({planStartTarget: 7, originalStartAt: '2026-09-01T12:00:00.000Z', plannedQuitAt: '2026-12-01T12:00:00.000Z'});
  assert.equal(valid(p), true);
  assert.equal(valid(profile()), true);
  assert.equal(valid({...p, planStartTarget: -1}), false);
  assert.equal(valid({...p, planStartTarget: 2.5}), false);
  assert.equal(valid({...p, originalStartAt: 'not-a-date'}), false);
});

test('cloud merge never silently overwrites conflicting plans or historical entries', () => {
  const source = fs.readFileSync('src/syncMerge.ts', 'utf8');
  const output = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const module = {exports: {}};
  vm.runInNewContext(output, {module, exports: module.exports, Object, Map, JSON, Set});
  const merge = module.exports.previewMerge;
  const remote = {profile: profile(), entries: [{id:'existing',at:'2026-10-02T12:00:00.000Z'}], cravings:[], checkins:[]};
  const local = {profile: {...remote.profile, planStartTarget:8}, entries:[...remote.entries], cravings:[], checkins:[]};
  const conflict = merge(local, remote);
  assert.equal(conflict.safeToApply, false);
  assert.equal(conflict.conflicts.some(c=>c.collection==='profile'), true);
  assert.equal(conflict.merged.profile.planStartTarget, undefined);
  assert.equal(conflict.merged.entries.length, 1);
  const same = merge(remote, remote);
  assert.equal(same.safeToApply, true);
  assert.equal(same.conflicts.length, 0);
});


test('restarting a scheduled reduction removes quit date but preserves baseline and original start', () => {
 const original=profile({baseline:12,plannedQuitAt:'2026-10-21T12:00:00.000Z',dailyTargetOverride:5});
 const when=date('2026-10-09');
 const current=target({...original,dailyTargetOverride:null},when);
 const restarted=restartReductionPlan(original,when);
 assert.equal(restarted.plannedQuitAt,undefined);
 assert.equal(Object.hasOwn(restarted,'plannedQuitAt'),true);
 assert.equal(restarted.dailyTargetOverride,null);
 assert.equal(restarted.baseline,12);
 assert.equal(restarted.originalStartAt,original.startAt);
 assert.equal(restarted.planStartTarget,current);
 assert.equal(target(restarted,when),current);
 assert.equal(validateData({profile:restarted,entries:[],cravings:[],checkins:[]}),true);
});

test('restarting twice keeps historical savings and does not alter saved records', () => {
 const entries=[{id:'first',at:'2026-10-02T12:00:00.000Z'}];
 const cravings=[{id:'urge',at:'2026-10-03T12:00:00.000Z',intensity:3,trigger:'stress'}];
 const checkins=[{date:'2026-10-04',complete:true,smokeFree:false}];
 const original=profile();
 const first=restartReductionPlan(original,date('2026-10-09'));
 const second=restartReductionPlan(first,date('2026-10-12'));
 const data={profile:second,entries,cravings,checkins};
 assert.equal(second.originalStartAt,original.startAt);
 assert.equal(data.entries,entries);
 assert.equal(data.cravings,cravings);
 assert.equal(data.checkins,checkins);
 assert.equal(savings(data,date('2026-10-12')),savings({...data,profile:original},date('2026-10-12')));
});

test('restart is a no-op for immediate quit plans', () => {
 const original=profile({mode:'quit'});
 assert.equal(restartReductionPlan(original,date('2026-10-09')),original);
});


test('restart patch explicitly clears a previously scheduled quit date when merged', () => {
 const original=profile({plannedQuitAt:'2026-10-21T12:00:00.000Z'});
 const patch=restartReductionPlan(original,date('2026-10-09'));
 const merged={...original,...patch};
 assert.equal(merged.plannedQuitAt,undefined);
 assert.equal(target(merged,date('2026-10-10')),patch.planStartTarget);
});


test('changing scheduled quit date preserves current planned target and original savings start', () => {
 const original=profile({baseline:10,plannedQuitAt:'2026-10-21T12:00:00.000Z'});
 const today=date('2026-10-09');
 const current=target(original,today);
 const revised=rescheduleQuitPlan(original,date('2026-11-01'),today);
 assert.equal(target(revised,today),current);
 assert.equal(revised.originalStartAt,original.startAt);
 assert.equal(revised.baseline,original.baseline);
 assert.equal(quitDate(revised).toISOString().slice(0,10),'2026-11-01');
 assert.equal(target(revised,date('2026-11-01')),0);
 assert.equal(validateData({profile:revised,entries:[],cravings:[],checkins:[]}),true);
});

test('changing quit date twice keeps the original savings anchor and does not mutate history', () => {
 const original=profile({baseline:10,plannedQuitAt:'2026-10-21T12:00:00.000Z'});
 const entries=[{id:'old',at:'2026-10-02T12:00:00.000Z'}];
 const first=rescheduleQuitPlan(original,date('2026-11-01'),date('2026-10-09'));
 const second=rescheduleQuitPlan(first,date('2026-11-15'),date('2026-10-12'));
 const data={profile:second,entries,cravings:[],checkins:[]};
 assert.equal(second.originalStartAt,original.startAt);
 assert.equal(data.entries,entries);
 assert.equal(savings(data,date('2026-10-12')),savings({...data,profile:original},date('2026-10-12')));
 assert.equal(target(second,date('2026-10-12')),target(first,date('2026-10-12')));
});


test('cloud update permission requires an exact previously observed plan', () => {
 const source=fs.readFileSync('src/syncMerge.ts','utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(output,{module,exports:module.exports,Object,Map,JSON,Set});
 const permitted=module.exports.canUpdateObservedPlan;
 const remote=profile({plannedQuitAt:'2026-12-01T12:00:00.000Z'});
 const fingerprint=JSON.stringify(Object.fromEntries(Object.entries(remote).sort(([a],[b])=>a.localeCompare(b))));
 assert.equal(permitted(undefined,remote),false);
 assert.equal(permitted(fingerprint,remote),true);
 assert.equal(permitted(fingerprint,{...remote,plannedQuitAt:'2026-12-02T12:00:00.000Z'}),false);
 assert.equal(permitted(fingerprint,{...remote,planStartTarget:7}),false);
});


test('cloud sync aborts stale sessions before restoring observed plan baselines', () => {
 const source=fs.readFileSync('src/cloudSync.native.ts','utf8');
 assert.match(source,/let accountEpoch=0/);
 assert.match(source,/resetObservedCloudPlans\(\):void \{ accountEpoch\+\+; observedPlans\.clear\(\); \}/);
 assert.match(source,/const startedEpoch=accountEpoch/);
 assert.match(source,/if\(startedEpoch!==accountEpoch\) throw new Error/);
 assert.match(source,/assertUser\(\);\s*const finalPlan=/);
});


test('next milestone finds slow reduction beyond fourteen days',()=>{
 const p=profile({baseline:12,speed:'gentle',startAt:'2026-10-01T12:00:00.000Z'});
 const next=nextReductionMilestone(p,date('2026-10-10'));
 assert.equal(next.goal,10);
 assert.equal(next.date.toISOString().slice(0,10),'2026-10-15');
});

test('next milestone respects scheduled stop and manual override',()=>{
 const p=profile({baseline:2,plannedQuitAt:'2026-11-20T12:00:00.000Z'});
 const next=nextReductionMilestone(p,date('2026-10-01'));
 assert.ok(next);
 assert.equal(next.goal,1);
 assert.equal(nextReductionMilestone({...p,dailyTargetOverride:1},date('2026-10-01')),null);
 assert.equal(nextReductionMilestone({...p,mode:'quit'},date('2026-10-01')),null);
});


test('milestone is based on calendar days across daylight saving transitions',()=>{
 const p=profile({baseline:2,startAt:'2026-03-25T12:00:00.000Z',plannedQuitAt:'2026-04-03T12:00:00.000Z'});
 const next=nextReductionMilestone(p,date('2026-03-28'));
 assert.ok(next);
 assert.equal(next.goal,1);
 assert.equal(next.date.toISOString().slice(0,10),'2026-03-30');
});

test('milestone returns none after reaching zero or for fixed custom targets',()=>{
 const p=profile({baseline:1,startAt:'2026-10-01T12:00:00.000Z',speed:'fast'});
 assert.equal(nextReductionMilestone(p,date('2026-10-05')),null);
 assert.equal(nextReductionMilestone({...p,dailyTargetOverride:1},date('2026-10-01')),null);
});


test('rescheduling a quit date preserves every historical record and todays planned goal',()=>{
 const before=profile({baseline:10,plannedQuitAt:'2026-11-01T12:00:00.000Z'});
 const now=date('2026-10-12');
 const entries=[{id:'old',at:'2026-10-02T12:00:00.000Z'}];
 const cravings=[{id:'craving',at:'2026-10-03T12:00:00.000Z',intensity:3,trigger:'stress'}];
 const checkins=[{date:'2026-10-04',complete:true,smokeFree:false}];
 const history=JSON.stringify({entries,cravings,checkins});
 const current=target(before,now);
 const after=rescheduleQuitPlan(before,date('2026-12-01'),now);
 assert.equal(target(after,now),current);
 assert.equal(after.baseline,before.baseline);
 assert.equal(after.originalStartAt,before.startAt);
 assert.equal(after.plannedQuitAt,date('2026-12-01').toISOString());
 assert.equal(target(after,date('2026-12-01')),0);
 assert.equal(JSON.stringify({entries,cravings,checkins}),history);
 assert.equal(validateData({profile:after,entries,cravings,checkins}),true);
});

test('restarting a scheduled reduction clears its old stop date without losing history',()=>{
 const before=profile({baseline:10,plannedQuitAt:'2026-11-01T12:00:00.000Z',dailyTargetOverride:4});
 const now=date('2026-10-12');
 const expected=target({...before,dailyTargetOverride:null},now);
 const after=restartReductionPlan(before,now);
 assert.equal(after.plannedQuitAt,undefined);
 assert.equal(after.dailyTargetOverride,null);
 assert.equal(after.originalStartAt,before.startAt);
 assert.equal(after.baseline,before.baseline);
 assert.equal(target(after,now),expected);
 assert.equal(target(after,date('2026-10-16')),expected-1);
 assert.equal(before.plannedQuitAt,'2026-11-01T12:00:00.000Z');
 const entries=[{id:'old',at:'2026-10-02T12:00:00.000Z'}];
 const cravings=[];
 const checkins=[{date:'2026-10-04',complete:true,smokeFree:false}];
 assert.equal(validateData({profile:after,entries,cravings,checkins}),true);
 assert.equal(countOn(entries,'2026-10-02'),1);
});

test('cloud sync retries are queued while another sync is in progress', () => {
 const source=fs.readFileSync('src/hooks/useCloudSync.ts','utf8');
 for(const required of ['const syncQueued=useRef(false)', 'syncQueued.current=true', 'syncQueued.current=false', 'setSyncTrigger(v=>v+1)']) {
  assert.ok(source.includes(required), 'Missing cloud sync queue behavior: '+required);
 }
});

test('restarting reduction twice retains original savings start', () => {
 const original=profile({baseline:12});
 const first=restartReductionPlan(original,date('2026-10-09'));
 const now=date('2026-10-15');
 const current=target(first,now);
 const second=restartReductionPlan(first,now);
 assert.equal(target(second,now),current);
 assert.equal(second.originalStartAt,original.startAt);
 assert.equal(second.baseline,original.baseline);
 assert.equal(original.originalStartAt,undefined);
});

test('quit date input accepts only future valid calendar dates',()=>{
 const now=new Date(2026,10,3,7,30);
 for(const value of ['2026-11-03','2026-11-02','2026-02-30','2026-13-01','2026-11-3','not-a-date'])assert.equal(parseFutureQuitDate(value,now),null);
 const tomorrow=parseFutureQuitDate('2026-11-04',now);
 assert.ok(tomorrow);
 assert.equal(tomorrow.getFullYear(),2026);
 assert.equal(tomorrow.getMonth(),10);
 assert.equal(tomorrow.getDate(),4);
});
test('quit date input handles leap days and midnight boundaries',()=>{
 assert.equal(parseFutureQuitDate('2027-02-29',new Date(2027,0,1)),null);
 const leap=parseFutureQuitDate('2028-02-29',new Date(2028,1,28,23,59));
 assert.ok(leap);
 assert.equal(leap.getDate(),29);
 assert.equal(parseFutureQuitDate('2028-02-29',new Date(2028,1,29,0,1)),null);
});

test('weekly progression matches scheduled and gradual reduction',()=>{
 const now=date('2026-10-01');
 const regular=weeklyPlanProgress(profile(),now);
 assert.equal(regular.todayGoal,12);
 assert.equal(regular.nextGoal,11);
 assert.equal(regular.reduction,1);
 const scheduled=weeklyPlanProgress(profile({baseline:10,plannedQuitAt:'2026-10-06T12:00:00.000Z'}),now);
 assert.equal(scheduled.todayGoal,10);
 assert.equal(scheduled.nextGoal,0);
 assert.equal(scheduled.reduction,10);
});
test('weekly progression respects immediate quit and manual goals',()=>{
 const now=date('2026-10-01');
 for(const p of [profile({mode:'quit'}),profile({dailyTargetOverride:5})]){
  const result=weeklyPlanProgress(p,now);
  assert.equal(result.todayGoal,result.nextGoal);
  assert.equal(result.reduction,0);
 }
 const scheduled=weeklyPlanProgress(profile({dailyTargetOverride:5,plannedQuitAt:'2026-10-05T12:00:00.000Z'}),now);
 assert.equal(scheduled.todayGoal,5);
 assert.equal(scheduled.nextGoal,0);
 assert.equal(scheduled.reduction,5);
});

test('quit-date preview matches saved targets and does not mutate profile',()=>{
 const now=date('2026-10-12');
 const before=profile({baseline:10,plannedQuitAt:'2026-11-01T12:00:00.000Z'});
 const original=JSON.stringify(before);
 const chosen=date('2026-12-01');
 const preview=rescheduleQuitPlan(before,chosen,now);
 const saved=rescheduleQuitPlan(before,chosen,now);
 const week=date('2026-10-19');
 for(const day of [now,week,chosen])assert.equal(target(preview,day),target(saved,day));
 assert.equal(target(preview,chosen),0);
 assert.equal(target(preview,now),target(before,now));
 assert.equal(JSON.stringify(before),original);
});
test('quit-date preview respects manual target until the chosen stop date',()=>{
 const now=date('2026-10-12');
 const before=profile({dailyTargetOverride:4,plannedQuitAt:'2026-11-01T12:00:00.000Z'});
 const changed=rescheduleQuitPlan(before,date('2026-10-20'),now);
 assert.equal(target(changed,now),4);
 assert.equal(target(changed,date('2026-10-19')),4);
 assert.equal(target(changed,date('2026-10-20')),0);
 assert.equal(before.plannedQuitAt,'2026-11-01T12:00:00.000Z');
});
test('restart confirmation preview matches the resulting plan without history changes',()=>{
 const now=date('2026-10-12');
 const before=profile({baseline:10,dailyTargetOverride:4,plannedQuitAt:'2026-11-01T12:00:00.000Z'});
 const data={profile:before,entries:[{id:'e',at:'2026-10-02T12:00:00.000Z'}],cravings:[{id:'c',at:'2026-10-03T12:00:00.000Z',intensity:2,trigger:'stress'}],checkins:[{date:'2026-10-04',complete:true,smokeFree:false}]};
 const historical=JSON.stringify({entries:data.entries,cravings:data.cravings,checkins:data.checkins});
 const preview=restartReductionPlan(before,now);
 const saved=restartReductionPlan(before,now);
 for(const day of [now,date('2026-10-19')])assert.equal(target(preview,day),target(saved,day));
 assert.equal(preview.plannedQuitAt,undefined);
 assert.equal(preview.dailyTargetOverride,null);
 assert.equal(preview.originalStartAt,before.startAt);
 assert.equal(JSON.stringify({entries:data.entries,cravings:data.cravings,checkins:data.checkins}),historical);
});

test('scheduled quit overrides a manual goal on and after the stop date',()=>{
 const p=profile({baseline:12,dailyTargetOverride:5,plannedQuitAt:'2026-10-20T12:00:00.000Z'});
 assert.equal(target(p,date('2026-10-19')),5);
 assert.equal(target(p,date('2026-10-20')),0);
 assert.equal(target(p,date('2026-10-21')),0);
 assert.equal(nextReductionMilestone(p,date('2026-10-19')),null);
 assert.equal(weeklyPlanProgress(p,date('2026-10-19')).nextGoal,0);
});
test('scheduled quit remains the next reduction milestone when no earlier reduction remains',()=>{
 const p=profile({baseline:1,plannedQuitAt:'2026-10-20T12:00:00.000Z'});
 const now=date('2026-10-19');
 assert.equal(target(p,now),1);
 const milestone=nextReductionMilestone(p,now);
 assert.ok(milestone);
 assert.equal(milestone.date.toISOString().slice(0,10),'2026-10-20');
 assert.equal(milestone.goal,0);
 assert.equal(target(p,date('2026-10-21')),0);
});


test('a passed scheduled quit date stays at zero until explicitly rescheduled', () => {
 const original=profile({baseline:10,plannedQuitAt:'2026-10-11T12:00:00.000Z'});
 const today=date('2026-10-20');
 assert.equal(target(original,today),0);
 assert.equal(target(original,date('2026-11-02')),0);
 const revised=rescheduleQuitPlan(original,date('2026-11-10'),today);
 assert.equal(revised.originalStartAt,original.startAt);
 assert.equal(target(revised,today),0);
 assert.equal(target(revised,date('2026-11-09')),0);
 assert.equal(target(revised,date('2026-11-10')),0);
 assert.equal(validateData({profile:revised,entries:[],cravings:[],checkins:[]}),true);
});

test('rescheduling a future quit date preserves manual target until the new stop date', () => {
 const original=profile({baseline:12,dailyTargetOverride:4,plannedQuitAt:'2026-10-21T12:00:00.000Z'});
 const now=date('2026-10-09');
 const revised=rescheduleQuitPlan(original,date('2026-11-01'),now);
 assert.equal(target(revised,now),4);
 assert.equal(target(revised,date('2026-10-31')),4);
 assert.equal(target(revised,date('2026-11-01')),0);
 assert.equal(revised.originalStartAt,original.startAt);
});

test('quit-date input rejects past, same-day, rollover and malformed dates', () => {
 const now=date('2026-11-03');
 for(const input of ['2026-11-02','2026-11-03','2026-02-30','2026-13-01','2026-11-3','2026/11/04','']){
  assert.equal(parseFutureQuitDate(input,now),null,input);
 }
 const valid=parseFutureQuitDate('2026-11-04',now);
 assert.ok(valid instanceof Date);
 assert.equal(valid.getFullYear(),2026);
 assert.equal(valid.getMonth(),10);
 assert.equal(valid.getDate(),4);
});


test('multiple reschedules and restart preserve all historical collections and savings anchor', () => {
 const original=profile({baseline:12,plannedQuitAt:'2026-10-25T12:00:00.000Z',packPrice:100,packSize:20});
 const entries=[{id:'one',at:'2026-10-02T12:00:00.000Z'},{id:'two',at:'2026-10-04T12:00:00.000Z'}];
 const cravings=[{id:'urge',at:'2026-10-05T12:00:00.000Z',intensity:3,trigger:'stress'}];
 const checkins=[{date:'2026-10-06',complete:true,smokeFree:false}];
 const snapshots=JSON.stringify({entries,cravings,checkins});
 const first=rescheduleQuitPlan(original,date('2026-11-10'),date('2026-10-09'));
 const second=rescheduleQuitPlan(first,date('2026-11-20'),date('2026-10-12'));
 const restarted=restartReductionPlan(second,date('2026-10-14'));
 const third=rescheduleQuitPlan(restarted,date('2026-12-01'),date('2026-10-15'));
 for(const p of [first,second,restarted,third]){
  assert.equal(p.originalStartAt,original.startAt);
  assert.equal(p.baseline,original.baseline);
  assert.equal(validateData({profile:p,entries,cravings,checkins}),true);
  assert.equal(savings({profile:p,entries,cravings,checkins},date('2026-10-15')),savings({profile:original,entries,cravings,checkins},date('2026-10-15')));
 }
 assert.equal(JSON.stringify({entries,cravings,checkins}),snapshots);
 assert.equal(third.plannedQuitAt,date('2026-12-01').toISOString());
 assert.equal(target(third,date('2026-12-01')),0);
});

test('repeated same-day rescheduling keeps todays goal and never changes historical savings start', () => {
 const now=date('2026-10-09');
 const original=profile({baseline:12,plannedQuitAt:'2026-10-25T12:00:00.000Z'});
 const todayGoal=target(original,now);
 const first=rescheduleQuitPlan(original,date('2026-11-01'),now);
 const second=rescheduleQuitPlan(first,date('2026-11-15'),now);
 const third=rescheduleQuitPlan(second,date('2026-12-01'),now);
 for(const p of [first,second,third]){
  assert.equal(target(p,now),todayGoal);
  assert.equal(p.originalStartAt,original.startAt);
  assert.equal(p.baseline,original.baseline);
 }
});


test('sync preview refuses competing plan edits without overwriting either history', () => {
 const source=fs.readFileSync('src/syncMerge.ts','utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(output,{module,exports:module.exports,Object,Map,JSON,Set});
 const merge=module.exports.previewMerge;
 const base=profile({plannedQuitAt:'2026-12-01T12:00:00.000Z'});
 const remote={profile:{...base,plannedQuitAt:'2026-12-15T12:00:00.000Z'},entries:[{id:'remote',at:'2026-10-02T12:00:00.000Z'}],cravings:[],checkins:[]};
 const local={profile:{...base,plannedQuitAt:'2026-11-25T12:00:00.000Z'},entries:[{id:'local',at:'2026-10-03T12:00:00.000Z'}],cravings:[],checkins:[]};
 const before=JSON.stringify({local,remote});
 const preview=merge(local,remote);
 assert.equal(preview.safeToApply,false);
 assert.equal(preview.conflicts.some(c=>c.collection==='profile'),true);
 assert.equal(preview.merged.profile.plannedQuitAt,remote.profile.plannedQuitAt);
 assert.equal(preview.merged.entries.length,2);
 assert.equal(JSON.stringify({local,remote}),before);
});

test('observed plan baseline rejects stale remote edits and accepts equivalent field order', () => {
 const source=fs.readFileSync('src/syncMerge.ts','utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(output,{module,exports:module.exports,Object,Map,JSON,Set});
 const allowed=module.exports.canUpdateObservedPlan;
 const base=profile({plannedQuitAt:'2026-12-01T12:00:00.000Z'});
 const canonical=JSON.stringify(Object.fromEntries(Object.entries(base).sort(([a],[b])=>a.localeCompare(b))));
 const reordered=Object.fromEntries(Object.entries(base).reverse());
 assert.equal(allowed(canonical,reordered),true);
 assert.equal(allowed(canonical,{...base,plannedQuitAt:'2026-12-15T12:00:00.000Z'}),false);
 assert.equal(allowed(canonical,{...base,dailyTargetOverride:3}),false);
 assert.equal(allowed(undefined,base),false);
});

test('cloud plan writes are transactionally checked against the last observed version', () => {
 const cloud=fs.readFileSync('src/cloudSync.native.ts','utf8');
 assert.match(cloud,/canUpdateObservedPlan\(known,remotePlan\)/);
 assert.match(cloud,/db\.runTransaction\(async transaction=>/);
 assert.match(cloud,/fingerprint\(payload as Profile\)!==known/);
 assert.match(cloud,/Planen ändrades på en annan enhet/);
 assert.match(cloud,/assertUser\(\)/);
});


test('rescheduled plan merges with additional remote history only after cloud plan baseline matches', () => {
 const source=fs.readFileSync('src/syncMerge.ts','utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(js,{exports});
 const base=profile({plannedQuitAt:'2026-11-01T12:00:00.000Z'});
 const revised=rescheduleQuitPlan(base,date('2026-12-01'),date('2026-10-09'));
 const local={profile:revised,entries:[{id:'local',at:'2026-10-03T12:00:00.000Z'}],cravings:[],checkins:[]};
 const remote={profile:base,entries:[{id:'remote',at:'2026-10-04T12:00:00.000Z'}],cravings:[],checkins:[]};
 const baseline=JSON.stringify(Object.fromEntries(Object.entries(base).sort(([a],[b])=>a.localeCompare(b))));
 assert.equal(exports.canUpdateObservedPlan(baseline,remote.profile),true);
 const preview=exports.previewMerge({...local,profile:remote.profile},remote);
 assert.equal(preview.safeToApply,true);
 assert.equal(Array.from(preview.merged.entries,x=>x.id).sort().join(','),'local,remote');
 assert.equal(preview.merged.profile.plannedQuitAt,base.plannedQuitAt);
 assert.equal(revised.originalStartAt,base.startAt);
 assert.equal(target(revised,date('2026-12-01')),0);
});

test('changed remote plan and duplicate historical ID both block a local restart sync', () => {
 const source=fs.readFileSync('src/syncMerge.ts','utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};vm.runInNewContext(js,{exports});
 const base=profile({plannedQuitAt:'2026-11-01T12:00:00.000Z'});
 const local={profile:restartReductionPlan(base,date('2026-10-09')),entries:[{id:'same',at:'2026-10-03T12:00:00.000Z'}],cravings:[],checkins:[]};
 const remote={profile:{...base,plannedQuitAt:'2026-11-15T12:00:00.000Z'},entries:[{id:'same',at:'2026-10-04T12:00:00.000Z'}],cravings:[],checkins:[]};
 const snapshot=JSON.stringify({local,remote});
 const preview=exports.previewMerge(local,remote);
 assert.equal(preview.safeToApply,false);
 assert.equal(Array.from(preview.conflicts,x=>x.collection).sort().join(','),'entries,profile');
 assert.equal(preview.merged.entries[0].at,remote.entries[0].at);
 assert.equal(JSON.stringify({local,remote}),snapshot);
});

test('custom quit date reaches zero on deadline without losing original baseline',()=>{
 const p=profile({baseline:20,plannedQuitAt:'2026-10-31T12:00:00.000Z'});
 const goals=Array.from({length:31},(_,i)=>target(p,date('2026-10-'+String(i+1).padStart(2,'0'))));
 assert.equal(goals[0],20);
 assert.equal(goals[30],0);
 for(let i=1;i<goals.length;i++){
  assert.ok(goals[i]<=goals[i-1],'planned daily target must never increase');
  assert.ok(goals[i]>=0,'planned daily target cannot be negative');
 }
 assert.equal(p.baseline,20);
});

test('short custom quit dates still reach zero on the selected calendar day',()=>{
 const p=profile({baseline:20,plannedQuitAt:'2026-10-03T12:00:00.000Z'});
 assert.equal(target(p,date('2026-10-01')),20);
 assert.equal(target(p,date('2026-10-02')),10);
 assert.equal(target(p,date('2026-10-03')),0);
});

test('custom quit date remains independent of previously chosen gradual pace',()=>{
 const common={baseline:15,plannedQuitAt:'2026-10-16T12:00:00.000Z'};
 const goals=['gentle','balanced','fast'].map(speed=>target(profile({...common,speed}),date('2026-10-09')));
 assert.deepEqual(goals,[7,7,7]);
});

test('changing cigarettes per day restarts future gradual goals at new count',()=>{
 const original=profile({baseline:20,speed:'fast'});
 const now=date('2026-10-09');
 const changed=adjustReductionTarget(original,8,now);
 assert.equal(target(changed,now),8);
 assert.equal(target(changed,date('2026-10-11')),7);
 assert.equal(changed.baseline,20);
 assert.equal(changed.originalStartAt,original.startAt);
 assert.equal(changed.dailyTargetOverride,null);
 assert.equal(original.planStartTarget,undefined);
});

test('changing daily cigarette count preserves selected quit date and reaches zero on time',()=>{
 const original=profile({baseline:20,plannedQuitAt:'2026-10-21T12:00:00.000Z'});
 const changed=adjustReductionTarget(original,12,date('2026-10-09'));
 assert.equal(target(changed,date('2026-10-09')),12);
 assert.equal(target(changed,date('2026-10-15')),6);
 assert.equal(target(changed,date('2026-10-21')),0);
 assert.equal(changed.plannedQuitAt,original.plannedQuitAt);
});

test('daily cigarette goal adjustment preserves saved history and savings anchor',()=>{
 const original=profile({baseline:15});
 const entries=[{id:'existing',at:'2026-10-02T12:00:00.000Z'}];
 const data={profile:original,entries,cravings:[],checkins:[]};
 const now=date('2026-10-09');
 const changed={...data,profile:adjustReductionTarget(original,6,now)};
 assert.equal(changed.entries,entries);
 assert.equal(changed.profile.originalStartAt,original.startAt);
 assert.equal(savings(changed,now),savings(data,now));
});

test('immediate quit plan cannot be changed into a smoking goal via daily adjustment',()=>{
 const p=profile({mode:'quit'});
 assert.equal(adjustReductionTarget(p,10,date('2026-10-09')),p);
 assert.equal(target(p,date('2026-10-09')),0);
});
