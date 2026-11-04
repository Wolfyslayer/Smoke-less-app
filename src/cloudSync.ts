import type {Data} from './domain';
export async function syncCloudData(_uid:string,_local:Data):Promise<Data>{throw new Error('Automatisk synkronisering kräver Android med Firebase.');}

export function resetObservedCloudPlans():void { /* No native sync on web. */ }

/** Web fallback: realtime Firestore listeners require the native Firebase SDK. */
export function subscribeCloudChanges(_uid:string,_onChange:()=>void,_onError:(error:Error)=>void):()=>void {return ()=>{};}
