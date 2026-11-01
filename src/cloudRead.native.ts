import {getFirestore,doc,collection,getDoc,getDocs} from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';
import type {Data} from './domain';
import {isCloudProfile, isCloudEntry, isCloudCraving, isCloudCheckin, userDocumentPath} from './cloudSchema';
import {previewMerge, type MergePreview} from './syncMerge';

type CloudMeta = {schemaVersion: number; revision: number; deleted: boolean};
type CloudSnapshot = {data: Data; hasTombstones: boolean};
function unwrap(value: unknown): {payload: Record<string, unknown>; deleted: boolean} {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ogiltig molndata');
  const {schemaVersion, revision, deleted, updatedAt, ...payload} = value as Record<string, unknown>;
  if (schemaVersion !== 1 || !Number.isInteger(revision) || (revision as number) < 1 || typeof deleted !== 'boolean' || !updatedAt) {
    throw new Error('Okänt format för molndata');
  }
  return {payload, deleted};
}
/** Read-only. No writes, no migration and no local storage mutation. */
export async function readCloudSnapshot(uid: string): Promise<CloudSnapshot> {
  if (!uid || getAuth().currentUser?.uid !== uid) throw new Error('Kontot har ändrats. Logga in igen.');
  // Read in stages so the error screen can identify the failing Firebase call.
  const readStage=async <T>(stage:string,operation:()=>Promise<T>):Promise<T>=>{
    try{return await operation();}
    catch(error){const message=error instanceof Error?error.message:String(error);throw new Error('Firestore / '+stage+': '+message);}
  };
  const db=await readStage('initiera databasen',async()=>getFirestore());
  const base=await readStage('skapa användarreferens',async()=>doc(db,userDocumentPath(uid)));
  const plan=await readStage('läsa sparad plan',()=>getDoc(doc(base,'settings','plan')));
  const entries=await readStage('läsa cigaretthistorik',()=>getDocs(collection(base,'entries')));
  const cravings=await readStage('läsa röksug',()=>getDocs(collection(base,'cravings')));
  const checkins=await readStage('läsa avstämningar',()=>getDocs(collection(base,'checkins')));
  if (getAuth().currentUser?.uid !== uid) throw new Error('Kontot ändrades under hämtningen.');
  let hasTombstones = false;
  const parse = <T>(items: {data: () => unknown}[], validate: (v: unknown) => v is T): T[] =>
    items.flatMap(item => {
      const {payload, deleted} = unwrap(item.data());
      if (deleted) {hasTombstones = true; return []; }
      if (!validate(payload)) throw new Error('Molndata kunde inte valideras');
      return [payload];
    });
  let profile: Data['profile'] = null;
  if (plan.exists()) {
    const parsed = unwrap(plan.data());
    if (parsed.deleted) hasTombstones = true;
    else {
      if (!isCloudProfile(parsed.payload)) throw new Error('Ogiltig molnprofil');
      profile = parsed.payload;
    }
  }
  return {
    data: {
      profile,
      entries: parse(entries.docs, isCloudEntry),
      cravings: parse(cravings.docs, isCloudCraving),
      checkins: parse(checkins.docs, isCloudCheckin),
    },
    hasTombstones,
  };
}
/** Read-only inventory before a future destructive operation. Does not delete data. */
export async function inspectCloudDeletion(uid:string):Promise<{entries:number;cravings:number;checkins:number;plan:boolean;hasTombstones:boolean}>{
  const snapshot=await readCloudSnapshot(uid);
  return {entries:snapshot.data.entries.length,cravings:snapshot.data.cravings.length,checkins:snapshot.data.checkins.length,plan:snapshot.data.profile!==null,hasTombstones:snapshot.hasTombstones};
}

export async function previewCloudImport(uid: string, local: Data): Promise<MergePreview> {
  const remote = await readCloudSnapshot(uid);
  const preview = previewMerge(local, remote.data);
  // Without tombstone reconciliation, deleted records could be resurrected.
  return {...preview, safeToApply: preview.safeToApply && !remote.hasTombstones};
}
