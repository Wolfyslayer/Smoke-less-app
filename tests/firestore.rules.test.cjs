const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {initializeTestEnvironment, assertSucceeds, assertFails} = require('@firebase/rules-unit-testing');
const {doc, getDoc, setDoc, updateDoc, deleteDoc} = require('firebase/firestore');

let env;
const projectId = 'smokeless-rules-test';
const valid = (id = 'e1') => ({
  schemaVersion: 1, updatedAt: new Date('2025-01-01T00:00:00Z'),
  revision: 1, deleted: false, id, at: '2025-01-01T12:00:00.000Z'
});
const path = (uid, id = 'e1') => `users/${uid}/entries/${id}`;
const db = uid => env.authenticatedContext(uid).firestore();

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'Run through Firebase Emulator Suite');
  env = await initializeTestEnvironment({
    projectId,
    firestore: {rules: fs.readFileSync('firestore.rules', 'utf8')}
  });
});
after(async () => { if (env) await env.cleanup(); });

test('guest cannot read or write', async () => {
  const guest = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(guest, path('alice'))));
  await assertFails(setDoc(doc(guest, path('alice')), valid()));
});
test('owner may create and read valid record', async () => {
  await assertSucceeds(setDoc(doc(db('alice'), path('alice')), valid()));
  await assertSucceeds(getDoc(doc(db('alice'), path('alice'))));
});
test('cross-user reads and writes are rejected', async () => {
  await assertFails(getDoc(doc(db('bob'), path('alice'))));
  await assertFails(setDoc(doc(db('bob'), path('alice','other')), valid('other')));
});
test('unknown fields and invalid data are rejected', async () => {
  await assertFails(setDoc(doc(db('alice'), path('alice','bad')), {...valid('bad'), secret: 'no'}));
  await assertFails(setDoc(doc(db('alice'), path('alice','bad2')), {...valid('bad2'), revision: 0}));
  await assertFails(setDoc(doc(db('alice'), path('alice','bad3')), {...valid('bad3'), at: 'x'.repeat(50)}));
});
test('revision must advance and hard delete is denied', async () => {
  const ref = doc(db('alice'), path('alice','rev'));
  await assertSucceeds(setDoc(ref, valid('rev')));
  await assertFails(updateDoc(ref, {revision: 1}));
  await assertFails(updateDoc(ref, {revision: 3}));
  await assertSucceeds(updateDoc(ref, {revision: 2, deleted: true}));
  await assertFails(deleteDoc(ref));
});
test('unlisted paths and parent documents are denied', async () => {
  await assertFails(setDoc(doc(db('alice'), 'users/alice'), {test: true}));
  await assertFails(setDoc(doc(db('alice'), 'users/alice/sync/device1'), {test: true}));
});
