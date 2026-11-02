'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness({state = 'deleting', authExists = false, remaining = [], confirm = false, parentExists = false, unknownCollections = []} = {}) {
  let updated = false;
  const lock = {
    exists: state !== null,
    get: key => key === 'state' ? state : undefined
  };
  const db = {
    doc: path => {
      if (path === 'users/test-uid') return {get: async () => ({exists: parentExists}), listCollections: async () => [...['control', 'entries', 'cravings', 'checkins', 'settings'], ...unknownCollections].map(id => ({id}))};
      assert.equal(path, 'users/test-uid/control/deletion');
      return {get: async () => lock};
    },
    collection: path => ({limit: n => {
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
    'firebase-admin/app': {initializeApp() {}, getApps: () => [1]},
    'firebase-admin/firestore': {getFirestore: () => db, FieldValue: {serverTimestamp: () => 'now'}},
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
    process: {argv: ['node', 'recoverDeletion.js', 'test-uid', ...(confirm ? ['--confirm-completed'] : [])]},
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
