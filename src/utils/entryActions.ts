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

/** Register a cigarette and clear any completed check-in for that day. */
export function addCigaretteEntry(data:Data,feeling:string|null,trigger:string|null):Data{
 const at=new Date().toISOString(),day=dayKey(new Date(at));
 const id=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 return {...data,entries:[...data.entries,{id,at,...(feeling?{feeling}:{}),...(trigger?{trigger}:{})}],checkins:data.checkins.filter(c=>c.date!==day)};
}
