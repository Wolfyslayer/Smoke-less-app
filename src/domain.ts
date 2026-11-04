export type Mode='reduce'|'quit';export type Speed='gentle'|'balanced'|'fast';
export type Profile={mode:Mode;baseline:number;packSize:number;packPrice:number;speed:Speed;startAt:string;dailyTargetOverride:number|null;planStartTarget?:number;originalStartAt?:string;plannedQuitAt?:string};
export type Cigarette={id:string;at:string;feeling?:string;trigger?:string};export type Craving={id:string;at:string;intensity:number;trigger:string;startIntensity?:number;strategy?:string;helpful?:boolean};
export type Checkin={date:string;complete:boolean;smokeFree:boolean};
export type Data={profile:Profile|null;entries:Cigarette[];cravings:Craving[];checkins:Checkin[]};
export const EMPTY:Data={profile:null,entries:[],cravings:[],checkins:[]};
export const dayKey=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const calendarDay=(d:Date)=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000;
export function target(p:Profile,now=new Date()){if(p.mode==='quit')return 0;if(p.plannedQuitAt && Number.isFinite(Date.parse(p.plannedQuitAt))){const start=dayKey(new Date(p.startAt)),end=dayKey(new Date(p.plannedQuitAt)),today=dayKey(now);if(today>=end)return 0;if(p.dailyTargetOverride!==null)return p.dailyTargetOverride;const startCount=p.planStartTarget??p.baseline;if(today<=start)return startCount;const dayNumber=(key:string)=>Math.floor(Date.UTC(Number(key.slice(0,4)),Number(key.slice(5,7))-1,Number(key.slice(8,10)))/86400000);const total=Math.max(1,dayNumber(end)-dayNumber(start));const remaining=Math.max(0,total-(dayNumber(today)-dayNumber(start)));return Math.max(0,Math.ceil(startCount*remaining/total));}if(p.dailyTargetOverride!==null)return p.dailyTargetOverride;const days=Math.max(0,calendarDay(now)-calendarDay(new Date(p.startAt)));const interval=p.speed==='gentle'?7:p.speed==='fast'?2:4;return Math.max(0,(p.planStartTarget??p.baseline)-Math.floor(days/interval));}
/** Summarize the next seven local calendar days without rewriting past targets. */
export function weeklyPlanProgress(p:Profile,now:Date){
 const next=new Date(now);next.setDate(next.getDate()+7);
 const todayGoal=target(p,now),nextGoal=target(p,next);
 return {todayGoal,nextGoal,reduction:Math.max(0,todayGoal-nextGoal)};
}
/** Find the next strictly lower planned daily target, including slow schedules beyond 14 days. */
export function nextReductionMilestone(p:Profile,now:Date):{date:Date;goal:number}|null {
 const current=target(p,now);
 if(p.mode!=='reduce'||current<=0||p.dailyTargetOverride!==null)return null;
 const horizon=p.plannedQuitAt?Math.min(3660,Math.max(0,calendarDay(new Date(p.plannedQuitAt))-calendarDay(now)+1)):Math.min(3660,current*7+8);
 for(let offset=1;offset<=horizon;offset++){
  const day=new Date(now);day.setDate(day.getDate()+offset);
  const goal=target(p,day);
  if(goal<current)return {date:day,goal};
 }
 return null;
}
/** Re-anchor future reduction goals after a user changes their daily cigarette target.
 * Existing entries, baseline and original savings start are retained by the caller.
 * A scheduled quit date remains fixed; normal plans keep their selected pace. */
export function adjustReductionTarget(p:Profile,value:number|null,now:Date):Profile {
 if(p.mode!=='reduce')return p;
 if(value===null)return {...p,dailyTargetOverride:null};
 if(!Number.isInteger(value)||value<0) return p;
 return {...p,startAt:now.toISOString(),originalStartAt:p.originalStartAt??p.startAt,planStartTarget:value,dailyTargetOverride:null};
}
/** Switch from a fixed quit date back to the saved gradual pace.
 * Resume at today's planned level rather than retroactively changing history. */
