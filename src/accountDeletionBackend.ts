import {DeletionError} from './accountDeletionSafety';
export const deletionEnabled=false;
export async function recentDeletionToken(_uid:string):Promise<{token:string;authTime:number}>{throw new DeletionError('Kontoradering kräver Android-appen.');}
export async function requestAccountDeletion(_token:string):Promise<unknown>{throw new DeletionError('Kontoradering är inte aktiverad.');}
export async function refreshDeletionReceipt(_uid:string):Promise<'pending'|'confirmed'|null>{return null;}
export async function finalizeDeletedDevice(_uid:string,_currentUid:()=>string|null):Promise<void>{throw new DeletionError('Kontoradering kräver Android-appen.');}
export async function finishDeletionCacheReset():Promise<'ready'|'restart-required'>{return 'ready';}
export {restartDeletedApp} from './accountDeletionLifecycle';
