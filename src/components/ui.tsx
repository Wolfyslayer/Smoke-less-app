import React from 'react';
import {Pressable,StyleSheet,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {C} from '../theme';

type CardProps={children:React.ReactNode;style?:StyleProp<ViewStyle>;tone?:'surface'|'elevated'};
export function AppCard({children,style,tone='surface'}:CardProps){
 return <View style={[styles.card,tone==='elevated'&&styles.elevated,style]}>{children}</View>;
}
type ButtonProps={title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;secondaryTone?:'soft'|'elevated'};
export function AppButton({title,onPress,secondary=false,disabled=false,secondaryTone='elevated'}:ButtonProps){
 return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.button,secondary&&(secondaryTone==='soft'?styles.secondarySoft:styles.secondaryElevated),pressed&&{opacity:.8},disabled&&{opacity:.4}]}>
  <Text style={[styles.buttonText,secondary&&styles.secondaryText]}>{title}</Text>
 </Pressable>;
}
const styles=StyleSheet.create({
 card:{backgroundColor:C.surface,borderRadius:20,padding:15,borderWidth:1,borderColor:C.border,gap:9},
 elevated:{backgroundColor:C.elevated,padding:17,gap:8},
 button:{backgroundColor:C.lime,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},
 secondaryElevated:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},
 secondarySoft:{backgroundColor:C.soft},
 buttonText:{color:C.background,fontWeight:'900',fontSize:15},
 secondaryText:{color:C.white},
});
