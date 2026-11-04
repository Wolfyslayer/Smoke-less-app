import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {C} from '../theme';
import {calendarDaysInclusive,dayKey,savings,type Data} from '../domain';

type Props={data:Data;period:number;onPeriodChange:(days:number)=>void;clock:number;weekly:number[];todayCount:number;recentCravingsCount:number;cravingTriggers:[string,number][];cigaretteTriggers:[string,number][]};
const fmt=(n:number)=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);
const periodStart=(clock:number,days:number)=>{const d=new Date(clock);d.setHours(0,0,0,0);d.setDate(d.getDate()-(days-1));return d.getTime()};
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.label}>{children}</Text>}
function Heading({children}:{children:React.ReactNode}){return <Text style={styles.heading}>{children}</Text>}
function Stat({label,value}:{label:string;value:string}){return <Card style={{flex:1,minWidth:135,gap:8}}><Label>{label}</Label><Text style={styles.statValue}>{value}</Text></Card>}
function Bars({values,clock}:{values:number[];clock:number}){const max=Math.max(1,...values);return <View style={styles.bars}>{values.map((n,i)=>{const d=new Date(clock);d.setHours(12,0,0,0);d.setDate(d.getDate()-(values.length-1-i));const label=['S','M','T','O','T','F','L'][d.getDay()];return <View key={i} accessible accessibilityRole="text" accessibilityLabel={`${dayKey(d)}: ${n} registrerade cigaretter${n===0?". Ingen registrering, inte bekräftat rökfri.":""}`} style={{flex:1,alignItems:'center',justifyContent:'flex-end',gap:6}}><Text style={{color:C.white,fontSize:12,fontWeight:'700'}}>{n}</Text><View style={{height:70,width:'100%',justifyContent:'flex-end',alignItems:'center'}}><View style={{height:Math.max(3,n/max*66),width:'68%',borderRadius:7,backgroundColor:n?C.lime:C.soft}}/></View><Text style={{color:C.dim,fontSize:11}}>{label}</Text></View>})}</View>}
export function StatsScreen({data,period,onPeriodChange,clock,weekly,todayCount,recentCravingsCount,cravingTriggers,cigaretteTriggers}:Props){
 const strategyOutcomes=new Map<string,{yes:number;no:number}>();
 for(const craving of data.cravings){
  if(!craving.strategy||typeof craving.helpful!=='boolean'||new Date(craving.at).getTime()>clock)continue;
  const result=strategyOutcomes.get(craving.strategy)??{yes:0,no:0};
  if(craving.helpful)result.yes++;else result.no++;
  strategyOutcomes.set(craving.strategy,result);
 }
 const triggerOutcomes=new Map<string,{total:number;helped:number}>();
 for(const craving of data.cravings){
  const at=new Date(craving.at).getTime();
  if(!craving.trigger||!Number.isFinite(at)||at>clock||typeof craving.helpful!=='boolean')continue;
  const counts=triggerOutcomes.get(craving.trigger)??{total:0,helped:0};
  counts.total++;if(craving.helpful)counts.helped++;
  triggerOutcomes.set(craving.trigger,counts);
 }
 const triggerInsights=[...triggerOutcomes.entries()].sort((a,b)=>b[1].total-a[1].total||a[0].localeCompare(b[0])).slice(0,3);
 const effectiveStrategies=[...strategyOutcomes.entries()].filter(([,counts])=>counts.yes>0).sort((a,b)=>b[1].yes-a[1].yes||a[0].localeCompare(b[0])).slice(0,3);
 const todayKey=dayKey(new Date(clock));
 const startKey=period===0?null:dayKey(new Date(periodStart(clock,period)));
 const periodEntries=data.entries.filter(e=>new Date(e.at).getTime()<=clock&&(period===0||new Date(e.at).getTime()>=periodStart(clock,period)));
 const startDate=data.profile?new Date(data.profile.originalStartAt??data.profile.startAt):null;
 const firstDay=startDate?periodStart(startDate.getTime(),1):null;
 const todayStart=periodStart(clock,1);
 const effectiveStart=firstDay===null?null:period===0?firstDay:Math.max(firstDay,periodStart(clock,period));
 const observedDays=effectiveStart===null||effectiveStart>todayStart?0:calendarDaysInclusive(new Date(effectiveStart),new Date(todayStart));
 const entriesDuringPlan=effectiveStart===null||startDate===null?[]:periodEntries.filter(e=>new Date(e.at).getTime()>=Math.max(effectiveStart,startDate.getTime()));
 const averagePerDay=observedDays>0?entriesDuringPlan.length/observedDays:0;
 const baseline=data.profile?.baseline??0;
 const reductionPercent=baseline>0&&observedDays>0?Math.round((1-averagePerDay/baseline)*100):null;
 const confirmedKeys=new Set(data.checkins.filter(c=>c.complete&&c.smokeFree&&c.date<=todayKey).map(c=>c.date));
 let confirmedStreak=0;
 const cursor=new Date(clock);
 cursor.setHours(12,0,0,0);
 while(confirmedKeys.has(dayKey(cursor))){confirmedStreak++;cursor.setDate(cursor.getDate()-1)}
 const milestoneDays=[1,3,7,14,30];
 const milestones=milestoneDays.map(days=>({days,reached:confirmedStreak>=days}));
 const nextMilestone=milestoneDays.find(days=>days>confirmedStreak);
 const totalSavings=savings(data,new Date(clock));
 const previousSavings=period===0?0:savings(data,new Date(periodStart(clock,period)-1));
 const selectedSavings=Math.max(0,totalSavings-previousSavings);
 const confirmedSmokeFreeDays=new Set(data.checkins.filter(c=>c.complete&&c.smokeFree&&c.date<=todayKey&&(startKey===null||c.date>=startKey)).map(c=>c.date)).size;
 return <View style={styles.screen}>
  <Card style={{padding:19,borderColor:'#425C29'}}><Label>REGISTRERINGAR</Label><Text style={styles.heroNumber}>{periodEntries.length}</Text><Text style={styles.muted}>{period===0?'Alla registreringar':'Kalenderdagar inklusive idag'}</Text></Card>
  <View style={styles.segment}>{([['Idag',1],['7 dagar',7],['30 dagar',30],['Totalt',0]] as const).map(([label,v])=><Pressable accessibilityRole="button" accessibilityState={{selected:period===v}} accessibilityLabel={`Visa statistik för ${label.toLowerCase()}`} key={label} onPress={()=>onPeriodChange(v)} style={[styles.segmentItem,period===v&&{backgroundColor:C.lime}]}><Text style={{color:period===v?C.background:C.muted,fontWeight:'700',fontSize:12}}>{label}</Text></Pressable>)}</View>
  <Heading>Cigaretter per dag</Heading><Card><Text style={styles.muted}>Diagrammet visar alltid de senaste sju dagarna, oavsett vald statistikperiod.</Text><Bars values={weekly} clock={clock}/><Text style={styles.muted}>De senaste sju kalenderdagarna, med antal registrerade cigaretter ovanför varje stapel. En tom stapel innebär inte automatiskt en rökfri dag.</Text></Card>
  <Text style={styles.muted}>Rökfria dagar räknas bara när dagen har bekräftats och ligger inom vald period. Dagar utan registrering räknas inte automatiskt som rökfria.</Text>
  <View style={styles.grid}><Stat label="REGISTRERAT IDAG" value={String(todayCount)}/><Stat label="BEKRÄFTAT RÖKFRIA DAGAR" value={String(confirmedSmokeFreeDays)}/><Stat label="UPPSKATTAT SPARAT TOTALT" value={data.profile?fmt(totalSavings)+" kr":"–"}/><Stat label="UPPSKATTAT SPARAT UNDER PERIODEN" value={data.profile?fmt(selectedSavings)+" kr":"–"}/><Stat label="TOTALT REGISTRERAT" value={String(data.entries.length)}/><Stat label="REGISTRERAT SNITT PER DAG" value={observedDays>0?averagePerDay.toLocaleString("sv-SE",{maximumFractionDigits:1}):"–"}/><Stat label="MOT STARTNIVÅ" value={reductionPercent===null?"–":(reductionPercent>0?"+":"")+reductionPercent+" %"}/></View>
  <Text style={styles.muted}>{observedDays===0?"Ingen planhistorik ännu. Statistik visas när du har startat en plan.":`Genomsnittet bygger på ${entriesDuringPlan.length} registreringar under ${observedDays} kalenderdagar sedan planens ursprungliga start inom vald period. Tidigare registreringar bevaras men räknas inte in i planens genomsnitt. Dagar utan registrering ingår men bevisar inte rökfrihet. Positiv procentsats betyder färre registrerade cigaretter än din angivna startnivå.`}</Text>
  <Card style={{gap:10}}><Heading>Så räknas din besparing</Heading>{data.profile?<><Text style={styles.muted}>Din angivna startnivå: {data.profile.baseline} cigaretter per dag.</Text><Text style={styles.muted}>Ditt angivna paketpris: {fmt(data.profile.packPrice)} kr för {data.profile.packSize} cigaretter (cirka {(data.profile.packPrice/data.profile.packSize).toLocaleString("sv-SE",{maximumFractionDigits:2})} kr per cigarett).</Text><Text style={styles.muted}>Uppskattningen jämför startnivån med registrerade cigaretter sedan planens ursprungliga start. Den är inte ett kvitto på faktiska inköp eller pengar på kontot.</Text></>:<Text style={styles.muted}>Starta en plan och ange din tidigare förbrukning samt paketpris för att se en uppskattning.</Text>}<Text style={styles.muted}>Periodens besparing är skillnaden mellan den totala uppskattningen vid periodens början och nu. Den kan vara 0 kr även om du registrerat färre cigaretter vissa dagar.</Text></Card>
  <Heading>Dina milstolpar</Heading>
  <Card style={{gap:12}}><Text style={styles.muted}>Din nuvarande följd av bekräftat rökfria dagar: {confirmedStreak}. Endast dagar du själv har bekräftat räknas. Detta är personliga framsteg, inte medicinska bedömningar.</Text><Text style={styles.cardTitle}>{nextMilestone===undefined?'Alla listade milstolpar är uppnådda!':confirmedStreak===0?'Första milstolpen: en bekräftat rökfri dag.':`${nextMilestone-confirmedStreak} ${nextMilestone-confirmedStreak===1?'dag':'dagar'} kvar till nästa milstolpe på ${nextMilestone} dagar.`}</Text><Text style={styles.muted}>En avbruten följd tar inte bort tidigare framsteg. Du kan fortsätta i din egen takt.</Text>
   {milestones.map(m=><View key={m.days} style={styles.sectionRow}><Text style={styles.cardTitle}>{m.days} {m.days===1?'dag':'dagar'} i följd</Text><Text style={{color:m.reached?C.lime:C.dim,fontWeight:'700'}}>{m.reached?'Uppnått':'Inte ännu'}</Text></View>)}
   <Text style={styles.muted}>Att minska eller sluta röka kan ge hälsofördelar, men hur snabbt de märks varierar. Följ gärna dina framsteg utan att jämföra din kropp med en fast tidslinje.</Text>
  </Card>
  <Heading>Strategier som hjälpt dig</Heading>
  <Card style={{gap:12}}><Text style={styles.muted}>Bygger enbart på dina egna svar när du markerat att en strategi hjälpte. Det är ingen garanti för att den fungerar varje gång.</Text>
   {effectiveStrategies.length===0?<Text style={styles.muted}>När du provar en strategi under SOS kan du ange om den hjälpte. Dina egna favoriter visas här.</Text>:effectiveStrategies.map(([name,counts])=><View key={name} style={styles.sectionRow}><Text style={[styles.cardTitle,{flex:1}]}>{name}</Text><Text style={styles.muted}>{counts.yes} hjälpte{counts.no>0?` · ${counts.no} hjälpte inte`:''}</Text></View>)}
  </Card>
  <Heading>Vad hjälper vid olika röksug?</Heading>
  <Card style={{gap:12}}><Text style={styles.muted}>Visar situationer där du har svarat om SOS-strategin hjälpte. Antalet svar är inte samma sak som alla registrerade röksug.</Text>
   {triggerInsights.length===0?<Text style={styles.muted}>När du anger om en SOS-strategi hjälpte kan du se mönster för olika situationer här.</Text>:triggerInsights.map(([name,counts])=><View key={name} style={styles.sectionRow}><Text style={[styles.cardTitle,{flex:1}]}>{name}</Text><Text style={styles.muted}>{counts.helped} av {counts.total} hjälpte</Text></View>)}
  </Card>
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
