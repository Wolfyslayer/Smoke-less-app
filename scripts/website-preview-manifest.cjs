'use strict';
const identity=require('../config/projectIdentity.json');
function websiteManifest(manifest){
 if(manifest?.schemaVersion!==2||manifest.platform!=='android'||manifest.channel!=='preview'||manifest.applicationId!==identity.preview.package||manifest.projectId!==identity.preview.projectId||!Number.isSafeInteger(manifest.build)||manifest.build<1||! /^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(manifest.version||'')||typeof manifest.runtime!=='string'||!manifest.runtime||! /^[a-f0-9]{64}$/.test(manifest.sha256||'')||! /^[a-f0-9]{64}$/.test(manifest.certificateSha256||'')||!Number.isFinite(Date.parse(manifest.publishedAt))||typeof manifest.releaseNotes!=='string'||!manifest.releaseNotes.trim()||manifest.releaseNotes.length>4000)throw Error('Unverified website manifest');
 const apk=`https://github.com/Wolfyslayer/Smoke-less-app/releases/download/preview-build-${manifest.build}/SmokeLess-Preview-${manifest.build}.apk`;
 if(manifest.apkUrl!==apk)throw Error('Mismatched website download');
 return {available:true,version:manifest.version,versionCode:manifest.build,runtimeVersion:manifest.runtime,packageName:manifest.applicationId,downloadUrl:apk,sha256:manifest.sha256,certificateSha256:manifest.certificateSha256,publishedAt:manifest.publishedAt,releaseNotes:manifest.releaseNotes};
}
module.exports={websiteManifest};
