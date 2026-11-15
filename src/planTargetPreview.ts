import {adjustReductionTarget,dayKey,quitDate,target,validateData,type Data,type Profile} from './domain';
export type PlanDatePolicy='keep'|'automatic';
export type DailyTargetPreview={expected:Profile;next:Profile;day:string;goals:{day:string;goal:number}[];quitAt:string};
export function previewDailyTarget(p:Profile,value:number,policy:PlanDatePolicy,now:Date):DailyTargetPreview|null{
 if(p.mode!=='reduce'||!Number.isSafeInteger(value)||value<0||!['keep','automatic'].includes(policy)||!Number.isFinite(now.getTime()))return null;
 if(policy==='keep'&&p.plannedQuitAt&&dayKey(new Date(p.plannedQuitAt))<=dayKey(now))return null;
 const base=policy==='automatic'?{...p,plannedQuitAt:undefined}:p;
 const next=adjustReductionTarget(base,value,now);
 if(!validateData({profile:next,entries:[],cravings:[],checkins:[]}))return null;
 const stop=quitDate(next);
 if(!Number.isFinite(stop.getTime()))return null;
 return {expected:{...p},next,day:dayKey(now),quitAt:dayKey(stop),goals:Array.from({length:7},(_,index)=>{
  const date=new Date(now);date.setHours(12,0,0,0);date.setDate(date.getDate()+index);
  return {day:dayKey(date),goal:target(next,date)};
 })};
}
/** Compare before applying; preserve all current records, including ones added during preview. */
export function applyDailyTargetPreview(data:Data,preview:DailyTargetPreview,now:Date):Data{
 if(dayKey(now)!==preview.day||JSON.stringify(data.profile)!==JSON.stringify(preview.expected))return data;
 const next={...data,profile:preview.next};
 return validateData(next)?next:data;
}
