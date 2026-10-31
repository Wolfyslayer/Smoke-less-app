import {useEffect,useState} from 'react';

/** Updates time-dependent dashboard values once per second while mounted. */
export function useLiveClock(){
 const [clock,setClock]=useState(Date.now());
 useEffect(()=>{
  const id=setInterval(()=>setClock(Date.now()),1000);
  return()=>clearInterval(id);
 },[]);
 return clock;
}
