const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync('src/domain/dailyShareCard.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const context={exports:{},Number,Math};
vm.runInNewContext(js,context);
const {buildDailyShareCard}=context.exports;
test('within limit: percentage is consumption, not success',()=>{
 const card=buildDailyShareCard({todayCount:3,dailyGoal:10});
 assert.equal(card.todayCount,3);assert.equal(card.dailyGoal,10);
 assert.equal(card.progressPercent,30);assert.match(card.message,/inom dagens gräns/);
});
test('at and above limit: percentage capped but actual count preserved',()=>{
 assert.equal(buildDailyShareCard({todayCount:10,dailyGoal:10}).progressPercent,100);
 const over=buildDailyShareCard({todayCount:15,dailyGoal:10});
 assert.equal(over.progressPercent,100);assert.equal(over.todayCount,15);
 assert.match(over.message,/utan att ge upp/);
});
test('zero goal and malformed inputs are safe',()=>{
 assert.equal(buildDailyShareCard({todayCount:0,dailyGoal:0}).progressPercent,0);
 assert.match(buildDailyShareCard({todayCount:0,dailyGoal:0}).message,/cigarettfri stund/);
 const card=buildDailyShareCard({todayCount:-4,dailyGoal:NaN});
 assert.equal(card.todayCount,0);assert.equal(card.dailyGoal,0);assert.equal(card.progressPercent,0);
});
test('share card model does not leak unrelated fields',()=>{
 const card=buildDailyShareCard({todayCount:2,dailyGoal:8,accountEmail:'private@example.com',entries:[{id:'secret'}]});
 assert.deepEqual(Object.keys(card).sort(),['dailyGoal','message','progressPercent','todayCount'].sort());
 assert.doesNotMatch(JSON.stringify(card),/private@example.com|secret/);
});
test('preview is opt-in and card does not access account data',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/showSharePreview,setShowSharePreview/);
 assert.match(profile,/showSharePreview\?<><View[^>]*><DailyProgressShareArtwork/);
 assert.match(profile,/setShowSharePreview\(v=>!v\)/);
 assert.match(profile,/pngPathRef\.current=null/);
 assert.match(profile,/setShareError\(false\)/);
 assert.match(profile,/artworkRef\.current\.toDataURL\(/);
 assert.match(profile,/onPress=\{renderPng\}/);
 assert.match(profile,/Sharing\.shareAsync\(pngPathRef\.current/);
 assert.match(profile,/pngStatus!=='ready'/);
 assert.match(profile,/Sharing\.isAvailableAsync\(\)/);
 const card=fs.readFileSync('src/components/DailyProgressShareArtwork.tsx','utf8');
 assert.doesNotMatch(card,/accountEmail|profile\.|entries|cravings|Share\.share/);
});
