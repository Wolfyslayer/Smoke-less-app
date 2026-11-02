import type {Data} from './domain';
export async function syncCloudData(_uid:string,_local:Data):Promise<Data>{throw new Error('Automatisk synkronisering kräver Android med Firebase.');}

export function resetObservedCloudPlans():void { /* No native sync on web. */ }
