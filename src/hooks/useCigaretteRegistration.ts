import {useRef,useState,type Dispatch,type SetStateAction} from 'react';
import type {Data} from '../domain';
import {addCigaretteEntry} from '../utils/entryActions';

export function useCigaretteRegistration(setData:Dispatch<SetStateAction<Data>>){
 const [registerOpen,setRegisterOpen]=useState(false);
 const [feeling,setFeeling]=useState<string|null>(null);
 const [cigTrigger,setCigTrigger]=useState<string|null>(null);
 const busy=useRef(false);
 const register=()=>{
  if(busy.current)return;
  busy.current=true;
  setTimeout(()=>busy.current=false,600);
  setData(v=>addCigaretteEntry(v,feeling,cigTrigger));
  setRegisterOpen(false);
  setFeeling(null);
  setCigTrigger(null);
 };
 const openRegister=()=>{setFeeling(null);setCigTrigger(null);setRegisterOpen(true)};
 return {registerOpen,setRegisterOpen,feeling,setFeeling,cigTrigger,setCigTrigger,register,openRegister};
}
