import {useCallback,useRef,useState} from 'react';

export type Tab='home'|'plan'|'register'|'stats'|'profile'|'account'|'sos'|'history'|'benefits'|'settings'|'backup';

/**
 * Keep navigation history within the single Expo Router screen.
 * Repeated navigation to the current tab must not create duplicate entries.
 * History is scoped to the active signed-in/guest session.
 */
export function useSessionNavigation(){
 const [tab,setCurrentTab]=useState<Tab>('home');
 const historyRef=useRef<Tab[]>([]);
 const currentRef=useRef<Tab>('home');

 const setTab=useCallback((next:Tab)=>{
  if(next===currentRef.current)return;
  historyRef.current.push(currentRef.current);
  currentRef.current=next;
  setCurrentTab(next);
 },[]);

 const goBack=useCallback(()=>{
  const previous=historyRef.current.pop();
  if(!previous)return false;
  currentRef.current=previous;
  setCurrentTab(previous);
  return true;
 },[]);

 return {tab,setTab,goBack};
}
