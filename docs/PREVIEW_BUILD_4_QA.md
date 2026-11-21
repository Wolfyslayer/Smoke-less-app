# Preview build 4 – riktad emulatoracceptans

Källcommit `be6c9690c3720116fca76c898e634c703e81a7d7`, version 6.0.0/build 4. Lokal fil `C:/SL/artifacts/SmokeLess-Preview-6.0.0-be6c969.apk`.

| Egenskap | Verifierat värde |
| --- | --- |
| Paket | com.smokeless.app.preview |
| SHA-256 | 80708fc63bca757e1615695a25a771a185fc0ad56a8a73296f8fecbe4e670712 |
| Certifikat SHA-256 | 166cbfc25851ddb6ca6c16a1942dbaf0c630d4b190e62b2e700b65aabda30137 |
| Runtime | 58fc79aaa29a60eca4411a57b6c904e5db886af3 |
| Kanal | preview |
| Arkitekturer | arm64-v8a och x86_64 |
| Appkod | Inbäddad bundle, ej debuggable |

Byggd lokalt 17 november. Expo prebuild ersatte först byggkatalogens keystore med standardnyckeln. Signaturkontrollen avvisade den APK:n före installation. Befintlig Preview-nyckel återfördes till den genererade byggkatalogen, rätt alias användes och Gradle paketerade kandidaten igen. Slutlig apksigner-verifiering matchade tidigare installerad Preview. Hash och certifikat verifierades igen 21 november.

`adb install -r` uppgraderade build 3 till build 4 på SmokeLess_QA/emulator-5556. Den syntetiska testinloggningen och historikens två poster med samma datum/tider fanns kvar. Kallstart utan Metro fungerade. Fyra widgetar lades till i Androids launcher. Vanlig och kompakt widget visade giltigt dagsmål när opt-in var på. Registrera-widgeten öppnade registreringsvyn utan att lägga till en post. SOS-widgeten öppnade SOS-vyn. Avstängd opt-in ersatte dagsvärdena i båda statistikwidgetarna med neutral text. Dessa handlingar kontrollerades igen 21 november.

R8 gav varningar om stack map-tabeller i Google Play-tjänsters authbibliotek. Bygget lyckades. Ny Google-kontoväljare/inloggning i denna kandidat är fortfarande öppen. Native radering provades separat i den lokala deletionqa-debugappen. Kandidatens publika raderingsflagga var avstängd. Full fysisk/tillgänglighets-/releaseacceptans återstår.

Widgetarnas efterföljande visuella omarbetning i fas 30 kräver nästa native-kandidat. Build 4:s resultat gäller den här exakt identifierade APK:n.
