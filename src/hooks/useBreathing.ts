import {useEffect,useRef,useState} from 'react';
import {Animated,Easing,Platform,Vibration} from 'react-native';

/** Breathing animation, elapsed seconds and optional haptic guidance for SOS. */
export function useBreathing(){
 const [breathing,setBreathing]=useState(false);
 const [breathSeconds,setBreathSeconds]=useState(0);
 const [hapticsEnabled,setHapticsEnabled]=useState(true);
 const breathScale=useRef(new Animated.Value(0)).current;
 const breathPhase=useRef(-1),breathHapticStep=useRef(-1),hapticsRef=useRef(true);
 useEffect(()=>{hapticsRef.current=hapticsEnabled;if(!hapticsEnabled)Vibration.cancel()},[hapticsEnabled]);useEffect(()=>{if(!breathing){breathScale.stopAnimation();breathScale.setValue(0);breathPhase.current=-1;breathHapticStep.current=-1;Vibration.cancel();return}const started=Date.now();const tick=()=>{const elapsed=(Date.now()-started)/1000;setBreathSeconds(Math.floor(elapsed));const segment=elapsed%12;const phase=segment<4?0:segment<6?1:2;const step=phase===0?Math.floor(segment/2):phase===1?0:Math.floor((segment-6)/3);if(phase!==breathPhase.current||step!==breathHapticStep.current){breathPhase.current=phase;breathHapticStep.current=step;if(hapticsRef.current&&Platform.OS!=='web'){Vibration.cancel();Vibration.vibrate(phase===0?55:phase===1?130:step===0?65:35)}}};tick();const animation=Animated.loop(Animated.sequence([Animated.timing(breathScale,{toValue:1,duration:4000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.delay(2000),Animated.timing(breathScale,{toValue:0,duration:6000,easing:Easing.inOut(Easing.sin),useNativeDriver:true})]));animation.start();const id=setInterval(tick,100);return()=>{clearInterval(id);animation.stop();Vibration.cancel();breathPhase.current=-1;breathHapticStep.current=-1}},[breathing,breathScale]);
 return {breathing,setBreathing,breathSeconds,setBreathSeconds,hapticsEnabled,setHapticsEnabled,breathScale};
}
