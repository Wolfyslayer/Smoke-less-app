'use strict';

/** Classify Google sign-in failures without changing Firebase session state. */
function googleSignInFailure(error) {
  const code = typeof error?.code === 'string' ? error.code : '';
  if (['SIGN_IN_CANCELLED', '12501', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(code)) {
    return {kind:'cancelled', message:'Google-inloggningen avbröts. Ingen data har ändrats.'};
  }
  if (code === 'IN_PROGRESS') {
    return {kind:'unavailable', message:'En Google-inloggning pågår redan. Vänta tills den är klar innan du försöker igen.'};
  }
  if (code === 'auth/account-exists-with-different-credential' || code === 'auth/credential-already-in-use') {
    return {kind:'account-conflict', message:'E-postadressen är redan kopplad till ett annat inloggningssätt. Logga in med ditt befintliga konto och länka Google efter säker verifiering. Ingen historik har ändrats.'};
  }
  if (['PLAY_SERVICES_NOT_AVAILABLE', 'PLAY_SERVICES_NOT_AVAILABLE_ERROR', 'auth/operation-not-supported-in-this-environment'].includes(code)) {
    return {kind:'unavailable', message:'Google Play-tjänster saknas eller stöds inte på den här enheten. Använd e-postinloggning i stället.'};
  }
  if (['auth/network-request-failed', 'NETWORK_ERROR', '7'].includes(code)) {
    return {kind:'network', message:'Ingen nätverksanslutning. Försök igen när du är online. Din historik finns kvar.'};
  }
  if (['DEVELOPER_ERROR', '10'].includes(code)) {
    return {kind:'configuration', message:'Google avvisade Android-appens OAuth-konfiguration (DEVELOPER_ERROR/10). Kontrollera att SHA-1 för den installerade debug-appen finns i Firebase och att appen använder rätt Web Client ID. Ingen historik har ändrats.'};
  }
  if (code === 'auth/invalid-credential') {
    return {kind:'configuration', message:'Firebase kunde inte verifiera Google-token (auth/invalid-credential). Kontrollera att Google-provider och OAuth-klient tillhör samma Firebase-projekt. Ingen historik har ändrats.'};
  }
  if (code === 'auth/operation-not-allowed') {
    return {kind:'configuration', message:'Firebase tillåter inte Google-inloggning (auth/operation-not-allowed). Kontrollera Google-provider i Firebase Authentication. Ingen historik har ändrats.'};
  }
  return {kind:'unknown', message:'Google-inloggningen misslyckades. Försök igen eller använd e-postinloggning. Ingen historik har ändrats.'};
}
module.exports = {googleSignInFailure};
