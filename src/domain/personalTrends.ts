import {dayKey,target,type Data} from '../domain';

export type TrendDay={day:string;entries:number;cravings:number;complete:boolean;smokeFree:boolean;goal:number|null};
export type TrendPeriod={start:string;end:string;days:number;entries:number;cravings:number;confirmedDays:number;smokeFreeDays:number;average:number};
export type TrendComparison={current:TrendPeriod;previous:TrendPeriod;entryChange:number|null;cravingChange:number};
const shift=(date:Date,days:number)=>{const next=new Date(date);next.setDate(next.getDate()+days);return next;};
const noon=(date:Date)=>new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
function parseDay(key:string):Date|null{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(key))return null;
 const d=new Date(Number(key.slice(0,4)),Number(key.slice(5,7))-1,Number(key.slice(8,10)),12);
 return dayKey(d)===key?d:null;
}
/** One pass over records; days without check-ins remain unconfirmed, including zero-count days. */
export function buildPersonalTrends(data:Data,clock:number){
 if(!Number.isFinite(clock))throw new Error('Invalid trend clock');
 const now=new Date(clock),today=noon(now),todayKey=dayKey(today);
 const days=new Map<string,TrendDay>();
 const planStart=data.profile?dayKey(new Date(data.profile.startAt)):null;
 const get=(key:string):TrendDay=>{
  let day=days.get(key);
  if(!day){const date=parseDay(key);day={day:key,entries:0,cravings:0,complete:false,smokeFree:false,goal:data.profile&&date&&planStart!==null&&key>=planStart?target(data.profile,date):null};days.set(key,day);}
  return day;
 };
 for(const entry of data.entries){const at=new Date(entry.at);if(Number.isFinite(at.getTime())&&at.getTime()<=clock)get(dayKey(at)).entries++;}
 for(const craving of data.cravings){const at=new Date(craving.at);if(Number.isFinite(at.getTime())&&at.getTime()<=clock)get(dayKey(at)).cravings++;}
 const checkins=new Map<string,{complete:boolean;smokeFree:boolean}>();
 for(const checkin of data.checkins){
  if(!parseDay(checkin.date)||checkin.date>todayKey)continue;
  const previous=checkins.get(checkin.date);
  // Conflicting duplicate check-ins are conservatively treated as unconfirmed.
  const conflict=!!previous&&(previous.complete!==checkin.complete||previous.smokeFree!==checkin.smokeFree);
  checkins.set(checkin.date,{complete:!conflict&&checkin.complete&&(previous?.complete??true),smokeFree:!conflict&&checkin.smokeFree&&(previous?.smokeFree??true)});
 }
 for(const [key,checkin] of checkins){const day=get(key);day.complete=checkin.complete&&!(checkin.smokeFree&&day.entries>0);day.smokeFree=day.complete&&checkin.smokeFree&&day.entries===0;}
 const summarize=(start:Date,end:Date):TrendPeriod=>{
  const result:TrendPeriod={start:dayKey(start),end:dayKey(end),days:0,entries:0,cravings:0,confirmedDays:0,smokeFreeDays:0,average:0};
  for(let cursor=new Date(start);cursor<=end;cursor=shift(cursor,1)){
   const day=get(dayKey(cursor));result.days++;result.entries+=day.entries;result.cravings+=day.cravings;result.confirmedDays+=Number(day.complete);result.smokeFreeDays+=Number(day.smokeFree);
  }
  result.average=result.days?result.entries/result.days:0;return result;
 };
 const compare=(current:TrendPeriod,previous:TrendPeriod):TrendComparison=>({current,previous,entryChange:current.confirmedDays===current.days&&previous.confirmedDays===previous.days?current.average-previous.average:null,cravingChange:current.cravings/current.days-previous.cravings/previous.days});
 const monday=shift(today,-((today.getDay()+6)%7));
 const week=compare(summarize(shift(monday,-7),shift(monday,-1)),summarize(shift(monday,-14),shift(monday,-8)));
 const monthStart=new Date(today.getFullYear(),today.getMonth(),1,12),lastMonth=new Date(today.getFullYear(),today.getMonth()-1,1,12),priorMonth=new Date(today.getFullYear(),today.getMonth()-2,1,12);
 const month=compare(summarize(lastMonth,shift(monthStart,-1)),summarize(priorMonth,shift(lastMonth,-1)));
 const smokeFree=[...days.values()].filter(d=>d.smokeFree).map(d=>d.day).sort();
 let longest=0,run=0,previous:Date|null=null;
 for(const key of smokeFree){const date=parseDay(key)!;run=previous&&dayKey(shift(previous,1))===key?run+1:1;longest=Math.max(longest,run);previous=date;}
 // An unfinished today does not erase a run completed yesterday.
 const streakEnd=get(todayKey).smokeFree?today:shift(today,-1);
 let currentStreak=0;
 for(let cursor=streakEnd;days.get(dayKey(cursor))?.smokeFree;cursor=shift(cursor,-1))currentStreak++;
 return {week,month,longestStreak:longest,currentStreak,streakEnd:dayKey(streakEnd),confirmedSmokeFreeDays:smokeFree.length,smokeFreeDays:smokeFree,recentDays:Array.from({length:7},(_,index)=>get(dayKey(shift(today,index-6))))};
}
