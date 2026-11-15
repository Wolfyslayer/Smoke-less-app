# Smoke Less – beständiga arbetsinstruktioner

Läs `AI_WORKFLOW.md`, `docs/MASTER_ROADMAP.md`, `docs/CODEX_CONTINUATION.md` och den aktiva fasplanen innan utveckling. Kontrollera aktuell branch, lokala ändringar, PR och senaste CI på GitHub.

Arbeta i fasens befintliga PR och bevara lokala ändringar. Följ CI-grinden: efter push kontrollerar AI själv båda obligatoriska kontrollerna på senaste PR-commit och fortsätter när de är gröna, enligt användarens beslut 2026-11-15. Rapportera fasens fasta huvud- och delchecklista och behov av Android-build efter varje commit.

Markera endast verifierade moment. Bred fysisk Android-, BrowserStack- och TalkBack-QA ligger i fas 25 enligt aktuell masterplan. Ändra inte hemligheter eller Firestore-regler i UI-fasen. Bevara main-ändringar vid merge.

Användarens uttryckliga fortsättningsbeslut: fortsätt automatiskt till nästa roadmapfas efter verifierat fasavslut och merge, tills roadmapen är färdig eller ett faktiskt hinder kräver användaren. Stanna inte enbart för att en fas är klar eller förberedd. Produktionspublicering och nödvändiga fysiska acceptanstester kräver fortfarande verkligt godkännande/resultat.
