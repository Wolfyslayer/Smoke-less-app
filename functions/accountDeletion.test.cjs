'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness({records = 3, failBatch = false, failCompletion = false, lockState = null, parentExists = false, unknownCollections = [], extraControl = false, nestedDocuments = false} = {}) {
  let remaining = records;
  let authDeleted = false;
  let lock = lockState && {state: lockState};
  const events = [];
  const COLLECTION_NAMES = ['entries', 'cravings', 'checkins', 'settings', 'control'];
  const lockRef = {
    async create(value) {
      if (lock) {const e = new Error('exists'); e.code = 6; throw e;}
      lock = {...value}; events.push('lock');
    },
    async get() {return {exists: !!lock, get: key => lock?.[key]};},
    async set(value) {if (failCompletion) throw new Error('final status unavailable'); lock = {...lock, ...value}; events.push('complete');}
  };
  const db = {
    collection(name) {
      assert.equal(name, 'users');
      return {doc() {return {
        get: async () => ({exists: parentExists}),
        listCollections: async () => [...COLLECTION_NAMES, ...unknownCollections].map(id => ({id})),
        collection(name) {
          if (name === 'control') return {doc: () => lockRef, limit: () => ({get: async () => ({docs: [{id: 'deletion'}, ...(extraControl ? [{id: 'other'}] : [])]})})};
          return {
            limit() {return {async get() {
              const count = Math.min(remaining, 200);
              return {empty: count === 0, docs: Array.from({length: count}, (_, i) => ({ref: {id: i, listCollections: async () => nestedDocuments ? [{id: 'attachments'}] : []}}))};
            }};}
          };
        }
      };}};
    },
    batch() {let count = 0; return {
      delete() {count++;},
      async commit() {
        if (failBatch) throw new Error('interrupted');
        remaining -= count; events.push('batch');
      }
    };}
  };
  const auth = {async deleteUser() {
    assert.equal(remaining, 0, 'Auth must not be deleted before Firestore data');
    authDeleted = true; events.push('auth');
  }};
  class HttpsError extends Error {constructor(code, message) {super(message); this.code = code;}}
  const modules = {
    'firebase-functions/v2/https': {onCall: (_options, handler) => handler, HttpsError},
    'firebase-admin/app': {initializeApp() {}, getApps: () => [1]},
    'firebase-admin/firestore': {getFirestore: () => db, FieldValue: {serverTimestamp: () => 'now'}},
    'firebase-admin/auth': {getAuth: () => auth}
  };
  const context = {exports: {}, require: name => {
    if (!(name in modules)) throw Error('Unexpected dependency: ' + name);
    return modules[name];
  }, console: {error() {}}};
  vm.runInNewContext(fs.readFileSync('functions/index.js', 'utf8'), context);
  const request = {auth: {uid: 'test-user', token: {auth_time: Math.floor(Date.now()/1000)}}, data: {}};
  return {invoke: (overrides = {}) => context.exports.deleteMyAccount({...request, ...overrides}), events, get remaining() {return remaining;}, get authDeleted() {return authDeleted;}, get lock() {return lock;}};
}

test('deletes all documents before Auth and completes the lock', async () => {
  const h = harness({records: 205});
  assert.equal((await h.invoke()).deleted, true);
  assert.equal(h.remaining, 0);
  assert.deepEqual(h.events, ['lock', 'batch', 'batch', 'auth', 'complete']);
});
test('failed Firestore batch keeps Auth and deletion lock intact', async () => {
  const h = harness({failBatch: true});
  await assert.rejects(h.invoke(), error => error.code === 'internal');
  assert.equal(h.authDeleted, false);
  assert.equal(h.lock.state, 'deleting');
});
test('retry resumes an interrupted deletion', async () => {
  const h = harness({lockState: 'deleting'});
  assert.equal((await h.invoke()).deleted, true);
  assert.equal(h.remaining, 0);
  assert.equal(h.lock.state, 'completed');
});
test('completed lock is never downgraded or rerun', async () => {
  const h = harness({lockState: 'completed'});
  assert.equal((await h.invoke()).deleted, true);
  assert.equal(h.authDeleted, false);
  assert.equal(h.lock.state, 'completed');
});

test('final status failure after Auth deletion retains lock for admin recovery', async () => {
  const h = harness({failCompletion: true});
  await assert.rejects(h.invoke(), error => error.code === 'internal');
  assert.equal(h.remaining, 0);
  assert.equal(h.authDeleted, true);
  assert.equal(h.lock.state, 'deleting');
  assert.deepEqual(h.events, ['lock', 'batch', 'auth']);
});

test('unexpected lock state blocks deletion without touching Auth', async () => {
  const h = harness({lockState: 'unknown'});
  await assert.rejects(h.invoke(), error => error.code === 'failed-precondition');
  assert.equal(h.authDeleted, false);
  assert.equal(h.lock.state, 'unknown');
});

test('does not delete Auth when unknown collections, parent or control data exist', async () => {
  for (const options of [{unknownCollections: ['devices']}, {parentExists: true}, {extraControl: true}]) {
    const h = harness(options);
    await assert.rejects(h.invoke(), error => error.code === 'internal');
    assert.equal(h.authDeleted, false);
    assert.equal(h.lock.state, 'deleting');
  }
});

test('rejects unauthenticated requests before creating a deletion lock', async () => {
  const h = harness();
  await assert.rejects(h.invoke({auth: null}), error => error.code === 'unauthenticated');
  assert.equal(h.lock, null);
  assert.equal(h.authDeleted, false);
});

test('rejects stale or future authentication before touching user data', async () => {
  for (const authTime of [Math.floor(Date.now() / 1000) - 601, Math.floor(Date.now() / 1000) + 120, undefined]) {
    const h = harness();
    await assert.rejects(
      h.invoke({auth: {uid: 'test-user', token: {auth_time: authTime}}}),
      error => error.code === 'failed-precondition'
    );
    assert.equal(h.lock, null);
    assert.equal(h.authDeleted, false);
  }
});

test('rejects deletion requests with parameters before creating the lock', async () => {
  const h = harness();
  await assert.rejects(h.invoke({data: {uid: 'another-user'}}), error => error.code === 'invalid-argument');
  assert.equal(h.lock, null);
  assert.equal(h.authDeleted, false);
});

test('refuses nested Firestore data before deleting documents or Auth', async () => {
  const h = harness({nestedDocuments: true});
  await assert.rejects(h.invoke(), error => error.code === 'internal');
  assert.equal(h.authDeleted, false);
  assert.equal(h.remaining, 3);
  assert.equal(h.lock.state, 'deleting');
  assert.deepEqual(h.events, ['lock']);
});
