'use strict';
// Run only by a trusted operator with Firebase Admin credentials.
// Default mode is read-only. This tool never deletes an Auth user or documents.
const {initializeApp, getApps} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {getAuth} = require('firebase-admin/auth');

async function main() {
  const uid = process.argv[2];
  const confirm = process.argv[3];
  if (!uid || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) {
    throw new Error('Usage: node recoverDeletion.js <uid> [--confirm-completed]');
  }
  if (confirm && confirm !== '--confirm-completed') throw new Error('Unknown argument');
  if (!getApps().length) initializeApp();
  const db = getFirestore();
  const lock = db.doc(`users/${uid}/control/deletion`);
  const snapshot = await lock.get();
  if (!snapshot.exists || snapshot.get('state') !== 'deleting') {
    throw new Error('Recovery requires an existing deletion lock in deleting state');
  }
  let authExists = true;
  try {
    await getAuth().getUser(uid);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    authExists = false;
  }
  const collections = ['entries', 'cravings', 'checkins', 'settings'];
  const counts = {};
  for (const collection of collections) {
    const sample = await db.collection(`users/${uid}/${collection}`).limit(1).get();
    counts[collection] = !sample.empty;
  }
  const hasData = Object.values(counts).some(Boolean);
  console.log(JSON.stringify({uid, authExists, collectionsWithRemainingData: Object.keys(counts).filter(k => counts[k]), action: confirm ? 'verify-and-finalize' : 'dry-run'}, null, 2));
  if (!confirm) return;
  if (authExists || hasData) {
    throw new Error('Cannot finalize: Auth user or user data still exists. Escalate for manual investigation.');
  }
  await db.runTransaction(async tx => {
    const current = await tx.get(lock);
    if (!current.exists || current.get('state') !== 'deleting') {
      throw new Error('Deletion state changed; refusing to finalize');
    }
    tx.update(lock, {state: 'completed', completedAt: FieldValue.serverTimestamp(), recoveredByAdmin: true});
  });
  console.log('Finalized deletion lock. No user documents or Auth records were modified.');
}
if (require.main === module) main().catch(error => {console.error(error.message); process.exitCode = 1;});
module.exports = {main};
