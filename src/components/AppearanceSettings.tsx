import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {Sun,Moon,Monitor} from 'lucide-react-native';
import {useAppTheme} from '../theme';
import type {ThemeMode} from '../themeTokens';
import {AppCard} from './ui';
const choices=[{value:'light',label:'Ljust',hint:'Ljust och fräscht',icon:Sun},{value:'dark',label:'Mörkt',hint:'Mörkt och skonsamt för ögonen',icon:Moon},{value:'system',label:'System',hint:'Följer telefonens inställning',icon:Monitor}] as const;
export function AppearanceSettings(){
 const {mode,colors:C,setMode,saving,error,ready}=useAppTheme();
 return <AppCard><Text accessibilityRole="header" style={{color:C.text,fontSize:20,fontWeight:'800'}}>Välj tema</Text><Text style={{color:C.textMuted,fontSize:14,lineHeight:21}}>Anpassa appens utseende.</Text>
 <View accessibilityRole="radiogroup" accessibilityLabel="Appens tema" style={{gap:10}}>{choices.map(({value,label,hint,icon:Icon})=><Pressable key={value} accessibilityRole="radio" accessibilityLabel={label} accessibilityHint={hint} accessibilityState={{checked:mode===value,disabled:!ready}} disabled={!ready} onPress={()=>void setMode(value as ThemeMode)} style={{minHeight:76,borderRadius:14,padding:14,backgroundColor:mode===value?C.accentSubtle:C.elevated,borderWidth:1,borderColor:mode===value?C.accent:C.border,flexDirection:'row',alignItems:'center',gap:14}}><Icon size={27} color={C.accent}/><View style={{flex:1,gap:4}}><Text style={{color:C.text,fontSize:16,fontWeight:'700'}}>{label}</Text><Text style={{color:C.textMuted,fontSize:13,lineHeight:18}}>{hint}</Text></View><View accessible={false} style={{width:18,height:18,borderRadius:9,borderWidth:2,borderColor:mode===value?C.accent:C.textMuted,alignItems:'center',justifyContent:'center'}}>{mode===value?<View style={{width:8,height:8,borderRadius:4,backgroundColor:C.accent}}/>:null}</View></Pressable>)}</View>
 <Text style={{color:C.textMuted,fontSize:12}}>Ditt val sparas automatiskt på den här enheten.</Text>
 {saving?<Text accessibilityLiveRegion="polite" style={{color:C.textMuted}}>Sparar utseende…</Text>:null}{error?<Text accessibilityRole="alert" style={{color:C.danger}}>{error}</Text>:null}</AppCard>;
}
