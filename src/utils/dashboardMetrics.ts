import type {Data} from '../domain';
import {dayKey,target,countOn} from '../domain';

export function getDashboardMetrics(data:Data,clock:number){
 const p=data.profile,today=dayKey(new Date(clock)),todayCount=countOn(data.entries,today),goal=p?target(p,new Date(clock)):0;
 const sorted=[...data.entries].sort((a,b)=>b.at.localeCompare(a.at));
 const last=sorted[0],elapsed=last?Math.max(0,Math.floor((clock-new Date(last.at).getTime())/60000)):null;
 const duration=elapsed===null?'Ingen registrerad':elapsed>=60?Math.floor(elapsed/60)+' h '+elapsed%60+' min':elapsed+' min';
 const planWeek=Array.from({length:7},(_,i)=>{const d=new Date(clock);d.setHours(12,0,0,0);d.setDate(d.getDate()-(6-i));const key=dayKey(d),logged=countOn(data.entries,key),limit=p?target(p,d):0,confirmed=data.checkins.some(c=>c.date===key&&c.complete);return {key,logged,limit,confirmed,within:confirmed&&logged<=limit}});const confirmedDays=planWeek.filter(d=>d.confirmed).length,withinDays=planWeek.filter(d=>d.within).length;const todayReduction=p?Math.max(0,p.baseline-goal):0;
 const recentCravings=data.cravings.filter(c=>new Date(c.at).getTime()>=clock-30*86400000);const cravingTriggers=Object.entries(recentCravings.reduce<Record<string,number>>((acc,c)=>{acc[c.trigger]=(acc[c.trigger]??0)+1;return acc},{})).sort((a,b)=>b[1]-a[1]);const recentCigarettes=data.entries.filter(e=>new Date(e.at).getTime()>=clock-30*86400000);const cigaretteTriggers=Object.entries(recentCigarettes.reduce<Record<string,number>>((acc,e)=>{if(e.trigger)acc[e.trigger]=(acc[e.trigger]??0)+1;return acc},{})).sort((a,b)=>b[1]-a[1]);
 const weekly=Array.from({length:7},(_,i)=>{const d=new Date(clock);d.setHours(12,0,0,0);d.setDate(d.getDate()-(6-i));return countOn(data.entries,dayKey(d))});

 return {p,today,todayCount,goal,sorted,last,elapsed,duration,planWeek,confirmedDays,withinDays,todayReduction,recentCravings,cravingTriggers,recentCigarettes,cigaretteTriggers,weekly};
}
