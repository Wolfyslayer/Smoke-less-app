import {useEffect,useRef,useState} from 'react';
import * as account from '../authService';

export function useAuthObserver(){
 const [authState,setAuthState]=useState<{initialized:boolean;user:account.AccountUser|null}>({initialized:false,user:null});
 const activeUidRef=useRef<string|null>(null);
 useEffect(()=>account.observeUser(user=>{
  activeUidRef.current=user?.uid??null;
  setAuthState({initialized:true,user});
 }),[]);
 return {authState,activeUidRef};
}
