import React,{useEffect,useState} from 'react';
import {Modal,Pressable,ScrollView,StyleSheet,Text,View,useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {C} from '../theme';

type Props={visible:boolean;value:Date|null;onCancel:()=>void;onConfirm:(date:Date)=>void;title?:string};
const pretty=(d:Date)=>d.toLocaleDateString('sv-SE',{day:'numeric',month:'long',year:'numeric'});
export function CompactDateModal({visible,value,onCancel,onConfirm,title='Välj stoppdatum'}:Props){
 const {width}=useWindowDimensions();
 const insets=useSafeAreaInsets();
 const [chosen,setChosen]=useState<Date|null>(value);
 const [month,setMonth]=useState(new Date().getMonth());
 const [year,setYear]=useState(new Date().getFullYear());
 useEffect(()=>{if(!visible)return;const now=new Date();const initial=value&&value.getTime()>now.getTime()?value:now;setChosen(value&&value.getTime()>now.getTime()?value:null);setMonth(initial.getMonth());setYear(initial.getFullYear());},[visible,value]);
 const first=(new Date(year,month,1).getDay()+6)%7;
 const days=new Date(year,month+1,0).getDate();
 const today=new Date();today.setHours(0,0,0,0);
 const move=(delta:number)=>{const next=new Date(year,month+delta,1);setYear(next.getFullYear());setMonth(next.getMonth());};
 const size=Math.min(Math.max(width-32,0),400);
 const daySize=Math.min(48,Math.max(0,(size-32)/7));
 return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} accessibilityViewIsModal>
  <View style={s.backdrop}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.scrollContent,{paddingTop:Math.max(insets.top,16),paddingBottom:Math.max(insets.bottom,16)}]}><View style={[s.panel,{width:size}]}>
   <Text accessibilityRole="header" style={s.title}>{title}</Text>
   <View style={s.nav}>
    <Pressable accessibilityRole="button" accessibilityLabel="Föregående månad" style={s.navButton} onPress={()=>move(-1)}><Text style={s.arrow}>‹</Text></Pressable>
    <Text style={s.month}>{new Date(year,month,1).toLocaleDateString('sv-SE',{month:'long',year:'numeric'})}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Nästa månad" style={s.navButton} onPress={()=>move(1)}><Text style={s.arrow}>›</Text></Pressable>
   </View>
   <View style={s.grid}>
    {['M','T','O','T','F','L','S'].map((label,i)=><View key={'week'+i} style={s.cell}><Text style={s.weekday}>{label}</Text></View>)}
    {Array.from({length:first},(_,i)=><View key={'empty'+i} style={s.cell}/>)}
    {Array.from({length:days},(_,i)=>{const day=i+1;const date=new Date(year,month,day,12);const disabled=date.getTime()<=today.getTime();const selected=chosen?.getFullYear()===year&&chosen?.getMonth()===month&&chosen?.getDate()===day;return <View key={day} style={s.cell}><Pressable accessibilityRole="button" accessibilityLabel={pretty(date)} accessibilityState={{selected,disabled}} disabled={disabled} onPress={()=>setChosen(date)} style={[s.day,{width:daySize,height:daySize,borderRadius:daySize/2},selected&&s.selected]}><Text style={[s.dayText,disabled&&s.disabled,selected&&s.selectedText]}>{day}</Text></Pressable></View>})}
   </View>
   <Text style={s.summary}>{chosen?'Valt: '+pretty(chosen):'Välj ett framtida datum'}</Text>
   <View style={s.actions}>
    <Pressable accessibilityRole="button" onPress={onCancel} style={s.secondary}><Text style={s.secondaryText}>Avbryt</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityState={{disabled:!chosen}} disabled={!chosen} onPress={()=>{if(chosen)onConfirm(chosen);}} style={[s.primary,!chosen&&{opacity:.45}]}><Text style={s.primaryText}>Välj datum</Text></Pressable>
   </View>
  </View></ScrollView></View>
 </Modal>;
}
const s=StyleSheet.create({
 backdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.72)'},
 scrollContent:{flexGrow:1,alignItems:'center',justifyContent:'center',paddingHorizontal:16},
 panel:{backgroundColor:C.surface,borderColor:C.border,borderWidth:1,borderRadius:22,padding:16,gap:12},
 title:{fontSize:19,fontWeight:'900',color:C.white,textAlign:'center'},
 nav:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 navButton:{width:48,height:48,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:C.elevated},
 arrow:{fontSize:27,color:C.white,lineHeight:32},
 month:{color:C.white,fontWeight:'800',fontSize:15,textTransform:'capitalize'},
 grid:{flexDirection:'row',flexWrap:'wrap'},
 cell:{width:'14.285714%',minHeight:48,alignItems:'center',justifyContent:'center'},
 weekday:{fontSize:12,color:C.muted,fontWeight:'800'},
 day:{alignItems:'center',justifyContent:'center'},
 dayText:{fontSize:14,color:C.white},
 disabled:{color:C.dim,opacity:.45},
 selected:{backgroundColor:C.lime},
 selectedText:{color:C.background,fontWeight:'900'},
 summary:{fontSize:13,color:C.muted,textAlign:'center'},
 actions:{flexDirection:'row',gap:10},
 secondary:{flex:1,minHeight:48,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:C.elevated},
 secondaryText:{color:C.white,fontWeight:'800'},
 primary:{flex:1,minHeight:48,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:C.lime},
 primaryText:{color:C.background,fontWeight:'900'}
});
