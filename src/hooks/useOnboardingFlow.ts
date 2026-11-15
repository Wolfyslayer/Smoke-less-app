import {useState,type Dispatch,type SetStateAction} from 'react';
import type {Data,Mode,Speed} from '../domain';
import {completeOnboarding} from '../domain/onboarding';
import {parseOnboardingNumbers} from '../utils/onboardingValidation';

export function useOnboardingFlow(setData:Dispatch<SetStateAction<Data>>,showMessage:(title:string,message:string)=>void){
 const [onStep,setOnStep]=useState(0);
 const [mode,setMode]=useState<Mode>('reduce');
 const [scheduled,setScheduled]=useState(false);
 const [speed,setSpeed]=useState<Speed>('gentle');
 const [quitDay,setQuitDay]=useState('');
 const [baseline,setBaseline]=useState('');
 const [packSize,setPackSize]=useState('20');
 const [packPrice,setPackPrice]=useState('0');
 const begin=()=>{
  const values=parseOnboardingNumbers(baseline,packSize,packPrice);
  if(!values){showMessage('Kontrollera uppgifterna','Ange 0–200 cigaretter per dag, paketstorlek 1–200 och pris 0–100000 kr.');return false;}
  const start=new Date();
  const parsed=quitDay.match(/^\d{4}-\d{2}-\d{2}$/)?new Date(quitDay+'T12:00:00'):null;
  if(scheduled && mode==='reduce' && (!parsed || !Number.isFinite(parsed.getTime()) || parsed.getFullYear()+'-'+String(parsed.getMonth()+1).padStart(2,'0')+'-'+String(parsed.getDate()).padStart(2,'0')!==quitDay || parsed.getTime()<=start.getTime())){showMessage('Kontrollera stoppdatum','Ange ett giltigt framtida datum i formatet ÅÅÅÅ-MM-DD.');return false;}
  setData(current=>completeOnboarding(current,{mode,baseline:values.baseline,packSize:values.packSize,packPrice:values.packPrice,speed,startAt:start.toISOString(),dailyTargetOverride:null,...(scheduled && mode==='reduce' && parsed?{plannedQuitAt:parsed.toISOString()}:{})}));
  return true;
 };
 return {onStep,setOnStep,mode,setMode,speed,setSpeed,scheduled,setScheduled,quitDay,setQuitDay,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin};
}
