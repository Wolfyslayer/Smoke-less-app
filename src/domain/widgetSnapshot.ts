/** Minimal, privacy-safe Android widget snapshot. Never persist account identity or history here. */
export type WidgetSnapshotInput={date:string;todayCount:number;dailyGoal:number;enabled:boolean};
export type WidgetSnapshot={version:1;date:string;todayCount:number;dailyGoal:number;remaining:number;progressPercent:number};
const count=(n:number)=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
const validDate=(date:string)=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date+'T12:00:00Z'))&&new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date;
/** Only produce a snapshot after explicit opt-in and for a validated local calendar day. */
export function makeWidgetSnapshot(input:WidgetSnapshotInput):WidgetSnapshot|null{
 if(!input.enabled||!validDate(input.date))return null;
 const todayCount=count(input.todayCount),dailyGoal=count(input.dailyGoal);
 return {version:1,date:input.date,todayCount,dailyGoal,remaining:Math.max(0,dailyGoal-todayCount),progressPercent:dailyGoal===0?(todayCount>0?100:0):Math.min(100,Math.round(todayCount/dailyGoal*100))};
}
/** Never show yesterday's snapshot as today's progress. */
export function readWidgetSnapshot(snapshot:unknown,today:string):WidgetSnapshot|null{
 if(!snapshot||typeof snapshot!=='object'||!validDate(today))return null;
 const value=snapshot as Partial<WidgetSnapshot>;
 if(value.version!==1||value.date!==today||!validDate(value.date)||!Number.isSafeInteger(value.todayCount)||!Number.isSafeInteger(value.dailyGoal)||value.todayCount!<0||value.dailyGoal!<0)return null;
 const clean=makeWidgetSnapshot({enabled:true,date:today,todayCount:value.todayCount!,dailyGoal:value.dailyGoal!});
 if(!clean||Object.keys(value).sort().join(',')!==Object.keys(clean).sort().join(','))return null;
 if(value.remaining!==clean.remaining||value.progressPercent!==clean.progressPercent)return null;
 return clean;
}
