import React,{useEffect,useState} from 'react';
import {ReminderSettings} from '../components/ReminderSettings';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {C} from '../theme';
import {AppCard,AppButton} from '../components/ui';
import type {Profile,Data} from '../domain';
import {setWidgetOptIn,widgetOptedIn,refreshWidgetSnapshot} from '../widgets/widgetPreferences';
import {SettingsPlanSection} from './SettingsPlanSection';

type Props={
 profile:Profile;goal:number;data:Data;
 onChangeMode:(mode:'reduce'|'quit')=>void;onChangeDailyTarget:React.ComponentProps<typeof SettingsPlanSection>['onChangeDailyTarget'];
};
export function validReminderTime(hourText:string,minuteText:string){return /^[0-9]{1,2}$/.test(hourText)&&/^[0-9]{1,2}$/.test(minuteText)&&Number(hourText)<=23&&Number(minuteText)<=59}
export function reminderStatusMessage(optedIn:boolean,permissionGranted:boolean,hasSavedId:boolean,hasScheduledId:boolean){if(!optedIn)return 'Påminnelser är avstängda.';if(!permissionGranted)return 'Notisbehörighet saknas. Tillåt notiser i telefonens inställningar och aktivera sedan påminnelsen igen.';return hasSavedId&&hasScheduledId?'Påminnelse är schemalagd och notiser är tillåtna.':'Ingen aktiv påminnelse hittades. Tryck Aktivera påminnelse för att schemalägga.'}
const Card=({children,style}:{children:React.ReactNode;style?:React.ComponentProps<typeof AppCard>['style']})=><AppCard tone="surface" style={style}>{children}</AppCard>;
const Button=({title,onPress,secondary=false}:{title:string;onPress:()=>void;secondary?:boolean})=><AppButton title={title} onPress={onPress} secondary={secondary} secondaryTone="elevated"/>;
export function SettingsScreen({profile,goal,data,onChangeMode,onChangeDailyTarget}:Props){
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
   setWidgetMessage(next?'Dagens framsteg får visas i widgeten. Lägg till Smoke Less via hemskärmens widgetmeny. Om den saknas behöver du installera en ny Android-build.':'Widgetens sparade uppgifter har rensats.');
  }catch{
   if(next)await setWidgetOptIn(false).catch(()=>{});
   setWidgetMessage('Kunde inte ändra widgetinställningen. Försök igen.');
  }finally{setWidgetBusy(false)}
 };

 return <View style={styles.screen}>
  <SettingsPlanSection profile={profile} goal={goal} onChangeMode={onChangeMode} onChangeDailyTarget={onChangeDailyTarget}/>
  <View style={styles.inlineHeading}><Text accessibilityRole="header" style={styles.heading}>Android-widget</Text></View>
  <Card style={{gap:10,padding:18}}>
   <Text style={styles.muted}>Du väljer själv om dagens antal och mål får visas på hemskärmen. Funktionen är under utveckling och kräver en kommande Android-build.</Text>
   <Pressable accessibilityRole="switch" accessibilityLabel="Tillåt dagsframsteg i Android-widget" accessibilityState={{checked:widgetEnabled,disabled:widgetBusy}} disabled={widgetBusy} onPress={toggleWidget} style={[styles.inline,{justifyContent:'space-between',minHeight:48,paddingVertical:10}]}>
    <Text style={[styles.cardTitle,{flexShrink:1}]}>{widgetEnabled?'Tillåtet':'Inte tillåtet'}</Text><Text style={{color:C.lime,fontWeight:'800'}}>{widgetEnabled?'PÅ':'AV'}</Text>
   </Pressable>
   {widgetMessage?<Text accessibilityLiveRegion="polite" style={styles.muted}>{widgetMessage}</Text>:null}
  </Card>
  <ReminderSettings/>
  <Text style={[styles.muted,{textAlign:'center',paddingHorizontal:12,paddingVertical:9}]}>Smoke Less hjälper dig att följa din utveckling och ersätter inte medicinsk rådgivning.</Text>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.surface,borderRadius:20,padding:15,borderWidth:1,borderColor:C.border,gap:9},
 inline:{flexDirection:'row',alignItems:'center',gap:12},inlineHeading:{flexDirection:'row',alignItems:'center',gap:9},
 actionIcon:{width:36,height:36,borderRadius:11,backgroundColor:C.elevated,alignItems:'center',justifyContent:'center'},
 heading:{fontSize:19,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},muted:{fontSize:13,color:C.muted,lineHeight:20},
 button:{backgroundColor:C.lime,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},buttonSecondary:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},
 buttonText:{color:C.background,fontWeight:'900',fontSize:15},
 timeInput:{minHeight:48,flex:1,minWidth:0,textAlign:'center'},
 input:{backgroundColor:C.elevated,borderRadius:14,borderWidth:1,borderColor:C.border,color:C.white,padding:12,minHeight:110,textAlignVertical:'top',fontSize:13},
});
