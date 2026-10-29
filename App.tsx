import React, { useEffect, useState } from 'react';
import HomeDashboard from './src/HomeDashboard';
import ReductionPlan from './src/ReductionPlan';
import SmokingLog from './src/SmokingLog';
import SmokingStats from './src/SmokingStats';
import Benefits from './src/Benefits';
import SettingsScreen from './src/SettingsScreen';
import {reductionSchedule} from './src/reductionPlan';
import ProgressInsights from './src/ProgressInsights';
import Onboarding, {Setup} from './src/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initialProfile, Profile } from './src/model';
import { loadProfile, saveProfile } from './src/storage';
import { loadIntervalPlan,saveIntervalPlan } from './src/intervalStorage';
import { registerInterval } from './src/adaptiveTapering';
import { scheduleIntervalNotifications } from './src/intervalNotifications';
import { deleteCheckin,dayKey } from './src/dailyCheckins';
import { showMessage } from './src/dialogs';

type Tab = 'home' | 'plan' | 'log' | 'stats' | 'benefits' | 'sos' | 'history' | 'settings';
const C = { bg:'#15110F', card:'#24201E', mint:'#FF812F', white:'#F7F4F1', muted:'#ADA5A0', border:'#3A3431' };
function Btn({title,onPress,secondary=false}:{title:string;onPress:()=>void;secondary?:boolean}) { return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.btn,secondary&&styles.secondary]}><Text style={[styles.btnText,secondary&&{color:C.white}]}>{title}</Text></Pressable>; }
function Tile({label,value}:{label:string;value:string}) {return <View style={styles.tile}><Text style={styles.muted}>{label}</Text><Text style={styles.number}>{value}</Text></View>;}
function AppContent() {
 const [profile,setProfile]=useState<Profile>(initialProfile);
 const [loaded,setLoaded]=useState(false);
 const [onboarded,setOnboarded]=useState<boolean|null>(null);
 const [tab,setTab]=useState<Tab>('home');
 const [dataVersion,setDataVersion]=useState(0);
 const [intensity,setIntensity]=useState(3);
 const [trigger,setTrigger]=useState('');
 const [breath,setBreath]=useState(0);
 const [sosStarted,setSosStarted]=useState(Date.now());
 const [sosTip,setSosTip]=useState(0);
 useEffect(()=>{AsyncStorage.getItem('smokeless-onboarded-v1').then(v=>setOnboarded(v==='yes')).catch(()=>setOnboarded(false));loadProfile().then(p=>{setProfile(p);setLoaded(true);}); return ()=>{};},[]);
 useEffect(()=>{if(loaded)saveProfile(profile).catch(()=>Alert.alert('Fel','Kunde inte spara lokalt.'));},[profile,loaded]);
 useEffect(()=>{if(tab!=='sos')return;const timer=setInterval(()=>setBreath(v=>(v+1)%8),1000);return ()=>clearInterval(timer);},[tab]);
 const navigate=(next:Tab)=>{setTab(next);};
 const update=(patch:Partial<Profile>)=>setProfile(p=>({...p,...patch}));
 const addCraving=async(resisted:boolean)=>{
  if(!resisted){try{const plan=await loadIntervalPlan();const next=registerInterval(plan);await saveIntervalPlan(next);await deleteCheckin(dayKey(new Date()));await scheduleIntervalNotifications(next);}catch{showMessage('Kunde inte registrera','Cigaretten kunde inte sparas. Försök igen.');return;}}
  update({cravings:[{id:String(Date.now()),date:new Date().toISOString(),intensity,trigger:trigger.trim()||'Okänd',resisted},...profile.cravings]});
  setTrigger('');setDataVersion(v=>v+1);setTab('home');showMessage('Registrerat',resisted?'Bra jobbat! Varje hanterat röksug räknas.':'Ett bakslag raderar inte dina framsteg. Cigaretten finns nu i loggen.');
 };
 if(onboarded===null)return <SafeAreaView style={styles.safe}><Text style={styles.logo}>SMOKE LESS</Text></SafeAreaView>;
 if(!onboarded)return <Onboarding onComplete={async(setup:Setup)=>{update({cigarettesPerDay:setup.cigarettesPerDay,packPrice:setup.packPrice,cigarettesPerPack:setup.cigarettesPerPack,quitAt:new Date().toISOString(),mode:setup.mode,planStartAt:new Date().toISOString(),reductionSpeed:'balanced'});await AsyncStorage.setItem('smokeless-onboarded-v1','yes');setOnboarded(true);if(setup.mode==='taper')setTab('home');}}/>;
 return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content"/>{tab!=='home'&&<View style={styles.header}><Text style={styles.logo}>◉  SMOKE LESS</Text><Text style={styles.muted}>En dag i taget</Text></View>}<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
 {tab==='home'&&<HomeDashboard dailyTarget={profile.mode==='quit'?0:(profile.dailyTargetOverride??reductionSchedule(profile.cigarettesPerDay,profile.planStartAt??profile.quitAt,profile.reductionSpeed).todayTarget)} onSOS={()=>{setSosStarted(Date.now());navigate('sos')}} onNavigate={navigate}/>}
 {tab==='plan'&&<ReductionPlan profile={profile} onUpdate={update}/>}
 {tab==='log'&&<SmokingLog key={dataVersion}/>}
 {tab==='stats'&&<SmokingStats key={dataVersion} profile={profile}/>}
 {tab==='benefits'&&<Benefits key={dataVersion} profile={profile}/>}
 {tab==='sos'&&<><Text style={styles.title}>Du klarar den här stunden</Text><Text style={styles.muted}>Röksug kommer i vågor. Du behöver inte bestämma något för resten av dagen – bara för just nu.</Text><View style={styles.hero}><Text style={styles.muted}>Andas lugnt med rytmen</Text><Text style={styles.big}>{breath<4?'Andas in':'Andas ut'}</Text><Text style={styles.subtitle}>{4-(breath%4)} sekunder · lugnt och i din egen takt</Text></View><View style={styles.card}><Text style={styles.cardTitle}>Prova en annan sak i fem minuter</Text><Text style={styles.body}>{['Drick ett glas vatten och fokusera på smaken.','Byt miljö. Ta en kort promenad eller öppna ett fönster.','Håll händerna sysselsatta och slappna av i axlarna.','Skicka ett meddelande till någon du litar på.'][sosTip]}</Text><Btn title="Visa ett annat tips" secondary onPress={()=>setSosTip(v=>(v+1)%4)}/></View><Text style={styles.section}>Hur starkt är röksuget?</Text><View style={styles.levels}>{[1,2,3,4,5].map(n=><Pressable key={n} onPress={()=>setIntensity(n)} style={[styles.level,intensity===n&&styles.selected]}><Text style={styles.body}>{n}</Text></Pressable>)}</View><Text style={styles.section}>Vad utlöste det?</Text><TextInput placeholder="Stress, kaffe, efter maten..." placeholderTextColor={C.muted} style={styles.input} value={trigger} onChangeText={setTrigger}/><Btn title="Jag klarade röksuget" onPress={()=>{void addCraving(true)}}/><Btn title="Jag rökte – registrera utan skuld" secondary onPress={()=>{void addCraving(false)}}/><Btn title="Se mina tidigare röksug" secondary onPress={()=>setTab('history')}/><Text style={styles.muted}>Tips: drick vatten, byt miljö, ring någon eller vänta fem minuter.</Text></>}
 {tab==='history'&&<><Btn title="← Tillbaka till stödet" secondary onPress={()=>setTab('sos')}/><Text style={styles.title}>Din utveckling</Text><ProgressInsights/><View style={styles.grid}><Tile label="Hanterade röksug" value={String(profile.cravings.filter(x=>x.resisted).length)}/><Tile label="Loggade röksug" value={String(profile.cravings.length)}/></View><Text style={styles.section}>Senaste händelser</Text>{profile.cravings.length===0?<Text style={styles.muted}>Här visas dina registrerade röksug.</Text>:profile.cravings.map(x=><View key={x.id} style={styles.card}><Text style={styles.cardTitle}>{x.resisted?'✓ Hanterat':'↻ Bakslag'} · {x.intensity}/5</Text><Text style={styles.muted}>{new Date(x.date).toLocaleString('sv-SE')} · {x.trigger}</Text></View>)}</>}
 {tab==='settings'&&<SettingsScreen profile={profile} onUpdate={update} onRestored={async()=>{const restored=await loadProfile();setProfile(restored);setDataVersion(v=>v+1);setTab('home');}}/>}
 </ScrollView><View style={styles.nav}><Pressable accessibilityRole="button" accessibilityLabel="Hjälp vid röksug" onPress={()=>{setSosStarted(Date.now());navigate('sos')}} style={styles.sosNav}><Text style={styles.sosNavText}>♡</Text><Text style={styles.sosNavCaption}>SOS</Text></Pressable>{([['home','Hem'],['plan','Plan'],['log','Logg'],['stats','Statistik'],['benefits','Fördelar'],['settings','Inställn.']] as [Tab,string][]).map(([id,label])=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===id}} key={id} onPress={()=>navigate(id)} style={styles.navItem}><Text style={[styles.navText,tab===id&&{color:C.mint}]}>{({home:'⌂',plan:'▦',log:'☷',stats:'▥',benefits:'♡',settings:'⚙'} as Record<string,string>)[id]}</Text><Text style={[styles.navCaption,tab===id&&{color:C.mint}]}>{label}</Text></Pressable>)}</View></SafeAreaView>;
}
export default function App(){return <SafeAreaProvider><AppContent/></SafeAreaProvider>;}
const styles=StyleSheet.create({sosNav:{position:'absolute',right:14,bottom:78,zIndex:5,backgroundColor:'#FF812F',width:64,height:64,borderRadius:32,alignItems:'center',justifyContent:'center',borderWidth:4,borderColor:C.bg,elevation:6},sosNavText:{color:'#15110F',fontSize:27,fontWeight:'900',lineHeight:29},sosNavCaption:{color:'#15110F',fontSize:10,fontWeight:'900'},quickMenu:{backgroundColor:C.card,padding:16,borderTopWidth:1,borderColor:C.border,gap:8},quickTitle:{color:C.white,fontSize:16,fontWeight:'800'},quickRow:{gap:8},safe:{flex:1,backgroundColor:C.bg},header:{paddingHorizontal:22,paddingTop:16,paddingBottom:16,borderBottomWidth:1,borderColor:C.border,backgroundColor:'#201B18'},logo:{color:C.mint,fontSize:17,fontWeight:'900',letterSpacing:2},content:{paddingHorizontal:18,paddingTop:20,paddingBottom:105,gap:18},title:{fontSize:27,fontWeight:'800',color:C.white,marginVertical:7},muted:{color:C.muted,fontSize:14},hero:{backgroundColor:C.card,padding:26,borderRadius:24,alignItems:'center',gap:12},big:{color:C.mint,fontSize:42,fontWeight:'900'},subtitle:{color:C.white,fontSize:14},grid:{flexDirection:'row',gap:12},tile:{flex:1,backgroundColor:C.card,borderRadius:18,padding:17,gap:9},number:{fontSize:25,color:C.white,fontWeight:'800'},section:{fontSize:19,fontWeight:'700',color:C.white,marginTop:8},btn:{backgroundColor:C.mint,borderRadius:15,padding:17,alignItems:'center',marginTop:4},secondary:{backgroundColor:C.card,borderWidth:1,borderColor:C.border},btnText:{color:C.bg,fontSize:15,fontWeight:'800'},card:{backgroundColor:C.card,borderRadius:18,padding:19,gap:8},cardTitle:{color:C.white,fontSize:17,fontWeight:'700'},body:{color:C.white,fontSize:15,lineHeight:23},levels:{flexDirection:'row',gap:9},level:{flex:1,backgroundColor:C.card,padding:13,alignItems:'center',borderRadius:12},selected:{backgroundColor:'#8B441E',borderWidth:1,borderColor:C.mint},input:{color:C.white,backgroundColor:C.card,borderColor:C.border,borderWidth:1,borderRadius:12,padding:14,fontSize:16},field:{gap:7},nav:{flexDirection:'row',borderTopWidth:1,borderColor:C.border,paddingTop:12,paddingBottom:14,backgroundColor:'#201B18'},navItem:{flex:1,alignItems:'center',paddingVertical:5,minHeight:50},navText:{color:C.muted,fontWeight:'700',fontSize:23},navCaption:{color:C.muted,fontWeight:'700',fontSize:10}});
