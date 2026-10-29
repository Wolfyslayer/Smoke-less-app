export type ReductionSpeed='gentle'|'balanced'|'fast';
export const speedLabel:Record<ReductionSpeed,string>={gentle:'Lugn',balanced:'Balanserad',fast:'Snabb'};
export function reductionSchedule(baseline:number,startAt:string,speed:ReductionSpeed='balanced'){
 const start=new Date(startAt);const startDay=new Date(start.getFullYear(),start.getMonth(),start.getDate(),12).getTime();
 const initial=Math.max(1,Math.round(baseline));
 const stepDays=speed==='gentle'?7:speed==='fast'?2:4;
 const steps=Math.ceil(initial/2);
 const length=steps*stepDays;
 const targetAt=(day:number)=>day>=length?0:Math.max(0,initial-2*Math.floor(Math.max(0,day)/stepDays));
 const todayIndex=Math.max(0,Math.floor((new Date().setHours(12,0,0,0)-startDay)/86400000));
 const quitDate=new Date(startDay+length*86400000);
 const days=Array.from({length:length+1},(_,day)=>({date:new Date(startDay+day*86400000),target:targetAt(day),day}));
 const next=days.find(x=>x.day>todayIndex&&x.target<targetAt(todayIndex));
 return {days,todayIndex,todayTarget:targetAt(todayIndex),quitDate,next,stepDays};
}
