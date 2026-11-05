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
 assert.match(profile,/setShowSharePreview\(previewOpenRef\.current\)/);
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

test('artwork is memoized to avoid SVG redraws when share status changes',()=>{
 const artwork=fs.readFileSync('src/components/DailyProgressShareArtwork.tsx','utf8');
 assert.match(artwork,/import React,\{forwardRef,memo\} from 'react'/);
 assert.match(artwork,/DailyProgressShareArtwork=memo\(forwardRef/);
});

test('starting a new image clears an earlier sharing error and guards synchronous render errors',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/setPngStatus\('rendering'\);\s*setShareError\(false\);/);
 assert.match(profile,/catch\{if\(generation===exportGenerationRef\.current\)setPngStatus\('error'\);\}/);
});

test('share confirmation requires preview to remain open after asynchronous availability check',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/if\(!previewOpenRef\.current\|\|exportGenerationRef\.current!==approvedGeneration\|\|!approvedPath/);
 assert.match(profile,/previewOpenRef\.current=!previewOpenRef\.current/);
});

test('sharing rejects an approval invalidated by closing and reopening the preview',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/const approvedGeneration=exportGenerationRef\.current/);
 assert.match(profile,/exportGenerationRef\.current!==approvedGeneration/);
});

test('profile account status and quick navigation accommodate large text and screen readers',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/accessibilityRole="header" style=\{\{color:C\.white,fontWeight:'900',fontSize:20,flexShrink:1\}\}/);
 assert.match(profile,/selectable style=\{\[styles\.muted,\{flexShrink:1\}\]\}/);
 assert.match(profile,/fontSize:13,flexShrink:1,textAlign:'right'/);
 assert.match(profile,/style=\{\[styles\.cardTitle,\{flexShrink:1\}\]\}>\{item\.label\}/);
 assert.match(profile,/sectionRow:\{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12\}/);
});

test('plan summary is one accessible full-width navigation target',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/accessibilityLabel="Öppna min plan" accessibilityHint="Visar dina mål och din plan" onPress=\{\(\)=>onNavigate\('plan'\)\} style=\{\[styles\.row,\{minHeight:72\}\]\}/);
 assert.doesNotMatch(profile,/style=\{styles\.planAction\}/);
});

test('quick links have stable configuration and context-sensitive account hints',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/const quickLinks=\[/);
 assert.match(profile,/quickLinks\.map\(item=>/);
 assert.match(profile,/item\.to==='account'\?\(loggedIn\?/);
 assert.match(profile,/item\.to==='backup'\?\(loggedIn\?/);
});

test('PNG preparation and stale-value status are announced to screen readers',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/pngStatus==='rendering'\?<Text accessibilityLiveRegion="polite" accessibilityRole="text"/);
 assert.match(profile,/Bilden förbereds\. Vänta tills den är klar innan du delar\./);
 assert.match(profile,/pngStatus==='ready'\?<Text accessibilityLiveRegion="polite" style=\{styles\.muted\}>Dagens värden har ändrats/);
});

test('changed daily values invalidate an in-flight PNG export before share',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/useLayoutEffect\(\(\)=>\{/);
 assert.match(profile,/latestCountsRef\.current=\{todayCount,dailyGoal\};\s*\+\+exportGenerationRef\.current;\s*pngPathRef\.current=null;\s*exportCountsRef\.current=null;/);
 assert.match(profile,/setPngStatus\('idle'\);\s*setShareError\(false\);\s*\},\[todayCount,dailyGoal\]\)/);
});

test('reminder settings support larger text and announce status changes without intrusive alerts',()=>{
 const settings=fs.readFileSync('src/screens/SettingsScreen.tsx','utf8');
 assert.match(settings,/reminderStatus\?<Text accessibilityLiveRegion="polite"/);
 assert.match(settings,/fontWeight:'800',flexShrink:1/);
 assert.match(settings,/accessibilityHint="Ange timmar mellan 0 och 23"/);
 assert.match(settings,/accessibilityHint="Ange minuter mellan 0 och 59"/);
});

