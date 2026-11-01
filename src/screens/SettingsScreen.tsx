import React,{useEffect,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
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
 useEffect(()=>{let active=true;AsyncStorage.getItem('smokeless:reminder-preference').then(v=>{if(active)setReminderPreference(v==='true')}).catch(()=>{}).finally(()=>{if(active)setReminderReady(true)});return()=>{active=false}},[]);
 const changeReminderPreference=async()=>{if(!reminderReady)return;const next=!reminderPreference;try{await AsyncStorage.setItem('smokeless:reminder-preference',String(next));setReminderPreference(next)}catch{setReminderReady(false)}};
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
   <Text style={styles.muted}>Spara om du vill ha påminnelser när funktionen är färdig. Valet sparas lokalt på enheten och skickar inga notiser ännu.</Text>
   <Pressable accessibilityRole="switch" accessibilityState={{checked:reminderPreference,disabled:!reminderReady}} disabled={!reminderReady} onPress={changeReminderPreference} style={[styles.inline,{justifyContent:'space-between',paddingVertical:10}]}>
    <Text style={styles.cardTitle}>{reminderPreference?'Önskas':'Önskas inte'}</Text><Text style={{color:C.lime,fontWeight:'800'}}>{reminderPreference?'PÅ':'AV'}</Text>
   </Pressable>
   <Text style={styles.muted}>Ingen notisbehörighet begärs av detta val. Du får en separat fråga innan schemalagda notiser aktiveras.</Text>
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
