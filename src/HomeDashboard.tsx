import React,{useEffect,useState} from 'react';
import {Alert,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {IntervalPlan,initialIntervalPlan} from './interval';
import {loadIntervalPlan,saveIntervalPlan} from './intervalStorage';
import {registerInterval,acceptSuggestion,dismissSuggestion} from './adaptiveTapering';
import {scheduleIntervalNotifications} from './intervalNotifications';
const C={bg:'#15110F',card:'#24201E',line:'#3A3431',orange:'#FF812F',green:'#35B980',white:'#F7F4F1',muted:'#ADA5A0'};
const dateKey=(value:string)=>new Date(value).toLocaleDateString('sv-SE');
function Stat({label,value,sub}:{label:string;value:string;sub?:string}){return <View style={s.stat}><Text style={s.statLabel}>{label}</Text><Text style={s.statValue}>{value}</Text>{sub?<Text style={s.sub}>{sub}</Text>:null}</View>;}
export default function HomeDashboard({dailyTarget,onSOS}:{dailyTarget:number;onSOS:()=>void}){
 const [plan,setPlan]=useState<IntervalPlan>(initialIntervalPlan);
 const [ready,setReady]=useState(false);
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{loadIntervalPlan().then(p=>{setPlan(p);setReady(true)});const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer)},[]);
 const update=async(next:IntervalPlan)=>{setPlan(next);try{await saveIntervalPlan(next);await scheduleIntervalNotifications(next)}catch{Alert.alert('Notiser','Dina ändringar sparades, men notiser kunde inte uppdateras.')}};
 const today=dateKey(new Date(now).toISOString());
 const entries=plan.history??[];
 const todayEntries=entries.filter(x=>dateKey(x.at)===today);
 const target=Math.max(0,Math.round(dailyTarget)||0);
 const count=todayEntries.length;
 const remaining=Math.max(0,target-count);
 const elapsed=Math.max(0,now-new Date(plan.lastCigaretteAt).getTime());
 const seconds=Math.floor(elapsed/1000);
 const elapsedLabel=seconds<60?seconds+' sek':seconds<3600?Math.floor(seconds/60)+' min':Math.floor(seconds/3600)+' h '+Math.floor(seconds%3600/60)+' min';
 const week=entries.filter(x=>now-new Date(x.at).getTime()<=7*86400000);
 const previous=entries.filter(x=>{const age=now-new Date(x.at).getTime();return age>7*86400000&&age<=14*86400000});
 const trend=previous.length?Math.round((previous.length-week.length)/previous.length*100):null;
 const segments=48,progress=target===0?(count>0?1:0):Math.min(1,count/target);
 const register=()=>Alert.alert('Registrera cigarett','Vill du lägga till en cigarett i dagens logg?',[
 {text:'Avbryt',style:'cancel'},
 {text:'Registrera',onPress:()=>update(registerInterval(plan))}
 ]);
 return <ScrollView style={s.root} contentContainerStyle={s.content}>
 <View style={s.top}><View><Text style={s.date}>{new Date(now).toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'long'})}</Text><Text style={s.title}>Dagens framsteg</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Stöd vid röksug" onPress={onSOS} style={s.heart}><Text style={s.heartText}>♡</Text></Pressable></View>
 <View style={s.ringWrap} accessibilityLabel={count+' av '+target+' cigaretter idag'}>
 <View style={s.ring}>{Array.from({length:segments},(_,i)=>{const angle=i*360/segments;return <View key={i} style={[s.segment,{transform:[{rotate:angle+'deg'}]}]}><View style={[s.segmentMark,{backgroundColor:i/segments<progress?C.orange:'#3B3532'}]}/></View>})}<View style={s.ringCenter}><Text style={s.count}>{count}<Text style={s.slash}> / {target}</Text></Text><Text style={s.ringCaption}>Cigaretter idag</Text></View></View>
 </View>
 <View style={[s.pill,{backgroundColor:remaining?'#19382A':'#3B2923'}]}><Text style={[s.pillText,{color:target===0&&count===0?C.green:remaining?C.green:C.orange}]}>{target===0?(count===0?'Rökfri dag hittills':'Registrerat idag: '+count):remaining?remaining+' under dagsmålet':'Dagsmålet nått eller överskridet'}</Text></View>
 <View style={s.grid}><Stat label="◷  Sedan senaste" value={entries.length?elapsedLabel:'Ingen registrering'}/><Stat label="◎  Dagens mål" value={target+' cigaretter'}/><Stat label="♧  Klarade intervall" value={String(entries.filter(x=>x.metTarget).length)}/><Stat label="⌁  Veckans förändring" value={trend===null?'–':(trend>0?'-':'')+Math.abs(trend)+' %'} sub={trend===null?'Samla två veckors data':'jämfört med föregående vecka'}/></View>
 <Pressable accessibilityRole="button" style={s.primary} onPress={register}><Text style={s.flame}>♨</Text><Text style={s.primaryText}>+ Jag rökte</Text><Text style={s.primarySub}>Registrera en cigarett</Text></Pressable>
 <View style={s.panel}><Text style={s.panelTitle}>Din nedtrappningsplan</Text><Text style={s.sub}>{plan.enabled?'Mål: minst '+plan.minutes+' minuter mellan cigaretterna':'Aktivera planen för att träna på längre intervaller.'}</Text>
 <Pressable accessibilityRole="button" style={s.outline} onPress={()=>update({...plan,enabled:!plan.enabled})}><Text style={s.outlineText}>{plan.enabled?'Pausa intervallplan':'Aktivera intervallplan'}</Text></Pressable>
 {plan.enabled?<><View style={s.presets}>{[30,45,60,90,120,180].map(n=><Pressable key={n} onPress={()=>update({...plan,minutes:n})} style={[s.preset,plan.minutes===n&&s.presetActive]}><Text style={s.presetText}>{n}m</Text></Pressable>)}</View><Pressable onPress={()=>update({...plan,notificationsEnabled:!plan.notificationsEnabled})}><Text style={s.sub}>Intervallnotiser: {plan.notificationsEnabled?'På':'Av'} (tryck för att ändra)</Text></Pressable></>:null}
 {plan.suggestedMinutes?<View style={s.suggest}><Text style={s.panelTitle}>Prova {plan.suggestedMinutes} minuter?</Text><Text style={s.sub}>Du har klarat flera intervaller. Det är frivilligt att öka målet.</Text><Pressable onPress={()=>update(acceptSuggestion(plan))}><Text style={s.action}>Ja, öka målet</Text></Pressable><Pressable onPress={()=>update(dismissSuggestion(plan))}><Text style={s.sub}>Inte just nu</Text></Pressable></View>:null}</View>
 <Pressable onPress={onSOS} style={s.support}><Text style={s.supportText}>♡  Jag är röksugen – hjälp mig</Text></Pressable>
 <Text style={s.note}>Målet är vägledande, inte en uppmaning att röka upp resterande cigaretter.</Text>
 </ScrollView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:C.bg},content:{padding:20,paddingBottom:36,gap:18},top:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8},date:{color:C.muted,fontSize:15,textTransform:'capitalize'},title:{color:C.white,fontSize:28,fontWeight:'800',marginTop:4},heart:{backgroundColor:C.card,width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center'},heartText:{color:C.orange,fontSize:34},ringWrap:{alignItems:'center',paddingVertical:10},ring:{width:250,height:250,alignItems:'center',justifyContent:'center'},segment:{position:'absolute',width:250,height:250,alignItems:'center'},segmentMark:{width:9,height:21,borderRadius:7,marginTop:0},ringCenter:{position:'absolute',width:185,height:185,borderRadius:100,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'},count:{color:C.white,fontSize:52,fontWeight:'800'},slash:{color:C.muted,fontSize:30},ringCaption:{color:C.muted,fontSize:15},pill:{alignSelf:'center',paddingVertical:9,paddingHorizontal:22,borderRadius:24},pillText:{fontWeight:'800',fontSize:15},grid:{flexDirection:'row',flexWrap:'wrap',gap:12},stat:{width:'48%',flexGrow:1,backgroundColor:C.card,borderRadius:16,borderWidth:1,borderColor:C.line,padding:16,minHeight:108,gap:8},statLabel:{color:C.muted,fontSize:14},statValue:{color:C.white,fontSize:21,fontWeight:'800'},sub:{color:C.muted,fontSize:13,lineHeight:20},primary:{backgroundColor:C.orange,borderRadius:20,alignItems:'center',padding:24,gap:4},flame:{color:C.white,fontSize:30},primaryText:{color:C.white,fontSize:27,fontWeight:'900'},primarySub:{color:'#FFF1E7',fontSize:14},panel:{backgroundColor:C.card,borderColor:C.line,borderWidth:1,borderRadius:18,padding:18,gap:12},panelTitle:{color:C.white,fontSize:19,fontWeight:'800'},outline:{borderWidth:1,borderColor:C.orange,borderRadius:12,padding:13,alignItems:'center'},outlineText:{color:C.orange,fontWeight:'800'},presets:{flexDirection:'row',flexWrap:'wrap',gap:7},preset:{padding:9,backgroundColor:C.line,borderRadius:9},presetActive:{backgroundColor:'#9B4A1F'},presetText:{color:C.white,fontWeight:'700'},suggest:{gap:10},action:{color:C.orange,fontWeight:'800'},support:{padding:16,borderRadius:15,borderColor:C.line,borderWidth:1,alignItems:'center'},supportText:{color:C.white,fontWeight:'700'},note:{color:C.muted,fontSize:12,textAlign:'center'}});
