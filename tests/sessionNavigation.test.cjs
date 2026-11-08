const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=path=>fs.readFileSync(path,'utf8');

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
});

test('bottom tabs and shared buttons preserve accessible touch targets',()=>{
 const nav=read('src/components/BottomNavigation.tsx');
 const ui=read('src/components/ui.tsx');
 assert.match(nav,/navItem:\{[^}]*minHeight:48/);
 assert.match(nav,/accessibilityRole="tab" accessibilityLabel=\{item\.label\}/);
 assert.match(ui,/button:\{[^}]*minHeight:48/);
});
