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
 const [helpful,setHelpful]=useState<boolean|null>(null);
 const {sosTimer,setSosTimer,sosTimerActive,setSosTimerActive}=useSosTimer();
 const startSos=()=>{setBreathSeconds(0);setBreathing(true);setSosStartIntensity(null);setIntensity(3);setTrigger('Stress');setSosTip(0);setHelpful(null);setSosTimerActive(false);setSosTimer(0);};
 const sosProps={
  breathScale,breathing,breathSeconds,
  onToggleBreathing:()=>{setBreathing(v=>!v);setBreathSeconds(0)},
  hapticsEnabled,onToggleHaptics:()=>setHapticsEnabled(v=>!v),
  sosIdeas,sosTip,onNextTip:()=>{setSosTip(v=>(v+1)%sosIdeas.length);setHelpful(null)},onSelectTip:(index:number)=>{if(index>=0&&index<sosIdeas.length){setSosTip(index);setHelpful(null)}},
  sosTimer,sosTimerActive,
  onToggleTimer:()=>{if(sosTimerActive){setSosTimerActive(false)}else{if(sosTimer===0)setSosTimer(120);setSosTimerActive(true)}},
  onResetTimer:()=>{setSosTimerActive(false);setSosTimer(0)},
  sosStartIntensity,intensity,onStartIntensity:setSosStartIntensity,onIntensity:setIntensity,
  trigger,onTrigger:setTrigger,helpful,onHelpful:setHelpful,
  onSave:()=>{setData(v=>addCravingEntry(v,intensity,trigger,{...(sosStartIntensity!==null?{startIntensity:sosStartIntensity}:{}),strategy:sosIdeas[sosTip].title,...(helpful!==null?{helpful}:{})}));setBreathing(false);setSosTimerActive(false);setSosTimer(0);setSosStartIntensity(null);setIntensity(3);setTrigger('Stress');setHelpful(null);goHome()}
 };
 return {sosProps,startSos};
}
