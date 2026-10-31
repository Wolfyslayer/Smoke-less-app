import auth from '@react-native-firebase/auth';
export type AccountUser={uid:string;email:string|null;emailVerified:boolean};
const client=()=>auth();
export function observeUser(callback:(user:AccountUser|null)=>void){return client().onAuthStateChanged(user=>callback(user?{uid:user.uid,email:user.email,emailVerified:user.emailVerified}:null))}
export async function signUp(email:string,password:string){if(password.length<6)throw Error('Lösenordet måste vara minst 6 tecken.');await client().createUserWithEmailAndPassword(email,password)}
export async function signIn(email:string,password:string){await client().signInWithEmailAndPassword(email,password)}
export async function resetPassword(email:string){await client().sendPasswordResetEmail(email)}
export async function signOut(){await client().signOut()}

export async function sendVerificationEmail(){const user=client().currentUser;if(!user)throw Error('Logga in först.');if(user.emailVerified)return;await user.sendEmailVerification()}
export async function refreshEmailVerification(){const user=client().currentUser;if(!user)throw Error('Logga in först.');await user.reload();return !!client().currentUser?.emailVerified}
