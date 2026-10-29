import React,{useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {loadIntervalPlan} from './intervalStorage';
import {CigaretteEntry} from './interval';
import {Profile} from './model';
const C={card:'#24201E',line:'#3A3431',orange:'#FF812F',green:'#35B980',white:'#F7F4F1',muted:'#ADA5A0'};
type Period='today'|'7'|'30'|'all';
const dateKey=(d:Date)=>d.toLocaleDateString('sv-SE');
function Tile({label,value,sub}:{label:string;value:string;sub?:string}){return <View style={s.tile}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text>{sub?<Text style={s.sub}>{sub}</Text>:null}</View>}
export default function SmokingStats({profile}:{profile:Profile}){
 const [entries,setEntries]=useState<CigaretteEntry[]>([]);
 const [period,setPeriod]=useState<Period>('7');
 useEffect(()=>{loadIntervalPlan().then(p=>setEntries(p.history??[]))},[]);
 const now=new Date(),today=dateKey(now);
 const todayCount=entries.filter(e=>dateKey(new Date(e.at))===today).length;
 const days=period==='today'?1:period==='7'?7:period==='30'?30:Math.max(1,Math.ceil((Date.now()-new Date(profile.planStartAt??profile.quitAt).getTime())/86400000));
 const start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-days+1);
 const recent=entries.filter(e=>new Date(e.at)>=start&&new Date(e.at)<=now);
 const daily=Array.from({length:Math.min(days,30)},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-Math.min(days,30)+i+1);return {date:d,count:recent.filter(e=>dateKey(new Date(e.at))===dateKey(d)).length}});
 const average=recent.length/days;
 const intervals=recent.map(e=>e.elapsedMinutes).filter(n=>Number.isFinite(n)&&n>=0);
 const longest=intervals.length?Math.max(...intervals):0;
 const avgInterval=intervals.length?Math.round(intervals.reduce((a,b)=>a+b,0)/intervals.length):0;
 const baseline=Math.max(0,profile.cigarettesPerDay)*days;
 const avoided=Math.max(0,Math.floor(baseline-recent.length));
 const saved=avoided*profile.packPrice/Math.max(1,profile.cigarettesPerPack);
 const fmt=(min:number)=>min>=60?Math.floor(min/60)+'h '+min%60+'m':min+'m';
 const max=Math.max(1,...daily.map(d=>d.count));
 return <View style={s.wrap}><Text style={s.title}>Statistik</Text><Text style={s.sub}>Beräknat från dina registrerade cigaretter.</Text><View style={s.tabs}>{([['today','Idag'],['7','7 dagar'],['30','30 dagar'],['all','Totalt']] as [Period,string][]).map(([id,label])=><Pressable key={id} onPress={()=>setPeriod(id)} style={[s.tab,period===id&&s.active]}><Text style={[s.tabText,period===id&&{color:C.white}]}>{label}</Text></Pressable>)}</View>
 <View style={s.chart}><Text style={s.heading}>Cigaretter per dag</Text><View style={s.bars}>{daily.map((d,i)=><View key={i} style={s.barSlot}><View style={[s.bar,{height:Math.max(2,d.count/max*145),backgroundColor:d.count>C.orange.length*0+profile.cigarettesPerDay? '#F8B23B':C.orange}]}/></View>)}</View><Text style={s.sub}>Visar de senaste {daily.length} dagarna · orange = registrerade cigaretter</Text></View>
 <View style={s.grid}><Tile label="CIGARETTER IDAG" value={String(todayCount)}/><Tile label="GENOMSNITT/DAG" value={average.toFixed(1)}/><Tile label="LÄNGSTA INTERVALL" value={intervals.length?fmt(longest):'–'}/><Tile label="GENOMSNITTLIGT INTERVALL" value={intervals.length?fmt(avgInterval):'–'}/><Tile label="FÄRRE CIGARETTER" value={String(avoided)} sub="Uppskattning mot tidigare nivå"/><Tile label="BERÄKNAD BESPARING" value={Math.round(saved)+' kr'}/></View><Text style={s.sub}>Besparingarna är uppskattningar baserade på din tidigare konsumtion och fullständig registrering. Saknade loggar räknas inte som bekräftat rökfria dagar.</Text></View>;
}
const s=StyleSheet.create({wrap:{gap:15},title:{fontSize:28,fontWeight:'800',color:C.white},sub:{fontSize:13,color:C.muted,lineHeight:20},tabs:{flexDirection:'row',backgroundColor:'#312B28',padding:5,borderRadius:15},tab:{flex:1,alignItems:'center',paddingVertical:12,borderRadius:12},active:{backgroundColor:C.orange},tabText:{fontSize:12,color:C.muted,fontWeight:'800'},chart:{backgroundColor:C.card,borderColor:C.line,borderWidth:1,borderRadius:18,padding:18,gap:14},heading:{fontSize:18,color:C.white,fontWeight:'800'},bars:{height:155,flexDirection:'row',alignItems:'flex-end',gap:3},barSlot:{flex:1,alignItems:'center',justifyContent:'flex-end',height:155},bar:{width:'85%',borderRadius:4},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tile:{width:'48%',flexGrow:1,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:15,padding:15,minHeight:105,gap:8},label:{color:C.muted,fontSize:12},value:{color:C.white,fontSize:24,fontWeight:'800'}});
