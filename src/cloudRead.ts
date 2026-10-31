import type {Data} from './domain';
import type {MergePreview} from './syncMerge';
export async function previewCloudImport(_uid: string, _local: Data): Promise<MergePreview> {
  throw new Error('Molnförhandsgranskning kräver Android/iOS med Firebase.');
}

export async function inspectCloudDeletion(_uid:string):Promise<{entries:number;cravings:number;checkins:number;plan:boolean;hasTombstones:boolean}>{throw new Error('Molnkontroll kräver Android med Firebase.');}
