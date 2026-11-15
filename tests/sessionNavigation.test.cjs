const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=path=>fs.readFileSync(path,'utf8');

test('session safe areas protect login footer without doubling main bottom insets',()=>{
 const session=read('src/components/AppSessionView.tsx');
 const nav=read('src/components/BottomNavigation.tsx');
 assert.match(session,/paddingBottom:Math\.max\(insets\.bottom,40\)/);
 assert.match(session,/paddingBottom:Math\.max\(insets\.bottom,16\)/);
 assert.match(session,/paddingLeft:Math\.max\(insets\.left,20\),paddingRight:Math\.max\(insets\.right,20\)/);
 assert.match(nav,/paddingBottom:Math\.max\(insets\.bottom,10\),paddingLeft:Math\.max\(insets\.left,5\),paddingRight:Math\.max\(insets\.right,5\)/);
 const main=session.slice(session.indexOf('return <View style={s.root}><ScrollView key={tab}'));
 assert.match(main,/paddingBottom:32/);
 assert.doesNotMatch(main,/paddingBottom:Math\.max\(insets\.bottom/);
});

test('session navigation tracks previous tabs and avoids duplicate history entries',()=>{
 const source=read('src/hooks/useSessionNavigation.ts');
 assert.match(source,/if\(next===currentRef\.current\)return/);
 assert.match(source,/historyRef\.current\.push\(currentRef\.current\)/);
 assert.match(source,/const previous=historyRef\.current\.pop\(\)/);
 assert.match(source,/if\(!previous\)return false/);
 assert.match(source,/historyRef\.current=\[\]/);
 assert.match(source,/return \{tab,setTab,goBack,resetToHome\}/);
});

test('Android back prioritizes overlays and navigation before exit',()=>{
 const source=read('src/components/AppSessionView.tsx');
 const handler=source.slice(source.indexOf("BackHandler.addEventListener('hardwareBackPress'"));
 const dialog=handler.indexOf('if(current.dialog)');
 const registration=handler.indexOf('if(current.registerOpen)');
 const navigation=handler.indexOf("if(state.tab!=='home')");
 const exit=handler.indexOf("current.ask('Avsluta Smoke Less?'");
 assert.ok(dialog>=0&&registration>dialog&&navigation>registration&&exit>navigation);
 assert.match(handler,/if\(!current\.goBack\(\)\)current\.resetToHome\(\)/);
 assert.match(handler,/BackHandler\.exitApp\(\)/);
 assert.match(source,/return \(\)=>subscription\.remove\(\)/);
});

test('onboarding confirmation protects unsaved credentials and clears them on leave',()=>{
 const modal=read('src/components/OnboardingAuthModal.tsx');
 const session=read('src/components/AppSessionView.tsx');
 assert.match(modal,/if\(!hasEmailDraft\)\{onBack\(\);return;\}/);
 assert.match(modal,/setConfirmLeave\(true\)/);
 assert.match(modal,/Fortsätt skriva/);
 assert.match(modal,/Gå tillbaka/);
 assert.match(session,/if\(authPrompt==='email'\)\{model\.setAccountEmail\(''\);model\.setAccountPassword\(''\);\}/);
});

test('account login protects drafts and clears credentials after confirmed back',()=>{
 const source=read('src/components/AppSessionView.tsx');
 assert.match(source,/if\(state\.tab==='account' && !state\.accountUser/);
 assert.match(source,/current\.setAccountEmail\(''\);current\.setAccountPassword\(''\)/);
});

test('registration and SOS retain guarded exit and timer cleanup',()=>{
 const session=read('src/components/AppSessionView.tsx');
 const navigation=read('src/hooks/useSessionNavigation.ts');
 assert.match(session,/if\(current\.registerOpen\)/);
 assert.match(navigation,/const resetToHome=useCallback/);
});

// Source-level regression checks complement, but do not replace, device QA.
test('modal content remains scrollable and respects system insets',()=>{
 for(const path of ['src/components/CompactDateModal.tsx','src/components/ConfirmationDialog.tsx','src/components/OnboardingAuthModal.tsx']){
  const source=read(path);
  assert.match(source,/useSafeAreaInsets/);
  assert.match(source,/<ScrollView/);
  assert.match(source,/insets\.top/);
  assert.match(source,/insets\.bottom/);
 }
 const register=read('src/components/CigaretteRegisterModal.tsx');
 assert.match(register,/confirmScroll/);
 assert.match(register,/paddingBottom:Math\.max\(insets\.bottom,20\)/);
});

test('calendar dates use their whole cell without overlapping adjacent dates',()=>{
 const source=read('src/components/CompactDateModal.tsx');
 assert.match(source,/cell:\{width:'14\.285714%',minHeight:48/);
 assert.match(source,/day:\{width:'100%',minHeight:48/);
 assert.match(source,/accessibilityLabel=\{pretty\(date\)\}/);
 assert.match(source,/accessibilityState=\{\{selected,disabled\}\}/);
 assert.match(source,/listDates=\(size-34\)\/7<48\|\|fontScale>1\.3/);
 assert.match(source,/listCell:\{width:'100%'\}/);
 assert.match(source,/listDates\?pretty\(date\):day/);
});

test('account actions remain tappable with keyboard and calendar headings can wrap',()=>{
 const session=read('src/components/AppSessionView.tsx');
 const auth=read('src/components/OnboardingAuthModal.tsx');
 const dates=read('src/components/CompactDateModal.tsx');
 assert.match(session,/<ScrollView key=\{tab\} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"/);
 assert.match(auth,/behavior=\{Platform\.OS==='ios'\?'padding':'height'\}/);
 assert.match(dates,/month:\{flex:1,textAlign:'center'/);
 assert.match(dates,/actions:\{flexDirection:'row',flexWrap:'wrap'/);
});

test('bottom tabs and shared buttons preserve accessible touch targets',()=>{
 const nav=read('src/components/BottomNavigation.tsx');
 const ui=read('src/components/ui.tsx');
 assert.match(nav,/navItem:\{[^}]*minHeight:48/);
 assert.match(nav,/accessibilityRole="tab" accessibilityLabel=\{item\.label\}/);
 assert.match(ui,/button:\{[^}]*minHeight:48/);
});

test('history deletion and dense selection rows preserve separate accessible targets',()=>{
 const history=read('src/screens/HistoryScreen.tsx');
 assert.match(history,/deleteAction:\{minWidth:48,minHeight:48/);
 assert.match(history,/accessibilityLabel=\{`Ta bort registrering från/);
 for(const path of ['src/screens/SOSScreen.tsx','src/screens/StatsScreen.tsx']){
  const source=read(path);
  assert.match(source,/segment:\{flexDirection:'row',flexWrap:'wrap'/);
  assert.match(source,/segmentItem:\{[^}]*minHeight:48/);
 }
 assert.match(read('src/components/BottomNavigation.tsx'),/navItem:\{[^}]*minWidth:56/);
});
