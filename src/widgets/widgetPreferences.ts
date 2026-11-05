import AsyncStorage from '@react-native-async-storage/async-storage';
import {clearNativeWidget,publishNativeWidget} from './nativeWidgetBridge';
import {dayKey,target,type Data} from '../domain';
import {makeWidgetSnapshot,readWidgetSnapshot,type WidgetSnapshot} from '../domain/widgetSnapshot';

/** Opt-in is local to this installation; never inherit it from cloud profile data. */
const OPT_IN_KEY='smokeless:widget-opt-in:v1';
const SNAPSHOT_KEY='smokeless:widget-snapshot:v1';
// Serialize writes so an older refresh cannot republish after opt-out or account switch.
let pendingWidgetWrite:Promise<unknown>=Promise.resolve();
function serializeWidgetWrite<T>(operation:()=>Promise<T>):Promise<T>{
 const next=pendingWidgetWrite.then(operation,operation);
 pendingWidgetWrite=next.then(()=>undefined,()=>undefined);
 return next;
}
export async function widgetOptedIn():Promise<boolean>{
 try{return await AsyncStorage.getItem(OPT_IN_KEY)==='true';}catch{return false;}
}
/** A failed write must not be reported as successful opt-in. */
export async function setWidgetOptIn(enabled:boolean):Promise<void>{
 return serializeWidgetWrite(async()=>{
 if(!enabled){
  // Clear native launcher-visible data before clearing local opt-in.
  await clearNativeWidget();
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
  await AsyncStorage.removeItem(OPT_IN_KEY);
  return;
 }
 await AsyncStorage.setItem(OPT_IN_KEY,'true');
 });
}
/** Write only whitelisted aggregates, and only after the main app has saved its data. */
export async function refreshWidgetSnapshot(data:Data,now=new Date()):Promise<WidgetSnapshot|null>{
 return serializeWidgetWrite(async()=>{
 if(!(await widgetOptedIn())){
  await clearNativeWidget();
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
  return null;
 }
 const date=dayKey(now);
 const dailyGoal=data.profile?target(data.profile,now):0;
 const todayCount=data.entries.reduce((n,entry)=>{
  const at=new Date(entry.at);
  return n+(Number.isFinite(at.getTime())&&dayKey(at)===date?1:0);
 },0);
 const snapshot=data.profile?makeWidgetSnapshot({enabled:true,date,todayCount,dailyGoal}):null;
 if(snapshot){
  await publishNativeWidget(snapshot);
  await AsyncStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshot));
 }else{
  await clearNativeWidget();
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
 }
 return snapshot;
 });
}
/** A missing/stale snapshot is a neutral widget state, not an assumed zero-cigarette day. */
export async function loadWidgetSnapshot(now=new Date()):Promise<WidgetSnapshot|null>{
 if(!(await widgetOptedIn()))return null;
 try{const raw=await AsyncStorage.getItem(SNAPSHOT_KEY);return raw?readWidgetSnapshot(JSON.parse(raw),dayKey(now)):null;}
 catch{return null;}
}
/** Required on sign-out, account switch and local data deletion. */
export async function clearWidgetPrivacy():Promise<void>{
 return serializeWidgetWrite(async()=>{
  await clearNativeWidget();
  await AsyncStorage.removeItem(SNAPSHOT_KEY);
  await AsyncStorage.removeItem(OPT_IN_KEY);
 });
}
