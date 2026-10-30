import React,{useEffect,useState} from 'react';
import {Share,Pressable,StyleSheet,Text,View} from 'react-native';
import {loadIntervalPlan} from './intervalStorage';
import {CigaretteEntry} from './interval';
import {Profile} from './model';
import {DailyCheckin,loadCheckins,dayKey} from './dailyCheckins';
const C={card:'#15171A',line:'#303336',orange:'#D7FF23',green:'#8DD8BD',white:'#F5F6F4',muted:'#A0A3A7'};
const milestones=[{minutes:20,label:'20 minuter',description:'Puls och blodtryck kan börja sjunka.'},{minutes:480,label:'8 timmar',description:'Kolmonoxidhalten i blodet sjunker.'},{minutes:1440,label:'24 timmar',description:'Kroppen fortsätter återhämta sig.'},{minutes:2880,label:'2 dagar',description:'Lukt- och smaksinnet kan börja förbättras.'},{minutes:4320,label:'3 dagar',description:'Andningen kan gradvis kännas lättare.'},{minutes:20160,label:'2 veckor',description:'Blodcirkulationen kan förbättras.'},{minutes:43200,label:'1 månad',description:'Hosta och andfåddhet kan minska.'},{minutes:129600,label:'3 månader',description:'Lungfunktion och ork kan fortsätta förbättras.'},{minutes:525600,label:'1 år',description:'Risken för hjärt-kärlsjukdom minskar över tid.'}];
export default function Benefits({profile}:{profile:Profile}){
 const [entries,setEntries]=useState<CigaretteEntry[]>([]);
 const [checkins,setCheckins]=useState<DailyCheckin[]>([]);
 useEffect(()=>{loadIntervalPlan().then(p=>setEntries(p.history??[]));loadCheckins().then(setCheckins)},[]);
 const started=new Date(profile.planStartAt??profile.quitAt).getTime();
 const elapsedDays=Math.max(0,(Date.now()-started)/86400000);
 const recorded=entries.filter(e=>new Date(e.at).getTime()>=started).length;
 const verified=checkins.filter(c=>c.complete&&c.date>=dayKey(new Date(started))&&c.date<dayKey(new Date())&&(!c.smokeFree||!entries.some(e=>dayKey(new Date(e.at))===c.date)));
 const recordedVerified=entries.filter(e=>verified.some(c=>c.date===dayKey(new Date(e.at)))).length;
 const estimatedAvoided=Math.max(0,Math.floor(verified.length*Math.max(0,profile.cigarettesPerDay)-recordedVerified));
 const saved=estimatedAvoided*profile.packPrice/Math.max(1,profile.cigarettesPerPack);
 const last=entries.length?entries.reduce((latest,e)=>e.at>latest?e.at:latest,entries[0].at):undefined;
 const quitMode=profile.mode==='quit';
 const smokeFreeMinutes=quitMode?Math.max(0,(Date.now()-Math.max(new Date(profile.quitAt).getTime(),last?new Date(last).getTime():0))/60000):0;
 const unlocked=quitMode?milestones.filter(m=>smokeFreeMinutes>=m.minutes).length:0;
 const next=milestones.find(m=>m.minutes>smokeFreeMinutes);
 return <View style={s.wrap}><Text style={s.title}>Dina framsteg</Text><Text style={s.sub}>Följ förändringarna över tid. Dina framsteg räknas varsamt och utan press.</Text><View style={s.row}><Text style={s.heading}>Uppskattad besparing</Text><Pressable accessibilityRole="button" onPress={()=>Share.share({message:'Jag jobbar mot ett rökfritt liv med Smoke Less. Ett steg i taget!'})}><Text style={s.action}>Dela framsteg ↗</Text></Pressable></View><View style={s.hero}><Text style={s.money}>{Math.round(saved).toLocaleString('sv-SE')} kr</Text><Text style={s.sub}>Uppskattning för {verified.length} avstämda dagar · cirka {estimatedAvoided} färre cigaretter</Text></View><Text style={s.heading}>Din hälsoresa</Text><Text style={s.sub}>{quitMode?'Milstolpar räknas från din senaste registrerade cigarett eller rökstoppet.':'Hälsomilstolpar visas först när du påbörjar ett rökstopp.'}</Text><View style={s.card}><View style={s.row}><Text style={s.heading}>Rökfri tid</Text><Text style={s.action}>{unlocked}/{milestones.length}</Text></View><Text style={s.money}>{quitMode?Math.floor(smokeFreeMinutes/60)+'h '+Math.floor(smokeFreeMinutes%60)+'m':'Inte påbörjad'}</Text><Text style={s.sub}>{next&&quitMode?'Nästa: '+next.label:quitMode?'Alla milstolpar uppnådda':'Fortsätt minska i din egen takt'}</Text></View>{milestones.map((m,i)=><View key={m.minutes} style={s.milestone}><Text style={[s.dot,{color:quitMode&&smokeFreeMinutes>=m.minutes?C.green:C.muted}]}>{quitMode&&smokeFreeMinutes>=m.minutes?'✓':'○'}</Text><View style={s.detail}><Text style={s.label}>{m.label}</Text><Text style={s.sub}>{m.description}</Text></View></View>)}<Text style={s.disclaimer}>Hälsoeffekter är generella och individuella resultat varierar. Besparingar baseras endast på dagar som du själv markerat som fullständigt registrerade.</Text></View>;
}
const s=StyleSheet.create({wrap:{gap:16},title:{color:C.white,fontSize:32,fontWeight:'800',letterSpacing:-0.8},heading:{color:C.white,fontSize:19,fontWeight:'800'},sub:{color:C.muted,fontSize:14,lineHeight:22},row:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},action:{color:C.orange,fontWeight:'800',fontSize:13},hero:{backgroundColor:'#15171A',borderColor:'#303336',borderWidth:1,borderRadius:18,padding:23,gap:8},money:{color:C.green,fontSize:31,fontWeight:'900'},card:{backgroundColor:'#15171A',borderColor:'#303336',borderWidth:1,borderRadius:18,padding:18,gap:10},milestone:{flexDirection:'row',gap:16,paddingVertical:9},dot:{fontSize:27},detail:{flex:1,gap:5},label:{color:C.white,fontWeight:'800',fontSize:16},disclaimer:{color:C.muted,fontSize:12,lineHeight:19}});
