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
  assert.equal(savings(data, date('2026-10-09')), 395);
  assert.equal(data.entries.length, 1);
  assert.equal(data.entries[0].id, 'a');
  assert.equal(changed.baseline, 10);
});

test('saved plan anchor is accepted by data validation', () => {
  const data = {profile: profile({planStartTarget: 8, originalStartAt: '2026-10-01T12:00:00.000Z'}), entries: [], cravings: [], checkins: []};
  assert.equal(validateData(data), true);
});
