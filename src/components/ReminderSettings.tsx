import React,{useEffect,useRef,useState} from 'react';
import {Platform,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {SettingsSwitch} from './SettingsSwitch';
import {createReminderService} from '../reminderService';
import {ReminderError,reminderDefaults,type ReminderSettings as Settings} from '../domain/reminders';
import {useThemeStyles,type ThemeColors} from '../theme';
const service=createReminderService(AsyncStorage,{
 permission:async()=>{if(Platform.OS==='web')return false;if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('smokeless-reminders-v1',{name:'Frivilliga påminnelser',importance:Notifications.AndroidImportance.DEFAULT,lockscreenVisibility:Notifications.AndroidNotificationVisibility.PRIVATE});const current=await Notifications.getPermissionsAsync();return current.granted||(await Notifications.requestPermissionsAsync()).granted;},
 cancel:async id=>{if(Platform.OS!=='web')await Notifications.cancelScheduledNotificationAsync(id);},
 scheduled:async()=>Platform.OS==='web'?[]:(await Notifications.getAllScheduledNotificationsAsync()).map(n=>n.identifier),
 schedule:async request=>Notifications.scheduleNotificationAsync({identifier:request.identifier,content:{title:'Smoke Less',body:request.body},trigger:request.weekly?{type:Notifications.SchedulableTriggerInputTypes.WEEKLY,weekday:2,hour:request.hour,minute:request.minute,channelId:'smokeless-reminders-v1'}:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour:request.hour,minute:request.minute,channelId:'smokeless-reminders-v1'}}),
});
const timeFields=['hour','minute','riskHour','riskMinute','quietStart','quietEnd'] as const;
type Times=Record<typeof timeFields[number],string>;
const timeTexts=(settings:Settings)=>Object.fromEntries(timeFields.map(key=>[key,String(settings[key]).padStart(2,'0')])) as Times;
export function ReminderSettings(){
 const styles=useThemeStyles(createStyles);

 const [settings,setSettings]=useState<Settings>(reminderDefaults),[times,setTimes]=useState(timeTexts(reminderDefaults));
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState('Läser inställningar…');
 const lock=useRef(false),mounted=useRef(true);
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 const run=async(action:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);try{await action();}catch(error){if(mounted.current)setStatus(error instanceof ReminderError?error.message:'Kunde inte uppdatera påminnelser. Försök igen.');}finally{lock.current=false;if(mounted.current)setBusy(false);}};
 const read=()=>run(async()=>{const result=await service.read();if(!mounted.current)return;setSettings(result.settings);setTimes(timeTexts(result.settings));setReady(true);setStatus(Platform.OS==='web'?'Schemalagda påminnelser stöds bara i mobilappen.':result.active?`${result.active} schemalagda påminnelser hittades. Leverans kräver telefonens notisbehörighet.`:'Inga aktiva påminnelser. Välj och aktivera om du vill.');});
 useEffect(()=>{void read();},[]);
 const changed=()=>setStatus('Ändringarna är inte aktiverade. Spara och aktivera för att ersätta tidigare påminnelser, eller stäng av alla.');
 const toggle=(key:'checkin'|'risk'|'quiet',value:boolean)=>{setSettings(v=>({...v,[key]:value}));changed();};
 const field=(key:typeof timeFields[number],label:string)=><TextInput accessibilityLabel={label} editable={ready&&!busy} keyboardType="number-pad" maxLength={2} value={times[key]} onChangeText={value=>{setTimes(v=>({...v,[key]:value}));changed();}} style={styles.input}/>;
 const switchButton=(key:'checkin'|'risk'|'quiet',label:string)=><SettingsSwitch label={label} value={settings[key]} disabled={!ready||busy} onValueChange={value=>toggle(key,value)}/>;
 const activate=()=>run(async()=>{
  if(!ready)return;
  if(timeFields.some(key=>!/^\d{1,2}$/.test(times[key])))throw new ReminderError('Ange timmar 0–23 och minuter 0–59.');
  const next={...settings,...Object.fromEntries(timeFields.map(key=>[key,Number(times[key])]))} as Settings;
  if(Platform.OS==='web'&&(next.checkin||next.risk))throw new ReminderError('Schemalagda påminnelser stöds bara i mobilappen.');
  await service.apply(next);if(mounted.current)setStatus(next.checkin||next.risk?'Valda påminnelser är schemalagda. Telefonens inställningar kan begränsa leveransen.':'Påminnelser är avstängda.');
 });
 const disable=()=>run(async()=>{await service.disable();if(mounted.current){setSettings(reminderDefaults);setTimes(timeTexts(reminderDefaults));setReady(true);setStatus('Påminnelser är avstängda.');}});
 return <View style={styles.card}>
  <Text accessibilityRole="header" style={styles.heading}>Påminnelser på den här enheten</Text>
  <Text style={styles.text}>Frivilligt stöd utan uppgifter om din plan eller historik på låsskärmen. Inställningarna gäller hela enheten, även vid kontobyte. Appnamnet kan synas. Behörighet efterfrågas först när du aktiverar.</Text>
  {switchButton('checkin','Avstämning')}
  {settings.checkin&&<><View accessibilityRole="radiogroup" style={styles.section}>{(['daily','weekly'] as const).map(frequency=><Pressable key={frequency} accessibilityRole="radio" accessibilityState={{checked:settings.frequency===frequency,disabled:!ready||busy}} disabled={!ready||busy} onPress={()=>{setSettings(v=>({...v,frequency}));changed();}} style={styles.button}><Text style={styles.text}>{frequency==='daily'?'Dagligen':'Varje måndag'}</Text></Pressable>)}</View><Text style={styles.text}>Tid för avstämning</Text><View style={styles.row}>{field('hour','Timme för avstämning, 0 till 23')}{field('minute','Minut för avstämning, 0 till 59')}</View></>}
  {switchButton('risk','Förberedelse inför en risksituation')}
  {settings.risk&&<><Text style={styles.text}>Välj en tid före en situation du vill förbereda dig för. Dagligen. Ingen beskrivning sparas.</Text><View style={styles.row}>{field('riskHour','Timme för förberedelse, 0 till 23')}{field('riskMinute','Minut för förberedelse, 0 till 59')}</View></>}
  {switchButton('quiet','Tysta tider')}
  {settings.quiet&&<><Text style={styles.text}>Från hel timme till hel timme. Samma timme betyder tyst hela dygnet. Tider inom fönstret kan inte aktiveras.</Text><View style={styles.row}>{field('quietStart','Tyst från timme, 0 till 23')}{field('quietEnd','Tyst till timme, 0 till 23')}</View></>}
  <Pressable accessibilityRole="button" disabled={!ready||busy} accessibilityState={{disabled:!ready||busy}} onPress={()=>void activate()} style={styles.button}><Text style={styles.link}>{busy?'Vänta…':'Spara och aktivera val'}</Text></Pressable>
  <Pressable accessibilityRole="button" disabled={busy} accessibilityState={{disabled:busy}} onPress={()=>void disable()} style={styles.button}><Text style={styles.link}>Stäng av alla påminnelser</Text></Pressable>
  {!ready&&<Pressable accessibilityRole="button" disabled={busy} onPress={()=>void read()} style={styles.button}><Text style={styles.link}>Läs inställningar igen</Text></Pressable>}
  <Text accessibilityLiveRegion="polite" style={styles.text}>{status}</Text>
  <Text style={styles.text}>Tiderna följer telefonens lokala tidszon. Ändringar gäller efter aktivering. Saknade registreringar används inte för att skicka fler notiser. Du kan också stänga av notiser i telefonens inställningar.</Text>
 </View>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({card:{gap:12,padding:18,borderRadius:24,backgroundColor:C.surface,borderWidth:1,borderColor:C.border},section:{gap:8},heading:{fontSize:19,fontWeight:'800',color:C.white},text:{fontSize:14,lineHeight:21,color:C.dim},link:{fontSize:15,fontWeight:'800',color:C.lime},row:{flexDirection:'row',gap:12},input:{flex:1,minWidth:0,minHeight:48,padding:12,fontSize:16,color:C.white,borderWidth:1,borderColor:C.border,borderRadius:12,backgroundColor:C.elevated},button:{minHeight:48,padding:12,justifyContent:'center',borderWidth:1,borderColor:C.border,borderRadius:12}});
