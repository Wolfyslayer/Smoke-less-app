'use strict';

/** Android account picker. Install @react-native-google-signin/google-signin before calling. */
async function requestGoogleIdToken(webClientId) {
  if (typeof webClientId !== 'string' || !webClientId.trim()) {
    const error = new Error('Google OAuth-webbklient saknas i konfigurationen.');
    error.code = 'DEVELOPER_ERROR';
    throw error;
  }
  const {GoogleSignin} = require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({webClientId});
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true});
  const result = await GoogleSignin.signIn();
  const idToken = result?.data?.idToken ?? result?.idToken;
  if (typeof idToken !== 'string' || !idToken.trim()) {
    const error = new Error('Google returnerade ingen ID-token.');
    error.code = 'auth/invalid-credential';
    throw error;
  }
  return idToken;
}
module.exports = {requestGoogleIdToken};
