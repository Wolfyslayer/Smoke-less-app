import React,{useId} from 'react';
import Svg,{Defs,LinearGradient,Path,Stop} from 'react-native-svg';
import {useThemeColors} from '../theme';

export function BrandMark({size=32}:{size?:number}){
 const C=useThemeColors(),id='leaf'+useId().replace(/[^a-zA-Z0-9]/g,'');
 return <Svg width={size} height={size} viewBox="0 0 64 64" accessible={false}>
  <Defs><LinearGradient id={id} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={C.accent}/><Stop offset="1" stopColor={C.accentPressed}/></LinearGradient></Defs>
  <Path d="M9 57C1 43 6 21 26 13C41 7 48 8 58 1C65 26 61 49 43 57C31 63 18 61 9 57Z" fill={'url(#'+id+')'}/>
  <Path d="M8 61C16 38 36 35 51 16C43 35 25 43 8 61Z" fill={C.background}/>
 </Svg>;
}
