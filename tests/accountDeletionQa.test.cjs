const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),ts=require('typescript');
const {localDeletionQa}=require('../src/accountDeletionQaPolicy.cjs');
const {deletionNativeConfig}=require('../qa/deletion-native-config.cjs');
const valid={enabled:true,development:true,packageId:'com.smokeless.app.deletionqa',firebaseProject:'demo-smokeless-qa'};
test('local deletion QA refuses live Firebase, release builds and ordinary application identities',()=>{
 for(const patch of [{development:false},{packageId:'com.smokeless.app'},{packageId:'com.smokeless.app.preview'},{firebaseProject:'smoke-less-75efa'},{firebaseProject:undefined}])assert.throws(()=>localDeletionQa({...valid,...patch}));
 for(const enabled of [undefined,false,'true'])assert.equal(localDeletionQa({...valid,enabled}),null);
 const q=localDeletionQa(valid);assert.equal(q.deletionUrl,'http://10.0.2.2:5001/demo-smokeless-qa/europe-west1/deleteMyAccount');assert.equal(q.auth,'http://10.0.2.2:9099');
});
test('QA config cannot select cloud builds, OTA, production credentials or live activation',()=>{
 const base=require('../app.json').expo;
 for(const env of [{EAS_BUILD:'true'},{EAS_BUILD_PROFILE:'preview'},{SMOKELESS_PREVIEW_OTA:'true'},{EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED:'true'}])assert.throws(()=>deletionNativeConfig(base,env));
 const c=deletionNativeConfig({...base,extra:{eas:{projectId:'real'},privateSetting:true}},{});
 assert.equal(c.android.package,valid.packageId);assert.equal(c.android.googleServicesFile,'./.expo/deletion-qa-google-services.json');assert.equal(c.updates.enabled,false);assert.deepEqual(c.extra,{localAccountDeletionQa:true});assert(!c.plugins.includes('./plugins/withCustomDebugKeystore'));
});
test('native QA bootstrap selects both emulators before client operations and never falls back to live services',()=>{
 const source=ts.transpileModule(fs.readFileSync('src/accountDeletionQa.native.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 function load(enabled,project='demo-smokeless-qa',development=true){const events=[],exports={};const deps={'expo-constants':{__esModule:true,default:{expoConfig:{extra:{localAccountDeletionQa:enabled},android:{package:valid.packageId}}}},'@react-native-firebase/app':{getApp:()=>{events.push('project');return {options:{projectId:project}};}},'@react-native-firebase/auth':{getAuth:()=>({useEmulator:url=>events.push(url)})},'@react-native-firebase/firestore':{__esModule:true,default:()=>({useEmulator:(host,port)=>events.push(`${host}:${port}`)})},'./accountDeletionQaPolicy.cjs':{localDeletionQa}};vm.runInNewContext(source,{exports,__DEV__:development,require:id=>deps[id]});return {exports,events};}
 assert.deepEqual(load(false).events,[]);
 assert.deepEqual(load(true).events,['project','http://10.0.2.2:9099','10.0.2.2:8088']);
 assert.throws(()=>load(true,'smoke-less-75efa'));assert.throws(()=>load(true,'demo-smokeless-qa',false));
});