test('home quick actions expose accessible labels and adapt to larger text',()=>{
 const home=fs.readFileSync('src/screens/HomeScreen.tsx','utf8');
 assert.match(home,/function Tile\([\s\S]*?accessibilityRole="button" accessibilityLabel=\{title\}/);
 assert.match(home,/style=\{\[styles\.tileText,\{flexShrink:1\}\]\}>\{title\}/);
 assert.match(home,/accessibilityRole="header" style=\{\[styles\.heading,\{flexShrink:1\}\]\}>Din utveckling/);
 assert.match(home,/accessibilityLabel="Visa mer statistik om din utveckling"/);
});

test('home coach aggregates craving history in a single pass with trigger-specific strategies',()=>{
 const home=fs.readFileSync('src/screens/HomeScreen.tsx','utf8');
 const section=home.slice(home.indexOf(' const triggerCounts=new Map<string,number>();'),home.indexOf(' const encouragement='));
 assert.equal((section.match(/for\(const craving of data\.cravings\)/g)||[]).length,1);
 assert.match(section,/const helpfulByTrigger=new Map<string,Map<string,number>>\(\)/);
 assert.match(section,/if\(!Number\.isFinite\(date\.getTime\(\)\)\|\|dayKey\(date\)>today\)continue/);
 assert.match(section,/const matchingStrategy=frequentTrigger\?topEntry\(helpfulByTrigger\.get\(frequentTrigger\[0\]\)/);
});

test('home statistics and daily check-in actions have clear labels and minimum touch targets',()=>{
 const home=fs.readFileSync('src/screens/HomeScreen.tsx','utf8');
 assert.match(home,/accessibilityLabel="Visa mer statistik om din utveckling" onPress=\{onStats\} style=\{styles\.recoveryLink\}/);
 assert.match(home,/accessibilityLabel="Bekräfta dagens registreringar" accessibilityHint="Markerar dagens registreringar som avstämda"/);
 assert.match(home,/recoveryLink:\{minHeight:48/);
 assert.match(home,/sectionRow:\{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12\}/);
});

test('home progress hero remains readable with large system fonts and narrow screens',()=>{
 const home=fs.readFileSync('src/screens/HomeScreen.tsx','utf8');
 assert.match(home,/justifyContent:'space-between',flexWrap:'wrap',gap:8/);
 assert.match(home,/flexGrow:1,flexShrink:1,minWidth:150/);
 assert.match(home,/adjustsFontSizeToFit minimumFontScale=\{0\.65\} numberOfLines=\{1\} style=\{styles\.heroNumber\}/);
 assert.match(home,/style=\{\[styles\.sectionRow,\{flexWrap:'wrap'\}\]\}/);
});

test('closing the preview prevents delayed sharing failures from showing an obsolete error',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/catch\{if\(previewOpenRef\.current&&exportGenerationRef\.current===approvedGeneration\)setShareError\(true\);\}finally\{setSharingPng\(false\);\}/);
 assert.match(profile,/accessibilityHint="Öppnar telefonens delningsdialog för den förhandsgranskade bilden"/);
});

test('stale image sharing and empty exports cannot report errors on a new preview',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/catch\{if\(previewOpenRef\.current&&exportGenerationRef\.current===approvedGeneration\)setShareError\(true\);\}/);
 assert.match(profile,/if\(!base64\)\{if\(generation===exportGenerationRef\.current&&previewOpenRef\.current\)setPngStatus\('error'\);return;\}/);
});

test('approved share generation remains visible to error handler',()=>{
 const profile=fs.readFileSync('src/screens/ProfileScreen.tsx','utf8');
 assert.match(profile,/const approvedGeneration=exportGenerationRef\.current;\s*try\{/);
 assert.doesNotMatch(profile,/try\{\s*const approvedPath=pngPathRef\.current;\s*const approvedCounts=exportCountsRef\.current;\s*const approvedGeneration=/);
});

test('reminder settings explain disabled and web-only states on initial load',()=>{
 const settings=fs.readFileSync('src/screens/SettingsScreen.tsx','utf8');
 assert.match(settings,/if\(v!=='true'\)setReminderStatus\('Påminnelser är avstängda\.'\)/);
 assert.match(settings,/else if\(Platform\.OS==='web'\)setReminderStatus\('Schemalagda påminnelser stöds bara i mobilappen\.'\)/);
});

test('quit mode disables daily target adjustment controls rather than offering an ineffective action',()=>{
 const settings=fs.readFileSync('src/screens/SettingsPlanSection.tsx','utf8');
 assert.match(settings,/accessibilityLabel="Minska dagligt mål"[\s\S]*?disabled=\{p\.mode==='quit'\|\|goal<=0\}/);
 assert.match(settings,/accessibilityLabel="Öka dagligt mål"[\s\S]*?accessibilityState=\{\{disabled:p\.mode==='quit'\}\} disabled=\{p\.mode==='quit'\}/);
});

test('home progress visuals announce their meaning and weekly values to screen readers',()=>{
 const home=fs.readFileSync('src/screens/HomeScreen.tsx','utf8');
 assert.match(home,/accessibilityLabel=\{\x60Dagens förbrukning: \$\{Math\.round\(p\)\} procent av dagsmålet\x60\}/);
 assert.match(home,/accessibilityLabel=\{\x60Registrerade cigaretter under veckan:/);
 assert.match(home,/måndag','tisdag','onsdag','torsdag','fredag','lördag','söndag/);
});
