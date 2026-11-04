const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
const shareFunction=profile.match(/const shareSupport=async\(\)=>\{[\s\S]*?\};/);
test('sharing is an explicit user action and uses the system dialog',()=>{
 assert.ok(shareFunction,'sharing handler exists');
 assert.match(profile,/onPress=\{\(\)=>void shareSupport\(\)\}/);
 assert.match(shareFunction[0],/Share\.share\(\{message:/);
});
test('shared message is a static generic encouragement, not personal data',()=>{
 assert.ok(shareFunction);
 assert.match(shareFunction[0],/message:'Ett litet steg i taget kan göra skillnad/);
 assert.doesNotMatch(shareFunction[0],/profile\.|accountEmail|history|cravings|entries|\$\{/);
 assert.doesNotMatch(shareFunction[0],/fetch\(|firestore|AsyncStorage|axios/);
});
test('sharing is available without an account and does not request contacts',()=>{
 assert.ok(shareFunction);
 assert.doesNotMatch(shareFunction[0],/loggedIn|currentUser|auth|Contacts|Permissions/);
 assert.match(profile,/Dela en uppmuntran/);
});
test('sharing explains recipient choice, cancellation, and privacy boundaries',()=>{
 assert.match(profile,/Ingenting delas automatiskt/);
 assert.match(profile,/du väljer själv mottagare/);
 assert.match(profile,/kan ha egna integritetsvillkor/);
 assert.match(profile,/Inga personliga registreringar följer med/);
});
test('sharing action is accessible',()=>{
 assert.match(profile,/accessibilityRole="button" accessibilityLabel="Dela ett stödmeddelande"/);
 assert.match(profile,/accessibilityHint="Öppnar telefonens delningsdialog där du själv väljer mottagare eller avbryter/);
 assert.match(profile,/accessibilityRole="header"[^>]*>Dela ett stödmeddelande/);
});
