import {useEffect} from 'react';
import {AppState} from 'react-native';
import type {Dispatch,SetStateAction} from 'react';

/** Requests a sync retry whenever the app becomes active. */
export function useAppResumeTrigger(setSyncTrigger:Dispatch<SetStateAction<number>>){
 useEffect(()=>{
  const subscription=AppState.addEventListener('change',state=>{
   if(state==='active')setSyncTrigger(value=>value+1);
  });
  return()=>subscription.remove();
 },[setSyncTrigger]);
}
