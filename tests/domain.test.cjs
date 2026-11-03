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
const {target, quitDate, countOn, savings, validateData, restartReductionPlan, rescheduleQuitPlan, nextReductionMilestone, parseFutureQuitDate} = context.exports;

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
