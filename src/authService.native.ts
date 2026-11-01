import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail,signOut as firebaseSignOut,sendEmailVerification as firebaseSendEmailVerification,reload} from '@react-native-firebase/auth';
export type AccountUser={uid:string;email:string|null;emailVerified:boolean};
const client=()=>getAuth();
export function observeUser(callback:(user:AccountUser|null)=>void){return onAuthStateChanged(client(),user=>callback(user?{uid:user.uid,email:user.email,emailVerified:user.emailVerified}:null))}
export async function signUp(email:string,password:string){if(password.length<6)throw Error('Lösenordet måste vara minst 6 tecken.');await createUserWithEmailAndPassword(client(),email,password)}
export async function signIn(email:string,password:string){await signInWithEmailAndPassword(client(),email,password)}
export async function resetPassword(email:string){await sendPasswordResetEmail(client(),email)}
export async function signOut(){await firebaseSignOut(client())}
export async function sendVerificationEmail(){const user=client().currentUser;if(!user)throw Error('Logga in först.');if(user.emailVerified)return;await firebaseSendEmailVerification(user)}
export async function refreshEmailVerification(){const user=client().currentUser;if(!user)throw Error('Logga in först.');await reload(user);return !!client().currentUser?.emailVerified}
