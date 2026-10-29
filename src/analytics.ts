import {CigaretteEntry} from './interval';
export const localDay=(at:string|Date)=>new Date(at).toLocaleDateString('sv-SE');
export function sortedHistory(entries:CigaretteEntry[]){return [...entries].filter(e=>Number.isFinite(new Date(e.at).getTime())).sort((a,b)=>b.at.localeCompare(a.at));}
export function intervalMinutes(entries:CigaretteEntry[]){
 const ordered=sortedHistory(entries).reverse();
 return ordered.slice(1).map((entry,i)=>Math.max(0,Math.floor((new Date(entry.at).getTime()-new Date(ordered[i].at).getTime())/60000)));
}
export function periodSummary(entries:CigaretteEntry[],start:Date,end:Date,baseline:number,packPrice:number,perPack:number){
 const recent=entries.filter(e=>{const at=new Date(e.at).getTime();return at>=start.getTime()&&at<=end.getTime()});
 const days=Math.max(1,Math.ceil((end.getTime()-start.getTime())/86400000));
 const intervals=intervalMinutes(entries).filter(n=>Number.isFinite(n));
 // Only observed cigarette counts are factual. Avoided cigarettes and savings are estimates
 // and require the user to confirm that they logged every cigarette during the period.
 const estimatedAvoided=Math.max(0,Math.floor(Math.max(0,baseline)*days-recent.length));
 return {recent,days,intervals,estimatedAvoided,estimatedSaved:estimatedAvoided*Math.max(0,packPrice)/Math.max(1,perPack)};
}

/** Rebuild interval facts after a timestamp edit, removal or undo. */
export function reconcileHistory(entries:CigaretteEntry[]):CigaretteEntry[]{
 const chronological=sortedHistory(entries).reverse();
 return chronological.map((entry,index)=>{
  const previous=chronological[index-1];
  const elapsedMinutes=previous?Math.max(0,Math.floor((Date.parse(entry.at)-Date.parse(previous.at))/60000)):0;
  return {...entry,elapsedMinutes,metTarget:!!previous&&elapsedMinutes>=entry.targetMinutes};
 }).reverse();
}
