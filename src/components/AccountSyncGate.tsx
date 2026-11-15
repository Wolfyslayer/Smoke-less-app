import React,{useState} from 'react';
import {ActivityIndicator,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {CloudOff,ChevronDown,ChevronUp,ShieldCheck} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useThemeColors,useThemeStyles,type ThemeColors} from '../theme';
import type {SyncPhase} from '../hooks/useCloudSync';

/** Presentation only; account authority remains in the session and sync hooks. */
export function AccountSyncGate({phase:syncPhase,message:syncStatus,onRetry}:{phase:SyncPhase;message:string;onRetry:()=>void}){
 const C=useThemeColors(),s=useThemeStyles(createStyles),insets=useSafeAreaInsets();
 const [showSyncDetails,setShowSyncDetails]=useState(false);
  const syncing=syncPhase==='idle'||syncPhase==='syncing';
  return <ScrollView style={s.root} contentContainerStyle={{flexGrow:1,justifyContent:'center',paddingHorizontal:24,paddingTop:Math.max(insets.top,24),paddingBottom:Math.max(insets.bottom,24)}}>
   <View style={s.errorCard}>
    <View style={s.errorIcon}><CloudOff color={C.lime} size={30}/></View>
    <Text style={s.errorTitle}>{syncing?'Hämtar dina uppgifter…':'Vi kunde inte hämta dina uppgifter'}</Text>
    <Text style={s.errorDescription}>{syncing?'Vi kontrollerar din sparade plan och historik. Det kan ta en liten stund.':'Anslutningen till ditt konto fungerade inte som väntat. Försök igen om en stund.'}</Text>
    {syncing?<ActivityIndicator color={C.lime} size="large"/>:<Pressable accessibilityRole="button" onPress={()=>{setShowSyncDetails(false);onRetry();}} style={s.errorButton}><Text style={s.errorButtonText}>Försök igen</Text></Pressable>}
    <View style={s.safeRow}><ShieldCheck size={18} color={C.success}/><Text style={s.safeText}>Din sparade historik skrivs inte över.</Text></View>
    {!syncing?<><Pressable accessibilityRole="button" accessibilityState={{expanded:showSyncDetails}} onPress={()=>setShowSyncDetails(v=>!v)} style={s.detailsButton}><Text style={s.detailsText}>{showSyncDetails?'Dölj anslutningsstatus':'Visa anslutningsstatus'}</Text>{showSyncDetails?<ChevronUp size={16} color={C.muted}/>:<ChevronDown size={16} color={C.muted}/>}</Pressable>{showSyncDetails?<Text selectable style={s.technicalError}>{syncStatus}</Text>:null}</>:null}
   </View>
  </ScrollView>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({errorCard:{backgroundColor:C.surface,borderColor:C.border,borderWidth:1,borderRadius:28,padding:26,alignItems:'center',gap:18},errorIcon:{width:68,height:68,borderRadius:22,backgroundColor:C.limeSoft,alignItems:'center',justifyContent:'center'},errorTitle:{color:C.white,fontSize:23,fontWeight:'900',textAlign:'center',lineHeight:30},errorDescription:{color:C.muted,fontSize:15,lineHeight:23,textAlign:'center'},errorButton:{backgroundColor:C.lime,borderRadius:16,paddingVertical:16,paddingHorizontal:28,alignItems:'center',alignSelf:'stretch'},errorButtonText:{color:C.onAccent,fontSize:16,fontWeight:'900'},safeRow:{flexDirection:'row',alignItems:'center',gap:8},safeText:{color:C.success,fontSize:12,flexShrink:1},detailsButton:{minHeight:48,flexDirection:'row',alignItems:'center',gap:8,padding:8},detailsText:{color:C.muted,fontSize:15,fontWeight:'700'},technicalError:{color:C.dim,fontSize:12,lineHeight:18,backgroundColor:C.elevated,borderRadius:12,padding:12,alignSelf:'stretch'},root:{flex:1,backgroundColor:C.background}});
