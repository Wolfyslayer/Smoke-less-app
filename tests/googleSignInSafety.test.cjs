const {test} = require('node:test');
const assert = require('node:assert/strict');
const {googleSignInFailure} = require('../src/auth/googleSignInSafety.cjs');

test('cancelled Google sign-in is not treated as an account change', () => {
 assert.equal(googleSignInFailure({code:'SIGN_IN_CANCELLED'}).kind,'cancelled');
});
test('credential conflicts require explicit safe linking', () => {
 for(const code of ['auth/account-exists-with-different-credential','auth/credential-already-in-use']){
  const result=googleSignInFailure({code});
  assert.equal(result.kind,'account-conflict');
  assert.match(result.message,/befintliga konto/);
 }
});
test('network and Play services errors offer safe fallback', () => {
 assert.equal(googleSignInFailure({code:'auth/network-request-failed'}).kind,'network');
 assert.equal(googleSignInFailure({code:'PLAY_SERVICES_NOT_AVAILABLE'}).kind,'unavailable');
});
test('misconfiguration and unexpected values never expose credentials', () => {
 assert.equal(googleSignInFailure({code:'DEVELOPER_ERROR'}).kind,'configuration');
 const result=googleSignInFailure({code:'other',token:'secret'});
 assert.equal(result.kind,'unknown');
 assert.doesNotMatch(result.message,/secret/);
});

test('every supported cancellation code is harmless and gives Swedish guidance', () => {
 for (const code of ['SIGN_IN_CANCELLED', '12501', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request']) {
  const result=googleSignInFailure({code});
  assert.equal(result.kind,'cancelled');
  assert.match(result.message,/avbröts/);
 }
});
test('configuration failures are distinct from account conflicts', () => {
 for (const code of ['DEVELOPER_ERROR','auth/invalid-credential','auth/operation-not-allowed']) {
  assert.equal(googleSignInFailure({code}).kind,'configuration');
 }
});
test('classifier is pure and cannot mutate session-like error payloads', () => {
 const error=Object.freeze({code:'auth/account-exists-with-different-credential',uid:'existing-uid',credential:'private-token'});
 const before=JSON.stringify(error);
 const result=googleSignInFailure(error);
 assert.equal(JSON.stringify(error),before);
 assert.equal(result.kind,'account-conflict');
 assert.doesNotMatch(result.message,/existing-uid|private-token/);
});
test('malformed error values fail closed without throwing', () => {
 for(const value of [null,undefined,'error',{}, {code:17}]) {
  const result=googleSignInFailure(value);
  assert.equal(result.kind,'unknown');
  assert.match(result.message,/Ingen historik har ändrats/);
 }
});

test('Android Google account picker checks Play services and accepts current response shape', async () => {
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/auth/googleNativeSignIn.cjs'),'utf8');
 const calls=[];
 const GoogleSignin={
  configure(options){calls.push(['configure',options.webClientId])},
  async hasPlayServices(){calls.push(['play'])},
  async signOut(){calls.push(['signOut'])},
  async signIn(){calls.push(['signIn']);return {data:{idToken:'example-token'}}}
 };
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,require(name){
  assert.equal(name,'@react-native-google-signin/google-signin');
  return {GoogleSignin};
 }});
 assert.equal(await module.exports.requestGoogleIdToken('123456789-example.apps.googleusercontent.com'), 'example-token');
 assert.deepEqual(calls,[['configure','123456789-example.apps.googleusercontent.com'],['play'],['signOut'],['signIn']]);
});
test('Android Google account picker rejects missing OAuth config before loading native library',async()=>{
 const {requestGoogleIdToken}=require('../src/auth/googleNativeSignIn.cjs');
 await assert.rejects(requestGoogleIdToken(''),error=>error.code==='DEVELOPER_ERROR');
});

test('Android picker stops before account selection if Play services fail',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/auth/googleNativeSignIn.cjs'),'utf8');
 let selected=false;
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,require:()=>({GoogleSignin:{
  configure(){},async signOut(){},
  async hasPlayServices(){throw Object.assign(new Error('unavailable'),{code:'PLAY_SERVICES_NOT_AVAILABLE'})},
  async signIn(){selected=true;return {data:{idToken:'unexpected'}}}
 }})});
 await assert.rejects(module.exports.requestGoogleIdToken('123456789-example.apps.googleusercontent.com'),error=>error.code==='PLAY_SERVICES_NOT_AVAILABLE');
 assert.equal(selected,false);
});
test('Android picker refuses successful response without an ID token',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/auth/googleNativeSignIn.cjs'),'utf8');
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,require:()=>({GoogleSignin:{
  configure(){},async hasPlayServices(){},async signOut(){},async signIn(){return {data:{idToken:null}}}
 }})});
 await assert.rejects(module.exports.requestGoogleIdToken('123456789-example.apps.googleusercontent.com'),error=>error.code==='auth/invalid-credential');
});

