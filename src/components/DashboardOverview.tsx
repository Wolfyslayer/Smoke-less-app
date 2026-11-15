import React,{useMemo} from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {dayKey,nextReductionMilestone,savings,type Data} from '../domain';
import {useDashboardPreferences} from '../hooks/useDashboardPreferences';
import {DashboardEditor,dashboardCardLabels} from './DashboardEditor';
import {C} from '../theme';

type Props={uid:string|null;data:Data;clock:number;duration:string;weekly:number[];goalCard:React.ReactNode};
export function DashboardOverview({uid,data,clock,duration,weekly,goalCard}:Props){
 const preferences=useDashboardPreferences(uid);
 const today=dayKey(new Date(clock));
 const minute=Math.floor(clock/60000);
 const cravingCount=useMemo(()=>data.cravings.filter(c=>{const at=new Date(c.at);return Number.isFinite(at.getTime())&&at.getTime()<=clock&&dayKey(at)===today;}).length,[data.cravings,today,minute]);
 const saved=useMemo(()=>savings(data),[data,today]);
 const milestone=useMemo(()=>data.profile?nextReductionMilestone(data.profile,new Date(clock)):null,[data.profile,today]);
 return <View style={s.container}>
  <DashboardEditor value={preferences.value} ready={preferences.ready} error={preferences.error} onChange={preferences.update}/>
  {preferences.value.cards.length===0?<Text style={s.muted}>Dina översiktskort är dolda. Välj Anpassa startsidan för att visa dem igen.</Text>:null}
  {preferences.value.cards.map(id=>id==='goal'?<React.Fragment key={id}>{goalCard}</React.Fragment>:<View key={id} style={s.card}>
   <Text accessibilityRole="header" style={s.title}>{dashboardCardLabels[id]}</Text>
   {id==='time'?<><Text style={s.value}>{duration||'Ingen cigarett registrerad'}</Text><Text style={s.muted}>Tid sedan senaste registrerade cigaretten. Detta är inte en bekräftelse på sammanhängande rökfri tid.</Text></>:null}
   {id==='savings'?<><Text style={s.value}>{new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(saved)} kr</Text><Text style={s.muted}>Uppskattning från din startnivå och dina registreringar.</Text></>:null}
   {id==='cravings'?<><Text style={s.value}>{cravingCount} registrerade idag</Text><Text style={s.muted}>{cravingCount===0?'Inget röksug registrerat idag. SOS finns när du behöver stöd.':'Följ dina situationer och strategier i SOS och Statistik.'}</Text></>:null}
   {id==='milestone'?<><Text style={s.value}>{milestone?`${milestone.goal} cigaretter per dag`:'Fortsätt med dagens mål'}</Text><Text style={s.muted}>{milestone?milestone.date.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'}):'Inget kommande minskningssteg i planen. Se Min plan för mer information.'}</Text></>:null}
   {id==='progress'?<><View style={s.week}>{weekly.map((count,index)=>{const date=new Date(clock);date.setHours(12,0,0,0);date.setDate(date.getDate()-(weekly.length-1-index));return <View key={index} accessible accessibilityRole="text" accessibilityLabel={`${date.toLocaleDateString('sv-SE',{day:'numeric',month:'long'})}: ${count} registrerade cigaretter`} style={s.day}><Text style={s.value}>{count}</Text><Text style={s.muted}>{date.toLocaleDateString('sv-SE',{weekday:'short'})}</Text></View>})}</View><Text style={s.muted}>Registreringar under de senaste sju dagarna. Noll registreringar är inte en bekräftad rökfri dag.</Text></>:null}
  </View>)}
 </View>;
}
const s=StyleSheet.create({container:{gap:16},card:{gap:10,padding:17,borderRadius:20,borderWidth:1,borderColor:C.border,backgroundColor:C.elevated},title:{color:C.white,fontSize:17,fontWeight:'800'},value:{color:C.white,fontSize:21,fontWeight:'800',flexShrink:1},muted:{color:C.muted,fontSize:13,lineHeight:20},week:{flexDirection:'row',flexWrap:'wrap',gap:8},day:{minWidth:48,flexGrow:1,alignItems:'center',paddingVertical:8}});
