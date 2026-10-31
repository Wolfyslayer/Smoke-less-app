import {useEffect,useState} from 'react';

/** Owns the two-minute SOS countdown. The caller controls whether it is running. */
export function useSosTimer(){
 const [sosTimer,setSosTimer]=useState(0);
 const [sosTimerActive,setSosTimerActive]=useState(false);
 useEffect(()=>{
  if(!sosTimerActive)return;
  const id=setInterval(()=>setSosTimer(v=>{
   if(v<=1){setSosTimerActive(false);return 0;}
   return v-1;
  }),1000);
  return()=>clearInterval(id);
 },[sosTimerActive]);
 return {sosTimer,setSosTimer,sosTimerActive,setSosTimerActive};
}
