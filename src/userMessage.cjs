'use strict';

// Only these app-authored validation messages may cross into presentation.
const safeMessages = new Set([
  'Ange din e-postadress först.',
  'Fyll i e-post och lösenord.',
  'Lösenordet måste vara minst 6 tecken.',
  'Logga in först.',
  'Kontot eller lokal historik ändrades. Försök igen.',
  'Kontot eller lokal historik ändrades. Starta om importen.',
  'Molndata eller lokal historik ändrades. Starta om importen.',
  'Kontot ändrades. Gästhistoriken finns kvar.',
  'Gästsessionen ändrades.',
]);
const codeMessages = {
  'auth/invalid-email': 'Kontrollera att e-postadressen är rätt skriven.',
  'auth/invalid-credential': 'Kontrollera e-postadress och lösenord och försök igen.',
  'auth/wrong-password': 'Kontrollera e-postadress och lösenord och försök igen.',
  'auth/user-not-found': 'Kontrollera e-postadress och lösenord och försök igen.',
  'auth/email-already-in-use': 'Adressen används redan. Logga in eller återställ lösenordet.',
  'auth/weak-password': 'Välj ett lösenord med minst 6 tecken.',
  'auth/too-many-requests': 'För många försök just nu. Vänta en stund och försök igen.',
  'auth/requires-recent-login': 'Logga in på nytt och försök igen.',
  'auth/network-request-failed': 'Kontrollera internetanslutningen och försök igen.',
};
function userMessage(error, fallback) {
  if (error && typeof error.code === 'string' && Object.hasOwn(codeMessages, error.code)) return codeMessages[error.code];
  if (error && typeof error.message === 'string' && safeMessages.has(error.message)) return error.message;
  return fallback;
}
module.exports = {userMessage};
