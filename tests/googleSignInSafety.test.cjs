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
