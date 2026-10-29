import React,{useEffect,useState} from 'react';
import {View,Text,StyleSheet} from 'react-native';
import {loadIntervalPlan} from './intervalStorage';
import {CigaretteEntry} from './interval';
export default function ProgressInsights(){
 const [entries,setEntries]=useState<CigaretteEntry[]>([]);
 useEffect(()=>{loadIntervalPlan().then(x=>setEntries(x.history??[]));},[]);
 const recent=entries.filter(x=>Date.now()-new Date(x.at).getTime()<7*86400000);
 const success=recent.filter(x=>x.metTarget).length;
 const rate=recent.length?Math.round(success/recent.length*100):0;
 const max=recent.length?Math.max(...recent.map(x=>x.elapsedMinutes),1):1;
 return <View style={s.card}><Text style={s.title}>Nedtrappning · senaste 7 dagarna</Text><Text style={s.stat}>{recent.length?rate+' %':'–'}</Text><Text style={s.sub}>{success} av {recent.length} intervaller nådde målet</Text><View style={s.bars}>{recent.slice(0,7).reverse().map((x,i)=><View key={x.at+i} style={s.track}><View style={[s.bar,{height:Math.max(4,Math.round(x.elapsedMinutes/max*85)),backgroundColor:x.metTarget?'#35B980':'#FF812F'}]}/></View>)}</View><Text style={s.sub}>Varje registrering räknas. Ett kortare intervall är ingen anledning att ge upp.</Text></View>;
}
const s=StyleSheet.create({card:{backgroundColor:'#24201E',padding:20,borderRadius:20,gap:10},title:{color:'#F7F4F1',fontSize:18,fontWeight:'800'},stat:{color:'#65E0BC',fontSize:35,fontWeight:'900'},sub:{color:'#ADA5A0',fontSize:14},bars:{height:100,flexDirection:'row',alignItems:'flex-end',gap:9},track:{flex:1,justifyContent:'flex-end',height:90,backgroundColor:'#3A3431',borderRadius:6},bar:{borderRadius:6,width:'100%'}});