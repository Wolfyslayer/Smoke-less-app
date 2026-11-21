'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness({state = 'deleting', authExists = false, remaining = [], confirm = false, parentExists = false, unknownCollections = [], extraControl = false, leaseUntilMs = 0, projectId = 'smokeless-recovery-test', env = {}, args, existingProject} = {}) {
  let updated = false;
  const lock = {
    exists: state !== null,
    get: key => key === 'state' ? state : key === 'leaseUntilMs' ? leaseUntilMs : undefined
  };
  const db = {
    doc: path => {
      if (path === 'users/test-uid') {
        return {
          get: async () => ({exists: parentExists}),
          listCollections: async () => [...['control', 'entries', 'cravings', 'checkins', 'settings'], ...unknownCollections].map(id => ({id}))
        };
      }
      assert.equal(path, 'users/test-uid/control/deletion');
      return {get: async () => lock};
    },
    collection: path => ({limit: n => {
      if (path === 'users/test-uid/control') {
        assert.equal(n, 2);
        return {get: async () => ({docs: [{id: 'deletion'}, ...(extraControl ? [{id: 'other'}] : [])]})};
      }
      assert.equal(n, 1);
      return {get: async () => ({empty: !remaining.some(name => path.endsWith('/' + name))})};
    }}),
    async runTransaction(fn) {
      await fn({
        get: async () => lock,
        update(ref, value) {
          assert.equal(value.state, 'completed');
          updated = true;
        }
      });
    }
  };
  const modules = {
    'firebase-admin/app': {initializeApp(options, name) {assert.equal(options.projectId, projectId);assert.equal(name, 'deletion-recovery');return {options};}, getApps: () => existingProject ? [{name: 'deletion-recovery', options: {projectId: existingProject}}] : []},
    'firebase-admin/firestore': {getFirestore: app => {assert.equal(app.options.projectId, projectId);return db;}, FieldValue: {serverTimestamp: () => 'now'}},
    'firebase-admin/auth': {getAuth: () => ({async getUser() {
      if (!authExists) {
        const error = new Error('missing');
        error.code = 'auth/user-not-found';
        throw error;
      }
      return {uid: 'test-uid'};
    }})}
  };
  const logs = [];
  const context = {
    module: {exports: {}},
    exports: {},
    require: name => {
      if (name in modules) return modules[name];
      throw Error('Unexpected module: ' + name);
    },
    process: {env, argv: ['node', 'recoverDeletion.js', ...(args || ['test-uid', '--project', projectId, ...(confirm ? ['--confirm-completed'] : [])])]},
    console: {log: message => logs.push(message), error: message => logs.push(message)}
  };
  context.exports = context.module.exports;
  vm.runInNewContext(fs.readFileSync('functions/recoverDeletion.js', 'utf8'), context);
  return {run: () => context.module.exports.main(), logs, get updated() {return updated;}};
}

test('default recovery inspection is read-only', async () => {
  const h = harness();
  await h.run();
  assert.equal(h.updated, false);
  assert.match(h.logs[0], /dry-run/);
  assert.doesNotMatch(h.logs[0], /test-uid/);
});

test('requires an explicit valid project and rejects extra arguments', async () => {
  for (const args of [['test-uid'], ['test-uid', '--project', 'bad/path'], ['test-uid', '--project', 'valid-project', '--confirm-completed', 'extra']]) {
    const h = harness({args});
    await assert.rejects(h.run(), /Usage/);
    assert.equal(h.updated, false);
  }
});

test('refuses mixed emulator/production targets and wrong initialized project', async () => {
  for (const options of [
    {env: {FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080'}},
    {projectId: 'demo-smokeless-qa'},
    {projectId: 'demo-smokeless-qa', env: {FIRESTORE_EMULATOR_HOST: 'remote.example:8080', FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099'}},
    {existingProject: 'wrong-project'},
  ]) {
    const h = harness(options);
    await assert.rejects(h.run(), /emulator|project mismatch/);
    assert.equal(h.updated, false);
  }
});

test('explicit demo recovery works only with both loopback emulators', async () => {
  const h = harness({projectId: 'demo-smokeless-qa', env: {FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080', FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099'}});
  await h.run();
  assert.equal(h.updated, false);
});

test('refuses finalization during active or invalid lease', async () => {
  for (const leaseUntilMs of [Date.now() + 600000, undefined, null, NaN, 'expired']) {
    const h = harness({confirm: true, leaseUntilMs: leaseUntilMs === undefined ? null : leaseUntilMs});
    await assert.rejects(h.run(), /lease is active or invalid/);
    assert.equal(h.updated, false);
  }
});
test('explicit confirmation completes only an empty, auth-less deletion', async () => {
  const h = harness({confirm: true});
  await h.run();
  assert.equal(h.updated, true);
});
test('refuses completion while Authentication user still exists', async () => {
  const h = harness({confirm: true, authExists: true});
  await assert.rejects(h.run(), /Auth user, parent document, unknown collections or user data still exists/);
  assert.equal(h.updated, false);
});
test('refuses completion while known user data remains', async () => {
  const h = harness({confirm: true, remaining: ['entries']});
  await assert.rejects(h.run(), /Auth user, parent document, unknown collections or user data still exists/);
  assert.equal(h.updated, false);
});
test('refuses completion without a pending deletion lock', async () => {
  for (const state of [null, 'completed', 'unexpected']) {
    const h = harness({confirm: true, state});
    await assert.rejects(h.run(), /existing deletion lock in deleting state/);
    assert.equal(h.updated, false);
  }
});

test('refuses completion when unknown collections or parent document exist', async () => {
  for (const options of [{unknownCollections: ['devices']}, {parentExists: true}]) {
    const h = harness({confirm: true, ...options});
    await assert.rejects(h.run(), /Cannot finalize/);
    assert.equal(h.updated, false);
  }
});

test('refuses recovery when unexpected control documents exist', async () => {
  const h = harness({confirm: true, extraControl: true});
  await assert.rejects(h.run(), /Cannot finalize/);
  assert.equal(h.updated, false);
});
