import {SettingsSection} from '../components/SettingsSection';
import {AppearanceSettings} from '../components/AppearanceSettings';
import {SettingsSwitch} from '../components/SettingsSwitch';
import {PreviewUpdateSettings} from '../components/PreviewUpdateSettings';
import Constants from 'expo-constants';
import React,{useEffect,useState} from 'react';
import {ReminderSettings} from '../components/ReminderSettings';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';
import {AppCard,AppButton} from '../components/ui';
import type {Data} from '../domain';
import {setWidgetOptIn,widgetOptedIn,refreshWidgetSnapshot} from '../widgets/widgetPreferences';

type Props={data:Data};
export function validReminderTime(hourText:string,minuteText:string){return /^[0-9]{1,2}$/.test(hourText)&&/^[0-9]{1,2}$/.test(minuteText)&&Number(hourText)<=23&&Number(minuteText)<=59}
export function reminderStatusMessage(optedIn:boolean,permissionGranted:boolean,hasSavedId:boolean,hasScheduledId:boolean){if(!optedIn)return 'Påminnelser är avstängda.';if(!permissionGranted)return 'Notisbehörighet saknas. Tillåt notiser i telefonens inställningar och aktivera sedan påminnelsen igen.';return hasSavedId&&hasScheduledId?'Påminnelse är schemalagd och notiser är tillåtna.':'Ingen aktiv påminnelse hittades. Tryck Aktivera påminnelse för att schemalägga.'}
const Card=({children,style}:{children:React.ReactNode;style?:React.ComponentProps<typeof AppCard>['style']})=><AppCard tone="surface" style={style}>{children}</AppCard>;
const Button=({title,onPress,secondary=false}:{title:string;onPress:()=>void;secondary?:boolean})=><AppButton title={title} onPress={onPress} secondary={secondary} secondaryTone="elevated"/>;
export function SettingsScreen({data}:Props){
 const C=useThemeColors(); const styles=useThemeStyles(createStyles);

 const [widgetEnabled,setWidgetEnabled]=useState(false);
 const [widgetBusy,setWidgetBusy]=useState(true);
 const [widgetMessage,setWidgetMessage]=useState('');
 useEffect(()=>{let active=true;void widgetOptedIn().then(enabled=>{if(active)setWidgetEnabled(enabled)}).catch(()=>{if(active)setWidgetMessage('Kunde inte läsa widgetinställningen.')}).finally(()=>{if(active)setWidgetBusy(false)});return()=>{active=false}},[]);
 const toggleWidget=async()=>{
  if(widgetBusy)return;
  setWidgetBusy(true);setWidgetMessage('');
  const next=!widgetEnabled;
  try{
   await setWidgetOptIn(next);
   if(next)await refreshWidgetSnapshot(data);
   setWidgetEnabled(next);
   setWidgetMessage(next?'Dagens framsteg får visas i widgeten. Lägg till Smoke Less via hemskärmens widgetmeny. Om widgeten saknas, kontrollera att du har den senaste appversionen.':'Widgetens sparade uppgifter har rensats.');
  }catch{
   if(next)await setWidgetOptIn(false).catch(()=>{});
   setWidgetMessage('Kunde inte ändra widgetinställningen. Försök igen.');
  }finally{setWidgetBusy(false)}
 };

 return <View style={styles.screen}>
  {Constants.expoConfig?.extra?.appVariant==='preview'?<SettingsSection title="Sök efter uppdateringar" description="Appuppdateringar och nya Preview-versioner"><PreviewUpdateSettings/></SettingsSection>:null}
  <SettingsSection title="Utseende" description="Ljust, mörkt eller systemtema"><AppearanceSettings/></SettingsSection>

  <SettingsSection title="Android-widgetar" description="Dagsöversikt, registrering och SOS på hemskärmen">
  <Card style={{gap:10,padding:18}}>
   <Text style={styles.muted}>Du väljer själv om dagens antal och mål får visas på hemskärmen. Lägg till widgeten från telefonens hemskärm när du har aktiverat den här.</Text>
   <SettingsSwitch label="Visa dagens antal och mål i widgetar" value={widgetEnabled} disabled={widgetBusy} onValueChange={()=>void toggleWidget()}/>
   <Text style={styles.muted}>Dagens framsteg finns som vanlig och kompakt widget. Registrera och SOS är genvägar som inte visar personliga uppgifter. Lägg till dem via telefonens widgetmeny. Registreringswidgeten öppnar appen; den sparar ingen cigarett automatiskt.</Text>
   {widgetMessage?<Text accessibilityLiveRegion="polite" style={styles.muted}>{widgetMessage}</Text>:null}
  </Card>
  </SettingsSection>
  <SettingsSection title="Påminnelser" description="Tider, tysta perioder och frivilliga notiser"><ReminderSettings/></SettingsSection>

  <Text style={[styles.muted,{textAlign:'center',paddingHorizontal:12,paddingVertical:9}]}>Smoke Less hjälper dig att följa din utveckling och ersätter inte medicinsk rådgivning.</Text>
 </View>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.surface,borderRadius:24,padding:15,borderWidth:1,borderColor:C.border,gap:9},
 inline:{flexDirection:'row',alignItems:'center',gap:12},inlineHeading:{flexDirection:'row',alignItems:'center',gap:9},
 actionIcon:{width:36,height:36,borderRadius:11,backgroundColor:C.elevated,alignItems:'center',justifyContent:'center'},
 heading:{fontSize:19,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},muted:{fontSize:15,color:C.muted,lineHeight:23},
 button:{backgroundColor:C.lime,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},buttonSecondary:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},
 buttonText:{color:C.onAccent,fontWeight:'900',fontSize:15},
 timeInput:{minHeight:48,flex:1,minWidth:0,textAlign:'center'},
 input:{backgroundColor:C.elevated,borderRadius:14,borderWidth:1,borderColor:C.border,color:C.white,padding:12,minHeight:110,textAlignVertical:'top',fontSize:15},
});
