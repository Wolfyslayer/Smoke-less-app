import React,{useEffect,useState} from 'react';
import {Alert,Pressable,StyleSheet,Text,View} from 'react-native';
import {initialIntervalPlan,intervalProgress,IntervalPlan} from './interval';
import {loadIntervalPlan,saveIntervalPlan} from './intervalStorage';
import {scheduleIntervalNotifications} from './intervalNotifications';
import { registerInterval, acceptSuggestion, dismissSuggestion } from './adaptiveTapering';
const colors={card:'#152536',mint:'#65E0BC',white:'#F2F8FA',muted:'#A3B8C5'};
export default function IntervalPanel(){
 const [plan,setPlan]=useState<IntervalPlan>(initialIntervalPlan);
 const [loaded,setLoaded]=useState(false);
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{loadIntervalPlan().then(p=>{setPlan(p);setLoaded(true);});const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
 const update=async(next:IntervalPlan)=>{setPlan(next);try{await saveIntervalPlan(next);await scheduleIntervalNotifications(next);}catch{Alert.alert('Notifikationer','Kunde inte schemalägga påminnelser på den här enheten.');}};
 const p=intervalProgress(plan,now);
 const entries=plan.history??[];
 const successes=entries.filter(x=>x.metTarget).length;
 const average=entries.length?Math.round(entries.reduce((sum,x)=>sum+x.elapsedMinutes,0)/entries.length):0;
 const button=(label:string,onPress:()=>void)=><Pressable accessibilityRole="button" onPress={onPress} style={s.button}><Text style={s.buttonText}>{label}</Text></Pressable>;
 return <View style={s.card}><Text style={s.heading}>Cigarettimer · Nedtrappning</Text><Text style={s.sub}>Träna på att vänta längre mellan cigaretterna, i din egen takt.</Text>
 {button(plan.enabled?'Pausa nedtrappningsplan':'Aktivera nedtrappningsplan',()=>update({...plan,enabled:!plan.enabled}))}
 {plan.enabled&&<><Text style={s.label}>Ditt intervall: {plan.minutes} minuter</Text><View style={s.row}>{[30,45,60,90,120,180].map(n=><Pressable key={n} accessibilityRole="button" accessibilityState={{selected:plan.minutes===n}} onPress={()=>update({...plan,minutes:n})} style={[s.chip,plan.minutes===n&&s.selected]}><Text style={s.chipText}>{n}</Text></Pressable>)}</View>
 <Text style={s.value}>{Math.floor(p.elapsedMinutes/60)} h {p.elapsedMinutes%60} min</Text><Text style={s.sub}>{p.extraMinutes>0?`Fantastiskt! +${p.extraMinutes} minuter över målet!`:p.remainingMinutes===0?'Målet uppnått!':`${p.remainingMinutes} minuter kvar till ditt mål`}</Text>
 <View style={s.suggestion}><Text style={s.heading}>Dina intervall</Text><Text style={s.sub}>{entries.length} registrerade cigaretter · {successes} uppnådda mål · {average} min genomsnitt</Text><Text style={s.sub}>Senaste 7: {entries.slice(0,7).map(x=>x.metTarget?'●':'○').join('  ')||'Ingen historik ännu'}</Text></View>
 {plan.suggestedMinutes&&<View style={s.suggestion}><Text style={s.heading}>Redo för nästa steg?</Text><Text style={s.sub}>Du har klarat flera intervaller! Vill du prova {plan.suggestedMinutes} minuter? Det är helt frivilligt.</Text>{button('Ja, prova längre intervall',()=>update(acceptSuggestion(plan)))}{button('Inte just nu',()=>update(dismissSuggestion(plan)))}</View>}
 {button('Jag rökte en cigarett · starta om timern',()=>Alert.alert('Registrera cigarett','Starta om intervallet från nu?',[{text:'Avbryt',style:'cancel'},{text:'Registrera',onPress:()=>update(registerInterval(plan))}]))}
 {button(plan.notificationsEnabled?'Stäng av intervallnotiser':'Aktivera intervallnotiser',()=>update({...plan,notificationsEnabled:!plan.notificationsEnabled}))}
 <Text style={s.sub}>Notiser vid målet samt 15, 30, 60, 120 och 180 minuter extra. Inga notiser om du registrerar en ny cigarett innan dess.</Text></>}
 </View>;
}
const s=StyleSheet.create({card:{backgroundColor:colors.card,padding:18,borderRadius:18,gap:12},heading:{color:colors.white,fontWeight:'800',fontSize:20},sub:{color:colors.muted,fontSize:14,lineHeight:21},label:{color:colors.white,fontWeight:'700'},row:{flexDirection:'row',flexWrap:'wrap',gap:7},chip:{padding:10,backgroundColor:'#294052',borderRadius:10},selected:{backgroundColor:'#23705D'},chipText:{color:colors.white,fontWeight:'700'},value:{color:colors.mint,fontSize:32,fontWeight:'900',textAlign:'center'},suggestion:{backgroundColor:'#1D3544',padding:15,borderRadius:14,gap:10},button:{backgroundColor:'#23705D',padding:13,borderRadius:12},buttonText:{color:colors.white,fontWeight:'700',textAlign:'center'}});
