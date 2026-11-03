import {useState,type Dispatch,type SetStateAction} from 'react';
import {adjustReductionTarget,type Data,type Profile} from '../domain';
import type {Tab} from './useSessionNavigation';
import {removeCigaretteEntry} from '../utils/entryActions';
import {updateProfile} from '../utils/profileActions';

export function useSessionActions({setData,ask,setTab}:{
 setData:Dispatch<SetStateAction<Data>>;
 ask:(title:string,message:string,confirm:()=>void)=>void;
 setTab:Dispatch<SetStateAction<Tab>>;
}){
 const [period,setPeriod]=useState(7);
 const remove=(id:string)=>ask('Ta bort registrering?','Registreringen tas bort från historiken.',()=>setData(v=>removeCigaretteEntry(v,id)));
 const go=(tab:Tab)=>setTab(tab);
 const changeProfile=(patch:Partial<Profile>)=>setData(v=>updateProfile(v,patch));
 const changeDailyTarget=(value:number|null)=>setData(v=>v.profile?{...v,profile:adjustReductionTarget(v.profile,value,new Date())}:v);
 return {remove,go,changeProfile,changeDailyTarget,period,setPeriod};
}
