'use strict';
const fs=require('node:fs');
const {deletionNativeConfig}=require('../qa/deletion-native-config.cjs');
// Run only in a disposable checkout without an existing dynamic/native project.
deletionNativeConfig(require('../app.json').expo);
for(const name of ['app.config.js','android'])if(fs.existsSync(name))throw Error('Use a fresh disposable phase-25 checkout; existing files are preserved');
fs.mkdirSync('.expo',{recursive:true});
fs.writeFileSync('.expo/deletion-qa-google-services.json',JSON.stringify({project_info:{project_number:'123456789012',project_id:'demo-smokeless-qa',storage_bucket:'demo-smokeless-qa.appspot.com'},client:[{client_info:{mobilesdk_app_id:'1:123456789012:android:0000000000000000000000',android_client_info:{package_name:'com.smokeless.app.deletionqa'}},api_key:[{current_key:'AIzaSyDemoOnlyNotARealGoogleApiKey0000000'}]}],configuration_version:'1'},null,2),{flag:'wx'});
fs.writeFileSync('app.config.js',"const {deletionNativeConfig}=require('./qa/deletion-native-config.cjs');\nmodule.exports=({config})=>deletionNativeConfig(config);\n",{flag:'wx'});
console.log('Disposable demo-project QA configuration prepared; live Firebase and OTA unavailable');
