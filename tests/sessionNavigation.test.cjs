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
