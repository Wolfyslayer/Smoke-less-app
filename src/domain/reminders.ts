import {normalizeReminderFrequency,type ReminderFrequency} from './maintenance';
export class ReminderError extends Error {}
export type ReminderSettings={checkin:boolean;risk:boolean;hour:number;minute:number;riskHour:number;riskMinute:number;frequency:ReminderFrequency;quiet:boolean;quietStart:number;quietEnd:number};
export const reminderDefaults:ReminderSettings={checkin:false,risk:false,hour:19,minute:0,riskHour:15,riskMinute:0,frequency:'daily',quiet:true,quietStart:22,quietEnd:7};
const integer=(value:unknown,max:number,fallback:number)=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=max?value:fallback;
export function normalizeReminders(raw:unknown):ReminderSettings{
 const v=raw&&typeof raw==='object'?raw as Partial<ReminderSettings>:{};
 return {checkin:v.checkin===true,risk:v.risk===true,hour:integer(v.hour,23,19),minute:integer(v.minute,59,0),riskHour:integer(v.riskHour,23,15),riskMinute:integer(v.riskMinute,59,0),frequency:normalizeReminderFrequency(v.frequency),quiet:v.quiet!==false,quietStart:integer(v.quietStart,23,22),quietEnd:integer(v.quietEnd,23,7)};
}
export function isQuietTime(hour:number,minute:number,settings:ReminderSettings){
 if(!settings.quiet)return false;
 const time=hour*60+minute,start=settings.quietStart*60,end=settings.quietEnd*60;
 return start===end|| (start<end?time>=start&&time<end:time>=start||time<end);
}
export function validateReminders(settings:ReminderSettings){
 const normalized=normalizeReminders(settings);
 if(Object.keys(normalized).some(key=>normalized[key as keyof ReminderSettings]!==settings[key as keyof ReminderSettings]))throw new ReminderError('Ogiltiga inställningar. Kontrollera tiderna.');
 if((settings.checkin&&isQuietTime(settings.hour,settings.minute,settings))||(settings.risk&&isQuietTime(settings.riskHour,settings.riskMinute,settings)))throw new ReminderError('En vald tid ligger inom tysta tider. Ändra tiden eller tystnadsfönstret.');
}
export const reminderIds=['smokeless-checkin-v2','smokeless-risk-v2'] as const;
export function reminderRequests(settings:ReminderSettings){
 validateReminders(settings);
 const items:{identifier:string;body:string;hour:number;minute:number;weekly:boolean}[]=[];
 if(settings.checkin)items.push({identifier:reminderIds[0],body:'En stund för dig? Öppna appen när det passar.',hour:settings.hour,minute:settings.minute,weekly:settings.frequency==='weekly'});
 if(settings.risk)items.push({identifier:reminderIds[1],body:'Ta en paus om du vill. Din plan finns i appen.',hour:settings.riskHour,minute:settings.riskMinute,weekly:false});
 return items;
}
