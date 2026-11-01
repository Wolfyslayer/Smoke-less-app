import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {C} from '../theme';
import {dayKey,savings,type Data} from '../domain';

type Props={data:Data;period:number;onPeriodChange:(days:number)=>void;clock:number;weekly:number[];todayCount:number;recentCravingsCount:number;cravingTriggers:[string,number][];cigaretteTriggers:[string,number][]};
const fmt=(n:number)=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);
const periodStart=(clock:number,days:number)=>{const d=new Date(clock);d.setHours(0,0,0,0);d.setDate(d.getDate()-(days-1));return d.getTime()};
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.label}>{children}</Text>}
function Heading({children}:{children:React.ReactNode}){return <Text style={styles.heading}>{children}</Text>}
function Stat({label,value}:{label:string;value:string}){return <Card style={{flex:1,minWidth:135,gap:8}}><Label>{label}</Label><Text style={styles.statValue}>{value}</Text></Card>}
function Bars({values}:{values:number[]}){const max=Math.max(1,...values);return <View style={styles.bars}>{values.map((n,i)=><View key={i} style={{flex:1,alignItems:'center',justifyContent:'flex-end',gap:9}}><View style={{height:78,width:'100%',justifyContent:'flex-end',alignItems:'center'}}><View style={{height:Math.max(3,n/max*74),width:'68%',borderRadius:7,backgroundColor:n?C.lime:C.soft}}/></View><Text style={{color:C.dim,fontSize:10}}>{['M','T','O','T','F','L','S'][i%7]}</Text></View>)}</View>}
export function StatsScreen({data,period,onPeriodChange,clock,weekly,todayCount,recentCravingsCount,cravingTriggers,cigaretteTriggers}:Props){
 const todayKey=dayKey(new Date(clock));
 const startKey=period===0?null:dayKey(new Date(periodStart(clock,period)));
 const periodEntries=data.entries.filter(e=>period===0||(new Date(e.at).getTime()>=periodStart(clock,period)&&new Date(e.at).getTime()<=clock));
 const startDate=data.profile?new Date(data.profile.originalStartAt??data.profile.startAt):null;
 const observedDays=period===0?(startDate?Math.max(1,Math.floor((periodStart(clock,1)-periodStart(startDate.getTime(),1))/86400000)+1):0):period;
 const averagePerDay=observedDays>0?periodEntries.length/observedDays:0;
 const baseline=data.profile?.baseline??0;
 const reductionPercent=baseline>0?Math.round((1-averagePerDay/baseline)*100):null;
 const confirmedSmokeFreeDays=new Set(data.checkins.filter(c=>c.complete&&c.smokeFree&&c.date<=todayKey&&(startKey===null||c.date>=startKey)).map(c=>c.date)).size;
 return <View style={styles.screen}>
  <Card style={{padding:19,borderColor:'#425C29'}}><Label>REGISTRERINGAR</Label><Text style={styles.heroNumber}>{periodEntries.length}</Text><Text style={styles.muted}>{period===0?'Alla registreringar':'Kalenderdagar inklusive idag'}</Text></Card>
  <View style={styles.segment}>{([['Idag',1],['7 dagar',7],['30 dagar',30],['Totalt',0]] as const).map(([label,v])=><Pressable accessibilityRole="button" key={label} onPress={()=>onPeriodChange(v)} style={[styles.segmentItem,period===v&&{backgroundColor:C.lime}]}><Text style={{color:period===v?C.background:C.muted,fontWeight:'700',fontSize:12}}>{label}</Text></Pressable>)}</View>
  <Heading>Cigaretter per dag</Heading><Card><Bars values={weekly}/><Text style={styles.muted}>De senaste sju dagarna. Tomma staplar innebär inte automatiskt rökfria dagar.</Text></Card>
  <Text style={styles.muted}>Rökfria dagar räknas bara när dagen har bekräftats och ligger inom vald period. Dagar utan registrering räknas inte automatiskt som rökfria.</Text>
  <View style={styles.grid}><Stat label="IDAG" value={String(todayCount)}/><Stat label="BEKRÄFTAT RÖKFRIA DAGAR" value={String(confirmedSmokeFreeDays)}/><Stat label="SPARAT" value={fmt(savings(data))+' kr'}/><Stat label="TOTALT REGISTRERAT" value={String(data.entries.length)}/><Stat label="SNITT PER DAG" value={observedDays>0?averagePerDay.toLocaleString("sv-SE",{maximumFractionDigits:1}):"–"}/><Stat label="MOT STARTNIVÅ" value={reductionPercent===null?"–":(reductionPercent>0?"+":"")+reductionPercent+" %"}/></View>
  <Text style={styles.muted}>Genomsnittet bygger på registrerade cigaretter under vald period, inklusive dagar utan registrering. Det är inte ett bevis på rökfrihet. Positiv procentsats betyder färre registrerade cigaretter än din angivna startnivå.</Text>
  <Heading>Förstå dina vanor</Heading>
  <Card style={{gap:14}}><Label>RÖKSUG · SENASTE 30 DAGARNA</Label><Text style={styles.statValue}>{recentCravingsCount} <Text style={{fontSize:14,color:C.muted}}>registrerade tillfällen</Text></Text>
   {cravingTriggers.length===0?<Text style={styles.muted}>Registrera röksug under Stöd vid röksug för att upptäcka dina vanligaste situationer.</Text>:cravingTriggers.slice(0,5).map(([name,n])=><View key={name} style={{gap:6}}><View style={styles.sectionRow}><Text style={styles.cardTitle}>{name}</Text><Text style={styles.muted}>{n} st</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${Math.round(n/recentCravingsCount*100)}%` as `${number}%`}]}/></View></View>)}
  </Card>
  <Card style={{gap:12}}><Label>VANLIGA SITUATIONER VID CIGARETTER</Label>{cigaretteTriggers.length===0?<Text style={styles.muted}>Välj en situation när du registrerar en cigarett för att se mönster här.</Text>:cigaretteTriggers.slice(0,5).map(([name,n])=><View key={name} style={styles.sectionRow}><Text style={styles.cardTitle}>{name}</Text><Text style={styles.muted}>{n} st</Text></View>)}<Text style={styles.muted}>Statistiken bygger på dina egna registreringar de senaste 30 dagarna. Den visar mönster, inte medicinska slutsatser.</Text></Card>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17,gap:8},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},heading:{fontSize:19,fontWeight:'800',color:C.white},
 heroNumber:{fontSize:48,fontWeight:'900',color:C.white},statValue:{fontSize:26,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:13,lineHeight:19,color:C.dim},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 segment:{flexDirection:'row',gap:5,padding:5,backgroundColor:C.elevated,borderRadius:15},segmentItem:{flex:1,paddingVertical:11,borderRadius:11,alignItems:'center'},
 bars:{height:120,flexDirection:'row',alignItems:'flex-end',gap:8},progressTrack:{height:9,borderRadius:5,backgroundColor:C.soft,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:5},
});
