'use strict';
// Public APK distribution is gated separately from build, merge and CI success.
const fs=require('node:fs');
function assertReleaseReady(readiness,candidate){
 if(readiness?.schemaVersion!==1||readiness.distribution!=='github-releases-and-website'||readiness.website!=='https://wolfyslayer.online')throw Error('Unrecognized APK distribution policy');
 for(const key of ['publicReleaseApproved','privacyPolicyApproved','supportAndDeletionRouteVerified','nativeAccountDeletionVerified','twoDeviceDataProtectionVerified','androidAccessibilityRegressionVerified','retentionAndRecoveryApproved'])if(readiness[key]!==true)throw Error(`APK release gate remains open: ${key}`);
 const accepted=readiness.candidate;
 if(!candidate||!accepted||! /^[a-f0-9]{40}$/.test(candidate.commit||'')||! /^[a-f0-9]{64}$/.test(candidate.sha256||'')||! /^[a-f0-9]{64}$/.test(candidate.certificateSha256||'')||!Number.isSafeInteger(candidate.build)||candidate.build<1||typeof candidate.runtime!=='string'||!candidate.runtime||!['com.smokeless.app.preview','com.smokeless.app'].includes(candidate.applicationId))throw Error('Missing verified APK candidate');
 for(const key of ['commit','sha256','certificateSha256','build','runtime','applicationId'])if(accepted[key]!==candidate[key])throw Error('APK does not match the approved candidate');
}
if(require.main===module){try{assertReleaseReady(JSON.parse(fs.readFileSync('config/apkReleaseReadiness.json','utf8')),JSON.parse(fs.readFileSync(process.argv[2],'utf8')));console.log('Explicit APK launch and candidate acceptance verified');}catch(error){console.error(error.message);process.exitCode=1;}}
module.exports={assertReleaseReady};
