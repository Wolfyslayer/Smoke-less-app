import React,{useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {CigaretteEntry,IntervalPlan} from './interval';
import {loadIntervalPlan,saveIntervalPlan} from './intervalStorage';
import {scheduleIntervalNotifications} from './intervalNotifications';
import {reconcileHistory} from './analytics';
import {confirmAction,showMessage} from './dialogs';
import DailyCheckin from './DailyCheckin';
import {deleteCheckin,dayKey} from './dailyCheckins';
const C={card:'#24201E',line:'#3A3431',orange:'#FF812F',white:'#F7F4F1',muted:'#ADA5A0'};
const key=(date:Date)=>date.toLocaleDateString('sv-SE');
export default function SmokingLog(){
 const [plan,setPlan]=useState<IntervalPlan|null>(null);
 const [offset,setOffset]=useState(0);
 const [undo,setUndo]=useState<CigaretteEntry|null>(null);
 const [revision,setRevision]=useState(0);
 useEffect(()=>{loadIntervalPlan().then(setPlan)},[]);
 const day=new Date();day.setDate(day.getDate()+offset);
 const selected=key(day);
 const entries=(plan?.history??[]).filter(e=>key(new Date(e.at))===selected).sort((a,b)=>b.at.localeCompare(a.at));
 const update=async(next:IntervalPlan,affectedDay?:string)=>{try{await saveIntervalPlan(next);if(affectedDay)await deleteCheckin(affectedDay);await scheduleIntervalNotifications(next);setPlan(next);setRevision(v=>v+1)}catch{showMessage('Fel','Kunde inte spara ändringen.')}};
 const remove=(entry:CigaretteEntry)=>confirmAction('Ta bort registrering?','Detta påverkar dagens antal och statistiken.',()=>{if(!plan)return;setUndo(entry);const history=reconcileHistory((plan.history??[]).filter(e=>e!==entry));const last=history[0]?.at??new Date().toISOString();update({...plan,history,lastCigaretteAt:last},dayKey(new Date(entry.at)))},true);
 const edit=(entry:CigaretteEntry,delta:number)=>{if(!plan)return;const date=new Date(new Date(entry.at).getTime()+delta*60000);if(!Number.isFinite(date.getTime())||date.getTime()>Date.now()){showMessage('Ogiltig tid','Registreringen kan inte flyttas till framtiden.');return}const history=reconcileHistory((plan.history??[]).map(e=>e===entry?{...e,at:date.toISOString()}:e));update({...plan,history,lastCigaretteAt:history[0]?.at??plan.lastCigaretteAt},dayKey(new Date(entry.at)));if(dayKey(date)!==dayKey(new Date(entry.at)))deleteCheckin(dayKey(date)).catch(()=>{});};
 return <View style={s.wrap}><Text style={s.title}>Cigarettlogg</Text><Text style={s.sub}>Varje cigarett registreras utan skuldkänslor.</Text><View style={s.selector}><Pressable accessibilityRole="button" onPress={()=>setOffset(v=>v-1)} style={s.arrow}><Text style={s.arrowText}>‹</Text></Pressable><View style={s.center}><Text style={s.heading}>{offset===0?'Idag':offset===-1?'Igår':day.toLocaleDateString('sv-SE',{weekday:'long'})}</Text><Text style={s.sub}>{day.toLocaleDateString('sv-SE',{day:'numeric',month:'short',year:'numeric'})}</Text></View><Pressable accessibilityRole="button" disabled={offset>=0} onPress={()=>setOffset(v=>Math.min(0,v+1))} style={s.arrow}><Text style={[s.arrowText,offset>=0&&{color:C.line}]}>›</Text></Pressable></View><Text style={s.count}>♨  {entries.length} {entries.length===1?'cigarett':'cigaretter'} denna dag</Text>
 {entries.length===0?<View style={s.card}><Text style={s.sub}>Inga cigaretter registrerade denna dag.</Text></View>:entries.map((entry,i)=><View style={s.card} key={entry.at+'-'+i}><Text style={s.icon}>♨</Text><View style={s.details}><Text style={s.heading}>{new Date(entry.at).toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'})}</Text><Text style={s.sub}>Cigarett {entries.length-i}</Text></View><Pressable accessibilityLabel="Flytta 5 minuter bakåt" onPress={()=>edit(entry,-5)}><Text style={s.control}>−5m</Text></Pressable><Pressable accessibilityLabel="Flytta 5 minuter framåt" onPress={()=>edit(entry,5)}><Text style={s.control}>+5m</Text></Pressable><Pressable accessibilityLabel="Ta bort cigarett" onPress={()=>remove(entry)}><Text style={s.control}>✕</Text></Pressable></View>)}
 <DailyCheckin key={selected+'-'+revision} date={day}/>{undo?<Pressable accessibilityRole="button" style={s.card} onPress={()=>{if(!plan)return;const history=reconcileHistory([undo,...(plan.history??[])]);update({...plan,history,lastCigaretteAt:history[0].at},dayKey(new Date(undo.at)));setUndo(null)}}><Text style={s.control}>↶ Ångra senaste borttagningen</Text></Pressable>:null}<Text style={s.sub}>Ändra tiden i steg om fem minuter eller ta bort en felregistrering. Loggen sparas lokalt.</Text></View>;
}
const s=StyleSheet.create({wrap:{gap:15},title:{fontSize:28,fontWeight:'800',color:C.white},sub:{fontSize:14,color:C.muted,lineHeight:20},selector:{backgroundColor:C.card,borderColor:C.line,borderWidth:1,borderRadius:17,padding:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},center:{alignItems:'center',gap:5},heading:{fontSize:19,fontWeight:'800',color:C.white},arrow:{padding:9,backgroundColor:'#312B28',borderRadius:30,minWidth:42,alignItems:'center'},arrowText:{color:C.white,fontSize:25},count:{color:C.muted,fontSize:16},card:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:16,padding:17,flexDirection:'row',alignItems:'center',gap:11},icon:{color:C.orange,fontSize:24},details:{flex:1,gap:5},control:{color:C.orange,fontSize:14,fontWeight:'800',padding:4}});
