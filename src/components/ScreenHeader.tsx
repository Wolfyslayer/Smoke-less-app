import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {UserRound,ArrowLeft,Leaf,Target,PlusCircle,ChartColumn,Bell,Settings} from 'lucide-react-native';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';
import {JourneyLandscape} from './JourneyLandscape';
import {BrandMark} from './BrandMark';
import type {Tab} from '../hooks/useSessionNavigation';
export type ScreenTab=Tab;
const titles:Record<Tab,string>={home:'Smoke Less',plan:'Min plan',register:'Registrera',stats:'Statistik',profile:'Profil',account:'Mitt konto',sos:'SOS – Jag är röksugen',history:'Historik',benefits:'Kunskap och stöd',settings:'Appinställningar',backup:'Data och synkronisering',journey:'Min rökstoppsresa',about:'Om Smoke Less','plan-settings':'Anpassa min plan'};
const subtitles:Partial<Record<Tab,string>>={home:'Din väg till ett rökfritt liv',plan:'Din personliga rökstoppsplan',register:'Följ dina registreringar',stats:'Följ din utveckling över tid',profile:'Ditt konto, din data och dina inställningar',sos:'Stöd när röksuget kommer',settings:'Anpassa Smoke Less efter dig'};
const primary=['home','plan','register','stats','profile'];
export function ScreenHeader({tab,clock,onNavigate,onBack}:{tab:Tab;clock:number;onNavigate:(tab:Tab)=>void;onBack?:()=>void}){
 const C=useThemeColors(),s=useThemeStyles(createStyles),isPrimary=primary.includes(tab);
 const opensSettings=tab==='home'||tab==='profile';
 const Icon=tab==='plan'?Target:tab==='register'?PlusCircle:tab==='stats'?ChartColumn:tab==='profile'?UserRound:Leaf;
 return <View style={s.container}><View style={s.row}>
  {isPrimary?<View style={s.brandIcon}>{tab==='home'?<BrandMark size={32}/>:<Icon size={27} color={C.accent}/>}</View>:<Pressable accessibilityRole="button" accessibilityLabel="Tillbaka" onPress={()=>{if(onBack)onBack();else onNavigate('home');}} style={s.back}><ArrowLeft size={23} color={C.text}/></Pressable>}
  <View style={{flex:1,minWidth:0,gap:3}}><Text accessibilityRole="header" style={s.title}>{titles[tab]}</Text><Text style={s.subtitle}>{subtitles[tab]??'Ett steg i taget, i din takt.'}</Text></View>
  <Pressable accessibilityRole="button" accessibilityLabel={opensSettings?'Öppna appinställningar':'Öppna min profil'} onPress={()=>onNavigate(opensSettings?'settings':'profile')} style={s.action}>{tab==='home'?<Bell size={21} color={C.text}/>:tab==='profile'?<Settings size={21} color={C.text}/>:<UserRound size={21} color={C.text}/>}</Pressable>
 </View>{tab==='home'?<View style={s.welcome}><JourneyLandscape/><View style={{gap:5,padding:16}}><Text accessibilityRole="header" style={s.greeting}>Hej igen!</Text><Text style={s.encouragement}>Varje liten förändring räknas.</Text><Text style={s.date}>{new Date(clock).toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'long'})}</Text></View></View>:null}</View>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({container:{gap:14},row:{flexDirection:'row',alignItems:'center',gap:10},brandIcon:{width:34,alignItems:'center'},back:{width:48,height:48,alignItems:'center',justifyContent:'center'},title:{fontSize:20,fontWeight:'800',color:C.text,flexShrink:1},subtitle:{fontSize:12,lineHeight:17,color:C.textMuted},action:{width:48,height:48,borderRadius:24,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,alignItems:'center',justifyContent:'center'},welcome:{minHeight:120,overflow:'hidden',borderRadius:16,borderWidth:1,borderColor:C.border,justifyContent:'center'},greeting:{fontSize:26,fontWeight:'800',color:C.text},encouragement:{fontSize:14,color:C.text},date:{fontSize:12,color:C.textMuted,marginTop:3}});
