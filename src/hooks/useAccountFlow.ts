import {useRef,useState,type Dispatch,type SetStateAction} from 'react';
import type {Data} from '../domain';
import type {LocalSessionStorage} from '../localSessionStorage';
import * as account from '../authService';
import {previewCloudImport,inspectCloudDeletion} from '../cloudRead';
import {backupBeforeCloudImport} from '../storage';

type Tab='home'|'plan'|'register'|'stats'|'profile'|'account'|'sos'|'history'|'benefits'|'settings';
type Props={
 sessionUser:account.AccountUser|null;
 verifyCurrentUid:()=>string|null;
 data:Data;
 setData:Dispatch<SetStateAction<Data>>;
 storageRef:{current:LocalSessionStorage};
 loadedDataRef:{current:Data|null};
 setTab:Dispatch<SetStateAction<Tab>>;
 showMessage:(title:string,message:string)=>void;
 ask:(title:string,message:string,confirm:()=>void)=>void;
};
export function useAccountFlow({sessionUser,verifyCurrentUid,data,setData,storageRef,loadedDataRef,setTab,showMessage,ask}:Props){
 const accountUser=sessionUser;const [emailVerified,setEmailVerified]=useState(!!sessionUser?.emailVerified);const [verificationBusy,setVerificationBusy]=useState(false);const [accountEmail,setAccountEmail]=useState(''),[accountPassword,setAccountPassword]=useState(''),[accountBusy,setAccountBusy]=useState(false),[accountMode,setAccountMode]=useState<'login'|'signup'>('login');const [migrationBusy,setMigrationBusy]=useState(false);const migrationBusyRef=useRef(false);const [cloudPreviewBusy,setCloudPreviewBusy]=useState(false),[cloudPreviewResult,setCloudPreviewResult]=useState<string|null>(null);
 const dataRef=useRef(data);dataRef.current=data;
 const accountUidRef={get current(){return verifyCurrentUid();}};
 const previewCloud=async()=>{if(!accountUser||cloudPreviewBusy)return;const uid=accountUser.uid;setCloudPreviewBusy(true);setCloudPreviewResult(null);try{const preview=await previewCloudImport(uid,data);if(accountUser?.uid!==uid)return;const localCount=data.entries.length+data.cravings.length+data.checkins.length;const mergedCount=preview.merged.entries.length+preview.merged.cravings.length+preview.merged.checkins.length;setCloudPreviewResult(`Lokala poster: ${localCount}. Poster efter möjlig sammanslagning: ${mergedCount}. Konflikter: ${preview.conflicts.length}. ${preview.safeToApply?'Ingen konflikt upptäckt.':'Automatisk sammanslagning är blockerad.'} Ingen data har ändrats.`)}catch(error){setCloudPreviewResult(error instanceof Error?error.message:'Kunde inte läsa molndata.')}finally{setCloudPreviewBusy(false)}};const requestCloudImport=async()=>{if(!accountUser||cloudPreviewBusy||accountBusy)return;const uid=accountUser.uid;const original=JSON.stringify(dataRef.current);setCloudPreviewBusy(true);try{const preview=await previewCloudImport(uid,dataRef.current);if(accountUidRef.current!==uid||JSON.stringify(dataRef.current)!==original)throw new Error('Kontot eller lokal historik ändrades. Försök igen.');if(!preview.safeToApply){showMessage('Import blockerad','Det finns konflikter eller raderade molnposter. Ingen historik har ändrats.');return;}const total=preview.merged.entries.length+preview.merged.cravings.length+preview.merged.checkins.length;ask('Importera molnhistorik?',`Detta lägger till molnposter i den lokala historiken (totalt ${total} poster). En säkerhetskopia sparas först på enheten. Inget laddas upp till Firebase. Fortsätt?`,()=>{void (async()=>{setCloudPreviewBusy(true);try{if(accountUidRef.current!==uid||JSON.stringify(dataRef.current)!==original)throw new Error('Kontot eller lokal historik ändrades. Starta om importen.');const fresh=await previewCloudImport(uid,dataRef.current);if(!fresh.safeToApply||accountUidRef.current!==uid||JSON.stringify(dataRef.current)!==original||JSON.stringify(fresh.merged)!==JSON.stringify(preview.merged))throw new Error('Molndata eller lokal historik ändrades. Starta om importen.');await backupBeforeCloudImport(dataRef.current);if(accountUidRef.current!==uid||JSON.stringify(dataRef.current)!==original)throw new Error('Kontot eller lokal historik ändrades. Starta om importen.');setData(fresh.merged);setCloudPreviewResult('Molnhistoriken har importerats lokalt. En säkerhetskopia sparades före importen.');}catch(error){showMessage('Importen avbröts',error instanceof Error?error.message:'Försök igen.');}finally{setCloudPreviewBusy(false)}})()});}catch(error){showMessage('Importen avbröts',error instanceof Error?error.message:'Försök igen.');}finally{setCloudPreviewBusy(false)}};const verificationAction=async(action:'send'|'refresh')=>{if(verificationBusy)return;setVerificationBusy(true);try{if(action==='send'){await account.sendVerificationEmail();showMessage('Verifieringsmejl skickat','Öppna mejlet och klicka på verifieringslänken. Återvänd sedan till Konto och välj Kontrollera verifiering.')}else{const verified=await account.refreshEmailVerification();setEmailVerified(verified);showMessage(verified?'E-post verifierad':'Väntar på verifiering',verified?'Din e-postadress är nu verifierad.':'Öppna verifieringslänken i ditt mejl och försök igen.')}}catch(error){showMessage('Kunde inte verifiera',error instanceof Error?error.message:'Försök igen senare.')}finally{setVerificationBusy(false)}};
const sendSignedInPasswordReset=async()=>{if(accountBusy||!accountUser?.email)return;setAccountBusy(true);try{await account.resetPassword(accountUser.email);showMessage('E-post skickad','Vi har skickat en länk för att ändra lösenordet till din kontoadress. Kontrollera även skräpposten.')}catch(error){showMessage('Kunde inte skicka mejl',error instanceof Error?error.message:'Försök igen senare.')}finally{setAccountBusy(false)}};
 const accountAction=async(action:'login'|'signup'|'reset'|'logout')=>{if(accountBusy)return;setAccountBusy(true);try{if(action==='logout')await account.signOut();else if(action==='reset'){if(!accountEmail.trim())throw Error('Ange din e-postadress först.');await account.resetPassword(accountEmail.trim());showMessage('E-post skickad','Om adressen finns får du instruktioner för återställning.')}else{if(!accountEmail.trim()||!accountPassword)throw Error('Fyll i e-post och lösenord.');if(action==='signup')await account.signUp(accountEmail.trim(),accountPassword);else await account.signIn(accountEmail.trim(),accountPassword);setAccountPassword('')}}catch(error){showMessage('Kunde inte genomföra åtgärden',error instanceof Error?error.message:'Försök igen senare.')}finally{setAccountBusy(false)}};
 const inspectCloudData=()=>{if(!accountUser||cloudPreviewBusy)return;const uid=accountUser.uid;setCloudPreviewBusy(true);void (async()=>{try{const result=await inspectCloudDeletion(uid);if(accountUidRef.current!==uid)throw Error('Kontot ändrades.');showMessage('Molnhistorik – endast kontroll',`Plan: ${result.plan?'Ja':'Nej'} · Cigaretter: ${result.entries} · Röksug: ${result.cravings} · Avstämningar: ${result.checkins}.${result.hasTombstones?' Raderingsmarkeringar finns i molnet.':''} Ingen data har raderats.`)}catch(error){showMessage('Kunde inte kontrollera molndata',error instanceof Error?error.message:'Försök igen senare.')}finally{setCloudPreviewBusy(false)}})()};
 const requestGuestReset=()=>{if(accountUser)return;ask('Radera gästhistorik?','Alla lokala gästregistreringar, röksug, dagliga avstämningar och din plan tas bort från den aktiva appen. En återställningskopia sparas först på enheten. Detta raderar INTE några molndata eller Firebase-konton. Vill du fortsätta?',()=>{void (async()=>{try{const key=await storageRef.current.resetGuestWithBackup();const snapshot=storageRef.current.getSnapshot();if(!snapshot||snapshot.session.kind!=='guest')throw Error('Gästsessionen ändrades.');loadedDataRef.current=snapshot.data;setData(snapshot.data);setTab('home');showMessage('Gästhistorik raderad','En lokal återställningskopia sparades under '+key+'. Kopian finns bara på den här enheten.')}catch(error){showMessage('Raderingen misslyckades',error instanceof Error?error.message:'Ingen ändring kunde bekräftas.')}})()})};
 const requestGuestMigration=()=>{
  if(!accountUser || migrationBusyRef.current || cloudPreviewBusy || accountBusy)return;
  const uid=accountUser.uid;
  ask('Kopiera gästhistorik?', 'Detta kopierar gästhistoriken till ditt inloggade konto på den här enheten. En separat säkerhetskopia sparas först. Gästhistoriken raderas inte och inget laddas upp till Firebase. Om kontot redan har lokal historik skrivs den inte över. Vill du fortsätta?',()=>{
   if(migrationBusyRef.current)return;
   migrationBusyRef.current=true;
   setMigrationBusy(true);
   void (async()=>{
    try{
     const result=await storageRef.current.migrateGuestToActiveAccount(uid,()=>accountUidRef.current);
     if(result.status==='already-exists'){
      showMessage('Kopiering avbruten','Det finns redan lokal historik för detta konto. Ingen historik har skrivits över.');
     }else{
      const snapshot=storageRef.current.getSnapshot();
      if(!snapshot || snapshot.session.kind!=='account' || snapshot.session.uid!==uid || accountUidRef.current!==uid)throw Error('Kontot ändrades. Gästhistoriken finns kvar.');
      loadedDataRef.current=snapshot.data;
      setData(snapshot.data);
      showMessage('Historiken kopierad','Gästhistoriken finns nu även på detta konto. En säkerhetskopia sparades på enheten. Gästhistoriken är oförändrad.');
     }
    }catch(error){showMessage('Kopiering avbruten',error instanceof Error?error.message:'Ingen historik har ändrats.');}
    finally{migrationBusyRef.current=false;setMigrationBusy(false);}
   })();
  });
 };

 return {accountUser,emailVerified,verificationBusy,accountBusy,accountMode,setAccountMode,accountEmail,setAccountEmail,accountPassword,setAccountPassword,migrationBusy,cloudPreviewBusy,cloudPreviewResult,previewCloud,requestCloudImport,verificationAction,sendSignedInPasswordReset,accountAction,inspectCloudData,requestGuestReset,requestGuestMigration};
}
