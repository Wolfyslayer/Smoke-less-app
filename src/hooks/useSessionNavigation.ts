import {useState} from 'react';
export type Tab='home'|'plan'|'register'|'stats'|'profile'|'account'|'sos'|'history'|'benefits'|'settings'|'backup';
export function useSessionNavigation(){const [tab,setTab]=useState<Tab>('home');return {tab,setTab};}
