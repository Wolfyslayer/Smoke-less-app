import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {C} from '../theme';
import {target,quitDate,nextReductionMilestone,restartReductionPlan,rescheduleQuitPlan,parseFutureQuitDate,type Profile,type Speed} from '../domain';

type WeekDay={key:string;confirmed:boolean;within:boolean};
type Props={profile:Profile;goal:number;todayReduction:number;confirmedDays:number;withinDays:number;planWeek:WeekDay[];clock:number;onChangeProfile:(patch:Partial<Profile>)=>void};
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.label}>{children}</Text>}
function Heading({children}:{children:React.ReactNode}){return <Text style={styles.heading}>{children}</Text>}
export function PlanScreen({profile:p,goal,todayReduction,confirmedDays,withinDays,planWeek,clock,onChangeProfile}:Props){
 const percentage=p.baseline>0?Math.max(0,Math.min(100,Math.round(todayReduction/p.baseline*100))):0;
 const customGoal=p.dailyTargetOverride!==null;
 const [editingDate,setEditingDate]=useState(false);
 const [dateInput,setDateInput]=useState('');
 const [dateError,setDateError]=useState('');
 const [confirmRestart,setConfirmRestart]=useState(false);
 const [showAllGoals,setShowAllGoals]=useState(false);
 const saveDate=()=>{const parsed=parseFutureQuitDate(dateInput,new Date(clock));if(!parsed){setDateError('Ange ett giltigt framtida datum (ÅÅÅÅ-MM-DD).');return;}onChangeProfile(rescheduleQuitPlan(p,parsed,new Date(clock)));setEditingDate(false);setDateError('');};
 const restart=()=>{onChangeProfile(restartReductionPlan(p,new Date(clock)));setConfirmRestart(false);};
 const scheduled=!!p.plannedQuitAt && p.mode==='reduce';
 const end=quitDate(p);
 const daysRemaining=Math.max(0,Math.ceil((Date.UTC(end.getFullYear(),end.getMonth(),end.getDate())-Date.UTC(new Date(clock).getFullYear(),new Date(clock).getMonth(),new Date(clock).getDate()))/86400000));
 const nextWeek=new Date(clock);nextWeek.setDate(nextWeek.getDate()+7);
 const nextGoal=target(p,nextWeek);
 const remainingSteps=Array.from({length:14},(_,i)=>{const d=new Date(clock);d.setDate(d.getDate()+i);return {date:d,goal:target(p,d)};});
 const nextDecrease=nextReductionMilestone(p,new Date(clock));
 const milestones=remainingSteps.slice(0,showAllGoals?14:7);
 return <View style={styles.screen}>
  <Card style={{gap:14,padding:19,borderColor:'#425C29'}}>
   <Label>DAGENS MÅL</Label><Text style={styles.heroNumber}>{goal}<Text style={{fontSize:20,color:C.muted}}> cigaretter</Text></Text>
   <Text style={styles.muted}>Startnivå: {p.baseline} per dag</Text><View style={styles.divider}/>
   <Text style={styles.cardTitle}>{p.mode==='quit'?'Ditt rökstopp':scheduled?'Ditt valda stoppdatum':customGoal?'Rökstopp enligt grundplanen':'Beräknat rökstopp'}</Text><Text style={styles.statValue}>{date(quitDate(p))}</Text>
   {scheduled?<Pressable accessibilityRole="button" accessibilityLabel="Ändra planerat stoppdatum" accessibilityHint="Öppnar fältet för att välja ett nytt stoppdatum" onPress={()=>{setDateInput([end.getFullYear(),String(end.getMonth()+1).padStart(2,'0'),String(end.getDate()).padStart(2,'0')].join('-'));setDateError('');setEditingDate(true)}}><Text style={styles.label}>ÄNDRA STOPPDATUM</Text></Pressable>:null}
   {scheduled&&editingDate?<View style={{gap:9}}><TextInput style={styles.dateInput} value={dateInput} onChangeText={setDateInput} placeholder="ÅÅÅÅ-MM-DD" placeholderTextColor={C.muted} accessibilityLabel="Nytt stoppdatum, år månad dag" accessibilityHint="Ange datum med fyra siffror för år, två för månad och två för dag" keyboardType="numbers-and-punctuation"/><Pressable accessibilityRole="button" accessibilityLabel="Spara nytt stoppdatum" onPress={saveDate}><Text style={styles.label}>SPARA NYTT DATUM</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>setEditingDate(false)}><Text style={styles.muted}>Avbryt</Text></Pressable>{dateError?<Text accessibilityRole="alert" style={styles.error}>{dateError}</Text>:null}</View>:null}
   {scheduled?<Text style={styles.muted}>{daysRemaining===0?'Ditt planerade stoppdatum är här.':daysRemaining+' dagar kvar till ditt planerade stoppdatum.'} Om en dag blir svår finns din tidigare historik kvar.</Text>:null}
   {customGoal?<Text style={styles.muted}>Du har valt ett eget dagligt riktvärde. Datumet bygger på grundplanen och påverkas inte av ditt eget mål.</Text>:null}
  </Card>
  <Card style={{gap:10}}><Label>NÄSTA DELMÅL</Label><Text style={styles.cardTitle}>{p.mode==='quit'?'Ditt dagsmål är noll cigaretter':customGoal?'Ditt eget dagsmål är '+goal+' cigaretter':nextDecrease?'Nästa minskning '+date(nextDecrease.date)+': '+nextDecrease.goal+' cigaretter per dag':goal===0?'Du har nått målet noll cigaretter':'Inget kommande minskningssteg i grundplanen'}</Text><Text style={styles.muted}>Om sju dagar är riktvärdet {nextGoal} cigaretter per dag. {p.mode==='quit'?'Du kan fortsätta registrera dina framsteg i din egen takt.':customGoal?'Ditt eget riktvärde gäller tills du ändrar eller återställer det.':scheduled?'Planen är anpassad till ditt valda stoppdatum.':'Följ utvecklingen i din egen takt.'}</Text></Card>
  <Heading>{p.mode==='quit'?'Ditt rökstopp':'Din nedtrappning'}</Heading>
  <Card style={{gap:10}}>
   <View style={styles.grid}>
    <View style={{flex:1,minWidth:115}}><Label>{p.mode==='quit'?'MÅL JÄMFÖRT MED START':'MINSKNING AV DAGSMÅL'}</Label><Text style={styles.statValue}>{todayReduction} <Text style={{fontSize:13,color:C.muted}}>färre/dag</Text></Text></View>
    <View style={{flex:1,minWidth:115}}><Label>JÄMFÖRT MED START</Label><Text style={styles.statValue}>{percentage}%</Text></View>
   </View>
   <View style={styles.progressTrack} accessible accessibilityRole="progressbar" accessibilityLabel="Minskning av dagsmål jämfört med start" accessibilityValue={{min:0,max:100,now:percentage}}><View style={[styles.progressFill,{width:`${Math.min(100,percentage)}%` as `${number}%`}]}/></View>
   <Text style={styles.muted}>Visar skillnaden mellan dagens mål och startnivån, inte hur mycket du faktiskt rökt.{customGoal?' Ett eget riktvärde gäller tills det återställs.':''}</Text>
  </Card>
  <Card style={{gap:10}}>
   <Label>PLANEN KAN ANPASSAS</Label>
   <Text style={styles.cardTitle}>En svår dag ändrar inte dina framsteg</Text>
   <Text style={styles.muted}>Om du röker mer än planerat behöver du inte börja om. Din registrerade historik finns kvar, och du kan fortsätta från nästa stund.</Text>
   {p.mode==='quit'?<Text style={styles.muted}>Du har valt att sluta direkt. Ditt mål är noll cigaretter, men en svår stund raderar aldrig tidigare registreringar eller framsteg.</Text>:scheduled?<Text style={styles.muted}>Ditt valda stoppdatum styr nedtrappningen. Du kan ändra datumet ovan eller starta om planen för att välja en annan takt. Tidigare registreringar finns kvar.</Text>:<Text style={styles.muted}>Behöver du en lugnare takt? Välj Lugn nedan. När du byter takt fortsätter grundplanen från dagens planerade nivå, inte från din ursprungliga startnivå. Tidigare registreringar finns kvar.</Text>}
   <Text style={styles.muted}>Vill du ha ett eget dagsmål kan du ändra det i Inställningar. Det gäller tills du återställer det. Det är ett högsta riktvärde, inte något du måste röka upp till.</Text>
  </Card>
  {p.mode==='reduce'?<Card style={{gap:10}}><Label>BÖRJA OM MED PLANEN</Label><Text style={styles.cardTitle}>En ny start utan att radera din historik</Text><Text style={styles.muted}>Starta en ny nedtrappning från dagens planerade nivå. Tidigare registreringar och ditt ursprungliga startdatum behålls. Ett eventuellt stoppdatum och ett eget dagsmål tas bort.</Text>
   {!confirmRestart?<Pressable accessibilityRole="button" accessibilityLabel="Starta om nedtrappningsplanen" accessibilityHint="Visar en bekräftelse innan planen ändras" onPress={()=>setConfirmRestart(true)}><Text style={styles.label}>STARTA OM PLANEN</Text></Pressable>:<View style={{gap:12}}><Text style={styles.muted}>Vill du starta om nedtrappningen? Dina tidigare registreringar raderas inte.</Text><Pressable accessibilityRole="button" accessibilityLabel="Bekräfta omstart av planen" accessibilityHint="Behåller registreringar och ursprungligt startdatum" onPress={restart}><Text style={styles.label}>JA, STARTA OM</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>setConfirmRestart(false)}><Text style={styles.muted}>Avbryt</Text></Pressable></View>}
  </Card>:null}
  <Heading>Senaste sju dagarna</Heading>
  <Card style={{gap:10}}>
   <View style={styles.sectionRow}><Text style={[styles.cardTitle,styles.flexText]}>{withinDays} av {confirmedDays} bekräftade dagar inom målet</Text><Text style={[styles.muted,styles.flexText]}>{confirmedDays}/7 avstämda</Text></View>
   <View style={{flexDirection:'row',gap:5}}>{planWeek.map(d=><View key={d.key} accessible accessibilityRole="text" accessibilityLabel={d.key+': '+(d.confirmed?(d.within?'inom målet':'över målet'):'ej bekräftad')} style={{flex:1,height:12,borderRadius:5,backgroundColor:!d.confirmed?C.soft:d.within?C.lime:C.danger}}/>)}</View>
   <Text style={styles.muted}>Endast dagar du bekräftat räknas. En missad dag betyder inte att dina framsteg är förlorade.</Text>
   {confirmedDays>withinDays?<View style={styles.recoveryCard}><Text style={styles.cardTitle}>Fortsätt där du är</Text><Text style={styles.muted}>Du har {confirmedDays-withinDays} {confirmedDays-withinDays===1?'bekräftad dag':'bekräftade dagar'} över riktvärdet den senaste veckan. Det betyder inte att du behöver börja om. Registrera som vanligt, använd SOS vid röksug och justera planen om du behöver mer tid.</Text></View>:null}
  </Card>
  {p.mode==='reduce'&&!scheduled?<Heading>Välj din takt</Heading>:null}
  {scheduled?<Text style={styles.muted}>Ditt stoppdatum styr nedtrappningen. Vill du välja en annan takt kan du starta om planen ovan utan ett bestämt datum.</Text>:null}
  {p.mode==='reduce'&&!scheduled?([['gentle','Lugn','Minska ungefär en cigarett per vecka.'],['balanced','Balanserad','Minska ungefär en cigarett var fjärde dag.'],['fast','Snabb','Minska ungefär en cigarett varannan dag.']] as [Speed,string,string][]).map(([id,title,subtitle])=>
   <Pressable key={id} accessibilityRole="button" accessibilityState={{selected:p.speed===id}} onPress={()=>{if(p.speed!==id){const current=target({...p,dailyTargetOverride:null},new Date(clock));onChangeProfile({speed:id,startAt:new Date(clock).toISOString(),planStartTarget:current,originalStartAt:p.originalStartAt??p.startAt})}}} style={[styles.card,styles.choice,p.speed===id&&styles.selected]}>
    <Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text>
   </Pressable>):null}
  <Heading>Kommande mål</Heading>
  {customGoal?<Text style={styles.muted}>Du använder ett eget dagsmål. Det gäller tills du återställer det i Inställningar{scheduled?', men på stoppdatumet blir målet alltid noll.':'.'}</Text>:null}
  <Card><View style={styles.milestoneList}>{milestones.map(({date:d,goal:dayGoal},i)=><View key={i} accessible accessibilityRole="text" accessibilityLabel={date(d)+', högsta dagsmål '+dayGoal+' cigaretter'} style={[styles.milestoneRow,i===0&&styles.milestoneToday]}><Text style={[styles.muted,styles.flexText]}>{i===0?'Idag · ':''}{date(d)}</Text><Text style={styles.cardTitle}>{dayGoal} / dag</Text></View>)}</View><Pressable accessibilityRole="button" accessibilityState={{expanded:showAllGoals}} accessibilityLabel={showAllGoals?'Visa färre kommande mål':'Visa alla fjorton kommande mål'} onPress={()=>setShowAllGoals(v=>!v)} style={styles.moreGoalsButton}><Text style={styles.label}>{showAllGoals?'VISA FÄRRE DAGAR':'VISA ALLA 14 DAGAR'}</Text></Pressable></Card>
  <Text style={styles.muted}>Dagsmålet är ett högsta riktvärde. Du behöver aldrig röka för att nå det.</Text>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},flexText:{flexShrink:1,minWidth:0},milestoneList:{gap:8},moreGoalsButton:{minHeight:44,justifyContent:'center',alignItems:'center',marginTop:12},milestoneRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:8,padding:12,borderRadius:12,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},milestoneToday:{borderColor:C.lime,backgroundColor:C.limeSoft},card:{backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},heading:{fontSize:19,fontWeight:'800',color:C.white},
 heroNumber:{fontSize:48,fontWeight:'900',color:C.white},statValue:{fontSize:26,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:13,lineHeight:19,color:C.dim},divider:{height:1,backgroundColor:C.border},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:10},sectionRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:10},
 progressTrack:{height:9,borderRadius:5,backgroundColor:C.soft,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:5},
 dayCell:{width:'21%',flexGrow:1,alignItems:'center',padding:10,gap:5,borderRadius:12,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},
 choice:{gap:5},disabledChoice:{opacity:0.55},selected:{borderColor:C.lime,backgroundColor:C.limeSoft},
 recoveryCard:{gap:7,padding:14,borderRadius:14,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},
 dateInput:{borderWidth:1,borderColor:C.border,borderRadius:10,padding:12,color:C.white,fontSize:16},error:{color:C.danger,fontSize:13},
});
