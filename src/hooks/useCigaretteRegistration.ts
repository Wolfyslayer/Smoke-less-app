import {useRef,useState,type Dispatch,type SetStateAction} from 'react';
import type {Data} from '../domain';
import {addCigaretteEntry} from '../utils/entryActions';

export function useCigaretteRegistration(setData:Dispatch<SetStateAction<Data>>){
 const [registerOpen,setRegisterOpen]=useState(false);
 const [feeling,setFeeling]=useState<string|null>(null);
 const [cigTrigger,setCigTrigger]=useState<string|null>(null);
 const busy=useRef(false);
 const record=(skip:boolean)=>{
  if(busy.current)return;
  busy.current=true;
  setTimeout(()=>busy.current=false,600);
  setData(v=>addCigaretteEntry(v,skip?null:feeling,skip?null:cigTrigger));
  setRegisterOpen(false);
  setFeeling(null);
  setCigTrigger(null);
 };
 const register=()=>record(false);
 const openRegister=()=>{setFeeling(null);setCigTrigger(null);setRegisterOpen(true)};
 const skipRegister=()=>record(true);
 return {registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,openRegister,skipRegister};
}
