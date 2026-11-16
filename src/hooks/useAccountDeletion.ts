import {useEffect,useRef,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAccountDeletionFlow} from '../accountDeletionFlow';
import {DeletionError,localDeletionState,observeLocalDeletion} from '../accountDeletionSafety';
import * as backend from '../accountDeletionBackend';
import * as account from '../authService';
import {resetObservedCloudPlans} from '../cloudSync';
import type {LocalSessionStorage} from '../localSessionStorage';

const recoveryKey='smokeless:account-deletion-recovery-uid';
type State={phase:'loading'|'idle'|'working'|'pending'|'restart'|'error';uid:string|null;message:string;confirmed:boolean};
type Props={uid:string|null;verifyCurrentUid:()=>string|null;storageRef:{current:LocalSessionStorage};busyElsewhere:boolean;ask:(title:string,message:string,confirm:()=>void,label?:string)=>void;showMessage:(title:string,message:string)=>void};
export function useAccountDeletion(props:Props){
 const live=useRef(props);live.current=props;
 const [state,setState]=useState<State>({phase:'loading',uid:null,message:'',confirmed:false});
 const active=useRef(true),busy=useRef(false);
 const [signal,setSignal]=useState(0),restartRequired=useRef(false);
 const flow=useRef<ReturnType<typeof createAccountDeletionFlow>|null>(null);
 if(!flow.current)flow.current=createAccountDeletionFlow({storage:AsyncStorage,currentUid:()=>live.current.verifyCurrentUid(),recentToken:backend.recentDeletionToken,request:backend.requestAccountDeletion,
  beforeRequest:async uid=>{await AsyncStorage.setItem(recoveryKey,uid);resetObservedCloudPlans();await live.current.storageRef.current.flush();},
  afterConfirmed:async uid=>{await backend.finalizeDeletedDevice(uid,()=>live.current.verifyCurrentUid());await AsyncStorage.removeItem(recoveryKey);},
 });
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 useEffect(()=>observeLocalDeletion(()=>{if(active.current)setSignal(v=>v+1);}),[]);
 useEffect(()=>{
  if(busy.current||restartRequired.current)return;
  let current=true;
  setState({phase:'loading',uid:props.uid,message:'',confirmed:false});
  void(async()=>{
   try{
    if(await backend.finishDeletionCacheReset()==='restart-required'){
     if(current&&active.current){restartRequired.current=true;setState({phase:'restart',uid:null,message:'Stäng appen med knappen nedan och öppna den igen för att slutföra säker städning.',confirmed:false});}
     return;
    }
    const recovery=await AsyncStorage.getItem(recoveryKey);
    const recoveredState=recovery?await localDeletionState(AsyncStorage,recovery):null;
    if(recovery&&!recoveredState)await AsyncStorage.removeItem(recoveryKey);
    const uid=recoveredState==='confirmed'?recovery:props.uid??recovery;
    const marker=uid?await localDeletionState(AsyncStorage,uid):null;
    if(!current||!active.current)return;
    setState(marker?{phase:'pending',uid,message:marker==='confirmed'?'Serverns radering är bekräftad. Slutför städningen på den här enheten.':'En tidigare radering behöver kontrolleras eller återförsökas. Ingen ny historik laddas upp för kontot.',confirmed:marker==='confirmed'}:{phase:'idle',uid:null,message:'',confirmed:false});
   }catch{if(current&&active.current)setState({phase:'error',uid:null,message:'Säker raderingsstatus kunde inte läsas. Stäng appen helt och öppna den igen.',confirmed:false});}
  })();
  return()=>{current=false;};
 },[props.uid,signal]);
 const run=async(uid:string)=>{
  if(busy.current||live.current.busyElsewhere)return;
  busy.current=true;
  setState({phase:'working',uid,message:'Kontrollerar och behandlar din begäran. Avbryt inte appen.',confirmed:false});
  // Invalidate in-flight cloud work before waiting for auth or storage.
  resetObservedCloudPlans();
  try{
   let marker=await localDeletionState(AsyncStorage,uid);
   if(marker==='pending'&&!flow.current!.hasConfirmedResponse(uid)&&live.current.verifyCurrentUid()===uid){
    try{if(await backend.refreshDeletionReceipt(uid)==='confirmed')flow.current!.rememberConfirmedReceipt(uid);}catch{/* Keep the block; fresh-auth retry may still resolve it. */}
    marker=await localDeletionState(AsyncStorage,uid);
   }
   if(marker==='confirmed'||flow.current!.hasConfirmedResponse(uid))await flow.current!.resumeConfirmed(uid);
   else await flow.current!.run(uid,true);
   restartRequired.current=true;
   if(active.current)setState({phase:'restart',uid,message:'Kontot och dess kontohistorik är raderade. Stäng appen och öppna den igen för att fortsätta.',confirmed:true});
  }catch(error){
   let marker:Awaited<ReturnType<typeof localDeletionState>>='pending';
   try{marker=await localDeletionState(AsyncStorage,uid);}catch{/* Stay blocked if status cannot be read. */}
   const message=error instanceof DeletionError?error.message:'Raderingen kunde inte bekräftas. Försök igen eller kontakta support.';
   if(active.current){
    if(marker||flow.current!.hasConfirmedResponse(uid))setState({phase:'pending',uid,message,confirmed:marker==='confirmed'||flow.current!.hasConfirmedResponse(uid)});
    else{setState({phase:'idle',uid:null,message:'',confirmed:false});live.current.showMessage('Raderingen startades inte',message);}
   }
  }finally{busy.current=false;}
 };
 const request=()=>{
  const uid=live.current.verifyCurrentUid();
  if(!backend.deletionEnabled||!uid||busy.current||live.current.busyElsewhere)return;
  live.current.ask('Radera konto och kontohistorik?','Detta tar permanent bort Smoke Less-kontot, dess molnhistorik och lokala återställningskopior. Gästhistorik och andra kontons aktiva historik behålls. Äldre omärkta kopior behöver först hanteras i Inställningar. Logga in på nytt före radering. Du behöver starta om appen efteråt.',()=>{if(live.current.verifyCurrentUid()===uid)void run(uid);},'Radera permanent');
 };
 const leaveForGuest=async()=>{
  if(busy.current||state.confirmed)return;
  busy.current=true;
  try{await account.signOut();await AsyncStorage.removeItem(recoveryKey);if(active.current)setState({phase:'idle',uid:null,message:'',confirmed:false});}
  catch{if(active.current)setState(v=>({...v,message:'Kunde inte logga ut. Försök igen.'}));}
  finally{busy.current=false;}
 };
 const closeApp=async()=>{try{await backend.closeDeletedApp();}catch(error){if(active.current)setState(v=>({...v,message:error instanceof DeletionError?error.message:'Stäng appen helt i Androids appinställningar och öppna den igen.'}));}};
 return {state,ready:state.phase==='idle',enabled:backend.deletionEnabled,request,retry:()=>{if(state.uid)void run(state.uid);},leaveForGuest:()=>void leaveForGuest(),closeApp:()=>void closeApp()};
}
