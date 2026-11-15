import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {UserRound,ArrowLeft,Leaf} from 'lucide-react-native';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';
import type {Tab} from '../hooks/useSessionNavigation';
export type ScreenTab=Tab;
const title:Record<ScreenTab,string>={home:'Ett steg i taget',plan:'Din plan',register:'Registrera',stats:'Din utveckling',profile:'Min profil',account:'Mitt konto',sos:'Hantera röksug',history:'Din logg',benefits:'Dina framsteg',settings:'Inställningar',backup:'Data och synkronisering',journey:'Min rökstoppsresa',about:'Om Smoke Less','plan-settings':'Anpassa min plan'};
const primaryTabs=['home','plan','register','stats','profile'];
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
export function ScreenHeader({tab,clock,onNavigate,onBack}:{tab:ScreenTab;clock:number;onNavigate:(tab:ScreenTab)=>void;onBack?:()=>void}){
 const C=useThemeColors(); const styles=useThemeStyles(createStyles);

 const isPrimary=primaryTabs.includes(tab);
 return <View style={styles.container}>
  <View style={styles.brandRow}><View style={styles.brand}><Leaf color={C.accent} size={19}/><Label>SMOKE LESS</Label></View><Pressable accessibilityRole="button" accessibilityLabel={isPrimary?'Öppna min profil':'Tillbaka'} accessibilityHint={isPrimary?'Visar din profil och dina inställningar':'Återgår till föregående vy'} onPress={()=>{if(isPrimary)onNavigate('profile');else if(onBack)onBack();else onNavigate('home');}} style={styles.avatar}>{isPrimary?<UserRound size={21} color={C.text}/>:<ArrowLeft size={21} color={C.text}/>}</Pressable></View>
  <View style={styles.textColumn}><Text accessibilityRole="header" style={[styles.title,tab==='home'&&styles.homeTitle]}>{tab==='home'?'Din dag, din takt.':title[tab]}</Text><Text style={styles.muted}>{tab==='home'?date(new Date(clock)):tab==='profile'?'Din resa, dina inställningar.':tab==='account'?'Inloggning och kontosäkerhet.':tab==='backup'?'Din historik, synkad mellan dina enheter.':'Ett steg i taget.'}</Text></View>
 </View>;
}
function Label({children}:{children:React.ReactNode}){
 const styles=useThemeStyles(createStyles);
return <Text style={styles.eyebrow}>{children}</Text>}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 container:{gap:20,paddingBottom:4},brandRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:16},brand:{flexDirection:'row',alignItems:'center',gap:8},
 textColumn:{flex:1,flexShrink:1,minWidth:0,gap:7},
 eyebrow:{fontSize:11,color:C.muted,fontWeight:'800',letterSpacing:1.7},
 title:{fontSize:34,fontWeight:'700',letterSpacing:-1.2,color:C.text,flexShrink:1},homeTitle:{fontSize:36},
 muted:{fontSize:15,color:C.muted,lineHeight:23},
 avatar:{flexShrink:0,width:48,height:48,borderRadius:24,borderWidth:1,borderColor:C.border,backgroundColor:C.surface,alignItems:'center',justifyContent:'center'}
});
