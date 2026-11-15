import {buildPersonalTrends} from './personalTrends';
import type {Data} from '../domain';
export function maintenanceSummary(data:Data,clock:number){
 const trends=buildPersonalTrends(data,clock),today=trends.recentDays.at(-1)!;
 return {confirmedDays:trends.confirmedSmokeFreeDays,longestStreak:trends.longestStreak,checked:today.complete,todayCount:today.entries,
  message:today.entries>0?'En registrering tar inte bort tidigare framsteg. Din plan och historik finns kvar. Du kan välja stöd för nästa stund.':'Behåll det som fungerar för dig. Du väljer själv när du vill stämma av eller förbereda en risksituation.'};
}
export type ReminderFrequency='daily'|'weekly';
export const WEEKLY_REMINDER_DAY=2;
export const normalizeReminderFrequency=(value:unknown):ReminderFrequency=>value==='weekly'?'weekly':'daily';
export function reminderPattern(frequency:ReminderFrequency,hour:number,minute:number){
 if(!Number.isInteger(hour)||hour<0||hour>23||!Number.isInteger(minute)||minute<0||minute>59)throw new Error('Invalid reminder time');
 return frequency==='weekly'?{type:'weekly' as const,weekday:WEEKLY_REMINDER_DAY,hour,minute}:{type:'daily' as const,hour,minute};
}
