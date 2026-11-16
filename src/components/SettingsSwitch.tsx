import React from 'react';
import {Switch,Text,View} from 'react-native';
import {useThemeColors} from '../theme';

export function SettingsSwitch({label,value,onValueChange,disabled=false}:{label:string;value:boolean;onValueChange:(value:boolean)=>void;disabled?:boolean}){
 const C=useThemeColors();
 return <View style={{minHeight:56,flexDirection:'row',alignItems:'center',gap:16,paddingVertical:8}}>
  <Text style={{flex:1,minWidth:0,fontSize:16,lineHeight:23,color:disabled?C.textMuted:C.text}}>{label}</Text>
  <Switch accessibilityLabel={label} value={value} disabled={disabled} onValueChange={next=>{if(!disabled&&next!==value)onValueChange(next);}} trackColor={{false:C.border,true:C.accent}} thumbColor={value?C.onAccent:C.textMuted} ios_backgroundColor={C.border}/>
 </View>;
}
