import React,{useEffect,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import * as Notifications from 'expo-notifications';
import {Shield,Download} from 'lucide-react-native';
import {C} from '../theme';
import {AppCard,AppButton} from '../components/ui';
import type {Profile} from '../domain';
import {SettingsPlanSection} from './SettingsPlanSection';

type Props={
 profile:Profile;goal:number;accountEmail:string|null;syncStatus:string;
 backup:string;onBackupChange:(value:string)=>void;
 onChangeMode:(mode:'reduce'|'quit')=>void;onChangeDailyTarget:(value:number|null)=>void;
 onOpenProfile:()=>void;onGuestReset:()=>void;onExportBackup:()=>void;onRestoreBackup:()=>void;
};
const Card=({children,style}:{children:React.ReactNode;style?:any})=><AppCard tone="surface" style={style}>{children}</AppCard>;
const Button=({title,onPress,secondary=false}:{title:string;onPress:()=>void;secondary?:boolean})=><AppButton title={title} onPress={onPress} secondary={secondary} secondaryTone="elevated"/>;
export function SettingsScreen({profile,goal,accountEmail,syncStatus,backup,onBackupChange,onChangeMode,onChangeDailyTarget,onOpenProfile,onGuestReset,onExportBackup,onRestoreBackup}:Props){
 const loggedIn=accountEmail!==null;
 const [reminderPreference,setReminderPreference]=useState(false);
 const [reminderReady,setReminderReady]=useState(false);
 const [reminderHour,setReminderHour]=useState('19');
 const [reminderMinute,setReminderMinute]=useState('00');
 const [reminderStatus,setReminderStatus]=useState('');
 const [reminderBusy,setReminderBusy]=useState(false);
 useEffect(()=>{let active=true;Promise.all([AsyncStorage.getItem('smokeless:reminder-preference'),AsyncStorage.getItem('smokeless:reminder-hour'),AsyncStorage.getItem('smokeless:reminder-minute'),AsyncStorage.getItem('smokeless:reminder-id')]).then(async([v,h,m,id])=>{if(!active)return;setReminderPreference(v==='true');if(h)setReminderHour(h);if(m)setReminderMinute(m);if(v==='true'&&Platform.OS!=='web'){try{const scheduled=await Notifications.getAllScheduledNotificationsAsync();if(!active)return;setReminderStatus(id&&scheduled.some(n=>n.identifier===id)?'Daglig påminnelse är schemalagd.':'Ingen aktiv påminnelse hittades. Tryck Aktivera påminnelse för att schemalägga.') }catch{if(active)setReminderStatus('Kunde inte kontrollera schemalagda påminnelser.')}}}).catch(()=>{if(active)setReminderStatus('Inställningarna kunde inte läsas.')}).finally(()=>{if(active)setReminderReady(true)});return()=>{active=false}},[]);
 const cancelReminder=async()=>{const id=await AsyncStorage.getItem('smokeless:reminder-id');if(id){await Notifications.cancelScheduledNotificationAsync(id);await AsyncStorage.removeItem('smokeless:reminder-id')}};
 const changeReminderPreference=async()=>{if(!reminderReady||reminderBusy)return;setReminderBusy(true);try{if(reminderPreference){if(Platform.OS!=='web')await cancelReminder();await AsyncStorage.setItem('smokeless:reminder-preference','false');setReminderPreference(false);setReminderStatus('Påminnelser är avstängda.')}else{await AsyncStorage.setItem('smokeless:reminder-preference','true');setReminderPreference(true);setReminderStatus('Önskemålet är sparat. Tryck Aktivera påminnelse för att begära behörighet och schemalägga.')}}catch{setReminderStatus('Kunde inte spara ändringen. Försök igen.')}finally{setReminderBusy(false)}};
 const activateReminder=async()=>{if(!reminderPreference||reminderBusy)return;const hour=Number(reminderHour),minute=Number(reminderMinute);if(!/^[0-9]{1,2}$/.test(reminderHour)||!/^[0-9]{1,2}$/.test(reminderMinute)||hour>23||minute>59){setReminderStatus('Ange en giltig tid: timmar 0–23 och minuter 0–59.');return}if(Platform.OS==='web'){setReminderStatus('Schemalagda påminnelser stöds bara i mobilappen.');return}setReminderBusy(true);try{const existing=await Notifications.getPermissionsAsync();const permission=existing.granted?existing:await Notifications.requestPermissionsAsync();if(!permission.granted){setReminderStatus('Notisbehörighet nekades. Du kan ändra detta i telefonens inställningar.');return}await cancelReminder();const reminderBody=profile.mode==='quit'
 ?'Hur går det med ditt rökstopp? Ta en stund att stämma av dagen. En svår stund tar inte bort dina framsteg.'
 :'Hur går det med din nedtrappning? Stäm av dagens registreringar och fortsätt i din egen takt.';
 const id=await Notifications.scheduleNotificationAsync({content:{title:'Smoke Less · Daglig avstämning',body:reminderBody},trigger:{type:Notifications.SchedulableTriggerInputTypes.DAILY,hour,minute}});try{await AsyncStorage.multiSet([['smokeless:reminder-id',id],['smokeless:reminder-hour',reminderHour],['smokeless:reminder-minute',reminderMinute]])}catch{await Notifications.cancelScheduledNotificationAsync(id);throw new Error('Could not save reminder')}setReminderStatus('Daglig påminnelse schemalagd kl. '+String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0')+'.')}catch{setReminderStatus('Kunde inte schemalägga påminnelsen. Försök igen.')}finally{setReminderBusy(false)}};

 return <View style={styles.screen}>
  <SettingsPlanSection profile={profile} goal={goal} onChangeMode={onChangeMode} onChangeDailyTarget={onChangeDailyTarget}/>
  <View style={styles.inlineHeading}><Shield size={19} color={C.lime}/><Text style={styles.heading}>Konto och säkerhet</Text></View>
  {!loggedIn?<Card style={{gap:13,padding:18,borderColor:'#9D793E',backgroundColor:'#272218'}}>
   <View style={styles.inline}><View style={[styles.actionIcon,{width:42,height:42,borderRadius:13,backgroundColor:'#47381F'}]}><Shield size={22} color="#E7B967"/></View><View style={{flex:1,gap:3}}><Text style={styles.cardTitle}>Inte säkerhetskopierad</Text><Text style={{color:'#E7B967',fontSize:12,fontWeight:'800'}}>GÄSTLÄGE</Text></View></View>
   <Text style={styles.muted}>Din historik finns bara på den här enheten. Om du avinstallerar appen, byter telefon eller förlorar enheten kan den försvinna.</Text>
   <Button title="Logga in eller skapa konto" onPress={onOpenProfile}/>
  </Card>:<Card style={{gap:12,padding:18}}>
   <View style={styles.inline}><View style={styles.actionIcon}><Shield size={22} color={C.lime}/></View><View style={{flex:1,gap:3}}><Text style={styles.cardTitle}>Molnsäkerhetskopia</Text><Text style={styles.muted}>{accountEmail||'Inloggad användare'}</Text></View></View>
   <Text style={styles.muted}>{syncStatus||'Automatisk synkronisering är aktiverad. Historiken synkas när appen öppnas och när du gör ändringar.'}</Text>
   <Button title="Hantera konto" secondary onPress={onOpenProfile}/>
  </Card>}
  {!loggedIn?<Card style={{gap:10,padding:18,borderColor:'#9D793E'}}>
   <Text style={styles.cardTitle}>Radera lokal gästhistorik</Text>
   <Text style={styles.muted}>En separat återställningskopia sparas på den här enheten innan historiken rensas. Åtgärden påverkar inte Firebase-konton eller molndata. Avinstallera inte appen om du vill behålla återställningskopian.</Text>
   <Button title="Radera gästhistorik (med bekräftelse)" secondary onPress={onGuestReset}/>
  </Card>:null}
  <View style={styles.inlineHeading}><Text style={styles.heading}>Påminnelser och motivation</Text></View>
  <Card style={{gap:10,padding:18}}>
   <Text style={styles.cardTitle}>Önskemål om dagliga påminnelser</Text>
   <Text style={styles.muted}>Välj om du vill ha en daglig påminnelse. Du godkänner notisbehörighet separat när du trycker på Aktivera påminnelse.</Text>
   <Pressable accessibilityRole="switch" accessibilityState={{checked:reminderPreference,disabled:!reminderReady||reminderBusy}} disabled={!reminderReady||reminderBusy} onPress={changeReminderPreference} style={[styles.inline,{justifyContent:'space-between',paddingVertical:10}]}>
    <Text style={styles.cardTitle}>{reminderPreference?'Önskas':'Önskas inte'}</Text><Text style={{color:C.lime,fontWeight:'800'}}>{reminderPreference?'PÅ':'AV'}</Text>
   </Pressable>
   {reminderPreference?<><View style={styles.inline}><TextInput accessibilityLabel="Timme för påminnelse" keyboardType="number-pad" value={reminderHour} onChangeText={setReminderHour} maxLength={2} style={[styles.input,{minHeight:48,flex:1}]}/><Text style={styles.cardTitle}>:</Text><TextInput accessibilityLabel="Minut för påminnelse" keyboardType="number-pad" value={reminderMinute} onChangeText={setReminderMinute} maxLength={2} style={[styles.input,{minHeight:48,flex:1}]}/></View><Button title={reminderBusy?'Vänta…':'Aktivera påminnelse vid vald tid'} onPress={activateReminder}/></>:null}
   <Text style={styles.muted}>Meddelandet anpassas till din nuvarande plan ({profile.mode==='quit'?'rökstopp':'nedtrappning'}). Om du byter plan behöver du aktivera påminnelsen igen för att uppdatera meddelandet.</Text>
   <Text style={styles.muted}>Tiden gäller i telefonens lokala tidszon. Om du ändrar tiden behöver du aktivera påminnelsen igen. Stänger du av reglaget tas den schemalagda påminnelsen bort.</Text>
   {reminderStatus?<Text accessibilityRole="alert" style={styles.muted}>{reminderStatus}</Text>:null}
  </Card>
  <View style={styles.inlineHeading}><Download size={19} color={C.lime}/><Text style={styles.heading}>Data och återställning</Text></View>
  <Card style={{gap:13,padding:18}}>
   <View style={styles.inline}><View style={styles.actionIcon}><Download size={20} color={C.lime}/></View><View style={{flex:1,gap:4}}><Text style={styles.cardTitle}>Manuell säkerhetskopia</Text><Text style={styles.muted}>Exportera eller återställ din historik som JSON.</Text></View></View>
   <Button title="Skapa JSON-säkerhetskopia" secondary onPress={onExportBackup}/>
   <TextInput accessibilityLabel="JSON-säkerhetskopia" multiline placeholder="Klistra in JSON här för att återställa, eller kopiera din exporterade text" placeholderTextColor={C.dim} value={backup} onChangeText={onBackupChange} style={styles.input}/>
   <Button title="Återställ från JSON" secondary onPress={onRestoreBackup}/>
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
 input:{backgroundColor:C.elevated,borderRadius:14,borderWidth:1,borderColor:C.border,color:C.white,padding:12,minHeight:110,textAlignVertical:'top',fontSize:13},
});
