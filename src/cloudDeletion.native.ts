import AsyncStorage from '@react-native-async-storage/async-storage';
import {DeletionError,markLocalDeletion} from './accountDeletionSafety';
/** Only invoke for a control document read from the authenticated user's own path. */
export async function recordServerDeletion(uid:string,state:unknown):Promise<never>{
 await markLocalDeletion(AsyncStorage,uid,state==='completed'?'confirmed':'pending');
 throw new DeletionError(state==='completed'?'Kontots radering är bekräftad av servern. Slutför lokal städning.':'Kontoradering pågår. Kontots historik synkroniseras inte.');
}
