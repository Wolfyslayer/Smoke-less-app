import {useEffect,useState} from 'react';
import {AccessibilityInfo} from 'react-native';
export function useReducedMotion(){
 const [reduced,setReduced]=useState(true);
 useEffect(()=>{let active=true,changed=false;
  const subscription=AccessibilityInfo.addEventListener('reduceMotionChanged',value=>{changed=true;if(active)setReduced(value);});
  void AccessibilityInfo.isReduceMotionEnabled().then(value=>{if(active&&!changed)setReduced(value);}).catch(()=>{});
  return()=>{active=false;subscription.remove();};
 },[]);
 return reduced;
}
