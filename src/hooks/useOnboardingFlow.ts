import {useState,type Dispatch,type SetStateAction} from 'react';
import type {Data,Mode} from '../domain';
import {EMPTY} from '../domain';
import {parseOnboardingNumbers} from '../utils/onboardingValidation';

export function useOnboardingFlow(setData:Dispatch<SetStateAction<Data>>,showMessage:(title:string,message:string)=>void){
 const [onStep,setOnStep]=useState(0);
 const [mode,setMode]=useState<Mode>('reduce');
 const [scheduled,setScheduled]=useState(false);
 const [quitDay,setQuitDay]=useState('');
 const [baseline,setBaseline]=useState('12');
 const [packSize,setPackSize]=useState('20');
 const [packPrice,setPackPrice]=useState('85');
 const begin=()=>{
  const values=parseOnboardingNumbers(baseline,packSize,packPrice);
  if(!values){showMessage('Kontrollera uppgifterna','Ange giltiga positiva tal.');return;}
  const start=new Date();
  const parsed=quitDay.match(/^\d{4}-\d{2}-\d{2}$/)?new Date(quitDay+'T12:00:00'):null;
  if(scheduled && mode==='reduce' && (!parsed || !Number.isFinite(parsed.getTime()) || parsed.getFullYear()+'-'+String(parsed.getMonth()+1).padStart(2,'0')+'-'+String(parsed.getDate()).padStart(2,'0')!==quitDay || parsed.getTime()<=start.getTime())){showMessage('Kontrollera stoppdatum','Ange ett giltigt framtida datum i formatet ÅÅÅÅ-MM-DD.');return;}
  setData({...EMPTY,profile:{mode,baseline:values.baseline,packSize:values.packSize,packPrice:values.packPrice,speed:'balanced',startAt:start.toISOString(),dailyTargetOverride:null,...(scheduled && mode==='reduce' && parsed?{plannedQuitAt:parsed.toISOString()}:{})}});
 };
 return {onStep,setOnStep,mode,setMode,scheduled,setScheduled,quitDay,setQuitDay,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin};
}
