const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const home=fs.readFileSync('src/screens/HomeScreen.tsx','utf8');

test('coach only counts helpful, nonempty strategies from valid nonfuture records',()=>{
 assert.match(home,/craving\.helpful!==true/);
 assert.match(home,/!craving\.strategy\?\.trim\(\)/);
 assert.match(home,/!Number\.isFinite\(date\.getTime\(\)\)/);
 assert.match(home,/dayKey\(date\)>today/);
});

test('coach ranks strategies by recorded frequency with stable tie breaking',()=>{
 assert.match(home,/helpfulStrategies\.set\(strategy,\(helpfulStrategies\.get\(strategy\)\?\?0\)\+1\)/);
 assert.match(home,/bestStrategy=\[\.\.\.helpfulStrategies\.entries\(\)\]\.sort\(\(a,b\)=>b\[1\]-a\[1\]\|\|a\[0\]\.localeCompare\(b\[0\]\)\)/);
});

test('situation-specific advice uses the same trigger and positive feedback',()=>{
 assert.match(home,/craving\.trigger!==frequentTrigger\[0\]/);
 assert.match(home,/triggerStrategies\.set\(strategy,\(triggerStrategies\.get\(strategy\)\?\?0\)\+1\)/);
 assert.match(home,/matchingStrategy\?/);
 assert.match(home,/Fundera på ett enkelt alternativ inför nästa gång/);
});

test('personal coach is optional, accessible and does not depend on login',()=>{
 assert.match(home,/\{bestStrategy\?<Card/);
 assert.match(home,/accessibilityRole="header"[^>]*>Ett tips som du själv tyckt hjälpte/);
 assert.match(home,/accessibilityLabel="Öppna SOS-stöd från din personliga coach"/);
 assert.match(home,/onPress=\{onSOS\}/);
 assert.doesNotMatch(home,/currentUser|onAuthStateChanged|isSignedIn/);
});

test('coach explains that guidance is based on self-reports and is not medical advice',()=>{
 assert.match(home,/strategier du själv markerat som hjälpsamma/);
 assert.match(home,/varken en förutsägelse eller en medicinsk rekommendation/);
});
