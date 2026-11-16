import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {UserRound,Target,Settings,Cloud,Info,ChevronRight,Heart} from 'lucide-react-native';
import {profileCategories} from '../profileCategories';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';
import type {Tab} from '../hooks/useSessionNavigation';
import type {Profile} from '../domain';
type Props={accountEmail:string|null;onNavigate:(tab:Tab)=>void;profile?:Profile;todayCount?:number;dailyGoal?:number};
const icons={account:UserRound,journey:Target,settings:Settings,data:Cloud,about:Info};
export function ProfileOverview({accountEmail,onNavigate}:Props){
 const C=useThemeColors(),s=useThemeStyles(createStyles);
 const signedIn=accountEmail!==null;
 return <View style={s.screen}>
  <View style={s.identity}><View style={s.avatar}><UserRound size={28} color={C.accent}/></View><View style={{flex:1,gap:5}}><Text accessibilityRole="header" style={s.title}>{signedIn?'Ditt konto':'Din personliga resa'}</Text><Text selectable style={s.description}>{signedIn?(accountEmail||'Inloggad'):'Gästläge · sparat på den här enheten'}</Text></View></View>
  <View style={s.group}>{profileCategories.map(category=>{const Icon=icons[category.id as keyof typeof icons];return <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={category.title} accessibilityHint={category.description} onPress={()=>onNavigate(category.destination)} style={({pressed})=>[s.row,pressed&&{backgroundColor:C.elevated}]}><View style={s.icon}><Icon size={22} color={C.accent}/></View><View style={{flex:1,minWidth:0,gap:5}}><Text style={s.rowTitle}>{category.title}</Text><Text style={s.description}>{category.description}</Text></View><ChevronRight size={18} color={C.textSecondary}/></Pressable>;})}</View>
  <Pressable accessibilityRole="button" accessibilityLabel="Öppna SOS-stöd" onPress={()=>onNavigate('sos')} style={s.support}><Heart size={21} color={C.accent}/><View style={{flex:1,gap:4}}><Text style={s.rowTitle}>Behöver du stöd just nu?</Text><Text style={s.description}>Öppna SOS direkt</Text></View><ChevronRight size={18} color={C.accent}/></Pressable>
 </View>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({screen:{gap:16},identity:{flexDirection:'row',gap:16,alignItems:'center',paddingVertical:8},avatar:{width:48,height:48,borderRadius:16,backgroundColor:C.accentSubtle,alignItems:'center',justifyContent:'center'},title:{fontSize:20,fontWeight:'700',color:C.text,flexShrink:1},description:{fontSize:14,lineHeight:21,color:C.textMuted,flexShrink:1},group:{backgroundColor:C.surface,borderRadius:16,overflow:'hidden'},row:{minHeight:72,flexDirection:'row',alignItems:'center',gap:12,padding:14,borderBottomWidth:StyleSheet.hairlineWidth,borderBottomColor:C.border},icon:{width:42,height:42,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:C.accentSubtle},rowTitle:{fontSize:16,fontWeight:'700',color:C.text,flexShrink:1},support:{minHeight:76,flexDirection:'row',alignItems:'center',gap:14,padding:18,borderRadius:16,backgroundColor:C.accentSubtle}});
