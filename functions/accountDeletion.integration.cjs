'use strict';
const {test,after}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
// Fail before importing/initializing Admin if the command is not strictly local.
const project='demo-smokeless-qa';
assert.match(process.env.FIRESTORE_EMULATOR_HOST||'',/^127\.0\.0\.1:\d+$/);
assert.match(process.env.FIREBASE_AUTH_EMULATOR_HOST||'',/^127\.0\.0\.1:\d+$/);
assert.equal(process.env.GCLOUD_PROJECT,project);
const {initializeApp}=require('firebase-admin/app'),{getFirestore,Timestamp}=require('firebase-admin/firestore'),{getAuth}=require('firebase-admin/auth');
initializeApp({projectId:project});const db=getFirestore(),auth=getAuth(),created=[];
const endpoint=`http://127.0.0.1:5001/${project}/europe-west1/deleteMyAccount`;
async function user(){const response=await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator-only`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`delete-${crypto.randomUUID()}@example.invalid`,password:crypto.randomBytes(18).toString('hex'),returnSecureToken:true})});const value=await response.json();assert.ok(response.ok,JSON.stringify(value));created.push(value.localId);return {uid:value.localId,token:value.idToken};}
async function call(token,data={}){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({data})});return {status:response.status,body:await response.json()};}
after(async()=>{for(const uid of created){await db.recursiveDelete(db.doc(`users/${uid}`));await auth.deleteUser(uid).catch(error=>{if(error.code!=='auth/user-not-found')throw error;});}});
test('real callable deletes only the authenticated user data before Auth and keeps the server lock',async()=>{
 const a=await user(),b=await user();const base=db.doc(`users/${a.uid}`),other=db.doc(`users/${b.uid}/entries/keep`);
 for(const collection of ['entries','cravings','checkins','settings'])await base.collection(collection).doc(collection==='settings'?'plan':'one').set({schemaVersion:1,revision:1,deleted:false,updatedAt:Timestamp.now(),test:'local-emulator-only'});
 await other.set({keep:true});const result=await call(a.token);assert.equal(result.status,200);assert.equal(result.body.result.deleted,true);
 for(const collection of ['entries','cravings','checkins','settings'])assert.equal((await base.collection(collection).get()).empty,true);
 await assert.rejects(auth.getUser(a.uid),error=>error.code==='auth/user-not-found');assert.equal((await base.collection('control').doc('deletion').get()).get('state'),'completed');assert.equal((await other.get()).get('keep'),true);assert.ok(await auth.getUser(b.uid));
});
test('unauthenticated calls and caller-supplied UID are rejected without deleting either account',async()=>{
 const a=await user(),b=await user();const unauth=await call(null);assert.equal(unauth.status,401);const extra=await call(a.token,{uid:b.uid});assert.equal(extra.status,400);assert.ok(await auth.getUser(a.uid));assert.ok(await auth.getUser(b.uid));assert.equal((await db.doc(`users/${a.uid}/control/deletion`).get()).exists,false);
});
test('unknown nested data keeps Auth and a pending lock instead of reporting a complete deletion',async()=>{
 const a=await user(),base=db.doc(`users/${a.uid}`);await base.collection('entries').doc('one').set({test:true});await base.collection('entries').doc('one').collection('nested').doc('keep').set({test:true});const result=await call(a.token);assert.ok(result.status>=400);assert.ok(await auth.getUser(a.uid));assert.equal((await base.collection('control').doc('deletion').get()).get('state'),'deleting');assert.equal((await base.collection('entries').doc('one').get()).exists,true);
});

test('a stale authenticated client cannot replay schema-valid writes after deletion while another account still works',async()=>{
 const a=await user(),b=await user();
 const firestoreBase=`http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/${project}/databases/(default)/documents`;
 const at=new Date(Date.now()-1000).toISOString();
 const metadata={schemaVersion:{integerValue:'1'},revision:{integerValue:'1'},deleted:{booleanValue:false},updatedAt:{timestampValue:at}};
 const fixtures=[
  ['entries/cached-entry',{...metadata,id:{stringValue:'cached-entry'},at:{stringValue:at}}],
  ['cravings/cached-craving',{...metadata,id:{stringValue:'cached-craving'},at:{stringValue:at},intensity:{integerValue:'3'},trigger:{stringValue:'synthetic QA'}}],
  ['checkins/2026-11-17',{...metadata,date:{stringValue:'2026-11-17'},complete:{booleanValue:true},smokeFree:{booleanValue:false}}],
  ['settings/plan',{...metadata,mode:{stringValue:'reduce'},baseline:{integerValue:'8'},packSize:{integerValue:'20'},packPrice:{doubleValue:0},speed:{stringValue:'gentle'},startAt:{stringValue:at},dailyTargetOverride:{integerValue:'8'}}],
 ];
 const write=(token,uid,path,fields)=>fetch(`${firestoreBase}/users/${uid}/${path}`,{method:'PATCH',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({fields})});
 // Each exact payload must first pass real client rules. A malformed payload
 // or an invalid token must never make the subsequent denial a false positive.
 for(const [path,fields] of fixtures)assert.equal((await write(a.token,a.uid,path,fields)).status,200,`positive client control: ${path.split('/')[0]}`);
 const controlPath=db.doc(`users/${b.uid}/entries/keep`);await controlPath.set({keep:'other account unchanged'});const controlBefore=(await controlPath.get()).data();
 const result=await call(a.token);assert.equal(result.status,200);assert.equal(result.body.result.deleted,true);
 await assert.rejects(auth.getUser(a.uid),error=>error.code==='auth/user-not-found');
 // The old token still authenticates the same UID for its read-only receipt.
 // Therefore write denial below tests the deletion lock, not lost identity.
 const receipt=await fetch(`${firestoreBase}/users/${a.uid}/control/deletion`,{headers:{Authorization:`Bearer ${a.token}`}});
 assert.equal(receipt.status,200);assert.equal((await receipt.json()).fields.state.stringValue,'completed');
 for(const [path,fields] of fixtures){
  assert.equal((await write(a.token,a.uid,path,fields)).status,403,`stale replay blocked: ${path.split('/')[0]}`);
  assert.equal((await db.doc(`users/${a.uid}/${path}`).get()).exists,false);
 }
 const otherFields={...metadata,id:{stringValue:'after-deletion-control'},at:{stringValue:at}};
 assert.equal((await write(b.token,b.uid,'entries/after-deletion-control',otherFields)).status,200);
 assert.deepEqual((await controlPath.get()).data(),controlBefore);assert.ok(await auth.getUser(b.uid));
});
