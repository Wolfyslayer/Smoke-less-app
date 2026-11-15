import React,{useState} from 'react';
import {Pressable,Text,View} from 'react-native';
import {ChevronDown,ChevronUp} from 'lucide-react-native';
import {useThemeColors} from '../theme';
export function SettingsSection({title,description,children,initiallyOpen=false}:{title:string;description:string;children:React.ReactNode;initiallyOpen?:boolean}){
 const [expanded,setExpanded]=useState(initiallyOpen);const C=useThemeColors();
 return <View style={{gap:12}}><Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityHint={description} accessibilityState={{expanded}} onPress={()=>setExpanded(value=>!value)} style={{minHeight:76,flexDirection:'row',alignItems:'center',gap:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.border}}><View style={{flex:1,gap:5}}><Text accessibilityRole="header" style={{fontSize:20,fontWeight:'700',color:C.text}}>{title}</Text><Text style={{fontSize:14,lineHeight:21,color:C.textMuted}}>{description}</Text></View>{expanded?<ChevronUp size={21} color={C.accent}/>:<ChevronDown size={21} color={C.accent}/>}</Pressable>
  <View style={{display:expanded?'flex':'none'}} accessibilityElementsHidden={!expanded} importantForAccessibility={expanded?'auto':'no-hide-descendants'}>{children}</View>
 </View>;
}
