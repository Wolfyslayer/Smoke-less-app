import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {House,Target,PlusCircle,ChartColumn,UserRound} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {C} from '../theme';

export type MainTab='home'|'plan'|'register'|'stats'|'profile';
const nav=[{id:'home',label:'Hem',icon:House},{id:'plan',label:'Plan',icon:Target},{id:'register',label:'Registrera',icon:PlusCircle},{id:'stats',label:'Statistik',icon:ChartColumn},{id:'profile',label:'Profil',icon:UserRound}] as const;
export function BottomNavigation({tab,onNavigate}:{tab:string;onNavigate:(tab:MainTab)=>void}){
 const insets=useSafeAreaInsets();
 return <View style={[styles.nav,{paddingBottom:Math.max(insets.bottom,10)}]}>{nav.map(item=><Pressable key={item.id} onPress={()=>onNavigate(item.id)} accessibilityRole="tab" accessibilityState={{selected:tab===item.id}} style={styles.navItem}><item.icon size={23} strokeWidth={tab===item.id?2.6:1.8} color={tab===item.id?C.lime:C.dim}/><Text style={{fontSize:10,color:tab===item.id?C.lime:C.muted,fontWeight:tab===item.id?'800':'500'}}>{item.label}</Text></Pressable>)}</View>;
}
const styles=StyleSheet.create({
 nav:{backgroundColor:'#111214',borderTopColor:C.border,borderTopWidth:1,paddingTop:7,flexDirection:'row',paddingHorizontal:5},
 navItem:{flex:1,alignItems:'center',justifyContent:'center',gap:4,minHeight:45}
});
