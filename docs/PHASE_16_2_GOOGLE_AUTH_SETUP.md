# Fas 16.2 – Google-inloggning på Android

## Firebase och Google OAuth (utan hemligheter)

1. Använd samma Firebase-projekt för Android-appen och Firebase Authentication. Android package ID är `com.smokeless.app`.
2. Aktivera **Google** under Firebase Console → Authentication → Sign-in method. E-post/lösenord ska förbli aktiverat.
3. Registrera **SHA-1** (och vid behov SHA-256) för det **faktiska signeringscertifikatet** som används till installerad Android-build. En egen debug-keystore och en CI-signerad APK kan ha olika fingeravtryck.
4. Hämta aktuell `google-services.json` från Firebase för rätt Android-app. Lägg den lokalt enligt projektets Android-bygginstruktioner; committa inte hemligheter eller personliga signeringsnycklar.
5. `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` ska vara OAuth-klient-ID av typen **Web application** i samma Firebase/Google Cloud-projekt. Det är ett klient-ID, inte ett klienthemligt värde. Det måste matcha appens konfiguration vid byggning.
6. För GitHub Actions används `GOOGLE_SERVICES_JSON_BASE64` som repository secret där arbetsflödet kräver den. Lägg aldrig base64-innehållet i källkod eller loggar.
7. När native-paket, Google-konfiguration eller signeringscertifikat ändras kan en ny Android-build krävas. Enbart JavaScript-ändringar kan normalt testas med befintlig dev-build.

## Inloggnings- och dataskydd

- Kontoväljaren rensar endast den tidigare **native Google Sign-In**-sessionen före nytt val. Det loggar inte ut ett Firebase-konto.
- Vanlig Google-inloggning tillåts inte när Firebase redan har en inloggad användare.
- Koppling till befintligt e-postkonto kräver återautentisering med lösenord och kontrollerar samma UID före och efter koppling.
- Vid kontokonflikt gör appen **ingen automatisk kontosammanslagning**. Historik får aldrig flyttas mellan UID utan ett separat, säkert och uttryckligt flöde.
- Gästhistorik importeras inte automatiskt vid Google-inloggning utan användarens godkännande.
- Kontoradering är **inte aktiverad** i kontovyn; den ska färdigställas och testas separat innan användaren erbjuds funktionen.

## Felsökning

| Fel | Kontroll |
| --- | --- |
| `DEVELOPER_ERROR` / 10 | Kontrollera signeringscertifikatets SHA-1, Android package ID och Web Client ID. |
| `auth/invalid-credential` | Kontrollera Google-provider, Firebase-projekt och OAuth-klient. |
| `auth/operation-not-allowed` | Aktivera Google som inloggningsleverantör i Firebase Authentication. |
| Play Services unavailable | Erbjud fortsatt inloggning med e-post/lösenord. |
| Network error | Visa återförsök; ändra inte historik eller session på grund av felet. |

## Verifiering och kvarstående QA

På fysisk Android-enhet har befintligt konto fungerat med e-post/lösenord och Google, inklusive bevarad historik, plan och statistik. Användaren har även verifierat att kontoväljaren visas igen, att avbryt fungerar och att gästregistreringar inte automatiskt blandas med kontohistorik.

Automatiska tester täcker avbrutet flöde, simulerade OAuth-/nätverksfel, kontokonfliktens felklassificering och statiska skydd för UID/kontoradering. Dessa tester är **inte** fullständiga Firebase-integrationstester. Fysisk TalkBack-QA, nya konton, verkligt offlinefall och säker kontoradering återstår enligt fasplanen/fas 25.
