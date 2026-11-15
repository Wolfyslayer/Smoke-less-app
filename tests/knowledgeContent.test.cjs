const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const scope={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/data/evidenceSupport.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,scope);
const {supportSources:sources,supportCards:cards,supportTopics:topics,openSupportSource:open,supportCheckedAt:date}=scope.exports;
test('each topic has sourced offline content and an explicit source review date',()=>{
 assert.equal(date,'2026-11-15');assert.equal(topics.length,3);
 for(const topic of topics){assert.ok(cards[topic].length>=2);for(const card of cards[topic]){assert.ok(card.text.length>40);assert.ok(card.sources.length);for(const id of card.sources)assert.ok(sources[id]);}}
 const text=JSON.stringify(cards);for(const term of ['nikotinberoende','abstinens','samtalsstöd','18 år','gravid','ammar','vårdcentral'])assert.ok(text.toLowerCase().includes(term.toLowerCase()),term);
});
test('only fixed primary-source URLs open, with no personal query or automatic request',async()=>{
 const calls=[];for(const id of Object.keys(sources)){
  assert.equal(await open(id,async url=>calls.push(url)),true);
  const url=new URL(sources[id].url);assert.equal(url.protocol,'https:');assert.ok(['www.1177.se','www.slutarokalinjen.se'].includes(url.hostname));assert.equal(url.search,'');assert.equal(url.hash,'');
 }
 assert.equal(await open('unknown',async()=>assert.fail()),false);
 assert.equal(await open('__proto__',async()=>assert.fail()),false);
 assert.equal(calls.length,Object.keys(sources).length);
});
test('failed and unavailable external openers return a recoverable result',async()=>{
 assert.equal(await open('stop',async()=>{throw Error('offline');}),false);
 assert.equal(await open('stop',async()=>{}),true);
});
test('knowledge stays voluntary, accessible and independent of account/history storage',()=>{
 const ui=fs.readFileSync('src/components/EvidenceSupport.tsx','utf8'),screen=fs.readFileSync('src/screens/BenefitsScreen.tsx','utf8');
 assert.match(screen,/<EvidenceSupport\/>/);assert.match(ui,/accessibilityRole="radio"/);assert.match(ui,/accessibilityRole="link"/);assert.match(ui,/minHeight:48/);assert.match(ui,/accessibilityRole="alert"/);assert.match(ui,/<Text selectable/);assert.match(ui,/ersätter inte individuell medicinsk bedömning/);
 assert.doesNotMatch(ui,/AsyncStorage|fetch\(|currentUser|setData|useEffect|numberOfLines/);
 assert.doesNotMatch(screen,/Din första dag|En månad/);
});
