import type {Data} from '../domain';

/** Append a craving log entry while preserving the rest of the user's history. */
export function addCravingEntry(data:Data,intensity:number,trigger:string):Data{
 const id=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 return {...data,cravings:[...data.cravings,{id,at:new Date().toISOString(),intensity,trigger}]};
}
