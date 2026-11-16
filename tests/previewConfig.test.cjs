const {test}=require('node:test'),assert=require('node:assert/strict');
const {createVariantConfig}=require('../config/buildVariants.cjs'),identity=require('../config/projectIdentity.json'),base=require('../app.json').expo;
const google=packageName=>({project_info:{project_id:'smoke-less-75efa'},client:[{client_info:{android_client_info:{package_name:packageName}}}]});
test('Preview is a distinct APK/channel/project while development retains the keystore plugin',()=>{
 const config=createVariantConfig(base,{APP_VARIANT:'preview'},()=>google(identity.preview.package));assert.equal(config.android.package,identity.preview.package);assert.equal(config.name,'Smoke Less Preview');assert.equal(config.scheme,'smokeless-preview');assert.equal(config.extra.eas.projectId,identity.preview.projectId);assert.equal(config.updates.requestHeaders['expo-channel-name'],'preview');assert.equal(config.runtimeVersion.policy,'fingerprint');assert.equal(config.updates.checkAutomatically,'NEVER');assert.equal(config.updates.disableAntiBrickingMeasures,false);
 const dev=createVariantConfig(base,{});assert.equal(dev.android.package,base.android.package);assert(dev.plugins.includes('./plugins/withCustomDebugKeystore'));assert(!config.plugins.includes('./plugins/withCustomDebugKeystore'));
 const prod=createVariantConfig(base,{APP_VARIANT:'production'},()=>google(identity.production.package));assert.equal(prod.extra.eas.projectId,identity.production.projectId);assert.notEqual(prod.extra.eas.projectId,config.extra.eas.projectId);assert.equal(prod.updates.enabled,false);assert.equal(prod.extra.previewUsesSharedFirebase,false);
 const eas=require('../eas.json');assert.equal(eas.build.preview.developmentClient,false);assert.equal(eas.build.preview.android.buildType,'apk');assert.equal(eas.build.preview.channel,'preview');assert.equal(eas.build.production.channel,'production');assert.equal(eas.build.development.developmentClient,true);
});
test('Preview rejects missing/wrong Firebase configuration and unknown variants without fallback',()=>{
 for(const read of [()=>{throw Error('missing');},()=>google(identity.production.package),()=>({...google(identity.preview.package),project_info:{project_id:'wrong-project'}})])assert.throws(()=>createVariantConfig(base,{APP_VARIANT:'preview'},read));assert.throws(()=>createVariantConfig(base,{APP_VARIANT:'typo'}));
});
test('Preview publication remains scoped even with a mistaken environment variant',()=>{
 const config=createVariantConfig(base,{APP_VARIANT:'production',SMOKELESS_PREVIEW_OTA:'true'},()=>google(identity.preview.package));assert.equal(config.extra.eas.projectId,identity.preview.projectId);assert.throws(()=>createVariantConfig(base,{SMOKELESS_PREVIEW_OTA:'true',EAS_BUILD_PROFILE:'production'},()=>google(identity.preview.package)));
});
