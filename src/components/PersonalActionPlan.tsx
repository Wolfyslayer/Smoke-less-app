import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {PLAN_TRIGGERS,actionSteps,clearActionPlan,isPlanTrigger,moveActionStep,rememberActionStrategy,toggleActionStep} from '../domain/actionPlans';
import type {useActionPlans} from '../hooks/useActionPlans';
import {useThemeStyles,type ThemeColors} from '../theme';

type Props={store:ReturnType<typeof useActionPlans>;trigger:string;strategy:string;onUseStep:(id:string)=>void;onTrigger:(trigger:string)=>void};
export function PersonalActionPlan({store,trigger,strategy,onUseStep,onTrigger}:Props){
 const s=useThemeStyles(createS);

 const [editing,setEditing]=useState(false);
 if(!isPlanTrigger(trigger))return null;
 const steps=store.value.plans[trigger]??[];
 return <View style={s.card}>
  <Text accessibilityRole="header" style={s.title}>Min plan vid {trigger.toLocaleLowerCase('sv-SE')}</Text>
  <Text style={s.text}>Du väljer vad som passar. Du behöver inte registrera varje röksug.</Text>
  <View style={s.row}>{PLAN_TRIGGERS.map(choice=><Pressable key={choice} accessibilityRole="radio" accessibilityLabel={`Situation: ${choice}`} accessibilityState={{checked:trigger===choice}} style={s.button} onPress={()=>onTrigger(choice)}><Text style={s.action}>{trigger===choice?'✓ ':''}{choice}</Text></Pressable>)}</View>
  {steps.length===0?<Text style={s.text}>Ingen sparad plan för situationen. Välj upp till tre korta steg, eller använd SOS som vanligt.</Text>:steps.map((id,index)=>{const step=actionSteps.find(s=>s.id===id)!;return <View key={id} style={s.group}>
   <Text style={s.title}>{index+1}. {step.title}</Text><Text style={s.text}>{step.detail}</Text>
   <Pressable accessibilityRole="button" accessibilityLabel={`Använd steg ${index+1}: ${step.title}`} accessibilityState={{selected:strategy===step.title}} style={s.button} onPress={()=>onUseStep(id)}><Text style={s.action}>{strategy===step.title?'Valt tips i SOS':'Använd tipset i SOS'}</Text></Pressable>
   {editing?<View style={s.row}>{([-1,1] as const).map(direction=>{const disabled=!store.ready||(direction===-1?index===0:index===steps.length-1);return <Pressable key={direction} accessibilityRole="button" accessibilityLabel={`Flytta ${step.title} ${direction===-1?'uppåt':'nedåt'}`} accessibilityState={{disabled}} disabled={disabled} style={s.button} onPress={()=>store.update(moveActionStep(store.value,trigger,id,direction))}><Text style={s.action}>{direction===-1?'Upp':'Ned'}</Text></Pressable>})}</View>:null}
  </View>})}
  <Pressable accessibilityRole="button" accessibilityState={{expanded:editing}} style={s.button} onPress={()=>setEditing(v=>!v)}><Text style={s.action}>{editing?'Stäng redigering':'Välj eller ändra mina steg'}</Text></Pressable>
  <Pressable accessibilityRole="button" accessibilityState={{disabled:!store.ready||steps.length>=3}} disabled={!store.ready||steps.length>=3} style={s.button} onPress={()=>store.update(rememberActionStrategy(store.value,trigger,strategy))}><Text style={s.action}>Spara valt SOS-tips i min plan</Text></Pressable>
  {store.error?<><Text accessibilityRole="alert" style={s.text}>{store.error}</Text><Pressable accessibilityRole="button" style={s.button} onPress={store.retry}><Text style={s.action}>Försök läsa igen</Text></Pressable></>:null}
  {editing?<><Text style={s.text}>Högst tre steg. Planen sparas lokalt för ditt konto eller gästläge. Att välja ett tips sparar inte en röksugsregistrering.</Text>{actionSteps.map(step=>{const selected=steps.includes(step.id),disabled=!store.ready||(!selected&&steps.length>=3);return <Pressable key={step.id} accessibilityRole="checkbox" accessibilityState={{checked:selected,disabled}} disabled={disabled} style={s.button} onPress={()=>store.update(toggleActionStep(store.value,trigger,step.id))}><Text style={s.action}>{selected?'✓ ':''}{step.title}</Text></Pressable>})}<Pressable accessibilityRole="button" accessibilityState={{disabled:!store.ready}} disabled={!store.ready} style={s.button} onPress={()=>store.update(clearActionPlan(store.value,trigger))}><Text style={s.action}>Rensa planen för denna situation</Text></Pressable></>:null}
 </View>;
}
const createS=(C:ThemeColors)=>StyleSheet.create({card:{padding:17,gap:12,borderRadius:24,borderWidth:1,borderColor:C.border,backgroundColor:C.surface},title:{color:C.white,fontSize:16,fontWeight:'800'},text:{color:C.muted,fontSize:15,lineHeight:21},button:{minWidth:48,minHeight:48,padding:12,justifyContent:'center',backgroundColor:C.elevated,borderRadius:12},action:{color:C.lime,fontWeight:'800',flexShrink:1},row:{flexDirection:'row',flexWrap:'wrap',gap:8},group:{gap:8,paddingVertical:8}});
