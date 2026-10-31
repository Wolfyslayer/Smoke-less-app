import {useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {Platform} from 'react-native';
import type {Data,Mode} from '../domain';
import {parseBackupData} from '../utils/backupValidation';
import {updateProfile} from '../utils/profileActions';

export function useSettingsFlow({data,setData,ask,showMessage}:{
 data:Data;
 setData:Dispatch<SetStateAction<Data>>;
 ask:(title:string,message:string,confirm:()=>void)=>void;
 showMessage:(title:string,message:string)=>void;
}){
 const [backup,setBackup]=useState('');
 const backupRef=useRef(backup);backupRef.current=backup;
 const dataRef=useRef(data);dataRef.current=data;
 const onChangeMode=(mode:Mode)=>ask(mode==='reduce'?'Byta till minskning?':'Byta till rökstopp?','Din plan får ett nytt startdatum. Din tidigare historik behålls.',()=>setData(v=>updateProfile(v,{mode,startAt:new Date().toISOString()})));
 const onExportBackup=()=>{
  const value=JSON.stringify(data,null,2);
  setBackup(value);
  if(Platform.OS==='web'&&typeof navigator!=='undefined'&&navigator.clipboard)navigator.clipboard.writeText(value).catch(()=>{});
  showMessage('Säkerhetskopia skapad','Din historik finns i textfältet nedan. Kopiera och spara texten på en säker plats.');
 };
 const onRestoreBackup=()=>{
  try{
   const value=parseBackupData(backup);
   const backupSnapshot=backup;
   const dataSnapshot=JSON.stringify(data);
   const currentCount=data.entries.length+data.cravings.length+data.checkins.length;
   const backupCount=value.entries.length+value.cravings.length+value.checkins.length;
   ask(
    'Återställ historik?',
    `Säkerhetskopian innehåller ${backupCount} poster (cigaretter: ${value.entries.length}, röksug: ${value.cravings.length}, dagliga avstämningar: ${value.checkins.length}). Din nuvarande historik innehåller ${currentCount} poster och ersätts helt. Detta går inte att ångra utan en separat säkerhetskopia. Fortsätt?`,
    ()=>{
     if(backupRef.current!==backupSnapshot||JSON.stringify(dataRef.current)!==dataSnapshot){
      showMessage('Återställningen avbröts','Säkerhetskopian eller den lokala historiken har ändrats sedan förhandsgranskningen. Granska och bekräfta igen.');
      return;
     }
     setData(value);
    },
   );
  }catch{showMessage('Ogiltig säkerhetskopia','Kontrollera JSON-innehållet.')}
 };
 return {backup,setBackup,onChangeMode,onExportBackup,onRestoreBackup};
}
