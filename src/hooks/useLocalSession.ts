import {useEffect,useRef} from 'react';
import type {Dispatch,SetStateAction} from 'react';
import type {Data} from '../domain';
import {LocalSessionStorage,type LocalSession} from '../localSessionStorage';
import type {AccountUser} from '../authService';

export function useLocalSession({sessionUser,data,setData,ready,setReady,setLoadError,showMessage}:{
 sessionUser:AccountUser|null;data:Data;setData:Dispatch<SetStateAction<Data>>;
 ready:boolean;setReady:(ready:boolean)=>void;setLoadError:(error:string|null)=>void;
 showMessage:(title:string,message:string)=>void;
}){
 const storageRef=useRef(new LocalSessionStorage());
 const loadedDataRef=useRef<Data|null>(null);
 const sessionRef=useRef<LocalSession>(sessionUser?{kind:'account',uid:sessionUser.uid}:{kind:'guest'});
 useEffect(()=>{
  let active=true;
  storageRef.current.switchTo(sessionRef.current).then(snapshot=>{
   if(!active)return;
   loadedDataRef.current=snapshot.data;
   setData(snapshot.data);
   setReady(true);
  }).catch(error=>{
   if(active)setLoadError(error instanceof Error?error.message:'Kunde inte läsa lokal historik.');
  });
  return()=>{active=false;};
 },[]);
 useEffect(()=>{
  if(!ready || data===loadedDataRef.current)return;
  storageRef.current.save(sessionRef.current,data).catch(error=>showMessage('Kunde inte spara',error instanceof Error?error.message:'Kontrollera lagringsutrymmet.'));
 },[data,ready]);
 return {storageRef,loadedDataRef,sessionRef};
}
