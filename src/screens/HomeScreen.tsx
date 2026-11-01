import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import Svg,{Circle} from 'react-native-svg';
import {PlusCircle,Heart,Target,History,Clock,ArrowUpRight} from 'lucide-react-native';
import {C} from '../theme';
import {savings,type Data} from '../domain';

type Props={data:Data;goal:number;todayCount:number;duration:string;weekly:number[];today:string;onRegister:()=>void;onSOS:()=>void;onPlan:()=>void;onHistory:()=>void;onStats:()=>void;onConfirmToday:()=>void};
const fmt=(n:number)=>new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);
function Card({children,style}:{children:React.ReactNode;style?:any}){return <View style={[styles.card,style]}>{children}</View>}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.label}>{children}</Text>}
function Tile({icon:Icon,title,onPress,featured=false}:{icon:any;title:string;onPress:()=>void;featured?:boolean}){return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.tile,featured&&{backgroundColor:C.limeSoft,borderColor:'#5C6B24'}]}><View style={styles.tileIcon}><Icon color={C.lime} size={23}/></View><Text style={styles.tileText}>{title}</Text><ArrowUpRight color={C.dim} size={16} style={{position:'absolute',right:15,top:17}}/></Pressable>}
function Ring({value}:{value:number}){const r=46,circ=2*Math.PI*r,p=Math.max(0,Math.min(100,value));return <View style={{width:106,height:106,alignItems:'center',justifyContent:'center'}}><Svg width={106} height={106} viewBox="0 0 120 120"><Circle cx="60" cy="60" r={r} stroke={C.soft} strokeWidth="11" fill="none"/><Circle cx="60" cy="60" r={r} stroke={C.lime} strokeWidth="11" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-p/100)} rotation={-90} origin="60,60"/></Svg><Text style={[styles.ringText,{position:'absolute'}]}>{Math.round(p)}%</Text></View>}
function Bars({values}:{values:number[]}){const max=Math.max(1,...values);return <View style={styles.bars}>{values.map((n,i)=><View key={i} style={{flex:1,alignItems:'center',justifyContent:'flex-end',gap:9}}><View style={{height:78,width:'100%',justifyContent:'flex-end',alignItems:'center'}}><View style={{height:Math.max(3,n/max*74),width:'68%',borderRadius:7,backgroundColor:n?C.lime:C.soft}}/></View><Text style={{color:C.dim,fontSize:10}}>{['M','T','O','T','F','L','S'][i%7]}</Text></View>)}</View>}
function Stat({label,value,detail}:{label:string;value:string;detail?:string}){return <Card style={{flex:1,minWidth:135,gap:8}}><Label>{label}</Label><Text style={styles.statValue}>{value}</Text>{detail?<Text style={styles.muted}>{detail}</Text>:null}</Card>}
export function HomeScreen({data,goal,todayCount,duration,weekly,today,onRegister,onSOS,onPlan,onHistory,onStats,onConfirmToday}:Props){
 const checkin=data.checkins.find(x=>x.date===today);
 const encouragement=checkin?.complete&&checkin.smokeFree
  ?'Du har bekräftat en rökfri dag. Bra jobbat med din avstämning!'
  :todayCount>goal
   ?'En svårare dag tar inte bort dina tidigare framsteg. Du kan fortsätta när du vill.'
   :checkin?.complete
    ?'Du har stämt av dagen. Varje ärlig registrering hjälper dig att förstå dina vanor.'
    :todayCount===0
     ?'Ta dagen i din egen takt. Registrera det som händer och ge dig själv utrymme att lyckas.'
     :'Du följer dina vanor steg för steg. Varje registrering hjälper dig framåt.';
 return <View style={styles.screen}>
  <Card style={{padding:19,gap:14,borderColor:'#425C29'}}><Label>DAGENS FRAMSTEG</Label><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}><View style={{flex:1}}><Text style={styles.heroNumber}>{Math.max(0,goal-todayCount)}<Text style={{fontSize:24,color:C.muted}}> / {goal}</Text></Text><Text style={styles.muted}>cigaretter kvar idag</Text></View><Ring value={goal===0?(todayCount>0?100:0):Math.min(100,todayCount/goal*100)}/></View><Text style={{color:C.white,fontSize:13}}>{goal===0?todayCount===0?'Ditt mål är en rökfri dag.':'Fortsätt framåt i din egen takt.':todayCount<=goal?'Du har '+(goal-todayCount)+' kvar till dagens övre gräns.':'Det blev lite mer än planerat idag, men dina framsteg räknas fortfarande. Fortsätt i din egen takt.'}</Text></Card>
  <Card><Label>DAGENS UPPMUNTRAN</Label><Text style={styles.cardTitle}>{encouragement}</Text><Text style={styles.muted}>Du bestämmer din takt. Små steg räknas också.</Text></Card>
  <View style={styles.grid}><Tile icon={PlusCircle} title="Registrera" featured onPress={onRegister}/><Tile icon={Heart} title="SOS · Jag är röksugen" onPress={onSOS}/><Tile icon={Target} title="Min plan" onPress={onPlan}/><Tile icon={History} title="Min logg" onPress={onHistory}/></View>
  <Card><View style={styles.inline}><Clock color={C.lime} size={22}/><View style={{flex:1,gap:5}}><Label>TID SEDAN SENASTE CIGARETTEN</Label><Text style={styles.statValue}>{duration}</Text></View></View></Card>
  <View style={styles.sectionRow}><Text style={styles.heading}>Din utveckling</Text><Pressable accessibilityRole="button" onPress={onStats}><Text style={styles.link}>Visa mer</Text></Pressable></View><Card><Bars values={weekly}/></Card>
  <View style={styles.grid}><Stat label="DIN BESPARING" value={fmt(savings(data))+' kr'}/><Stat label="DAGENS MÅL" value={String(goal)} detail="Högsta riktvärde"/></View>
  <Card><Label>DAGLIG AVSTÄMNING</Label><Text style={styles.cardTitle}>{checkin?'Dagen är avstämd':'Har du registrerat alla dagens cigaretter?'}</Text>{!checkin?<Pressable accessibilityRole="button" onPress={onConfirmToday} style={styles.button}><Text style={styles.buttonText}>Bekräfta dagens registreringar</Text></Pressable>:<Text style={styles.muted}>{checkin.smokeFree?'Bekräftat rökfri dag':'Registreringarna är bekräftade'}</Text>}</Card>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border,borderRadius:20,padding:17,gap:8},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},heroNumber:{fontSize:48,fontWeight:'900',color:C.white},
 muted:{fontSize:13,lineHeight:19,color:C.dim},statValue:{fontSize:26,fontWeight:'800',color:C.white},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 heading:{fontSize:19,fontWeight:'800',color:C.white},link:{color:C.lime,fontSize:13,fontWeight:'700'},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:10},inline:{flexDirection:'row',alignItems:'center',gap:14},sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 tile:{width:'46%',flexGrow:1,minHeight:105,borderRadius:18,backgroundColor:C.elevated,borderWidth:1,borderColor:C.border,padding:15,gap:12},
 tileIcon:{width:39,height:39,borderRadius:12,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},tileText:{color:C.white,fontWeight:'800',fontSize:14},
 bars:{height:120,flexDirection:'row',alignItems:'flex-end',gap:8},ringText:{color:C.white,fontSize:19,fontWeight:'800'},
 button:{backgroundColor:C.lime,borderRadius:14,minHeight:49,alignItems:'center',justifyContent:'center',paddingHorizontal:14},buttonText:{fontWeight:'800',color:C.background,fontSize:14},
});
