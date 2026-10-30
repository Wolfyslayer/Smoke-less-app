import React from 'react';
import {View} from 'react-native';
export default function ProgressRing({progress,size=222}:{progress:number;size?:number}){
 const count=120,clamped=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));
 const radius=size*94/222,center=size/2;
 return <View pointerEvents="none" style={{position:'absolute',width:size,height:size}}>{Array.from({length:count},(_,i)=>{const angle=i*2*Math.PI/count-Math.PI/2;return <View key={i} style={{position:'absolute',width:2,height:7,borderRadius:2,backgroundColor:i<count*clamped?'#D7FF23':'#303719',left:center+radius*Math.cos(angle)-1,top:center+radius*Math.sin(angle)-3.5,transform:[{rotate:(i*360/count)+'deg'}]}}/>})}</View>;
}
