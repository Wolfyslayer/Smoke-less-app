import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import type {Data} from './domain';
import {isCloudData, userDocumentPath} from './cloudSchema';
import {readCloudSnapshot} from './cloudRead.native';
import {previewMerge} from './syncMerge';

/**
 * Safe, additive synchronization: read server state, merge only when there
 * are no conflicts/tombstones, and create missing documents transactionally.
 * Never overwrites a remote document or silently resurrects deletions.
 */
export async function syncCloudData(uid: string, local: Data): Promise<Data> {
  const assertUser = () => {
    if (auth().currentUser?.uid !== uid) throw new Error('Kontot ändrades. Synkronisering avbruten.');
  };
  assertUser();
  if (!isCloudData(local)) throw new Error('Lokala data har ogiltigt format för molnsynkronisering.');
  const remote = await readCloudSnapshot(uid);
  assertUser();
  if (remote.hasTombstones) throw new Error('Molnet innehåller raderade poster. Automatisk synkronisering pausad för att undvika återställning av raderad data.');
  const preview = previewMerge(local, remote.data);
  if (!preview.safeToApply) throw new Error('Lokal historik och molnhistorik skiljer sig. Automatisk synkronisering pausad för att undvika överskrivning.');
  const base = firestore().doc(userDocumentPath(uid));
  const jobs: {path:string;payload:Record<string,unknown>}[] = [];
  if (local.profile && !remote.data.profile) jobs.push({path:'settings/plan',payload:local.profile as unknown as Record<string,unknown>});
  const addMissing = <T extends Record<string,unknown>>(collection:string, localItems:T[], remoteItems:T[], key:(v:T)=>string) => {
    const existing = new Set(remoteItems.map(key));
    for (const item of localItems) if (!existing.has(key(item))) jobs.push({path:collection+'/'+key(item),payload:item});
  };
  addMissing('entries',local.entries as unknown as Record<string,unknown>[],remote.data.entries as unknown as Record<string,unknown>[],v=>String(v.id));
  addMissing('cravings',local.cravings as unknown as Record<string,unknown>[],remote.data.cravings as unknown as Record<string,unknown>[],v=>String(v.id));
  addMissing('checkins',local.checkins as unknown as Record<string,unknown>[],remote.data.checkins as unknown as Record<string,unknown>[],v=>String(v.date));
  for (const job of jobs) {
    assertUser();
    const doc = base.collection(job.path.split('/')[0]).doc(job.path.split('/')[1]);
    await firestore().runTransaction(async transaction => {
      const existing = await transaction.get(doc);
      if (existing.exists()) {
        // A concurrent writer appeared; do not overwrite it.
        throw new Error('Molndata ändrades under synkroniseringen. Försök igen.');
      }
      assertUser();
      transaction.set(doc,{
        ...job.payload,
        schemaVersion:1,
        revision:1,
        deleted:false,
        updatedAt:firestore.FieldValue.serverTimestamp(),
      });
    });
  }
  assertUser();
  return preview.merged;
}
