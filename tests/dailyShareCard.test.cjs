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
 assert.match(profile,/generation!==exportGenerationRef\.current/);
 assert.match(profile,/latestCountsRef\.current\.todayCount!==todayCount/);
 assert.match(profile,/latestCountsRef\.current\.dailyGoal!==dailyGoal/);
 assert.match(profile,/exportCountsRef\.current\?\.todayCount!==todayCount/);
 assert.match(profile,/exportCountsRef\.current\?\.dailyGoal!==dailyGoal/);
 assert.match(profile,/setShareError\(false\)/);
 assert.match(profile,/artworkRef\.current\.toDataURL\(/);
 assert.match(profile,/onPress=\{renderPng\}/);
 assert.match(profile,/Sharing\.shareAsync\(approvedPath/);
 assert.match(profile,/pngStatus!=='ready'/);
 assert.match(profile,/Sharing\.isAvailableAsync\(\)/);
 assert.match(profile,/pngPathRef\.current!==approvedPath/);
 assert.match(profile,/latestCountsRef\.current\.todayCount!==approvedCounts\?\.todayCount/);
 assert.match(profile,/Dela framsteg eller uppmuntran/);
 assert.match(profile,/Bilden innehåller bara dagens antal och mål/);
 assert.match(profile,/style=\{\[styles\.cardTitle,\{flexShrink:1\}\]\}/);
 assert.match(profile,/aspectRatio:340\/420/);
 assert.match(profile,/accessibilityLiveRegion="polite"/);
 assert.match(profile,/accessibilityState=\{\{disabled:sharingPng,busy:sharingPng\}\}/);
 const card=fs.readFileSync('src/components/DailyProgressShareArtwork.tsx','utf8');
 assert.doesNotMatch(card,/accountEmail|profile\.|entries|cravings|Share\.share/);
});

test('share card normalizes fractional and infinite counts before calculating the graphic',()=>{
 const fractional=buildDailyShareCard({todayCount:3.9,dailyGoal:7.8});
 assert.equal(fractional.todayCount,3);
 assert.equal(fractional.dailyGoal,7);
 assert.equal(fractional.progressPercent,43);
 const infinite=buildDailyShareCard({todayCount:Infinity,dailyGoal:10});
 assert.equal(infinite.todayCount,0);
 assert.equal(infinite.progressPercent,0);
 const negative=buildDailyShareCard({todayCount:-Infinity,dailyGoal:-2});
 assert.equal(negative.todayCount,0);
 assert.equal(negative.dailyGoal,0);
});
test('zero cigarette goal stays at zero fill even when a cigarette was registered',()=>{
 const card=buildDailyShareCard({todayCount:2,dailyGoal:0});
 assert.equal(card.todayCount,2);
 assert.equal(card.dailyGoal,0);
 assert.equal(card.progressPercent,0);
 assert.match(card.message,/Fortsätt i din egen takt/);
});
test('daily share artwork has a descriptive accessible label and uses only normalized card values',()=>{
 const artwork=fs.readFileSync('src/components/DailyProgressShareArtwork.tsx','utf8');
 assert.match(artwork,/const card=buildDailyShareCard\(\{todayCount,dailyGoal\}\)/);
 assert.match(artwork,/accessibilityLabel=\{\`Dagens framsteg/);
 assert.match(artwork,/card\.todayCount/);
 assert.match(artwork,/card\.dailyGoal/);
 assert.doesNotMatch(artwork,/accountEmail|userId|firebase|AsyncStorage|historyEntries/);
});
