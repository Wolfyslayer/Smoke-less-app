import {assertAccountWritable,writeAccountScoped} from './accountDeletionSafety';
export const DASHBOARD_CARDS=['goal','time','savings','progress','cravings','milestone'] as const;
export type DashboardCard=typeof DASHBOARD_CARDS[number];
export type DashboardPreferences={version:1;cards:DashboardCard[]};
const defaults:readonly DashboardCard[]=['goal','time','savings','progress'];
export const defaultDashboardPreferences=():DashboardPreferences=>({version:1,cards:[...defaults]});

export function normalizeDashboardPreferences(value:unknown):DashboardPreferences{
 if(!value||typeof value!=='object'||!('version' in value)||value.version!==1||!('cards' in value)||!Array.isArray(value.cards))return defaultDashboardPreferences();
 return {version:1,cards:[...new Set(value.cards.filter((id):id is DashboardCard=>DASHBOARD_CARDS.includes(id)))]};
}
export function toggleDashboardCard(value:DashboardPreferences,id:DashboardCard):DashboardPreferences{
 const current=normalizeDashboardPreferences(value);
 return {version:1,cards:current.cards.includes(id)?current.cards.filter(card=>card!==id):[...current.cards,id]};
}
export function moveDashboardCard(value:DashboardPreferences,id:DashboardCard,direction:-1|1):DashboardPreferences{
 const current=normalizeDashboardPreferences(value),index=current.cards.indexOf(id),next=index+direction;
 if(index<0||next<0||next>=current.cards.length)return current;
 [current.cards[index],current.cards[next]]=[current.cards[next],current.cards[index]];
 return current;
}
export function dashboardStorageKey(uid:string|null):string{
 return uid===null?'smokeless:dashboard:v1:guest':`smokeless:dashboard:v1:account:${encodeURIComponent(uid)}`;
}
type Storage={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>;removeItem?:(key:string)=>Promise<unknown>};
/** A queue per identity prevents late writes from winning after rapid edits/remounts. */
export function createDashboardStore(storage:Storage){
 const pending=new Map<string,Promise<unknown>>();
 return {
  async load(uid:string|null):Promise<DashboardPreferences>{
   const key=dashboardStorageKey(uid);
   await pending.get(key)?.catch(()=>{});
   await assertAccountWritable(storage,uid);
   const raw=await storage.getItem(key);
   if(raw===null)return defaultDashboardPreferences();
   try{return normalizeDashboardPreferences(JSON.parse(raw));}catch{return defaultDashboardPreferences();}
  },
  save(uid:string|null,value:DashboardPreferences):Promise<void>{
   const key=dashboardStorageKey(uid),snapshot=JSON.stringify(normalizeDashboardPreferences(value));
   const write=(pending.get(key)??Promise.resolve()).catch(()=>{}).then(()=>writeAccountScoped(storage,uid,key,snapshot));
   pending.set(key,write);
   void write.finally(()=>{if(pending.get(key)===write)pending.delete(key);}).catch(()=>{});
   return write;
  },
 };
}
