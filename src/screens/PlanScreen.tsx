import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {C} from '../theme';
import {target,quitDate,nextReductionMilestone,restartReductionPlan,rescheduleQuitPlan,parseFutureQuitDate,weeklyPlanProgress,type Profile,type Speed} from '../domain';

type WeekDay={key:string;confirmed:boolean;within:boolean};
type Props={profile:Profile;goal:number;todayReduction:number;confirmedDays:number;withinDays:number;planWeek:WeekDay[];clock:number;onChangeProfile:(patch:Partial<Profile>)=>void};
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.label}>{children}</Text>}
function Heading({children}:{children:React.ReactNode}){return <Text accessibilityRole="header" style={styles.heading}>{children}</Text>}
export function PlanScreen({profile:p,goal,todayReduction,confirmedDays,withinDays,planWeek,clock,onChangeProfile}:Props){
 const percentage=p.baseline>0?Math.max(0,Math.min(100,Math.round(todayReduction/p.baseline*100))):0;
 const customGoal=p.dailyTargetOverride!==null;
 const [editingDate,setEditingDate]=useState(false);
 const [dateInput,setDateInput]=useState('');
 const [dateError,setDateError]=useState('');
 const [confirmRestart,setConfirmRestart]=useState(false);
 const [showAllGoals,setShowAllGoals]=useState(false);
 const [pendingSpeed,setPendingSpeed]=useState<Speed|null>(null);
 const [showPaceDetails,setShowPaceDetails]=useState(false);
 const saveDate=()=>{const parsed=parseFutureQuitDate(dateInput,new Date(clock));if(!parsed){setDateError('Ange ett giltigt framtida datum (ÅÅÅÅ-MM-DD).');return;}onChangeProfile(rescheduleQuitPlan(p,parsed,new Date(clock)));setEditingDate(false);setDateError('');};
 const restart=()=>{onChangeProfile(restartReductionPlan(p,new Date(clock)));setConfirmRestart(false);};
 const restartPreview=confirmRestart?restartReductionPlan(p,new Date(clock)):null;
 const restartNextWeek=new Date(clock);restartNextWeek.setDate(restartNextWeek.getDate()+7);
 const restartTodayGoal=restartPreview?target(restartPreview,new Date(clock)):null;
 const restartNextWeekGoal=restartPreview?target(restartPreview,restartNextWeek):null;
 const previewDate=editingDate?parseFutureQuitDate(dateInput,new Date(clock)):null;
 const previewProfile=previewDate?rescheduleQuitPlan(p,previewDate,new Date(clock)):null;
 const previewNextWeek=new Date(clock);previewNextWeek.setDate(previewNextWeek.getDate()+7);
 const previewNextWeekGoal=previewProfile?target(previewProfile,previewNextWeek):null;
 const previewTodayGoal=previewProfile?target(previewProfile,new Date(clock)):null;
 const previewStopGoal=previewProfile&&previewDate?target(previewProfile,previewDate):null;
 const previewWeek=previewProfile?Array.from({length:7},(_,i)=>{const d=new Date(clock);d.setDate(d.getDate()+i);return {date:d,goal:target(previewProfile,d)};}):[];
 const speedPreview=pendingSpeed?{...p,dailyTargetOverride:null,speed:pendingSpeed,startAt:new Date(clock).toISOString(),planStartTarget:target(p,new Date(clock)),originalStartAt:p.originalStartAt??p.startAt}:null;
 const speedPreviewGoal=speedPreview?target(speedPreview,previewNextWeek):null;
 const applySpeed=()=>{if(!speedPreview||pendingSpeed===p.speed){setPendingSpeed(null);return;}onChangeProfile({speed:pendingSpeed!,dailyTargetOverride:null,startAt:speedPreview.startAt,planStartTarget:speedPreview.planStartTarget,originalStartAt:speedPreview.originalStartAt});setPendingSpeed(null);setShowPaceDetails(false);};

 const scheduled=!!p.plannedQuitAt && p.mode==='reduce';
 const end=quitDate(p);
 const daysUntilStop=Math.round((Date.UTC(end.getFullYear(),end.getMonth(),end.getDate())-Date.UTC(new Date(clock).getFullYear(),new Date(clock).getMonth(),new Date(clock).getDate()))/86400000);
 const daysRemaining=Math.max(0,daysUntilStop);
 const {nextGoal,reduction:weeklyReduction}=weeklyPlanProgress(p,new Date(clock));
 const weeklySummary=p.mode==='quit'
  ?'Ditt mål är noll cigaretter varje dag. Du behöver inte ändra något för att fortsätta.'
  :scheduled&&daysUntilStop<=0
   ?'Stoppdatumet är här eller har passerat. Ditt planerade dagsmål är noll cigaretter. Du kan ändra datumet utan att förlora tidigare registreringar.'
  :customGoal
   ?scheduled
    ?'Ditt eget dagsmål gäller fram till stoppdatumet. På stoppdatumet är målet alltid noll.'
    :'Ditt eget dagsmål ligger kvar tills du ändrar eller återställer det i Inställningar.'
   :weeklyReduction>0
    ?'Under kommande sju dagar minskar ditt planerade dagsmål med '+weeklyReduction+' '+(weeklyReduction===1?'cigarett':'cigaretter')+'.'
    :goal===0
     ?'Ditt planerade dagsmål är redan noll cigaretter.'
     :'Dagsmålet är oförändrat den närmaste veckan. Nästa minskning visas ovan.';
 const remainingSteps=Array.from({length:14},(_,i)=>{const d=new Date(clock);d.setDate(d.getDate()+i);return {date:d,goal:target(p,d)};});
 const nextDecrease=nextReductionMilestone(p,new Date(clock));
 const milestones=remainingSteps.slice(0,showAllGoals?14:3);
 const nextDecreaseDays=nextDecrease?Math.round((Date.UTC(nextDecrease.date.getFullYear(),nextDecrease.date.getMonth(),nextDecrease.date.getDate())-Date.UTC(new Date(clock).getFullYear(),new Date(clock).getMonth(),new Date(clock).getDate()))/86400000):null;
 const milestoneCountdown=scheduled&&daysUntilStop>0&&(customGoal||nextDecreaseDays===null)
  ?daysUntilStop===1?'Imorgon är ditt planerade stoppdatum.':'Det är '+daysUntilStop+' dagar kvar till ditt planerade stoppdatum.'
  :!customGoal&&nextDecreaseDays!==null&&nextDecreaseDays>0
   ?nextDecreaseDays===1?'Nästa minskning sker imorgon.':'Nästa minskning sker om '+nextDecreaseDays+' dagar.'
   :null;
 const nextMilestoneTitle=p.mode==='quit'
  ?'Ditt dagsmål är noll cigaretter'
  :scheduled&&daysUntilStop<=0
   ?daysUntilStop===0?'Ditt planerade rökstopp är idag':'Ditt planerade stoppdatum har passerat'
   :scheduled&&(customGoal||!nextDecrease)
    ?'Nästa delmål: rökstopp '+date(end)
    :customGoal
     ?'Ditt eget dagsmål är '+goal+' cigaretter'
     :nextDecrease
      ?'Nästa minskning '+date(nextDecrease.date)+': '+nextDecrease.goal+' cigaretter per dag'
      :goal===0
       ?'Du har nått målet noll cigaretter'
       :'Inget kommande minskningssteg i grundplanen';
 return <View style={styles.screen}>
  <Card style={{gap:14,padding:19,borderColor:'#425C29'}}>
   <Label>DAGENS MÅL</Label><Text style={styles.heroNumber}>{goal}<Text style={{fontSize:20,color:C.muted}}> cigaretter</Text></Text>
   <Text style={styles.muted}>Startnivå: {p.baseline} per dag</Text><View style={styles.divider}/>
   <Text style={styles.cardTitle}>{p.mode==='quit'?'Ditt rökstopp':scheduled?'Ditt valda stoppdatum':customGoal?'Rökstopp enligt grundplanen':'Beräknat rökstopp'}</Text><Text style={styles.statValue}>{date(quitDate(p))}</Text>
   {p.mode==='reduce'?<Pressable accessibilityRole="button" accessibilityLabel={scheduled?'Ändra planerat stoppdatum':'Välj eget stoppdatum'} accessibilityHint="Öppnar fältet för att välja ett nytt stoppdatum" style={styles.actionButton} onPress={()=>{setDateInput(scheduled?[end.getFullYear(),String(end.getMonth()+1).padStart(2,'0'),String(end.getDate()).padStart(2,'0')].join('-'):'');setDateError('');setEditingDate(true)}}><Text style={styles.label}>{scheduled?'ÄNDRA STOPPDATUM':'VÄLJ EGET STOPPDATUM'}</Text></Pressable>:null}
   {p.mode==='reduce'&&editingDate?<View style={{gap:9}}><TextInput style={styles.dateInput} value={dateInput} onChangeText={value=>{setDateInput(value);if(dateError)setDateError("");}} placeholder="ÅÅÅÅ-MM-DD" placeholderTextColor={C.muted} accessibilityLabel="Nytt stoppdatum, år månad dag" accessibilityHint="Ange datum med fyra siffror för år, två för månad och två för dag" keyboardType="numbers-and-punctuation"/>{previewDate&&previewProfile?<View style={styles.previewCard}><Text accessibilityRole="header" style={styles.cardTitle}>Så påverkas din plan</Text><Text style={styles.muted}>Nytt stoppdatum: {date(previewDate)}. Dagens planerade mål förblir {previewTodayGoal} cigaretter. Om sju dagar blir ditt dagsmål {previewNextWeekGoal} cigaretter och på stoppdatumet {previewStopGoal}. Dina tidigare registreringar finns kvar.</Text><View style={styles.milestoneList}>{previewWeek.map(({date:d,goal:dayGoal},i)=><View key={i} accessible accessibilityRole="text" accessibilityLabel={date(d)+', föreslaget dagsmål '+dayGoal+' cigaretter'} style={styles.milestoneRow}><Text style={[styles.muted,styles.flexText]}>{i===0?'Idag · ':''}{date(d)}</Text><Text style={styles.cardTitle}>{dayGoal} / dag</Text></View>)}</View></View>:null}{!previewDate?<Text style={styles.muted}>Välj ett giltigt framtida datum för att se hur planen ändras och kunna spara.</Text>:null}<Pressable accessibilityRole="button" accessibilityLabel="Spara nytt stoppdatum" accessibilityHint="Sparar det valda datumet och behåller tidigare registreringar" accessibilityState={{disabled:!previewDate}} disabled={!previewDate} style={[styles.actionButton,!previewDate&&{opacity:0.5}]} onPress={saveDate}><Text style={styles.label}>SPARA NYTT DATUM</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Avbryt ändring av stoppdatum" style={styles.actionButton} onPress={()=>{setEditingDate(false);setDateError("");}}><Text style={styles.muted}>Avbryt</Text></Pressable>{dateError?<Text accessibilityRole="alert" style={styles.error}>{dateError}</Text>:null}</View>:null}
   {scheduled?<Text style={styles.muted}>{daysUntilStop<0?'Ditt planerade stoppdatum har passerat. Du kan fortsätta med målet noll eller välja ett nytt framtida datum.':daysUntilStop===0?'Ditt planerade stoppdatum är här.':daysRemaining+' dagar kvar till ditt planerade stoppdatum.'} Om en dag blir svår finns din tidigare historik kvar.</Text>:null}
   {customGoal?<Text style={styles.muted}>{scheduled?daysUntilStop<=0?'Ditt tidigare egna dagsmål gäller inte efter stoppdatumet. Dagens mål är noll.':'Ditt egna dagsmål gäller fram till stoppdatumet, då målet blir noll.':'Du har valt ett eget dagligt riktvärde. Datumet bygger på grundplanen och påverkas inte av ditt eget mål.'}</Text>:null}
  </Card>
  <Card style={{gap:10}}><Label>NÄSTA DELMÅL</Label><Text style={styles.cardTitle}>{nextMilestoneTitle}</Text>{milestoneCountdown?<Text style={styles.muted}>{milestoneCountdown}</Text>:null}<Text style={styles.muted}>Om sju dagar är ditt planerade dagsmål {nextGoal} cigaretter per dag. {weeklySummary}</Text></Card>
  <Heading>{p.mode==='quit'?'Ditt rökstopp':'Din nedtrappning'}</Heading>
  <Card style={{gap:10}}>
   <View style={styles.grid}>
    <View style={{flex:1,minWidth:115}}><Label>{p.mode==='quit'?'MÅL JÄMFÖRT MED START':'MINSKNING AV DAGSMÅL'}</Label><Text style={styles.statValue}>{todayReduction} <Text style={{fontSize:13,color:C.muted}}>färre/dag</Text></Text></View>
    <View style={{flex:1,minWidth:115}}><Label>JÄMFÖRT MED START</Label><Text style={styles.statValue}>{percentage}%</Text></View>
   </View>
   <View style={styles.progressTrack} accessible accessibilityRole="progressbar" accessibilityLabel="Minskning av dagsmål jämfört med start, inte faktisk konsumtion" accessibilityValue={{min:0,max:100,now:percentage}}><View style={[styles.progressFill,{width:`${Math.min(100,percentage)}%` as `${number}%`}]}/></View>
   <Text style={styles.muted}>Visar skillnaden mellan dagens mål och startnivån, inte hur mycket du faktiskt rökt.{customGoal?(scheduled?' Ditt egna riktvärde gäller bara fram till stoppdatumet.':' Ett eget riktvärde gäller tills det återställs.'):''}</Text>
  </Card>
  <Card style={{gap:10}}>
   <Label>PLANEN KAN ANPASSAS</Label>
   <Text style={styles.cardTitle}>En svår dag ändrar inte dina framsteg</Text>
   <Text style={styles.muted}>Om du röker mer än planerat behöver du inte börja om. Din registrerade historik finns kvar, och du kan fortsätta från nästa stund.</Text>
   {p.mode==='quit'?<Text style={styles.muted}>Du har valt att sluta direkt. Ditt mål är noll cigaretter, men en svår stund raderar aldrig tidigare registreringar eller framsteg.</Text>:scheduled?<Text style={styles.muted}>Ditt valda stoppdatum styr nedtrappningen. Du kan ändra datumet ovan eller starta om planen för att välja en annan takt. Tidigare registreringar finns kvar.</Text>:<Text style={styles.muted}>Behöver du en lugnare takt? Välj Lugn nedan. När du byter takt fortsätter grundplanen från dagens planerade nivå, inte från din ursprungliga startnivå. Tidigare registreringar finns kvar.</Text>}
   <Text style={styles.muted}>Vill du ha ett eget dagsmål kan du ändra det i Inställningar. Det gäller tills du återställer det. Det är ett högsta riktvärde, inte något du måste röka upp till.</Text>
  </Card>
  {p.mode==='reduce'?<Card style={{gap:10}}><Label>BÖRJA OM MED PLANEN</Label><Text style={styles.cardTitle}>En ny start utan att radera din historik</Text><Text style={styles.muted}>Starta en ny nedtrappning från dagens planerade nivå. Tidigare registreringar och ditt ursprungliga startdatum behålls. Ett eventuellt stoppdatum och ett eget dagsmål tas bort.</Text>
   {!confirmRestart?<Pressable accessibilityRole="button" accessibilityLabel="Starta om nedtrappningsplanen" accessibilityHint="Visar en bekräftelse innan planen ändras" style={styles.actionButton} onPress={()=>setConfirmRestart(true)}><Text style={styles.label}>STARTA OM PLANEN</Text></Pressable>:<View style={{gap:12}}><Text style={styles.muted}>Vill du starta om nedtrappningen? Dagens grundmål blir {restartTodayGoal} cigaretter och om sju dagar {restartNextWeekGoal}. Ett tidigare stoppdatum och eget dagsmål tas bort. Dina tidigare registreringar raderas inte.</Text><Pressable accessibilityRole="button" accessibilityLabel="Bekräfta omstart av planen" accessibilityHint="Behåller registreringar och ursprungligt startdatum" style={styles.actionButton} onPress={restart}><Text style={styles.label}>JA, STARTA OM</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Avbryt omstart av planen" style={styles.actionButton} onPress={()=>setConfirmRestart(false)}><Text style={styles.muted}>Avbryt</Text></Pressable></View>}
  </Card>:null}
  <Heading>Senaste sju dagarna</Heading>
  <Card style={{gap:10}}>
   <View style={styles.sectionRow}><Text style={[styles.cardTitle,styles.flexText]}>{withinDays} av {confirmedDays} bekräftade dagar inom målet</Text><Text style={[styles.muted,styles.flexText]}>{confirmedDays}/7 avstämda</Text></View>
   <View style={{flexDirection:'row',gap:5}}>{planWeek.map(d=><View key={d.key} accessible accessibilityRole="text" accessibilityLabel={d.key+': '+(d.confirmed?(d.within?'inom målet':'över målet'):'ej bekräftad')} style={{flex:1,height:12,borderRadius:5,backgroundColor:!d.confirmed?C.soft:d.within?C.lime:C.danger}}/>)}</View>
   <Text style={styles.muted}>Endast dagar du bekräftat räknas. En missad dag betyder inte att dina framsteg är förlorade.</Text>
   {confirmedDays>withinDays?<View style={styles.recoveryCard} accessible accessibilityRole="text" accessibilityLabel={'Stöd efter en svår vecka. '+(confirmedDays-withinDays)+' bekräftade dagar över målet. Dina tidigare framsteg finns kvar.'}><Text style={styles.cardTitle}>Fortsätt där du är</Text><Text style={styles.muted}>Du har {confirmedDays-withinDays} {confirmedDays-withinDays===1?'bekräftad dag':'bekräftade dagar'} över riktvärdet den senaste veckan. Det betyder inte att du behöver börja om. Dina registreringar och framsteg finns kvar.</Text><Text style={styles.muted}>{p.mode==='quit'?'Fortsätt med ditt mål att vara rökfri. Använd SOS när röksuget kommer och registrera även svåra stunder.':scheduled?'Fortsätt med din plan. Om du behöver mer tid kan du ändra stoppdatumet ovan utan att förlora historiken.':'Fortsätt registrera som vanligt. Du kan välja en lugnare takt nedan eller starta om nedtrappningen utan att förlora historiken.'}</Text></View>:null}
  </Card>
  {p.mode==='reduce'&&!scheduled?<Heading>Välj din takt</Heading>:null}
  {scheduled?<Text style={styles.muted}>Ditt stoppdatum styr nedtrappningen. Vill du välja en annan takt kan du starta om planen ovan utan ett bestämt datum.</Text>:null}
  {p.mode==='reduce'&&!scheduled?([['gentle','Lugn','Minska ungefär en cigarett per vecka.'],['balanced','Balanserad','Minska ungefär en cigarett var fjärde dag.'],['fast','Snabb','Minska ungefär en cigarett varannan dag.']] as [Speed,string,string][]).map(([id,title,subtitle])=>
   <Pressable key={id} accessibilityRole="button" accessibilityLabel={title+' nedtrappningstakt'} accessibilityHint={subtitle+' Tryck för att förhandsvisa och bekräfta ändringen.'} accessibilityState={{selected:p.speed===id}} onPress={()=>{setShowPaceDetails(false);if(p.speed!==id)setPendingSpeed(id);else setPendingSpeed(null)}} style={[styles.card,styles.choice,p.speed===id&&styles.selected]}>
    <Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text>
   </Pressable>):null}
  {pendingSpeed&&speedPreview?<Card style={{gap:10}}><Label>BEKRÄFTA NY TAKT</Label><Text style={styles.cardTitle}>Ändra nedtrappningen?</Text><Text style={styles.muted}>Dagens planerade mål förblir {speedPreview.planStartTarget} cigaretter. Med den nya takten blir målet om sju dagar {speedPreviewGoal} cigaretter per dag. Tidigare registreringar och ditt ursprungliga startdatum behålls.{customGoal?' Ditt egna dagsmål tas bort när du bekräftar, så att den nya takten kan börja gälla.':''}</Text><Pressable accessibilityRole="button" accessibilityLabel="Visa mål för de kommande sju dagarna" accessibilityState={{expanded:showPaceDetails}} style={styles.actionButton} onPress={()=>setShowPaceDetails(v=>!v)}><Text style={styles.label}>{showPaceDetails?'DÖLJ FÖRHANDSVISNING':'VISA VECKANS MÅL'}</Text></Pressable>{showPaceDetails?<View style={styles.milestoneList}>{Array.from({length:7},(_,i)=>{const d=new Date(clock);d.setDate(d.getDate()+i);return <View key={i} accessible accessibilityRole="text" accessibilityLabel={date(d)+', föreslaget dagsmål '+target(speedPreview,d)+' cigaretter'} style={styles.milestoneRow}><Text style={[styles.muted,styles.flexText]}>{i===0?'Idag · ':''}{date(d)}</Text><Text style={styles.cardTitle}>{target(speedPreview,d)} / dag</Text></View>})}</View>:null}<Pressable accessibilityRole="button" accessibilityLabel="Bekräfta ny nedtrappningstakt" style={styles.actionButton} onPress={applySpeed}><Text style={styles.label}>JA, ÄNDRA TAKT</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Avbryt ändring av nedtrappningstakt" style={styles.actionButton} onPress={()=>{setPendingSpeed(null);setShowPaceDetails(false);}}><Text style={styles.muted}>Avbryt</Text></Pressable></Card>:null}
  <Heading>Kommande mål</Heading><Text style={styles.muted}>De tre närmaste dagarna visas först. Visa alla 14 dagar om du vill planera längre fram.</Text>
  {customGoal?<Text style={styles.muted}>{scheduled&&daysUntilStop<=0?'Ditt tidigare egna dagsmål har ersatts av målet noll på stoppdatumet. Du kan ändra stoppdatumet ovan om du behöver en ny plan.':scheduled?'Du använder ett eget dagsmål fram till stoppdatumet. På stoppdatumet blir målet noll.':'Du använder ett eget dagsmål. Det gäller tills du återställer det i Inställningar.'}</Text>:null}
  <Card><View style={styles.milestoneList}>{milestones.map(({date:d,goal:dayGoal},i)=><View key={i} accessible accessibilityRole="text" accessibilityLabel={date(d)+', högsta dagsmål '+dayGoal+' cigaretter'} style={[styles.milestoneRow,i===0&&styles.milestoneToday]}><Text style={[styles.muted,styles.flexText]}>{i===0?'Idag · ':''}{date(d)}</Text><Text style={styles.cardTitle}>{dayGoal} / dag</Text></View>)}</View><Pressable accessibilityRole="button" accessibilityHint="Växlar mellan tre och fjorton kommande dagar" accessibilityState={{expanded:showAllGoals}} accessibilityLabel={showAllGoals?'Visa bara de tre närmaste dagarna':'Visa alla fjorton kommande mål'} onPress={()=>setShowAllGoals(v=>!v)} style={styles.moreGoalsButton}><Text style={styles.label}>{showAllGoals?'VISA 3 DAGAR':'VISA ALLA 14 DAGAR'}</Text></Pressable></Card>
  <Text style={styles.muted}>Dagsmålet är ett högsta riktvärde. Du behöver aldrig röka för att nå det.</Text>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20,minWidth:0},actionButton:{minHeight:48,justifyContent:'center',alignSelf:'stretch',paddingHorizontal:12},flexText:{flexShrink:1,minWidth:0},milestoneList:{gap:8},moreGoalsButton:{minHeight:48,justifyContent:'center',alignItems:'center',marginTop:12},milestoneRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:8,padding:12,borderRadius:12,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},milestoneToday:{borderColor:C.lime,backgroundColor:C.limeSoft},card:{backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime,flexShrink:1},heading:{fontSize:19,fontWeight:'800',color:C.white,flexShrink:1},
 heroNumber:{fontSize:48,fontWeight:'900',color:C.white,flexShrink:1},statValue:{fontSize:26,fontWeight:'800',color:C.white,flexShrink:1},cardTitle:{fontSize:16,fontWeight:'800',color:C.white,flexShrink:1},
 muted:{fontSize:13,lineHeight:19,color:C.dim,flexShrink:1},divider:{height:1,backgroundColor:C.border},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:10},sectionRow:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:10},
 progressTrack:{height:9,borderRadius:5,backgroundColor:C.soft,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:5},
 dayCell:{width:'21%',flexGrow:1,alignItems:'center',padding:10,gap:5,borderRadius:12,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},
 choice:{gap:5,minHeight:56,justifyContent:'center',minWidth:0},disabledChoice:{opacity:0.55},selected:{borderColor:C.lime,backgroundColor:C.limeSoft},
 previewCard:{padding:12,gap:6,borderRadius:12,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},recoveryCard:{gap:7,padding:14,borderRadius:14,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},
 dateInput:{borderWidth:1,borderColor:C.border,borderRadius:10,padding:12,color:C.white,fontSize:16,minHeight:48,width:'100%'},error:{color:C.danger,fontSize:13},
});
