const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {userMessage}=require('../src/userMessage.cjs');
const {googleSignInFailure}=require('../src/auth/googleSignInSafety.cjs');

test('presentation never reflects SDK messages, credentials, storage keys or unknown codes',()=>{
 const fallback='Försök igen senare.';
 for(const value of [null,undefined,'private-secret',new Error('Firebase uid=private-secret'),{code:'__proto__',message:'private-secret'},{code:'auth/unknown',message:'smokeless:private-secret'}])assert.equal(userMessage(value,fallback),fallback);
 assert.match(userMessage({code:'auth/invalid-email',message:'private-secret'},fallback),/e-postadress/);
 assert.match(userMessage({code:'auth/network-request-failed'},fallback),/internetanslutningen/);
 assert.equal(userMessage(new Error('Fyll i e-post och lösenord.'),fallback),'Fyll i e-post och lösenord.');
 assert.equal(userMessage(new Error('Fyll i e-post och lösenord. private-secret'),fallback),fallback);
 for(const code of ['DEVELOPER_ERROR','auth/invalid-credential','auth/operation-not-allowed'])assert.doesNotMatch(googleSignInFailure({code}).message,/Firebase|OAuth|SHA|token|DEVELOPER_ERROR|Web Client/);
});

test('Android reminder channel is created only on explicit activation and before permission',async()=>{
 let adapter;const calls=[];
 const notifications={AndroidImportance:{DEFAULT:3},AndroidNotificationVisibility:{PRIVATE:0},SchedulableTriggerInputTypes:{DAILY:'daily',WEEKLY:'weekly'},setNotificationChannelAsync:async(id,value)=>calls.push(['channel',id,value]),getPermissionsAsync:async()=>{calls.push(['read']);return {granted:false}},requestPermissionsAsync:async()=>{calls.push(['request']);return {granted:true}},scheduleNotificationAsync:async value=>calls.push(['schedule',value])};
 const deps={react:{},'react-native':{Platform:{OS:'android'}},'@react-native-async-storage/async-storage':{},'expo-notifications':notifications,'../reminderService':{createReminderService:(_,n)=>{adapter=n;return {}}},'../domain/reminders':{},'../theme':{}};
 const context={exports:{},require:id=>{assert(id in deps,id);return deps[id]}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/ReminderSettings.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText,context);
 assert.equal(calls.length,0);
 assert.equal(await adapter.permission(),true);
 assert.deepEqual(calls.map(x=>x[0]),['channel','read','request']);
 assert.equal(calls[0][2].lockscreenVisibility,0);
 for(const weekly of [false,true])await adapter.schedule({identifier:'id',body:'En stund för dig?',hour:19,minute:0,weekly});
 for(const [,value] of calls.filter(x=>x[0]==='schedule')){assert.equal(value.trigger.channelId,'smokeless-reminders-v1');assert.equal(value.trigger.hour,19);assert.equal('timezone' in value.trigger,false);assert.doesNotMatch(value.content.body,/konto|cigarett|röksug/)}
});

test('release presentation has no technical build instructions or raw errors in account and sync flows',()=>{
 for(const file of ['src/screens/AccountScreen.tsx','src/screens/SettingsScreen.tsx','src/components/OnboardingAuthModal.tsx'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/under utveckling|Android-build|development build/);
 for(const file of ['src/hooks/useAccountFlow.ts','src/hooks/useCloudSync.ts'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/error\.message|Firestore-lyssnare/);
 const settings=fs.readFileSync('src/screens/SettingsScreen.tsx','utf8');assert.match(settings,/appVariant==='preview'/);
 const client=fs.readFileSync('src/updates/previewUpdateClient.native.ts','utf8');assert.match(client,/appVariant!=='preview'/);
 const hook=fs.readFileSync('src/hooks/useCloudSync.ts','utf8'),view=fs.readFileSync('src/components/AppSessionView.tsx','utf8');
 assert.match(hook,/Historiken är synkroniserad/);assert.equal((view.match(/syncPhase!=='synced'/g)||[]).length,2);
 assert.doesNotMatch(view,/syncStatus\s*[!=]==/);
});
