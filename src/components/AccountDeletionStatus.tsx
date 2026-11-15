import React from 'react';
import {ActivityIndicator,BackHandler,Pressable,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {useAccountDeletion} from '../hooks/useAccountDeletion';
import {C} from '../theme';
export function AccountDeletionStatus({deletion}:{deletion:ReturnType<typeof useAccountDeletion>}){
 const insets=useSafeAreaInsets(),{state}=deletion;
 return <View style={[s.screen,{paddingTop:Math.max(insets.top,24),paddingBottom:Math.max(insets.bottom,24)}]}>
  <Text accessibilityRole="header" style={s.heading}>{state.phase==='restart'?'Raderingen är slutförd':state.phase==='loading'?'Startar Smoke Less':'Kontoradering'}</Text>
  <Text accessibilityLiveRegion="polite" style={s.text}>{state.message}</Text>
  {state.phase==='loading'||state.phase==='working'?<ActivityIndicator color={C.lime}/>:null}
  {state.phase==='pending'?<><Pressable accessibilityRole="button" onPress={deletion.retry} style={s.button}><Text style={s.link}>{state.confirmed?'Slutför lokal städning':'Försök igen'}</Text></Pressable>{!state.confirmed&&<Pressable accessibilityRole="button" onPress={deletion.leaveForGuest} style={s.button}><Text style={s.link}>Logga ut och fortsätt som gäst</Text></Pressable>}</>:null}
  {state.phase==='restart'||state.phase==='error'?<Pressable accessibilityRole="button" onPress={()=>BackHandler.exitApp()} style={s.button}><Text style={s.link}>Stäng appen</Text></Pressable>:null}
 </View>;
}
const s=StyleSheet.create({screen:{flex:1,gap:20,justifyContent:'center',paddingHorizontal:24,backgroundColor:C.background},heading:{fontSize:24,fontWeight:'800',color:C.white},text:{fontSize:15,lineHeight:23,color:C.dim},button:{minHeight:48,padding:14,justifyContent:'center',borderRadius:14,backgroundColor:C.surface},link:{fontSize:15,fontWeight:'700',color:C.lime}});
