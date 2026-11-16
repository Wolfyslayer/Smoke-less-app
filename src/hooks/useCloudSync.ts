import {userMessage} from '../userMessage.cjs';
import {useEffect,useRef,useState} from 'react';
import type {Dispatch,MutableRefObject,SetStateAction} from 'react';
import type {Data} from '../domain';
import {syncCloudData,resetObservedCloudPlans,subscribeCloudChanges} from '../cloudSync';
import {backupBeforeCloudImport} from '../storage';
import {useAppResumeTrigger} from './useAppResumeTrigger';

export type SyncPhase='idle'|'syncing'|'synced'|'error';

/** Owns the existing debounced, account-scoped cloud sync workflow. */
export function useCloudSync({
 data,setData,dataRef,ready,sessionUser,migrationBusy,cloudPreviewBusy,verifyCurrentUid
}:{
 data:Data;setData:Dispatch<SetStateAction<Data>>;dataRef:MutableRefObject<Data>;
 ready:boolean;sessionUser:{uid:string}|null;migrationBusy:boolean;cloudPreviewBusy:boolean;
 verifyCurrentUid:()=>string|null;
}){
 const [syncState,setSyncState]=useState<{uid:string|null;phase:SyncPhase;message:string}>({uid:null,phase:'idle',message:''});
 const currentUid=sessionUser?.uid??null;
 const scopedState=currentUid!==null&&syncState.uid===currentUid?syncState:{phase:'idle' as const,message:''};
 const setSync=(uid:string,phase:SyncPhase,message:string)=>setSyncState({uid,phase,message});
 const [syncTrigger,setSyncTrigger]=useState(0);
 const syncInFlight=useRef(false);
 const syncQueued=useRef(false);
 const lastUid=useRef<string|null|undefined>(undefined);
 useEffect(()=>{
  const uid=sessionUser?.uid??null;
  if(lastUid.current!==uid){resetObservedCloudPlans();lastUid.current=uid;setSyncState({uid,phase:'idle',message:''});}
 },[sessionUser?.uid]);
 useEffect(()=>{
  if(!sessionUser || !ready || migrationBusy || cloudPreviewBusy)return;
  const uid=sessionUser.uid;
  const timer=setTimeout(()=>{
   if(verifyCurrentUid()!==uid)return;
   if(syncInFlight.current){syncQueued.current=true;return;}
   const original=JSON.stringify(dataRef.current);
   syncInFlight.current=true;
   setSync(uid,'syncing','Synkroniserar…');
   void (async()=>{
    try{
     const merged=await syncCloudData(uid,dataRef.current);
     if(verifyCurrentUid()!==uid)return;
     if(JSON.stringify(dataRef.current)!==original){setSync(uid,'syncing','Lokala data ändrades. Synkroniserar igen.');setSyncTrigger(v=>v+1);return;}
     if(JSON.stringify(merged)!==original){
      await backupBeforeCloudImport(dataRef.current,uid);
      if(verifyCurrentUid()!==uid || JSON.stringify(dataRef.current)!==original)return;
      setData(merged);
     }
     setSync(uid,'synced','Historiken är synkroniserad');
    }catch(error){
     if(verifyCurrentUid()===uid)setSync(uid,'error',userMessage(error,'Synkronisering misslyckades. Försöker igen nästa gång appen öppnas.'));
    }finally{
     syncInFlight.current=false;
     if(syncQueued.current){syncQueued.current=false;setSyncTrigger(v=>v+1);}
    }
   })();
  },1200);
  return()=>clearTimeout(timer);
 },[data,ready,sessionUser?.uid,syncTrigger,migrationBusy,cloudPreviewBusy]);
 useEffect(()=>{
  if(!sessionUser || !ready || migrationBusy || cloudPreviewBusy)return;
  const uid=sessionUser.uid;
  let active=true;
  const unsubscribe=subscribeCloudChanges(uid,()=>{
   if(active && verifyCurrentUid()===uid){
    if(syncInFlight.current)syncQueued.current=true;
    else setSyncTrigger(v=>v+1);
   }
  },error=>{
   if(active && verifyCurrentUid()===uid)setSync(uid,'error',userMessage(error,'Kunde inte följa ändringar i molnet. Försök synkronisera igen.'));
  });
  return()=>{active=false;unsubscribe();};
 },[sessionUser?.uid,ready,migrationBusy,cloudPreviewBusy]);
 useAppResumeTrigger(setSyncTrigger);
 const retrySync=()=>{setSyncState({uid:currentUid,phase:'idle',message:''});if(syncInFlight.current){syncQueued.current=true;}else{setSyncTrigger(v=>v+1);}};
 return {syncStatus:scopedState.message,syncPhase:scopedState.phase,retrySync};
}
