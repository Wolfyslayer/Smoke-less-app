'use strict';

/**
 * Server-only account deletion endpoint. NOT deployed or exposed in the app
 * until its emulator tests, deployment config and recovery procedure pass QA.
 *
 * Requires firebase-functions v2 and firebase-admin in the functions runtime.
 * A persistent server-owned lock prevents stale signed-in clients from writing
 * after deletion begins, including while an old auth token remains valid.
 */
const {onCall, HttpsError} = require('firebase-functions/v2/https');
const {initializeApp, getApps} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {getAuth} = require('firebase-admin/auth');

if (!getApps().length) initializeApp();

const COLLECTIONS = ['entries', 'cravings', 'checkins', 'settings'];
const MAX_AUTH_AGE_SECONDS = 5 * 60;

async function deleteCollection(db, collectionRef) {
  while (true) {
    const snapshot = await collectionRef.limit(200).get();
    if (snapshot.empty) return;
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

exports.deleteMyAccount = onCall(
  {maxInstances: 10, timeoutSeconds: 540, memory: '256MiB'},
  async request => {
    const uid = request.auth?.uid;
    const authTime = Number(request.auth?.token?.auth_time);
    if (!uid) throw new HttpsError('unauthenticated', 'Logga in först.');
    if (!Number.isFinite(authTime) || Date.now() / 1000 - authTime > MAX_AUTH_AGE_SECONDS ||
        authTime > Date.now() / 1000 + 60) {
      throw new HttpsError('failed-precondition', 'Logga in på nytt innan kontot raderas.');
    }
    if (request.data && Object.keys(request.data).length) {
      throw new HttpsError('invalid-argument', 'Inga parametrar förväntas.');
    }

    const db = getFirestore();
    const base = db.collection('users').doc(uid);
    const lock = base.collection('control').doc('deletion');

    // Never remove the lock. Existing Firestore security rules reject all
    // client writes while it exists, even after Authentication deletion.
    await lock.set({
      state: 'deleting',
      requestedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    try {
      for (const collection of COLLECTIONS) {
        await deleteCollection(db, base.collection(collection));
      }
      // Auth deletion is LAST: a failure before this point can be retried by
      // the same user; after it succeeds, the server-owned lock remains.
      await getAuth().deleteUser(uid);
      await lock.set({state: 'completed', completedAt: FieldValue.serverTimestamp()}, {merge: true});
      return {deleted: true};
    } catch (error) {
      // Never remove the lock or report success on partial failure. Admin
      // recovery is required if auth deletion succeeded but final status fails.
      console.error('Account deletion incomplete', {uid, error});
      throw new HttpsError('internal', 'Raderingen kunde inte bekräftas. Kontakta support.');
    }
  }
);
