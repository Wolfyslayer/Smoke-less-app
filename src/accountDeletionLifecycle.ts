import {DeletionError} from './accountDeletionSafety';
export async function markDeletionRestart():Promise<void>{throw new DeletionError('Säker omstart kräver en uppdaterad Android-app.');}
export async function deletionRestartRequired():Promise<boolean>{return false;}
export async function closeDeletedApp():Promise<void>{throw new DeletionError('Stäng appen helt i Androids appinställningar och öppna den igen.');}
