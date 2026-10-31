import type {Data} from '../domain';
import {dayKey} from '../domain';

/** Remove a cigarette entry and invalidate the daily check-in for its date. */
export function removeCigaretteEntry(data:Data,id:string):Data{
 return {
  ...data,
  entries:data.entries.filter(e=>e.id!==id),
  checkins:data.checkins.filter(c=>c.date!==dayKey(new Date(data.entries.find(e=>e.id===id)?.at??Date.now())))
 };
}
