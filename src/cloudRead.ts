import type {Data} from './domain';
import type {MergePreview} from './syncMerge';
export async function previewCloudImport(_uid: string, _local: Data): Promise<MergePreview> {
  throw new Error('Molnförhandsgranskning kräver Android/iOS med Firebase.');
}