export function resumeGradualReduction(p:Profile,now:Date):Profile {
 if(p.mode!=='reduce'||!p.plannedQuitAt)return p;
 const current=target({...p,dailyTargetOverride:null},now);
 const {plannedQuitAt:_previousDate,...rest}=p;
 return {...rest,plannedQuitAt:undefined,startAt:now.toISOString(),originalStartAt:p.originalStartAt??p.startAt,planStartTarget:current,dailyTargetOverride:null};
}
/** Restart only the future reduction schedule; the caller retains all historical records. */
export function restartReductionPlan(p:Profile,now:Date):Profile {
 if(p.mode!=='reduce')return p;
 const current=target({...p,dailyTargetOverride:null},now);
 const {plannedQuitAt:_previousDate,...rest}=p;
 return {...rest,plannedQuitAt:undefined,startAt:now.toISOString(),originalStartAt:p.originalStartAt??p.startAt,planStartTarget:current,dailyTargetOverride:null};
}
/** Reschedule only future targets, keeping the current planned reduction level. */
export function rescheduleQuitPlan(p:Profile,quitAt:Date,now:Date):Profile {
 const current=target({...p,dailyTargetOverride:null},now);
 return {...p,plannedQuitAt:quitAt.toISOString(),startAt:now.toISOString(),planStartTarget:current,originalStartAt:p.originalStartAt??p.startAt};
}
/** Parse a strictly future local calendar date without accepting rolled-over dates. */
export function parseFutureQuitDate(input:string,now:Date):Date|null {
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
 if(!match)return null;
 const year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);
 const candidate=new Date(year,month-1,day,12);
 if(!Number.isFinite(candidate.getTime())||candidate.getFullYear()!==year||candidate.getMonth()+1!==month||candidate.getDate()!==day)return null;
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
 return new Date(year,month-1,day).getTime()>today.getTime()?candidate:null;
}
export function quitDate(p:Profile){if(p.mode==='quit')return new Date(p.startAt);if(p.plannedQuitAt)return new Date(p.plannedQuitAt);const interval=p.speed==='gentle'?7:p.speed==='fast'?2:4;const start=new Date(p.startAt);start.setDate(start.getDate()+(p.planStartTarget??p.baseline)*interval);return start;}
export function countOn(entries:Cigarette[],date:string){return entries.filter(e=>dayKey(new Date(e.at))===date).length;}
export function savings(data:Data,now=new Date()){const p=data.profile;if(!p)return 0;const days=Math.max(0,calendarDay(now)-calendarDay(new Date(p.originalStartAt??p.startAt))+1);const expected=p.baseline*days;const actual=data.entries.filter(e=>new Date(e.at)>=new Date(p.originalStartAt??p.startAt)&&new Date(e.at)<=now).length;return Math.max(0,expected-actual)*p.packPrice/p.packSize;}
export function validateData(v:unknown):v is Data {if(!v||typeof v!=='object')return false;const x=v as Data;if(!Array.isArray(x.entries)||!Array.isArray(x.cravings)||!Array.isArray(x.checkins))return false;if(x.profile!==null&&(!x.profile||!['reduce','quit'].includes(x.profile.mode)||!Number.isFinite(x.profile.baseline)||x.profile.baseline<0||!Number.isFinite(x.profile.packSize)||x.profile.packSize<=0||!Number.isFinite(x.profile.packPrice)||x.profile.packPrice<0))return false;if(x.profile?.plannedQuitAt!==undefined && (!Number.isFinite(Date.parse(x.profile.plannedQuitAt)) || dayKey(new Date(x.profile.plannedQuitAt))<=dayKey(new Date(x.profile.startAt))))return false;return x.entries.every(e=>typeof e.id==='string'&&Number.isFinite(Date.parse(e.at)))&&x.cravings.every(e=>typeof e.id==='string'&&Number.isFinite(Date.parse(e.at)))&&x.checkins.every(e=>typeof e.date==='string'&&typeof e.complete==='boolean'&&typeof e.smokeFree==='boolean');}
