import React,{useSyncExternalStore} from 'react';
import {Text} from 'react-native';
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
 const {dialog,setDialog,ask}=useConfirmationDialog();
 const busy=state.status==='checking'||state.status==='downloading',release=state.nativeRelease;
 return <><AppCard>
  <Text accessibilityRole="header" style={{fontSize:20,fontWeight:'700',color:C.text}}>Preview-uppdateringar</Text>
  <Text style={{color:C.textMuted}}>Installerad {service.info.version} · bygge {service.info.build}</Text>
  <Text style={{color:C.textMuted}}>Preview · appuppdateringar aktiverade</Text>
  <Text style={{color:C.textMuted}}>{state.lastCheck?`Senast kontrollerad: ${new Date(state.lastCheck).toLocaleString('sv-SE')}`:'Ingen uppdateringskontroll gjord ännu.'}</Text>
  <Text accessibilityLiveRegion="polite" style={{color:C.textMuted}}>{state.message||'Sök efter appuppdateringar och nya Preview-versioner.'}</Text>
  <AppButton title={busy?'Kontrollerar…':'Sök efter uppdateringar'} disabled={busy||state.status==='downloaded'} onPress={()=>void service.check(true)}/>
  {state.otaAvailable?<AppButton title="Hämta appuppdatering" secondary disabled={busy} onPress={()=>ask('Hämta uppdateringen?','Den används nästa gång appen startas. Appen startas inte om nu och din historik ändras inte.',()=>void service.download(),'Hämta')}/>:null}
  {release?<>
   <Text style={{color:C.text}}>Ny Preview {release.version} · bygge {release.build}</Text>
   <Text style={{color:C.textMuted}}>Publicerad: {new Date(release.publishedAt).toLocaleDateString('sv-SE')}</Text>
   <Text style={{color:C.text}}>{release.releaseNotes}</Text>
   <AppButton title="Ladda ner uppdatering" secondary disabled={busy} onPress={()=>ask(`Preview ${release.version} (bygge ${release.build})`,`${release.releaseNotes}\n\nNedladdningen öppnas från GitHub Releases. Android ber dig godkänna installationen. Behåll appens data; avinstallera inte för att uppdatera.`,()=>void service.openNative(),'Ladda ner uppdatering')}/>
  </>:null}
 </AppCard><ConfirmationDialog dialog={dialog} onClose={()=>setDialog(null)}/></>;
}
