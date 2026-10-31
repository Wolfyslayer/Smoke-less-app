import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {UserRound,ArrowLeft} from 'lucide-react-native';
import {C} from '../theme';
export type ScreenTab='home'|'plan'|'register'|'stats'|'profile'|'account'|'sos'|'history'|'benefits'|'settings';
const title:Record<ScreenTab,string>={home:'Din resa börjar här.',plan:'Din plan.',register:'Registrera.',stats:'Din utveckling.',profile:'Min profil.',account:'Mitt konto.',sos:'Hantera röksug.',history:'Din logg.',benefits:'Dina framsteg.',settings:'Inställningar.'};
const primaryTabs=['home','plan','register','stats','profile'];
const date=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
export function ScreenHeader({tab,clock,onNavigate}:{tab:ScreenTab;clock:number;onNavigate:(tab:ScreenTab)=>void}){
 return <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><View style={{flex:1,gap:7}}><Label>{tab==='home'?(new Date(clock).getHours()<11?'GOD MORGON':new Date(clock).getHours()<17?'GOD EFTERMIDDAG':'GOD KVÄLL'):'SMOKE LESS / 06'}</Label><Text style={styles.title}>{title[tab]}</Text><Text style={styles.muted}>{tab==='home'?date(new Date(clock)):tab==='profile'?'Din resa, dina inställningar.':tab==='account'?'Inloggning och säkerhetskopiering.':'Ett steg i taget.'}</Text></View><Pressable onPress={()=>onNavigate(primaryTabs.includes(tab)?'profile':'home')} style={styles.avatar}>{primaryTabs.includes(tab)?<UserRound size={22} color={C.lime}/>:<ArrowLeft size={22} color={C.lime}/>}</Pressable></View>;
}
function Label({children}:{children:React.ReactNode}){return <Text style={styles.eyebrow}>{children}</Text>}
const styles=StyleSheet.create({
 eyebrow:{fontSize:11,color:C.muted,fontWeight:'800',letterSpacing:1.7},
 title:{fontSize:26,fontWeight:'900',letterSpacing:-1,color:C.white},
 muted:{fontSize:13,color:C.muted,lineHeight:20},
 avatar:{width:40,height:40,borderRadius:13,backgroundColor:C.elevated,alignItems:'center',justifyContent:'center'}
});
