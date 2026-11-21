import {useEffect,useRef,useState} from 'react';
import {Linking} from 'react-native';
import Constants from 'expo-constants';
import {widgetDestination,type WidgetDestination} from '../widgets/widgetNavigation';

let initialLinkConsumed=false;
export function useWidgetNavigation(available:boolean,onNavigate:(destination:WidgetDestination)=>void){
 const [pending,setPending]=useState<WidgetDestination|null>(null);
 const navigate=useRef(onNavigate);navigate.current=onNavigate;
 useEffect(()=>{
  let active=true;
  const scheme=Constants.expoConfig?.scheme;
  const configuredScheme=typeof scheme==='string'?scheme:'';
  const receive=(url:string)=>{const destination=widgetDestination(url,configuredScheme);if(active&&destination)setPending(destination);};
  const subscription=Linking.addEventListener('url',event=>receive(event.url));
  if(!initialLinkConsumed){void Linking.getInitialURL().then(url=>{if(!initialLinkConsumed&&url)receive(url);}).catch(()=>{});}
  return()=>{active=false;subscription.remove();};
 },[]);
 useEffect(()=>{if(available&&pending){initialLinkConsumed=true;setPending(null);navigate.current(pending);}},[available,pending]);
}
