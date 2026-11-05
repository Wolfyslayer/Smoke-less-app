import {useEffect,useRef} from 'react';
import type {Dispatch,SetStateAction} from 'react';
import type {Data} from '../domain';
import {LocalSessionStorage,type LocalSession} from '../localSessionStorage';
import type {AccountUser} from '../authService';
import {clearWidgetPrivacy,refreshWidgetSnapshot} from '../widgets/widgetPreferences';

const sessionKey=(session:LocalSession)=>session.kind==='guest'?'guest':'account:'+session.uid;

/** Keep guest and account data strictly separated across authentication changes. */
export function useLocalSession({sessionUser,data,setData,ready,setReady,setLoadError,showMessage}:{
 sessionUser:AccountUser|null;data:Data;setData:Dispatch<SetStateAction<Data>>;
 ready:boolean;setReady:(ready:boolean)=>void;setLoadError:(error:string|null)=>void;
 showMessage:(title:string,message:string)=>void;
}){
 const storageRef=useRef(new LocalSessionStorage());
 const loadedDataRef=useRef<Data|null>(null);
 const requestedSession:LocalSession=sessionUser?{kind:'account',uid:sessionUser.uid}:{kind:'guest'};
 const requestedKey=sessionKey(requestedSession);
 const sessionRef=useRef<LocalSession>(requestedSession);
 const switchGeneration=useRef(0);
 const previousRequestedKey=useRef(requestedKey);
 // A stale account's state must never be written or synced as the new account.
 const sessionReady=ready && sessionKey(sessionRef.current)===requestedKey;

 useEffect(()=>{
  let active=true;
  const generation=++switchGeneration.current;
  const target:LocalSession=sessionUser?{kind:'account',uid:sessionUser.uid}:{kind:'guest'};
  // Never carry a previous account's widget permission or aggregates into another session.
  if(previousRequestedKey.current!==requestedKey){
   previousRequestedKey.current=requestedKey;
   void clearWidgetPrivacy().catch(()=>{});
  }
  // Block saves and cloud synchronization until the target session is loaded.
  setReady(false);
  setLoadError(null);
  loadedDataRef.current=null;
  // Do not publish the new session identity before its storage load succeeds.
  storageRef.current.switchTo(target).then(snapshot=>{
   if(!active || generation!==switchGeneration.current)return;
   sessionRef.current=snapshot.session;
   loadedDataRef.current=snapshot.data;
   setData(snapshot.data);
   setReady(true);
  }).catch(error=>{
   if(active && generation===switchGeneration.current){
    setLoadError(error instanceof Error?error.message:'Kunde inte läsa lokal historik.');
   }
  });
  return()=>{active=false;};
 },[requestedKey]);

 useEffect(()=>{
  if(!sessionReady || data===loadedDataRef.current)return;
  const target=sessionRef.current;
  storageRef.current.save(target,data).then(()=>{
   // Publish only after a successful local save and only for the same active session.
   if(sessionKey(sessionRef.current)!==sessionKey(target))return;
   return refreshWidgetSnapshot(data).catch(()=>{});
  }).catch(error=>{
   // Never display stale save failures after switching accounts.
   if(sessionKey(sessionRef.current)===sessionKey(target))
    showMessage('Kunde inte spara',error instanceof Error?error.message:'Kontrollera lagringsutrymmet.');
  });
 },[data,sessionReady,requestedKey]);
 return {storageRef,loadedDataRef,sessionRef,sessionReady};
}
