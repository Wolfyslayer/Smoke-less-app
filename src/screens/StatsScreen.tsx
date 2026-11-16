import {buildPersonalTrends} from '../domain/personalTrends';
import {PersonalTrends} from '../components/PersonalTrends';
import {Info} from 'lucide-react-native';
import React,{useMemo,useState} from 'react';
import {Pressable,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';
import {calendarDaysInclusive,dayKey,savings,type Data} from '../domain';

type Props={data:Data;period:number;onPeriodChange:(days:number)=>void;clock:number;weekly:number[];todayCount:number;recentCravingsCount:number;cravingTriggers:[string,number][];cigaretteTriggers:[string,number][]};
const fmt=(n:number)=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);
const periodStart=(clock:number,days:number)=>{const d=new Date(clock);d.setHours(0,0,0,0);d.setDate(d.getDate()-(days-1));return d.getTime()};
function Card({children,style}:{children:React.ReactNode;style?:any}){
 const styles=useThemeStyles(createStyles);
return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){
 const styles=useThemeStyles(createStyles);
return <Text style={styles.label}>{children}</Text>}
function Heading({children}:{children:React.ReactNode}){
 const styles=useThemeStyles(createStyles);
return <Text accessibilityRole="header" style={styles.heading}>{children}</Text>}
function Stat({label,value,compact=false}:{label:string;value:string;compact?:boolean}){
 const styles=useThemeStyles(createStyles);
 const {fontScale}=useWindowDimensions();
return <Card style={{flex:1,minWidth:fontScale>1.3?150:compact?88:135,gap:8}}><Label>{label}</Label><Text style={styles.statValue}>{value}</Text></Card>}
function Bars({values,clock}:{values:number[];clock:number}){
 const C=useThemeColors(); const styles=useThemeStyles(createStyles);
const max=Math.max(1,...values);return <View style={styles.bars}>{values.map((n,i)=>{const d=new Date(clock);d.setHours(12,0,0,0);d.setDate(d.getDate()-(values.length-1-i));const label=['S','M','T','O','T','F','L'][d.getDay()];return <View key={i} accessible accessibilityRole="text" accessibilityLabel={`${dayKey(d)}: ${n} registrerade cigaretter${n===0?". Ingen cigarett registrerad; eventuell rökfri bekräftelse visas separat.":""}`} style={{flex:1,alignItems:'center',justifyContent:'flex-end',gap:6}}><Text style={{color:C.white,fontSize:12,fontWeight:'700'}}>{n}</Text><View style={{height:70,width:'100%',justifyContent:'flex-end',alignItems:'center'}}><View style={{height:Math.max(3,n/max*66),width:'68%',borderRadius:7,backgroundColor:n?C.lime:C.soft}}/></View><Text style={{color:C.dim,fontSize:11}}>{label}</Text></View>})}</View>}
export function StatsScreen({data,period,onPeriodChange,clock,weekly,todayCount,recentCravingsCount,cravingTriggers,cigaretteTriggers}:Props){
 const [showTrends,setShowTrends]=useState(false);
 const [section,setSection]=useState<'overview'|'health'|'economy'|'history'>('overview');
 const [showChartInfo,setShowChartInfo]=useState(false);
 const C=useThemeColors(); const styles=useThemeStyles(createStyles);

 const minute=Math.floor(clock/60000);
 const trends=useMemo(()=>buildPersonalTrends(data,clock),[data,minute]);
 const strategyOutcomes=new Map<string,{yes:number;no:number}>();
 for(const craving of data.cravings){
  const at=new Date(craving.at).getTime();
  if(!Number.isFinite(at)||!craving.strategy||typeof craving.helpful!=='boolean'||at>clock)continue;
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
 const planStartKey=startDate&&Number.isFinite(startDate.getTime())?dayKey(startDate):null;
 const confirmedStreak=trends.currentStreak;
 const milestoneDays=[1,3,7,14,30];
 const milestones=milestoneDays.map(days=>({days,reached:confirmedStreak>=days}));
 const nextMilestone=milestoneDays.find(days=>days>confirmedStreak);
 const totalSavings=savings(data,new Date(clock));
 const previousSavings=period===0?0:savings(data,new Date(periodStart(clock,period)-1));
 const selectedSavings=Math.max(0,totalSavings-previousSavings);
 const confirmedSmokeFreeDays=trends.smokeFreeDays.filter(key=>planStartKey!==null&&key>=planStartKey&&(startKey===null||key>=startKey)).length;

 return <View style={styles.screen}>
  <View accessibilityRole="tablist" style={styles.segment}>{([['overview','Översikt'],['health','Hälsa'],['economy','Ekonomi'],['history','Historik']] as const).map(([id,label])=><Pressable key={id} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{selected:section===id}} onPress={()=>setSection(id)} style={[styles.segmentItem,section===id&&{backgroundColor:C.accent}]}><Text style={{fontSize:12,fontWeight:'700',color:section===id?C.onAccent:C.textMuted}}>{label}</Text></Pressable>)}</View>
  <View style={styles.segment}>{([['Idag',1],['7 dagar',7],['30 dagar',30],['Totalt',0]] as const).map(([label,v])=><Pressable accessibilityRole="button" accessibilityState={{selected:period===v}} accessibilityLabel={`Visa statistik för ${label.toLowerCase()}`} key={label} onPress={()=>onPeriodChange(v)} style={[styles.segmentItem,period===v&&{backgroundColor:C.lime}]}><Text style={{color:period===v?C.onAccent:C.muted,fontWeight:'700',fontSize:12}}>{label}</Text></Pressable>)}</View>

  {section==='overview'?<>
  <Heading>Cigaretter per dag</Heading><Card><View style={styles.sectionRow}><Text style={styles.muted}>Senaste sju dagarna</Text><Pressable accessibilityRole="button" accessibilityLabel="Om diagrammet" accessibilityState={{expanded:showChartInfo}} onPress={()=>setShowChartInfo(value=>!value)} style={{minWidth:48,minHeight:48,alignItems:'center',justifyContent:'center'}}><Info size={20} color={C.accent}/></Pressable></View><Bars values={weekly} clock={clock}/>{showChartInfo?<Text style={styles.muted}>Diagrammet visar alltid de senaste sju dagarna, oavsett vald statistikperiod. Antalet registrerade cigaretter står ovanför varje stapel. En tom stapel innebär inte automatiskt en rökfri dag.</Text>:null}</Card>

  <View style={styles.grid}><Stat compact label="Rökfria dagar" value={String(confirmedSmokeFreeDays)}/><Stat compact label="Uppskattat sparat" value={data.profile?fmt(totalSavings)+' kr':'–'}/><Stat compact label="Idag" value={String(todayCount)}/></View>
  <Text style={styles.muted}>Rökfria dagar bygger på dina bekräftade avstämningar. Noll registreringar räknas inte automatiskt som en rökfri dag.</Text>
  <Pressable accessibilityRole="button" onPress={()=>setSection('health')} style={styles.trendsToggle}><Text style={styles.cardTitle}>Din utveckling och dina milstolpar</Text><Text style={{color:C.accent}}>›</Text></Pressable>
  </>:null}
  {section==='economy'?<><View style={styles.grid}><Stat label="UPPSKATTAT SPARAT TOTALT" value={data.profile?fmt(totalSavings)+' kr':'–'}/><Stat label="UNDER VALD PERIOD" value={data.profile?fmt(selectedSavings)+' kr':'–'}/></View>  <Card style={{gap:10}}><Heading>Så räknas din besparing</Heading>{data.profile?<><Text style={styles.muted}>Din angivna startnivå: {data.profile.baseline} cigaretter per dag.</Text><Text style={styles.muted}>Ditt angivna paketpris: {fmt(data.profile.packPrice)} kr för {data.profile.packSize} cigaretter (cirka {(data.profile.packPrice/data.profile.packSize).toLocaleString("sv-SE",{maximumFractionDigits:2})} kr per cigarett).</Text><Text style={styles.muted}>Uppskattningen jämför startnivån med registrerade cigaretter sedan planens ursprungliga start. Den är inte ett kvitto på faktiska inköp eller pengar på kontot.</Text></>:<Text style={styles.muted}>Starta en plan och ange din tidigare förbrukning samt paketpris för att se en uppskattning.</Text>}<Text style={styles.muted}>Periodens besparing är skillnaden mellan den totala uppskattningen vid periodens början och nu. Den kan vara 0 kr även om du registrerat färre cigaretter vissa dagar.</Text></Card>
</>:null}
  {section==='health'?<>  <Heading>Dina milstolpar</Heading>
  <Text style={styles.muted}>Följden gäller till och med {trends.streakEnd}. En ännu inte avstämd dag räknas inte som rökfri.</Text>
  <Card style={{gap:12}}><Text style={styles.muted}>Din nuvarande följd av bekräftat rökfria dagar: {confirmedStreak}. Endast dagar du själv har bekräftat räknas. Detta är personliga framsteg, inte medicinska bedömningar.</Text><Text style={styles.cardTitle}>{nextMilestone===undefined?'Alla listade milstolpar är uppnådda!':confirmedStreak===0?'Första milstolpen: en bekräftat rökfri dag.':`${nextMilestone-confirmedStreak} ${nextMilestone-confirmedStreak===1?'dag':'dagar'} kvar till nästa milstolpe på ${nextMilestone} dagar.`}</Text><Text style={styles.muted}>En avbruten följd tar inte bort tidigare framsteg. Du kan fortsätta i din egen takt.</Text>
   {milestones.map(m=><View key={m.days} accessible accessibilityRole="text" accessibilityLabel={`${m.days} ${m.days===1?"dag":"dagar"} i följd: ${m.reached?"uppnått":"inte ännu"}`} style={styles.sectionRow}><Text style={styles.cardTitle}>{m.days} {m.days===1?'dag':'dagar'} i följd</Text><Text style={{color:m.reached?C.lime:C.dim,fontWeight:'700'}}>{m.reached?'Uppnått':'Inte ännu'}</Text></View>)}
   <Text style={styles.muted}>Att minska antalet cigaretter kan vara ett steg mot att sluta helt. Att sluta röka minskar hälsorisker över tid, men återhämtning och upplevda förändringar varierar mellan personer. Milstolparna ovan bygger på dina egna avstämningar och säger inte hur din kropp mår.</Text>
  </Card>
  <Heading>Din hälsa, i din takt</Heading>
  <Card style={{gap:10}}><Text style={styles.cardTitle}>Varje försök att sluta är värdefullt</Text><Text style={styles.muted}>Att sluta röka är ett av de viktigaste stegen för att minska riskerna med tobaksrökning. Förändringar i kroppen kan komma gradvis och ser olika ut för olika personer.</Text><Text style={styles.muted}>Appen mäter inte lungfunktion, blodtryck eller andra medicinska värden. Registreringar och rökfria dagar är dina egna uppgifter, inte en medicinsk hälsobedömning.</Text><Text style={styles.muted}>Om det känns svårt kan du använda SOS-stödet och fortsätta med din plan utan att börja om med din historik.</Text></Card>
</>:null}
  {section==='history'?<>  <Card style={{padding:19,borderColor:C.border}}><Label>REGISTRERINGAR</Label><Text style={styles.heroNumber}>{periodEntries.length}</Text><Text style={styles.muted}>{period===0?'Alla registreringar':'Kalenderdagar inklusive idag'}</Text></Card>
  <Text style={styles.muted}>Rökfria dagar räknas bara när dagen har bekräftats och ligger inom vald period. Dagar utan registrering räknas inte automatiskt som rökfria.</Text>
  <View style={styles.grid}><Stat label="REGISTRERAT IDAG" value={String(todayCount)}/><Stat label="BEKRÄFTAT RÖKFRIA DAGAR" value={String(confirmedSmokeFreeDays)}/><Stat label="UPPSKATTAT SPARAT TOTALT" value={data.profile?fmt(totalSavings)+" kr":"–"}/><Stat label="UPPSKATTAT SPARAT UNDER PERIODEN" value={data.profile?fmt(selectedSavings)+" kr":"–"}/><Stat label="TOTALT REGISTRERAT" value={String(data.entries.filter(e=>Number.isFinite(Date.parse(e.at))&&Date.parse(e.at)<=clock).length)}/><Stat label="REGISTRERAT SNITT PER DAG" value={observedDays>0?averagePerDay.toLocaleString("sv-SE",{maximumFractionDigits:1}):"–"}/><Stat label="MOT STARTNIVÅ" value={reductionPercent===null?"–":(reductionPercent>0?"+":"")+reductionPercent+" %"}/></View>
  <Text style={styles.muted}>{observedDays===0?"Ingen planhistorik ännu. Statistik visas när du har startat en plan.":`Genomsnittet bygger på ${entriesDuringPlan.length} registreringar under ${observedDays} kalenderdagar sedan planens ursprungliga start inom vald period. Tidigare registreringar bevaras men räknas inte in i planens genomsnitt. Dagar utan registrering ingår men bevisar inte rökfrihet. Positiv procentsats betyder färre registrerade cigaretter än din angivna startnivå.`}</Text>
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
  <Pressable accessibilityRole="button" accessibilityState={{expanded:showTrends}} onPress={()=>setShowTrends(value=>!value)} style={styles.trendsToggle}><View style={{gap:4,flex:1}}><Text style={styles.cardTitle}>Fördjupade trender</Text><Text style={styles.muted}>Veckor, mönster och personliga rekord</Text></View><Text style={{color:C.accent,fontSize:22}}>{showTrends?'−':'+'}</Text></Pressable>
  {showTrends?<PersonalTrends trends={trends}/>:null}</>:null}
 </View>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 screen:{gap:16},trendsToggle:{flexDirection:'row',alignItems:'center',gap:16,minHeight:72,paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.border},card:{backgroundColor:C.surface,borderRadius:16,borderWidth:1,borderColor:C.border,padding:16,gap:14},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},heading:{fontSize:19,fontWeight:'800',color:C.white},
 heroNumber:{fontSize:40,fontWeight:'900',color:C.white},statValue:{fontSize:26,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:15,lineHeight:23,color:C.dim},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},sectionRow:{flexWrap:'wrap',flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 segment:{flexDirection:'row',flexWrap:'wrap',gap:5,padding:5,backgroundColor:C.elevated,borderRadius:15},segmentItem:{flex:1,minWidth:64,minHeight:48,justifyContent:'center',paddingVertical:11,borderRadius:11,alignItems:'center'},
 bars:{minHeight:120,flexDirection:'row',alignItems:'flex-end',gap:8},progressTrack:{height:9,borderRadius:5,backgroundColor:C.soft,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:5},
});
