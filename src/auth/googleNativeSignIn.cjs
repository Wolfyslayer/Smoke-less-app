'use strict';

/** Android account picker. Install @react-native-google-signin/google-signin before calling. */
async function requestGoogleIdToken(webClientId) {
  if (typeof webClientId !== 'string' || !webClientId.trim()) {
    const error = new Error('Google OAuth-webbklient saknas i konfigurationen.');
    error.code = 'DEVELOPER_ERROR';
    throw error;
  }
  let GoogleSignin;
  try {
    ({GoogleSignin} = require('@react-native-google-signin/google-signin'));
  } catch (error) {
    if (error?.code !== 'MODULE_NOT_FOUND') throw error;
    const unavailable = new Error('Google-inloggning kräver en ny Android-build. Använd e-postinloggning tills den är installerad.');
    unavailable.code = 'PLAY_SERVICES_NOT_AVAILABLE';
    throw unavailable;
  }
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
