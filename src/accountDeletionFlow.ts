import {DeletionError,clearOwnPendingDeletion,isOwnedAccountKey,localDeletionState,markLocalDeletion,purgeConfirmedAccount,type DeletionStorage} from './accountDeletionSafety';
import {listLegacyRecoveryCopies} from './localRecoveryCopies';
type Dependencies={storage:DeletionStorage;currentUid:()=>string|null;recentToken:(uid:string)=>Promise<{token:string;authTime:number}>;request:(token:string)=>Promise<unknown>;beforeRequest:(uid:string)=>Promise<void>;afterConfirmed:(uid:string)=>Promise<void>;clock?:()=>number};
const activeDeletions=new Set<string>();
export function createAccountDeletionFlow(deps:Dependencies){
 let busy=false;
 const confirmedResponses=new Set<string>();
 const now=deps.clock??Date.now;
 return {
  hasConfirmedResponse:(uid:string)=>confirmedResponses.has(uid),
  // Trusted adapter boundary: only a verified completed receipt for this UID may call it.
  rememberConfirmedReceipt:(uid:string)=>{isOwnedAccountKey(uid,'');confirmedResponses.add(uid);},
  async resumeConfirmed(uid:string){
   isOwnedAccountKey(uid,'');
   if(busy||activeDeletions.has(uid))throw new DeletionError('Kontoraderingen pågår redan.');
   busy=true;activeDeletions.add(uid);
   try{if(confirmedResponses.has(uid))await markLocalDeletion(deps.storage,uid,'confirmed');await purgeConfirmedAccount(deps.storage,uid);await deps.afterConfirmed(uid);}
   finally{busy=false;activeDeletions.delete(uid);}
  },
  async run(uid:string,confirmed:boolean){
   isOwnedAccountKey(uid,'');
   if(!confirmed)throw new DeletionError('Kontoradering kräver ditt uttryckliga godkännande.');
   if(busy||activeDeletions.has(uid))throw new DeletionError('Kontoraderingen pågår redan.');
   if(deps.currentUid()!==uid)throw new DeletionError('Kontot har ändrats. Ingen ny radering startades.');
   busy=true;activeDeletions.add(uid);
   let attempted=false,marked=false;
   const operation=now()+'-'+Math.random().toString(36).slice(2);
   const initial=await localDeletionState(deps.storage,uid).catch(error=>{busy=false;activeDeletions.delete(uid);throw error;});
   try{
    if(initial!=='confirmed'){
     if((await listLegacyRecoveryCopies(deps.storage)).length)throw new DeletionError('Äldre omärkta återställningskopior måste hanteras i Inställningar före kontoradering.');
     const auth=await deps.recentToken(uid);
     const age=now()/1000-auth.authTime;
     if(!auth.token||!Number.isFinite(age)||age>240||age< -60)throw new DeletionError('Logga ut och in igen innan du raderar kontot.');
     if(deps.currentUid()!==uid)throw new DeletionError('Kontot ändrades under verifieringen. Ingen ny radering startades.');
     // Drain existing local saves while the UI/sync are paused, before blocking writes.
     await deps.beforeRequest(uid);
     if(deps.currentUid()!==uid)throw new DeletionError('Kontot ändrades. Ingen ny radering startades.');
     await markLocalDeletion(deps.storage,uid,'pending',operation);marked=true;
     if(deps.currentUid()!==uid)throw new DeletionError('Kontot ändrades. Ingen ny radering startades.');
     if(await localDeletionState(deps.storage,uid)!=='confirmed'){
      attempted=true;
      const result=await deps.request(auth.token);
      if(!result||typeof result!=='object'||(result as {deleted?:unknown}).deleted!==true)throw new DeletionError('Serverns radering kunde inte bekräftas.');
      confirmedResponses.add(uid);
      await markLocalDeletion(deps.storage,uid,'confirmed',operation);
     }
    }
    await purgeConfirmedAccount(deps.storage,uid);
    await deps.afterConfirmed(uid);
   }catch(error){
    // After a request may have reached the server, only retry/recovery can resolve it.
    // An older pending request must never be unlocked by a later preflight failure.
    if(!attempted&&marked&&initial===null)await clearOwnPendingDeletion(deps.storage,uid,operation);
    throw error;
   }finally{busy=false;activeDeletions.delete(uid);}
  },
 };
}
