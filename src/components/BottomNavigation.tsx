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
 return <View style={[styles.shell,{paddingBottom:Math.max(insets.bottom,10),paddingLeft:Math.max(insets.left,8),paddingRight:Math.max(insets.right,8)}]}><View style={styles.nav}>{nav.map(item=><Pressable key={item.id} onPress={()=>onNavigate(item.id)} accessibilityRole="tab" accessibilityLabel={item.label} accessibilityState={{selected:tab===item.id}} style={styles.navItem}><View style={[styles.icon,item.id==='register'&&styles.registerIcon,tab===item.id&&item.id!=='register'&&{backgroundColor:C.accentSubtle}]}><item.icon size={item.id==='register'?27:21} strokeWidth={tab===item.id?2.4:1.8} color={item.id==='register'?C.onAccent:tab===item.id?C.accent:C.dim}/></View><Text style={{textAlign:'center',flexShrink:1,fontSize:11,color:tab===item.id?C.accent:C.muted,fontWeight:tab===item.id?'800':'500'}}>{item.label}</Text></Pressable>)}</View></View>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 shell:{backgroundColor:C.background,paddingTop:8},nav:{width:'100%',maxWidth:680,alignSelf:'center',backgroundColor:C.surface,padding:8,borderRadius:30,flexDirection:'row',flexWrap:'wrap',gap:2,shadowColor:C.text,shadowOffset:{width:0,height:3},shadowOpacity:.06,shadowRadius:16,elevation:3},
 navItem:{flex:1,minWidth:56,paddingHorizontal:2,paddingVertical:4,alignItems:'center',justifyContent:'center',gap:5,minHeight:60},icon:{width:42,height:36,borderRadius:18,alignItems:'center',justifyContent:'center'},registerIcon:{height:42,width:42,borderRadius:21,backgroundColor:C.accent}
});
