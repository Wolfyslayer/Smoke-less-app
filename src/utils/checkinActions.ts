import type {Data} from '../domain';

/** Mark a day as checked in, replacing an earlier check-in for that date. */
export function confirmDailyCheckin(data:Data,date:string,todayCount:number):Data{
 return {...data,checkins:[...data.checkins.filter(c=>c.date!==date),{date,complete:true,smokeFree:todayCount===0}]};
}
