import {useState,type Dispatch,type SetStateAction} from 'react';
import type {Data} from '../domain';
import {useBreathing} from './useBreathing';
import {useSosTimer} from './useSosTimer';
import {sosIdeas} from '../data/sosIdeas';
import {addCravingEntry} from '../utils/cravingActions';

export function useSosFlow(setData:Dispatch<SetStateAction<Data>>,goHome:()=>void){
 const {breathing,setBreathing,breathSeconds,setBreathSeconds,hapticsEnabled,setHapticsEnabled,breathScale}=useBreathing();
 const [sosTip,setSosTip]=useState(0);
 const [sosStartIntensity,setSosStartIntensity]=useState<number|null>(null);
 const [intensity,setIntensity]=useState(3);
 const [trigger,setTrigger]=useState('Stress');
 const {sosTimer,setSosTimer,sosTimerActive,setSosTimerActive}=useSosTimer();
 const startSos=()=>{setBreathSeconds(0);setBreathing(true)};
 const sosProps={
  breathScale,breathing,breathSeconds,
  onToggleBreathing:()=>{setBreathing(v=>!v);setBreathSeconds(0)},
  hapticsEnabled,onToggleHaptics:()=>setHapticsEnabled(v=>!v),
  sosIdeas,sosTip,onNextTip:()=>setSosTip(v=>(v+1)%sosIdeas.length),
  sosTimer,sosTimerActive,
  onToggleTimer:()=>{if(sosTimerActive){setSosTimerActive(false)}else{if(sosTimer===0)setSosTimer(120);setSosTimerActive(true)}},
  onResetTimer:()=>{setSosTimerActive(false);setSosTimer(0)},
  sosStartIntensity,intensity,onStartIntensity:setSosStartIntensity,onIntensity:setIntensity,
  trigger,onTrigger:setTrigger,
  onSave:()=>{setData(v=>addCravingEntry(v,intensity,trigger));goHome()}
 };
 return {sosProps,startSos};
}
