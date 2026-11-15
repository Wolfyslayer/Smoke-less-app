import React,{useMemo} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {maintenanceSummary} from '../domain/maintenance';
import type {Data} from '../domain';
import {useThemeStyles,type ThemeColors} from '../theme';
export function MaintenanceSupport({data,clock,onSOS,onCheckin,onSettings}:{data:Data;clock:number;onSOS:()=>void;onCheckin:()=>void;onSettings:()=>void}){
 const s=useThemeStyles(createS);

 const minute=Math.floor(clock/60000),summary=useMemo(()=>maintenanceSummary(data,clock),[data,minute]);
 return <View style={s.card}>
  <Text accessibilityRole="header" style={s.title}>Ditt långsiktiga stöd</Text>
  <Text style={s.value}>{summary.confirmedDays} bekräftat rökfria dagar</Text>
  <Text style={s.text}>Längsta bekräftade följd: {summary.longestStreak} dagar. Saknade avstämningar räknas inte som rökfrihet.</Text>
  <Text style={s.text}>{summary.message}</Text>
  <Pressable accessibilityRole="button" style={s.button} onPress={onSOS}><Text style={s.action}>Öppna SOS och mina riskplaner</Text></Pressable>
  <Pressable accessibilityRole="button" accessibilityState={{disabled:summary.checked}} disabled={summary.checked} style={s.button} onPress={onCheckin}><Text style={s.action}>{summary.checked?'Dagens registreringar är avstämda':'Gör en frivillig avstämning'}</Text></Pressable>
  <Pressable accessibilityRole="button" style={s.button} onPress={onSettings}><Text style={s.action}>Välj färre eller inga påminnelser</Text></Pressable>
  <Text style={s.text}>Du har själv valt långsiktigt stöd. Byt stöd under fasvalet om du vill. Detta ändrar inte din rökstoppsplan eller tidigare rekord.</Text>
 </View>;
}
const createS=(C:ThemeColors)=>StyleSheet.create({card:{gap:12,padding:19,borderRadius:24,borderWidth:1,borderColor:C.border,backgroundColor:C.elevated},title:{fontSize:18,fontWeight:'800',color:C.white},value:{fontSize:25,fontWeight:'900',color:C.white},text:{fontSize:15,lineHeight:21,color:C.muted},button:{minHeight:48,padding:12,justifyContent:'center',backgroundColor:C.surface,borderRadius:12},action:{color:C.lime,fontWeight:'800',flexShrink:1}});
