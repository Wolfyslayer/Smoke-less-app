import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {House,Target,PlusCircle,ChartColumn,UserRound} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';

export type MainTab='home'|'plan'|'register'|'stats'|'profile';
const nav=[{id:'home',label:'Hem',icon:House},{id:'plan',label:'Plan',icon:Target},{id:'register',label:'Registrera',icon:PlusCircle},{id:'stats',label:'Statistik',icon:ChartColumn},{id:'profile',label:'Profil',icon:UserRound}] as const;
export function BottomNavigation({tab,onNavigate}:{tab:string;onNavigate:(tab:MainTab)=>void}){
 const C=useThemeColors(); const styles=useThemeStyles(createStyles);

 const insets=useSafeAreaInsets();
 return <View style={[styles.nav,{paddingBottom:Math.max(insets.bottom,10),paddingLeft:Math.max(insets.left,8),paddingRight:Math.max(insets.right,8)}]}>{nav.map(item=><Pressable key={item.id} onPress={()=>onNavigate(item.id)} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{selected:tab===item.id}} style={[styles.navItem,tab===item.id&&{backgroundColor:C.accentSubtle}]}><item.icon size={23} strokeWidth={tab===item.id?2.6:1.8} color={tab===item.id?C.lime:C.dim}/><Text style={{textAlign:'center',flexShrink:1,fontSize:12,color:tab===item.id?C.lime:C.muted,fontWeight:tab===item.id?'800':'600'}}>{item.label}</Text></Pressable>)}</View>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 nav:{backgroundColor:C.surface,borderTopColor:C.border,borderTopWidth:1,paddingTop:8,flexDirection:'row',flexWrap:'wrap',gap:4},
 navItem:{flex:1,minWidth:56,paddingHorizontal:4,paddingVertical:10,borderRadius:18,alignItems:'center',justifyContent:'center',gap:6,minHeight:56}
});
