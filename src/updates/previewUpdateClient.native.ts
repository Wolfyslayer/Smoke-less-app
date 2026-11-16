import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Linking} from 'react-native';
import identity from '../../config/projectIdentity.json';
import {createPreviewUpdateService,type PreviewUpdateService} from './previewUpdateService';
import {PREVIEW_MANIFEST_URL,validInstalledPreview} from './previewManifest';
let service:PreviewUpdateService|null|undefined;
export function getPreviewUpdateService():PreviewUpdateService|null{
 if(service!==undefined)return service;
 if(Constants.expoConfig?.extra?.appVariant!=='preview'||(typeof __DEV__!=='undefined'&&__DEV__))return service=null;
 try{
  const updates=require('expo-updates') as typeof import('expo-updates');
  const app=require('expo-application') as typeof import('expo-application');
  const info={applicationId:app.applicationId??'',version:app.nativeApplicationVersion??'',build:Number(app.nativeBuildVersion),runtime:updates.runtimeVersion??'',channel:updates.channel??'',projectId:Constants.easConfig?.projectId??''};
  if(!updates.isEnabled||!validInstalledPreview(info)||info.projectId!==identity.preview.projectId)return service=null;
  service=createPreviewUpdateService({info,now:Date.now,storage:AsyncStorage,checkOta:updates.checkForUpdateAsync,fetchOta:updates.fetchUpdateAsync,openUrl:url=>Linking.openURL(url),fetchManifest:async()=>{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
   try{const response=await fetch(PREVIEW_MANIFEST_URL,{redirect:'error',signal:controller.signal});if(response.url!==PREVIEW_MANIFEST_URL)throw Error('Manifest redirected');if(response.status===404)return null;if(!response.ok)throw Error('Manifest unavailable');if(Number(response.headers.get('content-length'))>16384)throw Error('Manifest too large');const text=await response.text();if(text.length>16384)throw Error('Manifest too large');return JSON.parse(text);}finally{clearTimeout(timeout);}
  }});
  return service;
 }catch{return service=null;}
}
