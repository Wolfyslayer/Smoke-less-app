'use strict';

/** Classify Google sign-in failures without changing Firebase session state. */
function googleSignInFailure(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  if (['SIGN_IN_CANCELLED', '12501', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(code)) {
    return {kind:'cancelled', message:'Google-inloggningen avbröts. Ingen data har ändrats.'};
  }
  if (code === 'auth/account-exists-with-different-credential' || code === 'auth/credential-already-in-use') {
    return {kind:'account-conflict', message:'E-postadressen är redan kopplad till ett annat inloggningssätt. Logga in med ditt befintliga konto och länka Google efter säker verifiering. Ingen historik har ändrats.'};
  }
  if (['PLAY_SERVICES_NOT_AVAILABLE', 'auth/operation-not-supported-in-this-environment'].includes(code)) {
    return {kind:'unavailable', message:'Google Play-tjänster saknas eller stöds inte på den här enheten. Använd e-postinloggning i stället.'};
  }
  if (['auth/network-request-failed', 'NETWORK_ERROR'].includes(code)) {
    return {kind:'network', message:'Ingen nätverksanslutning. Försök igen när du är online. Din historik finns kvar.'};
  }
  if (['DEVELOPER_ERROR', 'auth/invalid-credential', 'auth/operation-not-allowed'].includes(code)) {
    return {kind:'configuration', message:'Google-inloggning är inte korrekt konfigurerad. Försök med e-postinloggning tills problemet är åtgärdat.'};
  }
  return {kind:'unknown', message:'Google-inloggningen misslyckades. Försök igen eller använd e-postinloggning. Ingen historik har ändrats.'};
}
module.exports = {googleSignInFailure};
