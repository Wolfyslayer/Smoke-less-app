import React,{useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {loadIntervalPlan} from './intervalStorage';
import {CigaretteEntry} from './interval';
import {Profile} from './model';
import {intervalMinutes} from './analytics';
import {DailyCheckin,loadCheckins,confirmedSmokeFreeDays,dayKey} from './dailyCheckins';
const C={card:'#101E25',line:'#20343C',orange:'#6DDAE2',green:'#8DD8BD',white:'#EAF6F7',muted:'#8BA4AC'};
type Period='today'|'7'|'30'|'all';
const dateKey=(d:Date)=>d.toLocaleDateString('sv-SE');
function Tile({label,value,sub}:{label:string;value:string;sub?:string}){return <View style={s.tile}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text>{sub?<Text style={s.sub}>{sub}</Text>:null}</View>}
export default function SmokingStats({profile}:{profile:Profile}){
 const [entries,setEntries]=useState<CigaretteEntry[]>([]);
 const [period,setPeriod]=useState<Period>('7');
 const [checkins,setCheckins]=useState<DailyCheckin[]>([]);
 useEffect(()=>{loadIntervalPlan().then(p=>setEntries(p.history??[]));loadCheckins().then(setCheckins)},[]);
 const now=new Date(),today=dateKey(now);
 const todayCount=entries.filter(e=>dateKey(new Date(e.at))===today).length;
 const days=period==='today'?1:period==='7'?7:period==='30'?30:Math.max(1,Math.ceil((Date.now()-new Date(profile.planStartAt??profile.quitAt).getTime())/86400000));
 const start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-days+1);
 const recent=entries.filter(e=>new Date(e.at)>=start&&new Date(e.at)<=now);
 const daily=Array.from({length:Math.min(days,30)},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()-Math.min(days,30)+i+1);return {date:d,count:recent.filter(e=>dateKey(new Date(e.at))===dateKey(d)).length}});
 const verifiedDays=checkins.filter(c=>c.complete&&c.date>=dayKey(start)&&c.date<=dayKey(now)&&c.date<dayKey(now)&&(!c.smokeFree||!entries.some(e=>dayKey(new Date(e.at))===c.date)));
 const verifiedSmokeFree=verifiedDays.filter(c=>c.smokeFree).length;
 const average=verifiedDays.length?recent.filter(e=>verifiedDays.some(c=>c.date===dayKey(new Date(e.at)))).length/verifiedDays.length:0;
 const intervals=intervalMinutes(entries).filter(n=>n>=0);
 const longest=intervals.length?Math.max(...intervals):0;
 const avgInterval=intervals.length?Math.round(intervals.reduce((a,b)=>a+b,0)/intervals.length):0;
 const verifiedCigarettes=recent.filter(e=>verifiedDays.some(c=>c.date===dayKey(new Date(e.at)))).length;
 const avoided=Math.max(0,Math.floor(profile.cigarettesPerDay*verifiedDays.length-verifiedCigarettes));
 const saved=avoided*profile.packPrice/Math.max(1,profile.cigarettesPerPack);
 const fmt=(min:number)=>min>=60?Math.floor(min/60)+'h '+min%60+'m':min+'m';
 const max=Math.max(1,...daily.map(d=>d.count));
 return <View style={s.wrap}><Text style={s.title}>Statistik</Text><Text style={s.sub}>Beräknat från dina registrerade cigaretter.</Text><View style={s.tabs}>{([['today','Idag'],['7','7 dagar'],['30','30 dagar'],['all','Totalt']] as [Period,string][]).map(([id,label])=><Pressable key={id} onPress={()=>setPeriod(id)} style={[s.tab,period===id&&s.active]}><Text style={[s.tabText,period===id&&{color:C.white}]}>{label}</Text></Pressable>)}</View>
 <View style={s.chart}><Text style={s.heading}>Cigaretter per dag</Text><Text style={s.sub}>Följ dina mönster över tid. Tomma staplar betyder inte automatiskt rökfria dagar.</Text><View style={s.bars}>{daily.map((d,i)=><View key={i} style={s.barSlot}><View style={[s.bar,{height:Math.max(2,d.count/max*145),backgroundColor:d.count>profile.cigarettesPerDay? '#F8B23B':C.orange}]}/></View>)}</View><Text style={s.sub}>Visar de senaste {daily.length} dagarna · orange = registrerade cigaretter. Tomma staplar betyder inte automatiskt rökfri dag.</Text></View>
 <View style={s.grid}><Tile label="CIGARETTER IDAG" value={String(todayCount)}/><Tile label="GENOMSNITT/AVSTÄMD DAG" value={verifiedDays.length?average.toFixed(1):'–'}/><Tile label="LÄNGSTA INTERVALL" value={intervals.length?fmt(longest):'–'}/><Tile label="GENOMSNITTLIGT INTERVALL" value={intervals.length?fmt(avgInterval):'–'}/><Tile label="BEKRÄFTAT RÖKFRIA DAGAR" value={String(verifiedSmokeFree)} sub={verifiedDays.length+' avstämda dagar'}/><Tile label="REGISTRERADE UNDER PERIODEN" value={String(recent.length)} sub="Faktiska loggposter"/><Tile label="MÖJLIG BESPARING" value={Math.round(saved)+' kr'} sub="Baserat på avstämda dagar"/></View><Text style={s.sub}>Besparingarna uppskattas endast för dagar du bekräftat som fullständigt registrerade. Pågående dag räknas inte som färdig avstämning. Dagar utan registrering är inte automatiskt rökfria dagar.</Text></View>;
}
const s=StyleSheet.create({wrap:{gap:15},title:{fontSize:32,fontWeight:'800',color:C.white,letterSpacing:-0.8},sub:{fontSize:13,color:C.muted,lineHeight:20},tabs:{flexDirection:'row',backgroundColor:'#1B3039',padding:5,borderRadius:15},tab:{flex:1,alignItems:'center',paddingVertical:12,borderRadius:12},active:{backgroundColor:'#16404A'},tabText:{fontSize:12,color:C.muted,fontWeight:'800'},chart:{backgroundColor:C.card,borderColor:C.line,borderWidth:1,borderRadius:22,padding:20,gap:14},heading:{fontSize:18,color:C.white,fontWeight:'800'},bars:{height:155,flexDirection:'row',alignItems:'flex-end',gap:3},barSlot:{flex:1,alignItems:'center',justifyContent:'flex-end',height:155},bar:{width:'85%',borderRadius:4},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tile:{width:'46%',flexGrow:1,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:19,padding:17,minHeight:110,gap:9},label:{color:C.muted,fontSize:12},value:{color:C.white,fontSize:24,fontWeight:'800'}});
