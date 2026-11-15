import React from 'react';
import {Pressable,Text,View} from 'react-native';
import {useAppTheme} from '../theme';
import type {ThemeMode} from '../themeTokens';
import {AppCard} from './ui';
export function AppearanceSettings(){
 const {mode,colors:C,setMode,saving,error,ready}=useAppTheme();
 return <AppCard><Text accessibilityRole="header" style={{color:C.text,fontSize:20,fontWeight:'800'}}>Utseende</Text>
 <Text style={{color:C.textMuted,fontSize:15,lineHeight:23}}>Välj ljust eller mörkt. System följer telefonens inställning.</Text>
 <View accessibilityRole="radiogroup" accessibilityLabel="Appens tema" style={{gap:8}}>{([['system','System'],['light','Ljust'],['dark','Mörkt']] as [ThemeMode,string][]).map(([value,label])=><Pressable key={value} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{checked:mode===value,disabled:!ready}} disabled={!ready} onPress={()=>void setMode(value)} style={{minHeight:48,borderRadius:14,padding:14,backgroundColor:mode===value?C.accentSubtle:C.elevated,borderWidth:1,borderColor:mode===value?C.accent:C.border,flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12}}><Text style={{color:C.text,fontSize:16,fontWeight:mode===value?'800':'500',flexShrink:1}}>{label}</Text><Text accessible={false} style={{color:C.accent,fontSize:18}}>{mode===value?'●':'○'}</Text></Pressable>)}</View>
 {saving?<Text accessibilityLiveRegion="polite" style={{color:C.textMuted}}>Sparar utseende…</Text>:null}
 {error?<Text accessibilityRole="alert" style={{color:C.danger}}>{error}</Text>:null}
 </AppCard>;
}
