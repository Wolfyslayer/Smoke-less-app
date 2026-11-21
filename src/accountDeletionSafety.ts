export class DeletionError extends Error {}
type WriteStorage={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<unknown>;removeItem?:(key:string)=>Promise<unknown>};
export type DeletionStorage=WriteStorage&{removeItem:(key:string)=>Promise<unknown>;getAllKeys:()=>Promise<readonly string[]>;multiRemove:(keys:string[])=>Promise<unknown>};
export type LocalDeletionState='pending'|'confirmed'|null;
const markerWrites=new Map<string,Promise<unknown>>(),listeners=new Set<()=>void>();
export function observeLocalDeletion(listener:()=>void){listeners.add(listener);return ()=>{listeners.delete(listener);};}
const changed=()=>listeners.forEach(listener=>listener());
function queueMarker<T>(key:string,action:()=>Promise<T>){const next=(markerWrites.get(key)??Promise.resolve()).catch(()=>{}).then(action);markerWrites.set(key,next);void next.finally(()=>{if(markerWrites.get(key)===next)markerWrites.delete(key);}).catch(()=>{});return next;}
export function deletionMarkerKey(uid:string){
 if(typeof uid!=='string'||!uid||uid.length>128)throw new DeletionError('Ogiltigt konto-ID.');
 return 'smokeless:account-deletion:v1:'+encodeURIComponent(uid);
}
export async function localDeletionState(storage:Pick<WriteStorage,'getItem'>,uid:string):Promise<LocalDeletionState>{
 const value=await storage.getItem(deletionMarkerKey(uid));
 if(value===null)return null;
 // Unknown/corrupt states must also block writes, never silently unlock an account.
 if(value==='confirmed')return 'confirmed';
 try{const record=JSON.parse(value);return record?.version===1&&record.state==='confirmed'?'confirmed':'pending';}catch{return 'pending';}
}
export function markLocalDeletion(storage:WriteStorage,uid:string,state:Exclude<LocalDeletionState,null>,owner='remote'){
 const key=deletionMarkerKey(uid);
 return queueMarker(key,async()=>{
  if(state==='pending'&&await localDeletionState(storage,uid)==='confirmed')return;
  await storage.setItem(key,JSON.stringify({version:1,state,owner}));changed();
 });
}
export function clearOwnPendingDeletion(storage:DeletionStorage,uid:string,owner:string){
 const key=deletionMarkerKey(uid);
 return queueMarker(key,async()=>{
  let marker;try{marker=JSON.parse(await storage.getItem(key)??'null');}catch{return;}
  if(marker?.version===1&&marker.state==='pending'&&marker.owner===owner){await storage.removeItem(key);changed();}
 });
}
export async function assertAccountWritable(storage:Pick<WriteStorage,'getItem'>,uid:string|null){
 if(uid!==null&&await localDeletionState(storage,uid))throw new DeletionError('Kontoradering pågår. Kontots lokala data får inte ändras eller laddas upp.');
}
export async function writeAccountScoped(storage:WriteStorage,uid:string|null,key:string,value:string){
 await assertAccountWritable(storage,uid);
 await storage.setItem(key,value);
 try{await assertAccountWritable(storage,uid);}catch(error){
  // A delayed write may finish after confirmed cleanup. Remove only its own key.
  // Pending deletion may still abort before the server call: preserve history then.
  if(uid!==null&&await localDeletionState(storage,uid)==='confirmed'&&storage.removeItem)await storage.removeItem(key);
  throw error;
 }
}
export function isOwnedAccountKey(uid:string,key:string){
 if(!/^[A-Za-z0-9_-]{1,128}$/.test(uid))throw new DeletionError('Ogiltigt konto-ID.');
 const preferences=['dashboard','journey','action-plans','guidance'].map(name=>`smokeless:${name}:v1:account:${encodeURIComponent(uid)}`);
 return key===`smoke-less-v6-account:${uid}`||preferences.includes(key)||key.startsWith(`smoke-less-v6-migration-backup:${uid}:`)||key.startsWith(`smoke-less-pre-cloud-import:v2:account:${uid}:`);
}
export async function purgeConfirmedAccount(storage:DeletionStorage,uid:string){
 if(await localDeletionState(storage,uid)!=='confirmed')throw new DeletionError('Serverns radering måste vara bekräftad före lokal städning.');
 const keys=(await storage.getAllKeys()).filter(key=>isOwnedAccountKey(uid,key));
 if(keys.length)await storage.multiRemove(keys);
 if((await storage.getAllKeys()).some(key=>isOwnedAccountKey(uid,key)))throw new DeletionError('Kontots lokala kopior kunde inte tas bort helt. Försök igen.');
 // Keep the tombstone so delayed work and a stale signed-in session cannot restore data.
 return keys.length;
}
