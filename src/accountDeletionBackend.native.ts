import {DeletionError,isOwnedAccountKey,markLocalDeletion} from './accountDeletionSafety';
import {getApp} from '@react-native-firebase/app';
import {getAuth,getIdTokenResult,signOut} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import {clearWidgetPrivacy} from './widgets/widgetPreferences';
import {accountDeletionRemoteEnabled as deletionEnabled} from './accountDeletionConfig';
import {localDeletionQaConfig} from './accountDeletionQa';

// Remains off until deployment and isolated end-to-end acceptance are verified.
export {deletionEnabled};
const cacheResetKey='smokeless:deletion-cache-reset-required';
export async function recentDeletionToken(uid:string){
 const user=getAuth().currentUser;
 if(!user||user.uid!==uid)throw new DeletionError('Logga in på nytt innan du raderar kontot.');
 let result;
 try{result=await getIdTokenResult(user,true);}
 catch{throw new DeletionError('Inloggningen kunde inte verifieras. Logga ut och in igen, eller kontakta support om kontot redan har raderats.');}
 if(getAuth().currentUser?.uid!==uid)throw new DeletionError('Kontot ändrades under verifieringen.');
 return {token:result.token,authTime:Number(result.claims.auth_time)};
}
export async function refreshDeletionReceipt(uid:string):Promise<'pending'|'confirmed'|null>{
 isOwnedAccountKey(uid,'');
 if(getAuth().currentUser?.uid!==uid)throw new DeletionError('Logga in med rätt konto för att kontrollera raderingen.');
 const snapshot=await firestore().doc(`users/${uid}/control/deletion`).get({source:'server'});
 if(!snapshot.exists())return null;
 const state=snapshot.data()?.state==='completed'?'confirmed':'pending';
 try{await markLocalDeletion(AsyncStorage,uid,state);}catch(error){if(state!=='confirmed')throw error;}
 return state;
}
export async function requestAccountDeletion(token:string):Promise<unknown>{
 if(!deletionEnabled)throw new DeletionError('Kontoradering är inte aktiverad i den här versionen.');
 const project=getApp().options.projectId;
 const region=process.env.EXPO_PUBLIC_ACCOUNT_DELETION_REGION||'europe-west1';
 if(!project||!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project)||!/^[a-z]+(?:-[a-z0-9]+)+$/.test(region))throw new DeletionError('Kontoraderingens server är inte konfigurerad.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
 try{
  const response=await fetch(localDeletionQaConfig?.deletionUrl??`https://${region}-${project}.cloudfunctions.net/deleteMyAccount`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({data:{}}),signal:controller.signal});
  const payload=await response.json() as {result?:unknown;error?:unknown};
  if(!response.ok||payload.error)throw new DeletionError('Serverns radering kunde inte bekräftas. Försök igen med färsk inloggning. Om problemet kvarstår behövs support.');
  return payload.result;
 }finally{clearTimeout(timer);}
}
export async function finalizeDeletedDevice(uid:string,currentUid:()=>string|null){
 await AsyncStorage.setItem(cacheResetKey,'true');
 await firestore().terminate();
 await firestore().clearPersistence();
 if(currentUid()===uid)await clearWidgetPrivacy();
 const directory=FileSystem.cacheDirectory;
 if(!directory)throw new DeletionError('De tillfälliga delningsbilderna kunde inte kontrolleras. Försök slutföra städningen igen.');
 for(const name of await FileSystem.readDirectoryAsync(directory))if(/^smokeless-daily-progress-\d+\.png$/.test(name))await FileSystem.deleteAsync(directory+name,{idempotent:true});
 if(currentUid()===uid)await signOut(getAuth());
 // Keep the reset flag until a fresh app process verifies cache cleanup before sync.
}
export async function finishDeletionCacheReset(){
 if(await AsyncStorage.getItem(cacheResetKey)!=='true')return;
 try{await firestore().clearPersistence();}
 catch{throw new DeletionError('Stäng appen helt och öppna den igen för att slutföra säker städning.');}
 await AsyncStorage.removeItem(cacheResetKey);
}
