import {normalizeReminderFrequency,WEEKLY_REMINDER_DAY,type ReminderFrequency} from '../domain/maintenance';
import React,{useEffect,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import * as Notifications from 'expo-notifications';
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
 const [reminderFrequency,setReminderFrequency]=useState<ReminderFrequency>('daily');
 const [reminderPreference,setReminderPreference]=useState(false);
 const [reminderReady,setReminderReady]=useState(false);
 const [reminderHour,setReminderHour]=useState('19');
 const [reminderMinute,setReminderMinute]=useState('00');
 const [reminderStatus,setReminderStatus]=useState('');
 const [reminderBusy,setReminderBusy]=useState(false);
 useEffect(()=>{let active=true;Promise.all([AsyncStorage.getItem('smokeless:reminder-preference'),AsyncStorage.getItem('smokeless:reminder-hour'),AsyncStorage.getItem('smokeless:reminder-minute'),AsyncStorage.getItem('smokeless:reminder-id'),AsyncStorage.getItem('smokeless:reminder-frequency')]).then(async([v,h,m,id,f])=>{if(!active)return;setReminderFrequency(normalizeReminderFrequency(f));setReminderPreference(v==='true');if(h)setReminderHour(h);if(m)setReminderMinute(m);if(v!=='true')setReminderStatus('Påminnelser är avstängda.');else if(Platform.OS==='web')setReminderStatus('Schemalagda påminnelser stöds bara i mobilappen.');if(v==='true'&&Platform.OS!=='web'){try{const [scheduled,permission]=await Promise.all([Notifications.getAllScheduledNotificationsAsync(),Notifications.getPermissionsAsync()]);if(!active)return;setReminderStatus(reminderStatusMessage(true,permission.granted,Boolean(id),scheduled.some(n=>n.identifier===id))) }catch{if(active)setReminderStatus('Kunde inte kontrollera schemalagda påminnelser.')}}}).catch(()=>{if(active)setReminderStatus('Inställningarna kunde inte läsas.')}).finally(()=>{if(active)setReminderReady(true)});return()=>{active=false}},[]);
 const changeReminderFrequency=async(frequency:ReminderFrequency)=>{if(!reminderReady||reminderBusy)return;setReminderBusy(true);try{if(Platform.OS!=='web')await cancelReminder();await AsyncStorage.setItem('smokeless:reminder-frequency',frequency);setReminderFrequency(frequency);setReminderStatus('Frekvens sparad. Ingen tidigare påminnelse är aktiv. Tryck Aktivera påminnelse för att schemalägga igen.');}catch{setReminderStatus('Kunde inte ändra frekvensen. Försök igen.');}finally{setReminderBusy(false)}};
 const cancelReminder=async()=>{const id=await AsyncStorage.getItem('smokeless:reminder-id');if(id){await Notifications.cancelScheduledNotificationAsync(id);await AsyncStorage.removeItem('smokeless:reminder-id')}};
 const changeReminderPreference=async()=>{if(!reminderReady||reminderBusy)return;setReminderBusy(true);try{if(reminderPreference){if(Platform.OS!=='web')await cancelReminder();await AsyncStorage.setItem('smokeless:reminder-preference','false');setReminderPreference(false);setReminderStatus('Påminnelser är avstängda.')}else{await AsyncStorage.setItem('smokeless:reminder-preference','true');setReminderPreference(true);setReminderStatus('Önskemålet är sparat. Tryck Aktivera påminnelse för att begära behörighet och schemalägga.')}}catch{setReminderStatus('Kunde inte spara ändringen. Försök igen.')}finally{setReminderBusy(false)}};
 const activateReminder=async()=>{if(!reminderPreference||reminderBusy)return;const hour=Number(reminderHour),minute=Number(reminderMinute);if(!validReminderTime(reminderHour,reminderMinute)){setReminderStatus('Ange en giltig tid: timmar 0–23 och minuter 0–59.');return}if(Platform.OS==='web'){setReminderStatus('Schemalagda påminnelser stöds bara i mobilappen.');return}setReminderBusy(true);try{const existing=await Notifications.getPermissionsAsync();const permission=existing.granted?existing:await Notifications.requestPermissionsAsync();if(!permission.granted){setReminderStatus('Notisbehörighet nekades. Du kan ändra detta i telefonens inställningar.');return}await cancelReminder();const reminderBody=profile.mode==='quit'
 ?'Hur går det med ditt rökstopp? Ta en stund att stämma av dagen. En svår stund tar inte bort dina framsteg.'
 :'Hur går det med din nedtrappning? Stäm av dagens registreringar och fortsätt i din egen takt.';
 const id=await Notifications.scheduleNotificationAsync({content:{title:'Smoke Less',body:reminderBody},trigger:reminderFrequency==='weekly'?{type:Notifications.SchedulableTriggerInputTypes.WEEKLY,weekday:WEEKLY_REMINDER_DAY,hour,minute}:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour,minute}});try{await AsyncStorage.multiSet([['smokeless:reminder-id',id],['smokeless:reminder-hour',reminderHour],['smokeless:reminder-minute',reminderMinute]])}catch{await Notifications.cancelScheduledNotificationAsync(id);throw new Error('Could not save reminder')}setReminderStatus((reminderFrequency==='weekly'?'Veckovis (måndag)':'Daglig')+' påminnelse schemalagd kl. '+String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0')+'.')}catch{setReminderStatus('Kunde inte schemalägga påminnelsen. Försök igen.')}finally{setReminderBusy(false)}};

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
  <View style={styles.inlineHeading}><Text accessibilityRole="header" style={styles.heading}>Påminnelser och motivation</Text></View>
  <Card style={{gap:10,padding:18}}>
   <Text accessibilityRole="header" style={styles.cardTitle}>Frivilliga påminnelser</Text>
   <Text style={styles.muted}>Välj dagligen, en gång i veckan eller avstängt på den här enheten. Du godkänner notisbehörighet separat när du trycker på Aktivera påminnelse.</Text>
   <Pressable accessibilityRole="switch" accessibilityLabel="Påminnelser" accessibilityHint="Slår på eller av önskemålet om påminnelser" accessibilityState={{checked:reminderPreference,disabled:!reminderReady||reminderBusy}} disabled={!reminderReady||reminderBusy} onPress={changeReminderPreference} style={[styles.inline,{justifyContent:'space-between',minHeight:48,paddingVertical:10}]}>
    <Text style={[styles.cardTitle,{flexShrink:1}]}>{reminderPreference?'Önskas':'Önskas inte'}</Text><Text style={{color:C.lime,fontWeight:'800',flexShrink:1}}>{reminderPreference?'PÅ':'AV'}</Text>
   </Pressable>
   <View style={{gap:8}}>{([['daily','Dagligen'],['weekly','En gång i veckan, måndag']] as const).map(([frequency,label])=><Pressable key={frequency} accessibilityRole="radio" accessibilityState={{checked:reminderFrequency===frequency,disabled:!reminderReady||reminderBusy}} disabled={!reminderReady||reminderBusy} style={[styles.button,styles.buttonSecondary]} onPress={()=>void changeReminderFrequency(frequency)}><Text style={[styles.buttonText,{color:C.white}]}>{reminderFrequency===frequency?'✓ ':''}{label}</Text></Pressable>)}</View>
   {reminderPreference?<><View style={styles.inline}><TextInput accessibilityLabel="Timme för påminnelse, 0 till 23" accessibilityHint="Ange timmar mellan 0 och 23" keyboardType="number-pad" value={reminderHour} onChangeText={setReminderHour} maxLength={2} style={[styles.input,styles.timeInput]} selectTextOnFocus/><Text style={styles.cardTitle}>:</Text><TextInput accessibilityLabel="Minut för påminnelse, 0 till 59" accessibilityHint="Ange minuter mellan 0 och 59" keyboardType="number-pad" value={reminderMinute} onChangeText={setReminderMinute} maxLength={2} style={[styles.input,{minHeight:48,flex:1}]}/></View><Button title={reminderBusy?'Vänta…':'Aktivera påminnelse vid vald tid'} onPress={activateReminder}/></>:null}
   <Text style={styles.muted}>Meddelandet anpassas till din nuvarande plan ({profile.mode==='quit'?'rökstopp':'nedtrappning'}). Om du byter plan behöver du aktivera påminnelsen igen för att uppdatera meddelandet.</Text>
   <Text style={styles.muted}>Tiden gäller i telefonens lokala tidszon. Om du ändrar tiden behöver du aktivera påminnelsen igen. Stänger du av reglaget tas den schemalagda påminnelsen bort.</Text>
   {reminderStatus?<Text accessibilityLiveRegion="polite" style={styles.muted}>{reminderStatus}</Text>:null}
  </Card>
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
