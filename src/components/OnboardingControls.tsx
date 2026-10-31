import React from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Check} from 'lucide-react-native';
import {C} from '../theme';

export function OnboardingField({label,value,onChange,keyboardType='numeric'}:{label:string;value:string;onChange:(v:string)=>void;keyboardType?:'numeric'|'default'}){
 return <View style={{gap:8}}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} keyboardType={keyboardType} value={value} onChangeText={onChange} placeholderTextColor={C.dim} style={styles.input}/></View>;
}
export function OnboardingChoice({title,subtitle,selected,onPress}:{title:string;subtitle?:string;selected:boolean;onPress:()=>void}){
 return <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{selected}} style={[styles.choice,selected&&{borderColor:C.lime,backgroundColor:C.limeSoft}]}><View style={{flex:1,gap:5}}><Text style={styles.choiceTitle}>{title}</Text>{subtitle?<Text style={styles.muted}>{subtitle}</Text>:null}</View>{selected?<Check size={20} color={C.lime}/>:<View style={styles.radio}/>}</Pressable>;
}
const styles=StyleSheet.create({
 fieldLabel:{color:C.white,fontSize:14,fontWeight:'700'},
 input:{backgroundColor:C.elevated,borderRadius:15,borderWidth:1,borderColor:C.border,color:C.white,fontSize:17,padding:15},
 choice:{backgroundColor:C.surface,borderWidth:1,borderColor:C.border,padding:14,borderRadius:16,flexDirection:'row',alignItems:'center',gap:10},
 choiceTitle:{color:C.white,fontSize:15,fontWeight:'800'},
 muted:{fontSize:13,color:C.muted,lineHeight:20},
 radio:{width:20,height:20,borderRadius:10,borderWidth:2,borderColor:C.dim}
});
