const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');

const source = fs.readFileSync('src/syncMerge.ts', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020},
}).outputText;
const loaded = new Module('src/syncMerge.ts', module);
loaded.filename = 'src/syncMerge.ts';
loaded.paths = module.paths;
loaded._compile(js, loaded.filename);
const {previewMerge} = loaded.exports;

const empty = () => ({profile: null, entries: [], cravings: [], checkins: []});
const entry = (id, at = '2026-10-31T12:00:00.000Z') => ({id, at});
const profile = (baseline = 12) => ({
  mode: 'reduce', baseline, packSize: 20, packPrice: 85,
  speed: 'balanced', startAt: '2026-10-01T12:00:00.000Z',
  dailyTargetOverride: null,
});

test('merges distinct local and remote entries without losing either', () => {
  const local = {...empty(), entries: [entry('local')]};
  const remote = {...empty(), entries: [entry('remote')]};
  const preview = previewMerge(local, remote);
  assert.equal(preview.safeToApply, true);
  assert.deepEqual(new Set(preview.merged.entries.map(x => x.id)), new Set(['local', 'remote']));
  assert.deepEqual(local.entries, [entry('local')]);
  assert.deepEqual(remote.entries, [entry('remote')]);
});

test('identical records are deduplicated and repeated merge is idempotent', () => {
  const data = {...empty(), entries: [entry('one')], cravings: [{id: 'crave', at: entry('x').at, intensity: 3, trigger: 'Stress'}], checkins: [{date: '2026-10-31', complete: true, smokeFree: false}]};
  const first = previewMerge(data, data);
  assert.equal(first.safeToApply, true);
  assert.equal(first.merged.entries.length, 1);
  assert.equal(first.merged.cravings.length, 1);
  assert.equal(first.merged.checkins.length, 1);
  assert.deepEqual(previewMerge(first.merged, data).merged, first.merged);
});

test('conflicting cigarette IDs block automatic application', () => {
  const result = previewMerge({...empty(), entries: [entry('same', '2026-10-30T10:00:00.000Z')]}, {...empty(), entries: [entry('same')]});
  assert.equal(result.safeToApply, false);
  assert.deepEqual(result.conflicts, [{collection: 'entries', key: 'same'}]);
});

test('conflicting daily checkins block automatic application', () => {
  const checkin = {date: '2026-10-31', complete: true, smokeFree: true};
  const result = previewMerge({...empty(), checkins: [checkin]}, {...empty(), checkins: [{...checkin, smokeFree: false}]});
  assert.equal(result.safeToApply, false);
  assert.deepEqual(result.conflicts, [{collection: 'checkins', key: '2026-10-31'}]);
});

test('conflicting profiles block automatic application', () => {
  const result = previewMerge({...empty(), profile: profile(12)}, {...empty(), profile: profile(10)});
  assert.equal(result.safeToApply, false);
  assert.deepEqual(result.conflicts, [{collection: 'profile', key: 'profile'}]);
});

test('profile from only one source is retained', () => {
  assert.deepEqual(previewMerge({...empty(), profile: profile()}, empty()).merged.profile, profile());
  assert.deepEqual(previewMerge(empty(), {...empty(), profile: profile()}).merged.profile, profile());
});
