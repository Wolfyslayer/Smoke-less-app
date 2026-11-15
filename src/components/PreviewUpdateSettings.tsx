import React,{useSyncExternalStore} from 'react';
import {Text,View} from 'react-native';
import Constants from 'expo-constants';
import {getPreviewUpdateService} from '../updates/previewUpdateClient';
import {useThemeColors} from '../theme';
import {AppButton,AppCard} from './ui';
import {ConfirmationDialog} from './ConfirmationDialog';
import {useConfirmationDialog} from '../hooks/useConfirmationDialog';
import type {PreviewUpdateService} from '../updates/previewUpdateService';
export function PreviewUpdateSettings(){
 if(Constants.expoConfig?.extra?.appVariant!=='preview')return null;
 const service=getPreviewUpdateService();return service?<UpdateControls service={service}/>:<Unavailable/>;
}
function Unavailable(){const C=useThemeColors();return <Text style={{color:C.textMuted}}>Uppdateringskontrollen finns i den fristående Preview-appen.</Text>;}
function UpdateControls({service}:{service:PreviewUpdateService}){
 const C=useThemeColors(),state=useSyncExternalStore(service.subscribe,service.getSnapshot,service.getSnapshot);
 const {dialog,setDialog,ask}=useConfirmationDialog();const busy=state.status==='checking'||state.status==='downloading';
 return <><AppCard><Text accessibilityRole="header" style={{fontSize:20,fontWeight:'700',color:C.text}}>Preview-uppdateringar</Text><Text style={{color:C.textMuted}}>Installerad {service.info.version} · bygge {service.info.build}</Text><Text style={{color:C.textMuted}}>Kanal: preview · runtime {service.info.runtime.slice(0,12)}</Text>{state.lastCheck?<Text style={{color:C.textMuted}}>Senast kontrollerad: {new Date(state.lastCheck).toLocaleString('sv-SE')}</Text>:null}<Text accessibilityLiveRegion="polite" style={{color:C.textMuted}}>{state.message||'Sök efter appuppdateringar och nya Preview-versioner.'}</Text><AppButton title={busy?'Kontrollerar…':'Sök efter uppdateringar'} disabled={busy||state.status==='downloaded'} onPress={()=>void service.check(true)}/>{state.otaAvailable?<AppButton title="Hämta appuppdatering" secondary disabled={busy} onPress={()=>ask('Hämta uppdateringen?','Den används nästa gång appen startas. Appen startas inte om nu och din historik ändras inte.',()=>void service.download(),'Hämta')}/>:null}{state.nativeRelease?<AppButton title={`Hämta Preview ${state.nativeRelease.version} (bygge ${state.nativeRelease.build})`} secondary disabled={busy} onPress={()=>ask('Öppna ny Preview-version?','Nedladdningen öppnas hos Expo. Android ber dig godkänna installationen. Behåll appens data; avinstallera inte för att uppdatera.',()=>void service.openNative(),'Öppna nedladdning')}/>:null}</AppCard><ConfirmationDialog dialog={dialog} onClose={()=>setDialog(null)}/></>;
}
