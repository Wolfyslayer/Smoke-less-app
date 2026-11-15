import {useCallback,useEffect,useRef,useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createDashboardStore,dashboardStorageKey,defaultDashboardPreferences,type DashboardPreferences} from '../dashboardPreferences';

const store=createDashboardStore(AsyncStorage);
export function useDashboardPreferences(uid:string|null){
 const key=dashboardStorageKey(uid);
 const [state,setState]=useState<{key:string;value:DashboardPreferences;ready:boolean;error:string|null}>({key,value:defaultDashboardPreferences(),ready:false,error:null});
 const generation=useRef(0);
 const currentKey=useRef(key);currentKey.current=key;
 useEffect(()=>{
  const request=++generation.current;
  setState({key,value:defaultDashboardPreferences(),ready:false,error:null});
  void store.load(uid).then(value=>{
   if(currentKey.current===key&&generation.current===request)setState({key,value,ready:true,error:null});
  }).catch(()=>{
   if(currentKey.current===key&&generation.current===request)setState({key,value:defaultDashboardPreferences(),ready:false,error:'Dina kortval kunde inte läsas. Försök öppna startsidan igen.'});
  });
  return ()=>{++generation.current;};
 },[key,uid]);
 const update=useCallback((value:DashboardPreferences)=>{
  if(state.key!==key||!state.ready)return;
  const request=++generation.current;
  setState({key,value,ready:true,error:null});
  void store.save(uid,value).catch(()=>{
   if(currentKey.current===key&&generation.current===request)setState(current=>({...current,error:'Kortvalen kunde inte sparas. Försök ändra dem igen.'}));
  });
 },[key,uid,state.key,state.ready]);
 // Never render a previous account's layout during the effect transition.
 return {value:state.key===key?state.value:defaultDashboardPreferences(),ready:state.key===key&&state.ready,error:state.key===key?state.error:null,update};
}
