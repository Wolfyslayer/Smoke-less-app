import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut as firebaseSignOut,sendEmailVerification as firebaseSendEmailVerification,reload,GoogleAuthProvider,EmailAuthProvider,reauthenticateWithCredential,linkWithCredential,signInWithCredential} from '@react-native-firebase/auth';
export type AccountUser={uid:string;email:string|null;emailVerified:boolean};
const client=()=>getAuth();
export function observeUser(callback:(user:AccountUser|null)=>void){return onAuthStateChanged(client(),user=>callback(user?{uid:user.uid,email:user.email,emailVerified:user.emailVerified}:null))}
export async function signUp(email:string,password:string){if(password.length<6)throw Error('Lösenordet måste vara minst 6 tecken.');await createUserWithEmailAndPassword(client(),email,password)}
export async function signIn(email:string,password:string){await signInWithEmailAndPassword(client(),email,password)}
export async function resetPassword(email:string){await sendPasswordResetEmail(client(),email)}
export async function signOut(){await firebaseSignOut(client())}
export async function sendVerificationEmail(){const user=client().currentUser;if(!user)throw Error('Logga in först.');if(user.emailVerified)return;await firebaseSendEmailVerification(user)}
export async function refreshEmailVerification(){const user=client().currentUser;if(!user)throw Error('Logga in först.');await reload(user);return !!client().currentUser?.emailVerified}

export async function signInWithGoogleCredential(idToken:string){
 if(typeof idToken!=='string'||!idToken.trim())throw Error('Google-inloggningen saknar en giltig ID-token.');
 const auth=client();
 if(auth.currentUser)throw Error('Du är redan inloggad. Logga ut innan du byter konto.');
 try{
  await signInWithCredential(auth,GoogleAuthProvider.credential(idToken));
 }catch(error){
  // Do not automatically link accounts or transfer history after a credential conflict.
  // The existing UID-scoped session and cloud sync remain the only data authority.
  throw error;
 }
}

export async function linkGoogleToEmailAccount(idToken:string,password:string,expectedUid:string):Promise<void>{
 if(!idToken?.trim()||!password||!expectedUid)throw Error('Google-kopplingen saknar obligatoriska uppgifter.');
 const auth=client();
 const user=auth.currentUser;
 if(!user||user.uid!==expectedUid||!user.email)throw Error('Kontot har ändrats. Ingen Google-koppling genomfördes.');
 if(user.providerData.some(provider=>provider.providerId==='google.com'))throw Error('Google är redan kopplat till ditt konto.');
 if(!user.providerData.some(provider=>provider.providerId==='password'))throw Error('Detta konto använder inte e-post och lösenord.');
 await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,password));
 if(auth.currentUser?.uid!==expectedUid)throw Error('Kontot ändrades under verifieringen.');
 await linkWithCredential(user,GoogleAuthProvider.credential(idToken));
 if(auth.currentUser?.uid!==expectedUid)throw Error('Kontot ändrades under Google-kopplingen.');
}
