import {useCallback,useEffect,useRef,useState} from 'react';
import type {LocalPreferences} from '../localPreferences';

export function useLocalPreferences<T>(store:LocalPreferences<T>,uid:string|null){
 const key=store.key(uid);
 const [retry,setRetry]=useState(0);
 const [state,setState]=useState({key,value:store.defaults(),ready:false,error:null as string|null});
 const generation=useRef(0),currentKey=useRef(key);currentKey.current=key;
 useEffect(()=>{
  const request=++generation.current;
  setState({key,value:store.defaults(),ready:false,error:null});
  void store.load(uid).then(value=>{if(currentKey.current===key&&request===generation.current)setState({key,value,ready:true,error:null});}).catch(()=>{
   if(currentKey.current===key&&request===generation.current)setState({key,value:store.defaults(),ready:false,error:'Inställningarna kunde inte läsas. Försök igen.'});
  });
  return ()=>{++generation.current;};
 },[store,key,uid,retry]);
 const update=useCallback((value:T)=>{
  if(state.key!==key||!state.ready)return;
  const request=++generation.current;
  setState({key,value,ready:true,error:null});
  void store.save(uid,value).catch(()=>{if(currentKey.current===key&&request===generation.current)setState(current=>({...current,error:'Ändringen kunde inte sparas. Försök ändra valet igen.'}));});
 },[store,key,uid,state.key,state.ready]);
 return {value:state.key===key?state.value:store.defaults(),ready:state.key===key&&state.ready,error:state.key===key?state.error:null,update,retry:()=>setRetry(v=>v+1)};
}
