import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {Profile} from './model';
import {reductionSchedule,speedLabel,ReductionSpeed} from './reductionPlan';
const C={card:'#24201E',border:'#3A3431',orange:'#FF812F',white:'#F7F4F1',muted:'#ADA5A0'};
export default function ReductionPlan({profile,onUpdate}:{profile:Profile;onUpdate:(patch:Partial<Profile>)=>void}){
 const speed:ReductionSpeed=profile.reductionSpeed??'balanced';
 const plan=reductionSchedule(profile.cigarettesPerDay,profile.planStartAt??profile.quitAt,speed);
 const target=profile.dailyTargetOverride??plan.todayTarget;
 const weeks=Array.from({length:Math.ceil(plan.days.length/7)},(_,i)=>plan.days.slice(i*7,i*7+7));
 const dayName=(d:Date)=>d.toLocaleDateString('sv-SE',{weekday:'short'}).slice(0,2);
 return <View style={s.wrap}><Text style={s.title}>Din nedtrappningsplan</Text><Text style={s.sub}>{speedLabel[speed]} takt · start vid {profile.cigarettesPerDay} cigaretter/dag</Text>
 <View style={s.row}><View style={s.tile}><Text style={s.sub}>Dagens mål</Text><Text style={s.value}>{target} <Text style={s.small}>cigaretter</Text></Text></View><View style={s.tile}><Text style={s.sub}>Planerat rökstopp</Text><Text style={s.value}>{plan.quitDate.toLocaleDateString('sv-SE',{day:'numeric',month:'short'})}</Text><Text style={s.sub}>{Math.max(0,Math.ceil((plan.quitDate.getTime()-Date.now())/86400000))} dagar kvar</Text></View></View>
 {plan.next?<View style={s.card}><Text style={s.text}>↘ Nästa minskning: <Text style={s.bold}>{plan.next.target} cigaretter/dag</Text> om {Math.max(0,plan.next.day-plan.todayIndex)} dagar</Text></View>:<View style={s.card}><Text style={s.text}>Planerat rökstoppsdatum har nåtts. Fortsätt i din egen takt.</Text></View>}
 <View style={s.card}><Text style={s.sub}>Planen är ett stöd, inte ett krav. Du kan räkna om den när som helst. Din cigaretthistorik sparas.</Text></View>
 <Text style={s.heading}>Nedtrappningshastighet</Text><View style={s.row}>{(['gentle','balanced','fast'] as ReductionSpeed[]).map(v=><Pressable key={v} style={[s.choice,speed===v&&s.active]} onPress={()=>onUpdate({reductionSpeed:v,planStartAt:new Date().toISOString()})}><Text style={s.text}>{speedLabel[v]}</Text></Pressable>)}</View>
 <View style={s.row}><Text style={s.heading}>Planens tidslinje</Text><Pressable onPress={()=>onUpdate({planStartAt:new Date().toISOString(),dailyTargetOverride:null})}><Text style={s.action}>↻ Räkna om</Text></Pressable></View>
 {weeks.map((days,i)=><View style={s.card} key={i}><Text style={s.bold}>Vecka {i+1}</Text><View style={s.days}>{days.map(d=><View key={d.day} style={[s.day,d.day===plan.todayIndex&&s.today]}><Text style={s.dayNumber}>{d.target}</Text><Text style={s.dayLabel}>{dayName(d.date)}</Text></View>)}</View></View>)}
 <Text style={s.sub}>Dagsmålet är ett högsta riktvärde – du behöver aldrig röka för att nå det. Ändringar i planen påverkar inte tidigare registreringar.</Text></View>;
}
const s=StyleSheet.create({wrap:{gap:15},title:{fontSize:28,fontWeight:'800',color:C.white},heading:{fontSize:19,fontWeight:'800',color:C.white},sub:{fontSize:14,lineHeight:21,color:C.muted},row:{flexDirection:'row',gap:10,alignItems:'center',justifyContent:'space-between'},tile:{flex:1,backgroundColor:C.card,borderColor:C.border,borderWidth:1,borderRadius:16,padding:15,minHeight:115,gap:9},value:{fontSize:24,fontWeight:'800',color:C.white},small:{fontSize:13,fontWeight:'400',color:C.muted},card:{backgroundColor:C.card,borderColor:C.border,borderWidth:1,borderRadius:16,padding:16,gap:13},text:{fontSize:14,color:C.white},bold:{fontSize:16,fontWeight:'800',color:C.white},choice:{flex:1,padding:12,backgroundColor:C.card,borderRadius:12,alignItems:'center'},active:{borderWidth:1,borderColor:C.orange},action:{color:C.orange,fontWeight:'800'},days:{flexDirection:'row',gap:4,justifyContent:'space-between'},day:{flex:1,minWidth:0,backgroundColor:'#312B28',borderRadius:9,paddingVertical:12,alignItems:'center',gap:9},today:{backgroundColor:'#8B441E'},dayNumber:{color:C.white,fontSize:15,fontWeight:'800'},dayLabel:{color:C.muted,fontSize:10}});
