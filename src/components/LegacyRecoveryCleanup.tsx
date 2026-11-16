import React,{useEffect,useRef,useState} from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {ConfirmationDialog} from './ConfirmationDialog';
import {useConfirmationDialog} from '../hooks/useConfirmationDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {listLegacyRecoveryCopies,removeLegacyRecoveryCopies} from '../localRecoveryCopies';
import {useThemeStyles,type ThemeColors} from '../theme';
export function LegacyRecoveryCleanup(){
 const s=useThemeStyles(createS);
 const {dialog,setDialog,ask}=useConfirmationDialog();

 const [count,setCount]=useState<number|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const active=useRef(true),lock=useRef(false);
 const read=()=>{void listLegacyRecoveryCopies(AsyncStorage).then(keys=>{if(active.current){setCount(keys.length);setMessage('');}}).catch(()=>{if(active.current)setMessage('Äldre återställningskopior kunde inte kontrolleras.');});};
 useEffect(()=>{active.current=true;read();return()=>{active.current=false;};},[]);
 const remove=async()=>{if(lock.current)return;lock.current=true;setBusy(true);try{await removeLegacyRecoveryCopies(AsyncStorage,true);if(active.current){setCount(0);setMessage('Äldre återställningskopior är borttagna. Aktuell historik är oförändrad.');}}catch{if(active.current)setMessage('Alla äldre kopior kunde inte tas bort. Försök igen.');}finally{lock.current=false;if(active.current)setBusy(false);}};
 if(count===0&&!message)return null;
 if(count===null&&!message)return null;
 return <><View style={s.card}>
  <Text accessibilityRole="header" style={s.title}>Äldre återställningskopior</Text>
  {count!==null&&count>0&&<><Text style={s.text}>{count} äldre kopior finns på enheten. De saknar kontomärkning och kan höra till flera konton eller gästläge. Du väljer själv om du vill ta bort dem.</Text><Text style={s.text}>Raderingen gäller alla sådana äldre kopior på den här enheten. Aktuell historik och nya kontomärkta kopior påverkas inte. Raderade kopior kan inte återställas.</Text><Pressable accessibilityRole="button" accessibilityState={{disabled:busy}} disabled={busy} style={s.button} onPress={()=>ask('Radera äldre återställningskopior?','Alla äldre omärkta återställningskopior på den här enheten tas bort permanent. De kan höra till flera konton eller gästläge. Aktuell historik och nya märkta kopior behålls.',()=>void remove(),'Radera äldre kopior')}><Text style={s.link}>{busy?'Vänta…':'Radera äldre återställningskopior'}</Text></Pressable></>}
  {message?<Text accessibilityLiveRegion="polite" style={s.text}>{message}</Text>:null}
  {message&&count!==0?<Pressable accessibilityRole="button" disabled={busy} onPress={read} style={s.button}><Text style={s.link}>Kontrollera igen</Text></Pressable>:null}
 </View><ConfirmationDialog dialog={dialog} onClose={()=>setDialog(null)}/></>;
}
const createS=(C:ThemeColors)=>StyleSheet.create({card:{gap:12,padding:18,borderRadius:16,borderWidth:1,borderColor:C.border,backgroundColor:C.surface},title:{fontSize:17,fontWeight:'800',color:C.white},text:{fontSize:14,lineHeight:21,color:C.dim},button:{minHeight:48,padding:12,justifyContent:'center'},link:{fontSize:14,fontWeight:'700',color:C.lime}});
