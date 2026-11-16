import {NativeModules} from 'react-native';
import {DeletionError} from './accountDeletionSafety';
type Lifecycle={markRestartRequired:()=>Promise<void>;isRestartRequired:()=>Promise<boolean>;closeAfterDeletion:()=>Promise<void>};
function lifecycle():Lifecycle{
 const native=NativeModules.SmokeLessDeletionLifecycle as Lifecycle|undefined;
 if(!native?.markRestartRequired||!native.isRestartRequired||!native.closeAfterDeletion)throw new DeletionError('Den här appversionen behöver uppdateras för att slutföra säker kontoradering.');
 return native;
}
export async function markDeletionRestart(){await lifecycle().markRestartRequired();}
export async function deletionRestartRequired(){return lifecycle().isRestartRequired();}
export async function closeDeletedApp(){await lifecycle().closeAfterDeletion();}
