import firestore from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';
import type {Data,Profile} from './domain';
import {isCloudData, userDocumentPath} from './cloudSchema';
import {readCloudSnapshot} from './cloudRead.native';
import {previewMerge,canUpdateObservedPlan} from './syncMerge';

// Only a profile successfully observed during this app session can be updated.
// The remote document is rechecked inside a transaction before any write.
const observedPlans = new Map<string,string>();
let accountEpoch=0;
/** Forget in-memory cloud baselines on account transitions. */
export function resetObservedCloudPlans():void { accountEpoch++; observedPlans.clear(); }
const fingerprint = (profile:Profile) => JSON.stringify(Object.fromEntries(Object.entries(profile).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b))));

/**
 * Safe, additive synchronization: read server state, merge only when there
 * are no conflicts/tombstones, and create missing documents transactionally.
 * Never overwrites a remote document or silently resurrects deletions.
 */
export async function syncCloudData(uid: string, local: Data): Promise<Data> {
  const startedEpoch=accountEpoch;
  const assertUser = () => {
    if(startedEpoch!==accountEpoch) throw new Error('Kontosessionen ändrades. Synkronisering avbruten.');
    if (getAuth().currentUser?.uid !== uid) throw new Error('Kontot ändrades. Synkronisering avbruten.');
  };
  assertUser();
  if (!isCloudData(local)) throw new Error('Lokala data har ogiltigt format för molnsynkronisering.');
  const remote = await readCloudSnapshot(uid);
  assertUser();
  if (remote.hasTombstones) throw new Error('Molnet innehåller raderade poster. Automatisk synkronisering pausad för att undvika återställning av raderad data.');
  const remotePlan = remote.data.profile;
  const localPlan = local.profile;
  const known = observedPlans.get(uid);
  const planChanged = !!localPlan && !!remotePlan && fingerprint(localPlan)!==fingerprint(remotePlan);
  // The cloud owns an existing plan on the first sync after login (or after a
  // different device changed it). A locally edited plan may only be uploaded
  // after this session has observed the exact remote baseline. This prevents
  // a stale local plan from blocking all history synchronization.
  const canUpdatePlan = planChanged && canUpdateObservedPlan(known,remotePlan);
  const cloudOwnsPlan = planChanged && !canUpdatePlan;
  const preview = previewMerge(
    cloudOwnsPlan || canUpdatePlan ? {...local,profile:remotePlan} : local,
    remote.data,
  );
  if (!preview.safeToApply) {
    const types=[...new Set(preview.conflicts.map(conflict=>conflict.collection))].join(', ');
    throw new Error('Lokal historik och molnhistorik skiljer sig ('+types+'). Automatisk synkronisering pausad för att undvika överskrivning.');
  }
  const writeStage=async <T>(stage:string,operation:()=>Promise<T>):Promise<T>=>{
    try{return await operation();}
    catch(error){const message=error instanceof Error?error.message:String(error);throw new Error('Firestore / '+stage+': '+message);}
  };
  const db=firestore();
  const base=db.doc(userDocumentPath(uid));
  const jobs: {path:string;payload:Record<string,unknown>}[] = [];
  if (local.profile && !remote.data.profile) jobs.push({path:'settings/plan',payload:local.profile as unknown as Record<string,unknown>});
  const addMissing = <T extends Record<string,unknown>>(collection:string, localItems:T[], remoteItems:T[], key:(v:T)=>string) => {
    const existing = new Set(remoteItems.map(key));
    for (const item of localItems) if (!existing.has(key(item))) jobs.push({path:collection+'/'+key(item),payload:item});
  };
  addMissing('entries',local.entries as unknown as Record<string,unknown>[],remote.data.entries as unknown as Record<string,unknown>[],v=>String(v.id));
  addMissing('cravings',local.cravings as unknown as Record<string,unknown>[],remote.data.cravings as unknown as Record<string,unknown>[],v=>String(v.id));
  addMissing('checkins',local.checkins as unknown as Record<string,unknown>[],remote.data.checkins as unknown as Record<string,unknown>[],v=>String(v.date));
  if (canUpdatePlan && localPlan && remotePlan) {
    assertUser();
    const planDoc=base.collection('settings').doc('plan');
    await writeStage('uppdatera plan',()=>db.runTransaction(async transaction=>{
      const current=await transaction.get(planDoc);
      if (!current.exists()) throw new Error('Planen ändrades i molnet. Försök igen.');
      const raw=current.data() as Record<string,unknown>;
      if (raw.schemaVersion!==1 || raw.deleted!==false || !Number.isInteger(raw.revision) || (raw.revision as number)<1) throw new Error('Planens molnversion är ogiltig.');
      const {schemaVersion,revision,deleted,updatedAt,...payload}=raw;
      if (fingerprint(payload as Profile)!==known) throw new Error('Planen ändrades på en annan enhet. Ingen information har skrivits över.');
      assertUser();
      transaction.set(planDoc,{...Object.fromEntries(Object.entries(localPlan).filter(([,value])=>value!==undefined)),schemaVersion:1,revision:(revision as number)+1,deleted:false,updatedAt:firestore.FieldValue.serverTimestamp()});
    }));
  }
  for (const job of jobs) {
    assertUser();
    const targetDoc=base.collection(job.path.split('/')[0]).doc(job.path.split('/')[1]);
    await writeStage('skapa '+job.path,()=>db.runTransaction(async transaction => {
      const existing = await transaction.get(targetDoc);
      if (existing.exists()) {
        // A concurrent writer appeared; do not overwrite it.
        throw new Error('Molndata ändrades under synkroniseringen. Försök igen.');
      }
      assertUser();
      transaction.set(targetDoc,{
        ...Object.fromEntries(Object.entries(job.payload).filter(([,value])=>value!==undefined)),
        schemaVersion:1,
        revision:1,
        deleted:false,
        updatedAt:firestore.FieldValue.serverTimestamp(),
      });
    }));
  }
  assertUser();
  const finalPlan=canUpdatePlan?localPlan:preview.merged.profile;
  if(finalPlan) observedPlans.set(uid,fingerprint(finalPlan));
  else observedPlans.delete(uid);
  return {...preview.merged,profile:finalPlan};
}
