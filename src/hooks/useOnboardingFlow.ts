import {useState,type Dispatch,type SetStateAction} from 'react';
import type {Data,Mode} from '../domain';
import {EMPTY} from '../domain';
import {parseOnboardingNumbers} from '../utils/onboardingValidation';

export function useOnboardingFlow(setData:Dispatch<SetStateAction<Data>>,showMessage:(title:string,message:string)=>void){
 const [onStep,setOnStep]=useState(0);
 const [mode,setMode]=useState<Mode>('reduce');
 const [baseline,setBaseline]=useState('12');
 const [packSize,setPackSize]=useState('20');
 const [packPrice,setPackPrice]=useState('85');
 const begin=()=>{
  const values=parseOnboardingNumbers(baseline,packSize,packPrice);
  if(!values){showMessage('Kontrollera uppgifterna','Ange giltiga positiva tal.');return;}
  setData({...EMPTY,profile:{mode,baseline:values.baseline,packSize:values.packSize,packPrice:values.packPrice,speed:'balanced',startAt:new Date().toISOString(),dailyTargetOverride:null}});
 };
 return {onStep,setOnStep,mode,setMode,baseline,setBaseline,packSize,setPackSize,packPrice,setPackPrice,begin};
}
