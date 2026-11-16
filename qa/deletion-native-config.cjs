'use strict';
// Local, disposable Android debug app. Never consumed by EAS/release workflows.
function deletionNativeConfig(base,env=process.env){
 if(env.EAS_BUILD||env.EAS_BUILD_PROFILE||env.SMOKELESS_PREVIEW_OTA||env.EXPO_PUBLIC_ACCOUNT_DELETION_ENABLED==='true')throw Error('Deletion QA cannot use EAS, OTA or live deletion activation');
 return {...base,name:'Smoke Less Deletion QA',slug:'smoke-less-deletion-qa',scheme:'smokeless-deletionqa',
  plugins:(base.plugins||[]).filter(p=>p!=='./plugins/withCustomDebugKeystore').concat('./qa/withLocalQaAndroid.cjs'),
  android:{...base.android,package:'com.smokeless.app.deletionqa',googleServicesFile:'./.expo/deletion-qa-google-services.json'},
  updates:{enabled:false},extra:{localAccountDeletionQa:true},
 };
}
module.exports={deletionNativeConfig};
