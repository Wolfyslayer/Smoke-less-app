'use strict';
const fs=require('node:fs');const identity=require('../config/projectIdentity.json');
function manifestFromBuild(build){
 const artifact=build.artifacts?.applicationArchiveUrl;
 let url;try{url=new URL(artifact);}catch{throw Error('Missing APK artifact');}
 if(build.platform!=='ANDROID'||build.status!=='FINISHED'||build.buildProfile!=='preview'||build.distribution!=='INTERNAL'||build.updateChannel?.name!=='preview'||build.app?.id!==identity.preview.projectId||build.appIdentifier!==identity.preview.package||!/^\d+$/.test(String(build.appBuildVersion))||!Number.isSafeInteger(Number(build.appBuildVersion))||Number(build.appBuildVersion)<1||!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(build.appVersion||'')||typeof build.runtime?.version!=='string'||!build.runtime.version||url.protocol!=='https:'||url.hostname!=='expo.dev'||url.port||url.username||url.password||url.search||url.hash||!/^\/artifacts\/eas\/[A-Za-z0-9_-]+\.apk$/.test(url.pathname))throw Error('Build is not a verified standalone Preview APK');
 if(build.expirationDate&&(!Number.isFinite(Date.parse(build.expirationDate))||Date.parse(build.expirationDate)<=Date.now()))throw Error('APK artifact is expired');
 return {schemaVersion:1,platform:'android',channel:'preview',applicationId:identity.preview.package,projectId:identity.preview.projectId,build:Number(build.appBuildVersion),version:build.appVersion,runtime:build.runtime.version,apkUrl:artifact,...(build.expirationDate?{expiresAt:build.expirationDate}:{})};
}
if(require.main===module){try{const input=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));const result=manifestFromBuild(input);fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n');console.log('Verified Preview manifest written');}catch{console.error('Preview manifest validation failed; nothing published');process.exitCode=1;}}
module.exports={manifestFromBuild};
