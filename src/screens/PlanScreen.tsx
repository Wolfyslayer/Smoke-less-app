import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {C} from '../theme';
import {target,quitDate,type Profile,type Speed} from '../domain';

type WeekDay={key:string;confirmed:boolean;within:boolean};
type Props={profile:Profile;goal:number;todayReduction:number;confirmedDays:number;withinDays:number;planWeek:WeekDay[];clock:number;onChangeProfile:(patch:Partial<Profile>)=>void};
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.label}>{children}</Text>}
function Heading({children}:{children:React.ReactNode}){return <Text style={styles.heading}>{children}</Text>}
export function PlanScreen({profile:p,goal,todayReduction,confirmedDays,withinDays,planWeek,clock,onChangeProfile}:Props){
 const percentage=p.baseline>0?Math.max(0,Math.min(100,Math.round(todayReduction/p.baseline*100))):0;
 const customGoal=p.dailyTargetOverride!==null;
 return <View style={styles.screen}>
  <Card style={{gap:14,padding:19,borderColor:'#425C29'}}>
   <Label>DAGENS MÅL</Label><Text style={styles.heroNumber}>{goal}<Text style={{fontSize:20,color:C.muted}}> cigaretter</Text></Text>
   <Text style={styles.muted}>Startnivå: {p.baseline} per dag</Text><View style={styles.divider}/>
   <Text style={styles.cardTitle}>{customGoal?'Rökstopp enligt grundplanen':'Planerat rökstopp'}</Text><Text style={styles.statValue}>{date(quitDate(p))}</Text>
   {customGoal?<Text style={styles.muted}>Du har valt ett eget dagligt riktvärde. Datumet bygger på grundplanen och påverkas inte av ditt egna mål.</Text>:null}
  </Card>
  <Heading>Din nedtrappning</Heading>
  <Card style={{gap:10}}>
   <View style={styles.grid}>
    <View style={{flex:1,minWidth:115}}><Label>MINSKNING AV DAGSMÅL</Label><Text style={styles.statValue}>{todayReduction} <Text style={{fontSize:13,color:C.muted}}>färre/dag</Text></Text></View>
    <View style={{flex:1,minWidth:115}}><Label>JÄMFÖRT MED START</Label><Text style={styles.statValue}>{percentage}%</Text></View>
   </View>
   <View style={styles.progressTrack}><View style={[styles.progressFill,{width:`${Math.min(100,percentage)}%` as `${number}%`}]}/></View>
   <Text style={styles.muted}>Visar hur dagsmålet har förändrats från startnivån, inte hur mycket du faktiskt rökt.{customGoal?' Ett eget riktvärde gäller tills det återställs.':''}</Text>
  </Card>
  <Card style={{gap:10}}>
   <Label>PLANEN KAN ANPASSAS</Label>
   <Text style={styles.cardTitle}>En svår dag ändrar inte dina framsteg</Text>
   <Text style={styles.muted}>Om du röker mer än planerat behöver du inte börja om. Din registrerade historik finns kvar, och du kan fortsätta från nästa stund.</Text>
   <Text style={styles.muted}>Behöver du en lugnare takt? Välj Lugn nedan. Tänk på att ett byte av takt startar om planens tidsräkning från idag. Tidigare registreringar finns kvar.</Text>
   <Text style={styles.muted}>Vill du ha ett eget dagsmål kan du ändra det i Inställningar. Det gäller tills du återställer det. Det är ett högsta riktvärde, inte något du måste röka upp till.</Text>
  </Card>
  <Heading>Senaste sju dagarna</Heading>
  <Card style={{gap:10}}>
   <View style={styles.sectionRow}><Text style={styles.cardTitle}>{withinDays} av {confirmedDays} bekräftade dagar inom målet</Text><Text style={styles.muted}>{confirmedDays}/7 avstämda</Text></View>
   <View style={{flexDirection:'row',gap:5}}>{planWeek.map(d=><View key={d.key} accessibilityLabel={d.key+': '+(d.confirmed?(d.within?'inom målet':'över målet'):'ej bekräftad')} style={{flex:1,height:12,borderRadius:5,backgroundColor:!d.confirmed?C.soft:d.within?C.lime:C.danger}}/>)}</View>
   <Text style={styles.muted}>Endast dagar du bekräftat räknas. En missad dag betyder inte att dina framsteg är förlorade.</Text>
  </Card>
  <Heading>Välj din takt</Heading>
  {([['gentle','Lugn','Minska ungefär en cigarett per vecka.'],['balanced','Balanserad','Minska ungefär en cigarett var fjärde dag.'],['fast','Snabb','Minska ungefär en cigarett varannan dag.']] as [Speed,string,string][]).map(([id,title,subtitle])=>
   <Pressable key={id} accessibilityRole="button" accessibilityState={{selected:p.speed===id}} onPress={()=>{if(p.speed!==id)onChangeProfile({speed:id,startAt:new Date().toISOString()})}} style={[styles.card,styles.choice,p.speed===id&&styles.selected]}>
    <Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text>
   </Pressable>)}
  <Heading>Kommande mål</Heading>
  {customGoal?<Text style={styles.muted}>Du använder ett eget dagsmål. Därför visas samma riktvärde för alla kommande dagar tills du återställer det i Inställningar.</Text>:null}
  <Card><View style={styles.grid}>{Array.from({length:14},(_,i)=>{const d=new Date(clock);d.setDate(d.getDate()+i);return <View key={i} style={[styles.dayCell,i===0&&{borderColor:C.lime,backgroundColor:C.limeSoft}]}><Text style={styles.muted}>{d.toLocaleDateString('sv-SE',{weekday:'short'})}</Text><Text style={styles.cardTitle}>{target(p,d)}</Text></View>})}</View></Card>
  <Text style={styles.muted}>Dagsmålet är ett högsta riktvärde. Du behöver aldrig röka för att nå det.</Text>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.elevated,borderRadius:20,borderWidth:1,borderColor:C.border,padding:17},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},heading:{fontSize:19,fontWeight:'800',color:C.white},
 heroNumber:{fontSize:48,fontWeight:'900',color:C.white},statValue:{fontSize:26,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 muted:{fontSize:13,lineHeight:19,color:C.dim},divider:{height:1,backgroundColor:C.border},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:10},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:10},
 progressTrack:{height:9,borderRadius:5,backgroundColor:C.soft,overflow:'hidden'},progressFill:{height:'100%',backgroundColor:C.lime,borderRadius:5},
 dayCell:{width:'21%',flexGrow:1,alignItems:'center',padding:10,gap:5,borderRadius:12,borderWidth:1,borderColor:C.border,backgroundColor:C.soft},
 choice:{gap:5},selected:{borderColor:C.lime,backgroundColor:C.limeSoft},
});
