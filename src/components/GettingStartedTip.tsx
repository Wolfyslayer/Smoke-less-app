import React,{useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createLocalPreferences} from '../localPreferences';
import {useLocalPreferences} from '../hooks/useLocalPreferences';
import {guidanceText,normalizeGuidance,type GuidanceId} from '../domain/gettingStarted';
import {useThemeStyles,type ThemeColors} from '../theme';
const store=createLocalPreferences('guidance',AsyncStorage,normalizeGuidance);
export function GettingStartedTip({uid,id}:{uid:string|null;id:GuidanceId}){
 const s=useThemeStyles(createS);

 const prefs=useLocalPreferences(store,uid),[open,setOpen]=useState(false);
 const dismiss=()=>prefs.update({version:1,dismissed:[...new Set([...prefs.value.dismissed,id])]});
 if(prefs.error)return <View style={s.box}><Text accessibilityRole="alert" style={s.text}>{prefs.error}</Text><Pressable accessibilityRole="button" onPress={prefs.ready?dismiss:prefs.retry} style={s.button}><Text style={s.link}>Försök igen</Text></Pressable></View>;
 if(!prefs.ready||prefs.value.dismissed.includes(id))return null;
 return <View style={s.box}>
  <Pressable accessibilityRole="button" accessibilityState={{expanded:open}} onPress={()=>setOpen(v=>!v)} style={s.button}><Text style={s.link}>{open?'Stäng tipset':guidanceText[id].title}</Text></Pressable>
  {open&&<><Text style={s.text}>{guidanceText[id].text}</Text><Pressable accessibilityRole="button" onPress={dismiss} style={s.button}><Text style={s.link}>Visa inte det här tipset igen</Text></Pressable></>}
 </View>;
}
const createS=(C:ThemeColors)=>StyleSheet.create({box:{gap:8,padding:12,borderWidth:1,borderColor:C.border,borderRadius:16},button:{minHeight:48,justifyContent:'center',padding:8},link:{color:C.lime,fontSize:14,fontWeight:'700'},text:{color:C.dim,fontSize:14,lineHeight:21}});
