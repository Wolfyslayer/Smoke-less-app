export type AccountUser={uid:string;email:string|null};
export function observeUser(callback:(user:AccountUser|null)=>void){callback(null);return ()=>{}}
const unavailable=()=>{throw new Error('Kontoinloggning är tillgänglig i Android-appen. Här kan du fortsätta utan konto.')};
export async function signUp(_email:string,_password:string){unavailable()}
export async function signIn(_email:string,_password:string){unavailable()}
export async function resetPassword(_email:string){unavailable()}
export async function signOut(){unavailable()}
