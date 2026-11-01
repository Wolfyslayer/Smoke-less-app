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
const {target, quitDate, countOn, savings, validateData} = context.exports;

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
