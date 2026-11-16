const fs=require('node:fs');
const identity=require('./projectIdentity.json');
function createVariantConfig(base,env=process.env,readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'))){
 if(env.SMOKELESS_PREVIEW_OTA==='true'&&env.EAS_BUILD_PROFILE&&env.EAS_BUILD_PROFILE!=='preview')throw Error('Preview publication cannot use another build profile');
 const variant=env.SMOKELESS_PREVIEW_OTA==='true'?'preview':env.APP_VARIANT||'development';
 if(!['development','preview','production'].includes(variant))throw Error('Unknown APP_VARIANT');
 const preview=variant==='preview',target=preview?identity.preview:identity.production;
 const googleFile=preview?(env.GOOGLE_SERVICES_JSON_PREVIEW||'./google-services.preview.json'):variant==='production'?(env.GOOGLE_SERVICES_JSON_PRODUCTION||base.android.googleServicesFile):base.android.googleServicesFile;
 if(variant!=='development'){
  let google;try{google=readJson(googleFile);}catch{throw Error('Preview Firebase configuration file is required');}
  if(google.project_info?.project_id!==target.firebaseProject||!google.client?.some(c=>c.client_info?.android_client_info?.package_name===target.package))throw Error('Preview Firebase project/package mismatch');
  if(preview&&target.firebaseProject===identity.production.firebaseProject&&!target.sharedFirebaseApproved)throw Error('Shared Firebase requires an explicit decision');
 }
 const plugins=(base.plugins||[]).filter(plugin=>variant==='development'||plugin!=='./plugins/withCustomDebugKeystore');
 return {...base,name:preview?'Smoke Less Preview':base.name,slug:preview?'smoke-less-preview':base.slug,owner:identity.owner,scheme:preview?'smokeless-preview':base.scheme,plugins,
  android:{...base.android,package:target.package,googleServicesFile:googleFile},
  runtimeVersion:{policy:'fingerprint'},
  updates:preview?{enabled:true,url:`https://u.expo.dev/${target.projectId}`,checkAutomatically:'NEVER',fallbackToCacheTimeout:0,requestHeaders:{'expo-channel-name':'preview'},disableAntiBrickingMeasures:false}:{enabled:false},
  extra:{...base.extra,appVariant:variant,previewUsesSharedFirebase:preview&&target.sharedFirebaseApproved,eas:{projectId:target.projectId}},
 };
}
module.exports={createVariantConfig};
