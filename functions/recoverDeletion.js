'use strict';
// Run only by a trusted operator with Firebase Admin credentials.
// Default mode is read-only. This tool never deletes an Auth user or documents.
const {initializeApp, getApps} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {getAuth} = require('firebase-admin/auth');

async function main() {
  const [uid, projectFlag, projectId, confirm, ...extra] = process.argv.slice(2);
  if (!uid || !/^[A-Za-z0-9_-]{1,128}$/.test(uid) || projectFlag !== '--project' ||
      !projectId || !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId) || extra.length) {
    throw new Error('Usage: node recoverDeletion.js <uid> --project <project-id> [--confirm-completed]');
  }
  if (confirm && confirm !== '--confirm-completed') throw new Error('Unknown argument');
  // Never infer the project from a developer's ambient credentials or CLI state.
  // Refuse mixed emulator/production configuration before opening any database.
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (projectId.startsWith('demo-')) {
    const local = host => /^(localhost|127\.0\.0\.1):[0-9]{1,5}$/.test(host || '');
    if (!local(firestoreHost) || !local(authHost)) throw new Error('Demo recovery requires both local emulators');
  } else if (firestoreHost || authHost) {
    throw new Error('Production recovery refuses emulator environment variables');
  }
  const existing = getApps().find(app => app.name === 'deletion-recovery');
  if (existing && existing.options.projectId !== projectId) throw new Error('Recovery app project mismatch');
  const app = existing || initializeApp({projectId}, 'deletion-recovery');
  const db = getFirestore(app);
  const lock = db.doc(`users/${uid}/control/deletion`);
  const snapshot = await lock.get();
  if (!snapshot.exists || snapshot.get('state') !== 'deleting') {
    throw new Error('Recovery requires an existing deletion lock in deleting state');
  }
  let authExists = true;
  try {
    await getAuth(app).getUser(uid);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    authExists = false;
  }
  const collections = ['entries', 'cravings', 'checkins', 'settings'];
  const userDoc = db.doc(`users/${uid}`);
  const parentSnapshot = await userDoc.get();
  const actualCollections = await userDoc.listCollections();
  const unknownCollections = actualCollections.map(ref => ref.id).filter(name => ![...collections, 'control'].includes(name));
  const counts = {};
  for (const collection of collections) {
    const sample = await db.collection(`users/${uid}/${collection}`).limit(1).get();
    counts[collection] = !sample.empty;
  }
  const controlSnapshot = await db.collection(`users/${uid}/control`).limit(2).get();
  const unexpectedControlDocuments = controlSnapshot.docs.filter(doc => doc.id !== 'deletion').map(doc => doc.id);
  const hasData = Object.values(counts).some(Boolean);
  // Keep identifiers and unexpected path names out of shareable diagnostics.
  console.log(JSON.stringify({projectId, authExists, collectionsWithRemainingData: Object.keys(counts).filter(k => counts[k]), parentDocumentExists: parentSnapshot.exists, unknownCollectionCount: unknownCollections.length, unexpectedControlDocumentCount: unexpectedControlDocuments.length, action: confirm ? 'verify-and-finalize' : 'dry-run'}, null, 2));
  if (!confirm) return;
  if (authExists || hasData || parentSnapshot.exists || unknownCollections.length || unexpectedControlDocuments.length) {
    throw new Error('Cannot finalize: Auth user, parent document, unknown collections or user data still exists. Escalate for manual investigation.');
  }
  await db.runTransaction(async tx => {
    const current = await tx.get(lock);
    if (!current.exists || current.get('state') !== 'deleting') {
      throw new Error('Deletion state changed; refusing to finalize');
    }
    const leaseUntil = current.get('leaseUntilMs');
    if (typeof leaseUntil !== 'number' || !Number.isFinite(leaseUntil) || leaseUntil > Date.now()) {
      throw new Error('Deletion lease is active or invalid; refusing to finalize');
    }
    tx.update(lock, {state: 'completed', completedAt: FieldValue.serverTimestamp(), recoveredByAdmin: true});
  });
  console.log('Finalized deletion lock. No user documents or Auth records were modified.');
}
if (require.main === module) main().catch(() => {console.error('Recovery failed; verify arguments, project, credentials, deletion lease and remaining data privately.'); process.exitCode = 1;});
module.exports = {main};
