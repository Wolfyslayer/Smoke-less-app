import React from 'react';
import {StyleSheet,Text,View} from 'react-native';
import {buildPersonalTrends,type TrendComparison} from '../domain/personalTrends';
import {useThemeStyles,type ThemeColors} from '../theme';

const number=(value:number)=>value.toLocaleString('sv-SE',{maximumFractionDigits:1});
function Comparison({title,value}:{title:string;value:TrendComparison}){
 const s=useThemeStyles(createS);

 return <View style={s.card}>
  <Text accessibilityRole="header" style={s.title}>{title}</Text>
  {[['Senast avslutad',value.current],['Föregående',value.previous]] .map(([label,period])=>{const p=period as TrendComparison['current'];return <View key={String(label)} accessible accessibilityRole="text" style={s.row}>
   <Text style={s.text}>{String(label)}: {p.start} – {p.end}</Text>
   <Text style={s.text}>{p.entries} registreringar · {number(p.average)} per kalenderdag</Text>
   <Text style={s.text}>{p.confirmedDays}/{p.days} dagar avstämda · {p.cravings} registrerade röksug</Text>
  </View>})}
  <Text style={s.text}>{value.entryChange===null?'För få avstämda dagar för en konsumtionsjämförelse. Registreringarna visas utan att saknade dagar tolkas som rökfria.':`Skillnad i registrerat dagsgenomsnitt: ${value.entryChange>0?'+':''}${number(value.entryChange)} cigaretter.`}</Text>
  <Text style={s.text}>Skillnad i registrerade röksug per kalenderdag: {value.cravingChange>0?'+':''}{number(value.cravingChange)}. Fler eller färre registreringar visar inte säkert hur ofta röksug faktiskt förekom.</Text>
 </View>;
}
export function PersonalTrends({trends}:{trends:ReturnType<typeof buildPersonalTrends>}){
 const s=useThemeStyles(createS);

 return <View style={s.container}>
  <Comparison title="Vecka mot vecka" value={trends.week}/>
  <Comparison title="Månad mot månad" value={trends.month}/>
  <View style={s.card}><Text accessibilityRole="header" style={s.title}>Dina bekräftade rekord</Text><Text style={s.text}>Längsta följd: {trends.longestStreak} dagar. Totalt: {trends.confirmedSmokeFreeDays} bekräftat rökfria dagar.</Text><Text style={s.text}>Följd till och med {trends.streakEnd}: {trends.currentStreak} dagar. En ofärdig dag räknas inte som rökfri och tar inte bort tidigare rekord.</Text></View>
  <View style={s.card}><Text accessibilityRole="header" style={s.title}>Registreringar och kända planmål</Text>{trends.recentDays.map(day=><View key={day.day} accessible accessibilityRole="text" style={s.row}><Text style={s.text}>{day.day}: {day.entries} registreringar · {day.complete?'avstämd':'inte avstämd'}{day.smokeFree?' · bekräftat rökfri':''}</Text><Text style={s.text}>{day.goal===null?'Historiskt planmål saknas':`Planmål: högst ${day.goal}`}</Text></View>)}<Text style={s.text}>Äldre planmål kan inte återskapas från dagens plan. Mål visas bara från senaste planstart. Dagens mål och registreringar använder samma källor som startsidan. Noll registreringar är inte automatiskt rökfrihet.</Text></View>
 </View>;
}
const createS=(C:ThemeColors)=>StyleSheet.create({container:{gap:16},card:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border,borderRadius:24,padding:17,gap:12},title:{color:C.white,fontWeight:'800',fontSize:18,flexShrink:1},text:{color:C.muted,fontSize:15,lineHeight:21,flexShrink:1},row:{gap:5,paddingVertical:8}});
