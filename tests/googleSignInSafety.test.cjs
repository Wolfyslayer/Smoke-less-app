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
  async signIn(){calls.push(['signIn']);return {data:{idToken:'example-token'}}}
 };
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,require(name){
  assert.equal(name,'@react-native-google-signin/google-signin');
  return {GoogleSignin};
 }});
 assert.equal(await module.exports.requestGoogleIdToken('oauth-web-client'), 'example-token');
 assert.deepEqual(calls,[['configure','oauth-web-client'],['play'],['signIn']]);
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
  configure(){},
  async hasPlayServices(){throw Object.assign(new Error('unavailable'),{code:'PLAY_SERVICES_NOT_AVAILABLE'})},
  async signIn(){selected=true;return {data:{idToken:'unexpected'}}}
 }})});
 await assert.rejects(module.exports.requestGoogleIdToken('web-client'),error=>error.code==='PLAY_SERVICES_NOT_AVAILABLE');
 assert.equal(selected,false);
});
test('Android picker refuses successful response without an ID token',async()=>{
 const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../src/auth/googleNativeSignIn.cjs'),'utf8');
 const module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,require:()=>({GoogleSignin:{
  configure(){},async hasPlayServices(){},async signIn(){return {data:{idToken:null}}}
 }})});
 await assert.rejects(module.exports.requestGoogleIdToken('web-client'),error=>error.code==='auth/invalid-credential');
});
