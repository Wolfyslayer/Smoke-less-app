import React from 'react';
import {Pressable,StyleSheet,Text,View,type StyleProp,type ViewStyle} from 'react-native';
import {useThemeStyles,type ThemeColors} from '../theme';
import {designTokens} from '../themeTokens';

type CardProps={children:React.ReactNode;style?:StyleProp<ViewStyle>;tone?:'surface'|'elevated'};
export function AppCard({children,style,tone='surface'}:CardProps){
 const styles=useThemeStyles(createStyles);

 return <View style={[styles.card,tone==='elevated'&&styles.elevated,style]}>{children}</View>;
}
type ButtonProps={title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean;secondaryTone?:'soft'|'elevated';compact?:boolean};
export function AppButton({title,onPress,secondary=false,disabled=false,secondaryTone='elevated',compact=false}:ButtonProps){
 const styles=useThemeStyles(createStyles);

 return <Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.button,secondary&&(secondaryTone==='soft'?styles.secondarySoft:styles.secondaryElevated),pressed&&!disabled&&styles.pressed,disabled&&styles.disabled]}>
  <Text style={[styles.buttonText,secondary&&styles.secondaryText,compact&&styles.compactText]}>{title}</Text>
 </Pressable>;
}
const createStyles=(C:ThemeColors)=>StyleSheet.create({
 card:{backgroundColor:C.surface,borderRadius:designTokens.radius.card,padding:designTokens.spacing.lg,borderWidth:1,borderColor:C.border,gap:designTokens.spacing.md},
 elevated:{backgroundColor:C.elevated},
 button:{backgroundColor:C.lime,padding:13,borderRadius:14,alignItems:'center',justifyContent:'center',minHeight:48},
 pressed:{opacity:.8},
 disabled:{opacity:.5},
 secondaryElevated:{backgroundColor:C.elevated,borderWidth:1,borderColor:C.border},
 secondarySoft:{backgroundColor:C.soft},
 buttonText:{color:C.onAccent,fontWeight:'800',fontSize:16,textAlign:'center',flexShrink:1},
 secondaryText:{color:C.white},
 compactText:{fontSize:14,fontWeight:'800'},
});
