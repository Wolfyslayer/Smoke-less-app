import type {Data} from './domain';

export type GuestMergePreview = {
  merged: Data;
  added: {entries:number; cravings:number; checkins:number};
  conflicts: string[];
};

/** Preserve the account plan; only append guest records with non-conflicting identities. */
export function previewGuestMerge(account:Data,guest:Data):GuestMergePreview {
  const conflicts:string[]=[];
  function append<T>(kind:string,current:T[],incoming:T[],key:(item:T)=>string) {
    const byId=new Map(current.map(item=>[key(item),item]));
    const result=[...current];let added=0;
    for(const item of incoming) {
      const id=key(item),existing=byId.get(id);
      if(existing!==undefined) {
        if(JSON.stringify(existing)!==JSON.stringify(item)) conflicts.push(kind+': '+id);
        continue;
      }
      byId.set(id,item);result.push(item);added++;
    }
    return {result,added};
  }
  const entries=append('cigaretter',account.entries,guest.entries,item=>item.id);
  const cravings=append('röksug',account.cravings,guest.cravings,item=>item.id);
  const checkins=append('avstämningar',account.checkins,guest.checkins,item=>item.date);
  return {
    merged:{profile:account.profile??guest.profile,entries:entries.result,cravings:cravings.result,checkins:checkins.result},
    added:{entries:entries.added,cravings:cravings.added,checkins:checkins.added},
    conflicts,
  };
}
