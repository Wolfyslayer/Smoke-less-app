import React from 'react';
import {Pressable,StyleSheet,Text,View} from 'react-native';
import {Clock,Trash2} from 'lucide-react-native';
import {C} from '../theme';
import {dayKey,type Cigarette} from '../domain';

type Props={
 todayCount:number;goal:number;duration:string;sorted:Cigarette[];today:string;
 last:Cigarette|undefined;onOpenRegister:()=>void;onOpenHistory:()=>void;onRemove:(id:string)=>void;
};
function Button({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
 return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({pressed})=>[styles.button,secondary&&styles.buttonSecondary,(pressed||disabled)&&{opacity:disabled?.4:.8}]}><Text style={[styles.buttonText,secondary&&{color:C.white}]}>{title}</Text></Pressable>;
}
export function RegisterScreen({todayCount,goal,duration,sorted,today,last,onOpenRegister,onOpenHistory,onRemove}:Props){
 return <View style={styles.screen}>
  <View style={[styles.card,{alignItems:'center',gap:15,paddingVertical:35,borderColor:'#425C29'}]}>
   <Text style={styles.label}>REGISTRERADE IDAG</Text>
   <Text style={[styles.heroNumber,{fontSize:76}]}>{todayCount}</Text>
   <View><Text style={styles.muted}>Dagens riktvärde: {goal}</Text></View>
   <View style={{width:'100%'}}><Button title="+ Registrera cigarett" onPress={onOpenRegister}/></View>
  </View>
  <View style={styles.card}><Text style={styles.label}>SENASTE CIGARETTEN</Text><Text style={styles.statValue}>{duration}</Text></View>
  <View style={styles.sectionRow}><Text style={styles.heading}>Dagens historik</Text><Pressable accessibilityRole="button" onPress={onOpenHistory}><Text style={styles.link}>Visa alla</Text></Pressable></View>
  {sorted.filter(e=>dayKey(new Date(e.at))===today).slice(0,10).map(e=><View key={e.id} style={[styles.card,styles.inline]}>
   <Clock size={19} color={C.lime}/>
   <Text style={[styles.cardTitle,{flex:1}]}>{new Date(e.at).toLocaleTimeString('sv-SE',{hour:'2-digit',minute:'2-digit'})}</Text>
   <Pressable accessibilityRole="button" accessibilityLabel="Ta bort registrering" onPress={()=>onRemove(e.id)}><Trash2 color={C.danger} size={20}/></Pressable>
  </View>)}
  <Button title="Ångra senaste registreringen" secondary disabled={!last} onPress={()=>last&&onRemove(last.id)}/>
 </View>;
}
const styles=StyleSheet.create({
 screen:{gap:20},card:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border,borderRadius:20,padding:17},
 label:{fontSize:11,fontWeight:'800',letterSpacing:1.5,color:C.lime},
 heroNumber:{fontSize:48,fontWeight:'900',color:C.white},
 statValue:{fontSize:26,fontWeight:'800',color:C.white},
 muted:{fontSize:13,lineHeight:19,color:C.dim},
 sectionRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
 heading:{fontSize:19,fontWeight:'800',color:C.white},link:{color:C.lime,fontSize:13,fontWeight:'700'},
 inline:{flexDirection:'row',alignItems:'center',gap:14},cardTitle:{fontSize:16,fontWeight:'800',color:C.white},
 button:{backgroundColor:C.lime,borderRadius:14,minHeight:49,alignItems:'center',justifyContent:'center',paddingHorizontal:14},
 buttonSecondary:{backgroundColor:C.soft},buttonText:{fontWeight:'800',color:C.background,fontSize:14},
});
