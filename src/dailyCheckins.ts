import AsyncStorage from '@react-native-async-storage/async-storage';
export type DailyCheckin={date:string;complete:boolean;smokeFree:boolean;note?:string;updatedAt:string};
const KEY='smokeless-checkins-v1';
export const dayKey=(date:Date)=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export async function loadCheckins():Promise<DailyCheckin[]>{
 try{const raw=await AsyncStorage.getItem(KEY);const data=raw?JSON.parse(raw):[];return Array.isArray(data)?data.filter((x):x is DailyCheckin=>!!x&&typeof x.date==='string'&&typeof x.complete==='boolean'&&typeof x.smokeFree==='boolean'):[]}catch{return []}
}
export async function saveCheckin(checkin:DailyCheckin):Promise<void>{
 const existing=await loadCheckins();
 await AsyncStorage.setItem(KEY,JSON.stringify([checkin,...existing.filter(x=>x.date!==checkin.date)].slice(0,2000)));
}
export async function deleteCheckin(date:string):Promise<void>{
 const existing=await loadCheckins();await AsyncStorage.setItem(KEY,JSON.stringify(existing.filter(x=>x.date!==date)));
}
export function confirmedSmokeFreeDays(checkins:DailyCheckin[]){return checkins.filter(x=>x.complete&&x.smokeFree).length;}

export async function replaceCheckins(checkins:DailyCheckin[]):Promise<void>{await AsyncStorage.setItem(KEY,JSON.stringify(checkins));}
