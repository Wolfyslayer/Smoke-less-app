import React,{useEffect,useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppButton} from './ui';
import {C} from '../theme';
export function CigaretteRegisterModal({visible,feeling,onFeelingChange,cigTrigger,onTriggerChange,onClose,onRegister,onSkip}:{
 visible:boolean;feeling:string|null;onFeelingChange:(value:string|null)=>void;
 cigTrigger:string|null;onTriggerChange:(value:string|null)=>void;
 onClose:()=>void;onRegister:()=>void;onSkip:()=>void;
}){
 const insets=useSafeAreaInsets();
 const [confirmClose,setConfirmClose]=useState(false);
 useEffect(()=>{if(!visible)setConfirmClose(false);},[visible]);
 const requestClose=()=>{
  if(!feeling&&!cigTrigger){onClose();return;}
  setConfirmClose(true);
 };
 const discard=()=>{setConfirmClose(false);onClose();};
 return <Modal visible={visible} transparent animationType="slide" onRequestClose={()=>{if(confirmClose){setConfirmClose(false);return;}requestClose();}}><View style={styles.overlay}><Pressable style={{flex:1}} onPress={requestClose}/><View style={[styles.sheet,{paddingBottom:Math.max(insets.bottom,22)}]}><View style={styles.header}><Text style={styles.title}>Vad fick dig att röka?</Text><Pressable accessibilityRole="button" accessibilityLabel="Stäng registreringen" onPress={requestClose} style={styles.closeButton}><Text style={styles.close}>✕</Text></Pressable></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{gap:18}}><Text style={styles.section}>Hur känner du dig?</Text><View style={styles.grid}>{([['😌','Lugn'],['😟','Stressad'],['😢','Ledsen'],['😠','Irriterad'],['😐','Uttråkad'],['😰','Orolig']] as const).map(([emoji,label])=><Pressable key={label} onPress={()=>onFeelingChange(feeling===label?null:label)} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected:feeling===label}} style={[styles.emotion,feeling===label&&styles.selected]}><Text style={{fontSize:30}}>{emoji}</Text><Text style={styles.option}>{label}</Text></Pressable>)}</View><Text style={styles.section}>Vad utlöste det?</Text><Text style={styles.hint}>Valfritt – du kan hoppa över detta.</Text><View style={styles.grid}>{['Stress','Kaffe','Alkohol','Efter mat','Uttråkning','Socialt','Vana','Röksug','Arbete','Annat'].map(label=><Pressable key={label} onPress={()=>onTriggerChange(cigTrigger===label?null:label)} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{selected:cigTrigger===label}} style={[styles.trigger,cigTrigger===label&&styles.selected]}><Text style={styles.option}>{label}</Text></Pressable>)}</View><AppButton title="Registrera cigarett" onPress={onRegister}/><AppButton title="Hoppa över frågorna" secondary onPress={onSkip}/></ScrollView></View>{confirmClose?<View style={styles.confirmOverlay} accessibilityViewIsModal><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.confirmScroll,{paddingTop:Math.max(insets.top,20),paddingBottom:Math.max(insets.bottom,20)}]}><View style={styles.confirmCard}><Text accessibilityRole="header" style={styles.confirmTitle}>Avbryt registreringen?</Text><Text style={styles.confirmMessage}>Dina val för känsla och utlösande faktor kommer inte att sparas.</Text><AppButton title="Fortsätt registrera" secondary onPress={()=>setConfirmClose(false)}/><AppButton title="Avbryt registreringen" onPress={discard}/></View></ScrollView></View>:null}</View></Modal>;
}
const styles=StyleSheet.create({
 confirmOverlay:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(0,0,0,.8)'},
 confirmScroll:{flexGrow:1,justifyContent:'center',paddingHorizontal:20},
 confirmCard:{backgroundColor:C.surface,borderRadius:22,borderWidth:1,borderColor:C.border,padding:20,gap:14},
 confirmTitle:{color:C.white,fontSize:21,fontWeight:'800'},
 confirmMessage:{color:C.muted,fontSize:15,lineHeight:22},
 overlay:{flex:1,justifyContent:'flex-end',backgroundColor:'rgba(0,0,0,.72)'},
 sheet:{backgroundColor:'#221F1E',borderTopLeftRadius:30,borderTopRightRadius:30,paddingHorizontal:20,paddingTop:18,maxHeight:'88%',gap:12},
 header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},
 title:{fontSize:21,fontWeight:'800',color:'#FFF',flexShrink:1},
 closeButton:{minWidth:48,minHeight:48,alignItems:'center',justifyContent:'center'},
 close:{color:'#AAA',fontSize:26},
 section:{fontSize:17,fontWeight:'800',color:'#FFF'},
 hint:{fontSize:14,color:'#A6A1A0',lineHeight:21},
 grid:{flexDirection:'row',flexWrap:'wrap',gap:10},
 emotion:{width:'30%',flexGrow:1,minHeight:76,borderRadius:15,backgroundColor:'#302C2A',borderWidth:1,borderColor:'#403B39',alignItems:'center',justifyContent:'center',gap:7},
 option:{color:'#F5F4F2',fontSize:14,fontWeight:'700',textAlign:'center'},
 selected:{borderColor:C.lime,backgroundColor:'#384024'},
 trigger:{width:'47%',flexGrow:1,minHeight:50,borderRadius:14,backgroundColor:'#302C2A',borderWidth:1,borderColor:'#403B39',alignItems:'center',justifyContent:'center',padding:12}
});
