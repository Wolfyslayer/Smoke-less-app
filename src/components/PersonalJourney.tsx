import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {JOURNEY_PHASES,journeyLabels,journeySupport} from '../domain/personalJourney';
import type {usePersonalJourney} from '../hooks/usePersonalJourney';
import {C} from '../theme';

type Props={journey:ReturnType<typeof usePersonalJourney>;todayCount:number;checked:boolean;onPlan:()=>void;onSOS:()=>void;onCheckin:()=>void;compact?:boolean};
export function PersonalJourney({journey,todayCount,checked,onPlan,onSOS,onCheckin,compact=false}:Props){
 const [editing,setEditing]=useState(false);
 const support=journeySupport(journey.value.phase,todayCount,checked);
 return <View style={s.card}>
  <Text accessibilityRole="header" style={s.title}>{journey.value.phase?`Ditt valda stöd: ${journeyLabels[journey.value.phase]}`:'Stöd för din resa'}</Text>
  <Text style={s.text}>{support.text}</Text>
  {journey.value.phase?<><Text style={s.text}>{support.checkin}</Text>{!(compact&&support.action==='sos')&&!(checked&&support.action==='checkin')?<Pressable accessibilityRole="button" style={s.button} onPress={support.action==='sos'?onSOS:support.action==='plan'?onPlan:onCheckin}><Text style={s.action}>{support.action==='sos'?'Öppna SOS':support.action==='plan'?'Se min plan':'Stäm av dagens registreringar'}</Text></Pressable>:null}</>:null}
  <Pressable accessibilityRole="button" accessibilityState={{expanded:editing}} style={s.button} onPress={()=>setEditing(v=>!v)}><Text style={s.action}>{editing?'Stäng fasval':'Välj eller ändra stöd'}</Text></Pressable>
  {journey.error?<><Text accessibilityRole="alert" style={s.text}>{journey.error}</Text><Pressable accessibilityRole="button" onPress={journey.retry} style={s.button}><Text style={s.action}>Försök läsa igen</Text></Pressable></>:null}
  {editing?<><Text style={s.text}>Du väljer själv. Detta beskriver vilket stöd du vill ha, inte ett verifierat hälsotillstånd. Valet sparas bara på den här enheten för ditt konto eller gästläge.</Text>{[null,...JOURNEY_PHASES].map(phase=><Pressable key={phase??'none'} accessibilityRole="radio" accessibilityState={{checked:journey.value.phase===phase,disabled:!journey.ready}} disabled={!journey.ready} style={s.button} onPress={()=>journey.update({version:1,phase})}><Text style={s.action}>{journey.value.phase===phase?'✓ ':''}{phase?journeyLabels[phase]:'Ingen fasanpassning'}</Text></Pressable>)}</>:null}
 </View>;
}
const s=StyleSheet.create({card:{gap:10,padding:17,borderRadius:20,borderWidth:1,borderColor:C.border,backgroundColor:C.surface},title:{color:C.white,fontSize:17,fontWeight:'800'},text:{color:C.muted,fontSize:13,lineHeight:21},button:{minHeight:48,padding:12,justifyContent:'center',borderRadius:12,backgroundColor:C.elevated},action:{color:C.lime,fontWeight:'800',flexShrink:1}});
