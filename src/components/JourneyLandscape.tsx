import React,{useId} from 'react';
import {View} from 'react-native';
import Svg,{Circle,Defs,LinearGradient,Path,RadialGradient,Rect,Stop} from 'react-native-svg';
import {useThemeColors} from '../theme';

/** Decorative vector scenery; contains no account or progress information. */
export function JourneyLandscape(){
 const C=useThemeColors(),id=useId().replace(/[^a-zA-Z0-9]/g,'');
 return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={{position:'absolute',top:0,left:0,right:0,bottom:0}}>
 <Svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
  <Defs><LinearGradient id={id+'sky'} x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={C.background}/><Stop offset="1" stopColor={C.elevated}/></LinearGradient><RadialGradient id={id+'glow'}><Stop offset="0" stopColor={C.scenerySun} stopOpacity=".6"/><Stop offset="1" stopColor={C.scenerySun} stopOpacity="0"/></RadialGradient></Defs>
  <Rect width="400" height="220" fill={'url(#'+id+'sky)'}/><Circle cx="294" cy="123" r="85" fill={'url(#'+id+'glow)'}/><Circle cx="294" cy="130" r="28" fill={C.scenerySun}/>
  <Path d="M0 145 L65 92 L119 130 L178 89 L238 144 L303 123 L355 97 L400 132 V220 H0Z" fill={C.soft}/>
  <Path d="M0 167 L60 144 L114 164 L193 126 L253 166 L323 144 L400 161 V220 H0Z" fill={C.surface}/>
  {Array.from({length:18},(_,i)=>{const x=i*25-10,h=25+(i*17)%40,y=181+(i%3)*8;return <Path key={i} d={'M'+x+' '+(y-h)+' l'+(-h*.32)+' '+(h*.66)+' h'+(h*.17)+' l'+(-h*.22)+' '+(h*.34)+' h'+(h*.74)+' l'+(-h*.22)+' '+(-h*.34)+' h'+(h*.17)+'Z'} fill={C.background}/>;})}
  <Path d="M0 208 Q80 180 157 210 T400 200 V220 H0Z" fill={C.background}/>
 </Svg></View>;
}