test('Android picker treats an explicitly cancelled result as cancellation',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/auth/googleNativeSignIn.cjs'),'utf8');
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,require:()=>({GoogleSignin:{
  configure(){},async hasPlayServices(){},async signOut(){},async signIn(){return {type:'cancelled',data:null}}
 }})});
 await assert.rejects(module.exports.requestGoogleIdToken('123456789-example.apps.googleusercontent.com'),error=>error.code==='SIGN_IN_CANCELLED');
});

test('concurrent native Google request is not misclassified as a user cancellation',()=>{
 const result=googleSignInFailure({code:'IN_PROGRESS'});
 assert.equal(result.kind,'unavailable');
 assert.match(result.message,/pågår redan/);
});

test('Android picker rejects malformed OAuth client IDs before loading native module',async()=>{
 const {requestGoogleIdToken}=require('../src/auth/googleNativeSignIn.cjs');
 for(const invalid of ['not-a-client-id','android-client','https://example.com','123456789-example.apps.googleusercontent.com.evil.test']){
  await assert.rejects(requestGoogleIdToken(invalid),error=>error.code==='DEVELOPER_ERROR');
 }
});

test('native Google sign-in refuses an already authenticated session and never links identities implicitly',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/authService.native.ts'),'utf8');
 const fn=source.slice(source.indexOf('export async function signInWithGoogleCredential'));
 assert.match(fn,/if\(auth\.currentUser\)throw Error/);
 assert.match(fn,/signInWithCredential\(auth,GoogleAuthProvider\.credential\(idToken\)\)/);
 assert.doesNotMatch(fn,/linkWithCredential|updateCurrentUser|deleteUser|mergeGuestHistory/);
});

test('Android build workflows configure Google OAuth before Expo prebuild',()=>{
 const fs=require('node:fs'),path=require('node:path');
 for(const file of ['native-android.yml','browserstack-apk.yml']){
  const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows',file),'utf8');
  assert.match(workflow,/GOOGLE_SERVICES_JSON_BASE64/);
  assert.match(workflow,/android_client_info\?\.package_name === 'com\.smokeless\.app'/);
  assert.match(workflow,/c\.client_type === 3/);
  assert.match(workflow,/EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=/);
  assert.ok(workflow.indexOf('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=')<workflow.indexOf('npx expo prebuild'));
  assert.doesNotMatch(workflow,/console\.log\(webClients\[0\]\)/);
 }
});

// A credential already belonging to another Firebase UID must never trigger a merge.
test('Google credential conflict is explicit and does not expose account data',()=>{
 for(const code of ['auth/credential-already-in-use','auth/account-exists-with-different-credential']){
  const result=googleSignInFailure({code,uid:'private-user',idToken:'private-token'});
  assert.equal(result.kind,'account-conflict');
  assert.match(result.message,/befintliga konto/);
  assert.doesNotMatch(result.message,/private-user|private-token/);
 }
});
test('native account linking requires reauthentication and preserves the existing UID',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/authService.native.ts'),'utf8');
 const fn=source.slice(source.indexOf('export async function linkGoogleToEmailAccount'));
 assert.match(fn,/user\.uid!==expectedUid/);
 assert.match(fn,/reauthenticateWithCredential\(user,EmailAuthProvider\.credential\(user\.email,password\)\)/);
 assert.match(fn,/linkWithCredential\(user,GoogleAuthProvider\.credential\(idToken\)\)/);
 assert.match(fn,/auth\.currentUser\?\.uid!==expectedUid/);
 assert.doesNotMatch(fn,/deleteUser|updateCurrentUser|mergeGuestHistory|signInWithCredential/);
});

test('Google sign-in cannot initiate account deletion or bypass the logged-in session guard',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/authService.native.ts'),'utf8');
 const signIn=source.slice(source.indexOf('export async function signInWithGoogleCredential'),source.indexOf('export async function linkGoogleToEmailAccount'));
 assert.match(signIn,/if\(auth\.currentUser\)throw Error/);
 assert.doesNotMatch(signIn,/deleteUser|firebaseSignOut|linkWithCredential|reauthenticateWithCredential/);
 const linking=source.slice(source.indexOf('export async function linkGoogleToEmailAccount'));
 assert.match(linking,/if\(!user\|\|user\.uid!==expectedUid/);
 assert.match(linking,/auth\.currentUser\?\.uid!==expectedUid/);
 assert.doesNotMatch(linking,/deleteUser|firebaseSignOut|signInWithCredential/);
});
test('account deletion is not exposed as an enabled button in AccountScreen',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/screens/AccountScreen.tsx'),'utf8');
 assert.match(source,/Säker kontoradering behöver färdigställas och testas innan funktionen kan aktiveras/);
 assert.doesNotMatch(source,/<Btn title="Radera konto"/);
});
