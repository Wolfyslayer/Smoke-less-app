import {useEffect,useRef,useState} from 'react';
import type {Dispatch,MutableRefObject,SetStateAction} from 'react';
import type {Data} from '../domain';
import {syncCloudData} from '../cloudSync';
import {backupBeforeCloudImport} from '../storage';
import {useAppResumeTrigger} from './useAppResumeTrigger';

/** Owns the existing debounced, account-scoped cloud sync workflow. */
export function useCloudSync({
 data,setData,dataRef,ready,sessionUser,migrationBusy,cloudPreviewBusy,verifyCurrentUid
}:{
 data:Data;setData:Dispatch<SetStateAction<Data>>;dataRef:MutableRefObject<Data>;
 ready:boolean;sessionUser:{uid:string}|null;migrationBusy:boolean;cloudPreviewBusy:boolean;
 verifyCurrentUid:()=>string|null;
}){
 const [syncStatus,setSyncStatus]=useState('');
 const [syncTrigger,setSyncTrigger]=useState(0);
 const syncInFlight=useRef(false);
 useEffect(()=>{
  if(!sessionUser || !ready || migrationBusy || cloudPreviewBusy)return;
  const uid=sessionUser.uid;
  const timer=setTimeout(()=>{
   if(syncInFlight.current || verifyCurrentUid()!==uid)return;
   const original=JSON.stringify(dataRef.current);
   syncInFlight.current=true;
   setSyncStatus('Synkroniserar…');
   void (async()=>{
    try{
     const merged=await syncCloudData(uid,dataRef.current);
     if(verifyCurrentUid()!==uid)return;
     if(JSON.stringify(dataRef.current)!==original){setSyncStatus('Lokala data ändrades. Synkroniserar igen.');setSyncTrigger(v=>v+1);return;}
     if(JSON.stringify(merged)!==original){
      await backupBeforeCloudImport(dataRef.current);
      if(verifyCurrentUid()!==uid || JSON.stringify(dataRef.current)!==original)return;
      setData(merged);
     }
     setSyncStatus('Synkroniserad med Firestore');
    }catch(error){
     if(verifyCurrentUid()===uid)setSyncStatus(error instanceof Error?error.message:'Synkronisering misslyckades. Försöker igen nästa gång appen öppnas.');
    }finally{syncInFlight.current=false;}
   })();
  },1200);
  return()=>clearTimeout(timer);
 },[data,ready,sessionUser?.uid,syncTrigger,migrationBusy,cloudPreviewBusy]);
 useAppResumeTrigger(setSyncTrigger);
 return {syncStatus};
}
