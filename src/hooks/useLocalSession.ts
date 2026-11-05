import {useEffect,useRef} from 'react';
import {AppState} from 'react-native';
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
  // Block saves and cloud synchronization until the target session is loaded.
  setReady(false);
  setLoadError(null);
  loadedDataRef.current=null;
  // Clearing privacy is a prerequisite to loading the next identity.
  // Never allow a failed clear to silently carry the previous account's opt-in.
  void (async()=>{
   try{
    if(previousRequestedKey.current!==requestedKey){
     await clearWidgetPrivacy();
     if(!active || generation!==switchGeneration.current)return;
     previousRequestedKey.current=requestedKey;
    }
    const snapshot=await storageRef.current.switchTo(target);
    if(!active || generation!==switchGeneration.current)return;
    sessionRef.current=snapshot.session;
    loadedDataRef.current=snapshot.data;
    setData(snapshot.data);
    setReady(true);
    // Restore today's launcher widget after app restart, even without a new entry.
    // The serialized native queue ensures a later account switch clears this data.
    void refreshWidgetSnapshot(snapshot.data).catch(()=>{});
   }catch(error){
    if(active && generation===switchGeneration.current)
     setLoadError(error instanceof Error?error.message:'Kunde inte läsa lokal historik eller rensa widgetdata.');
   }
  })();
  return()=>{active=false;};
 },[requestedKey]);

 // On returning from the background, refresh today's widget even when no new entry was saved.
 // The native provider separately handles midnight and timezone broadcasts.
 useEffect(()=>{
  if(!sessionReady)return;
  const subscription=AppState.addEventListener('change',state=>{
   if(state==='active' && sessionKey(sessionRef.current)===requestedKey){
    void refreshWidgetSnapshot(data).catch(()=>{});
   }
  });
  return()=>subscription.remove();
 },[sessionReady,requestedKey,data]);

 useEffect(()=>{
  if(!sessionReady || data===loadedDataRef.current)return;
  const target=sessionRef.current;
  const generation=switchGeneration.current;
  storageRef.current.save(target,data).then(()=>{
   // Publish only after a successful local save and only for the same active session.
   if(generation!==switchGeneration.current || sessionKey(sessionRef.current)!==sessionKey(target))return;
   return refreshWidgetSnapshot(data).catch(()=>{});
  }).catch(error=>{
   // Never display stale save failures after switching accounts.
   if(sessionKey(sessionRef.current)===sessionKey(target))
    showMessage('Kunde inte spara',error instanceof Error?error.message:'Kontrollera lagringsutrymmet.');
  });
 },[data,sessionReady,requestedKey]);
 return {storageRef,loadedDataRef,sessionRef,sessionReady};
}
