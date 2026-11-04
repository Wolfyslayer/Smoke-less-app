const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const screen=fs.readFileSync('src/screens/BenefitsScreen.tsx','utf8');

test('knowledge is shown in the existing benefits screen without authentication',()=>{
 assert.match(screen,/export function BenefitsScreen\(\{data\}:\{data:Data\}\)/);
 assert.match(screen,/Kunskap som hjälper/);
 assert.doesNotMatch(screen,/onAuthStateChanged|currentUser|isSignedIn/);
});

test('knowledge covers dependence, cravings, withdrawal and setbacks',()=>{
 for(const title of ['Vad är nikotinberoende?','När röksuget kommer','Om abstinens','Om du röker mer än planerat']){
  assert.ok(screen.includes(title),title);
 }
});

test('Swedish support links use HTTPS and do not interpolate private data',()=>{
 for(const url of ['https://www.1177.se/','https://www.slutarokalinjen.se/']){
  assert.ok(screen.includes(url),url);
 }
 const links=[...screen.matchAll(/Linking\.openURL\(([^)]*)\)/g)].map(match=>match[1]);
 assert.equal(links.length,2);
 for(const argument of links)assert.match(argument,/^'https:\/\/[a-z0-9./-]+'$/);
});

test('external links are accessible and medical information has a limitation notice',()=>{
 assert.equal((screen.match(/accessibilityRole="link"/g)||[]).length,2);
 assert.match(screen,/accessibilityLabel="[^"]*webbläsaren"/);
 assert.match(screen,/ersätter inte medicinsk bedömning/);
 assert.match(screen,/Kontakta vården/);
});
