'use strict';
const fs=require('node:fs'),identity=require('../config/projectIdentity.json');
function requireRuntime(fingerprint,manifest){
 if(typeof fingerprint?.hash!=='string'||! /^[a-f0-9]{40,64}$/.test(fingerprint.hash)||manifest?.schemaVersion!==2||manifest.runtime!==fingerprint.hash||manifest.channel!=='preview'||manifest.applicationId!==identity.preview.package||manifest.projectId!==identity.preview.projectId||! /^[a-f0-9]{64}$/.test(manifest.sha256||''))throw Error('No published compatible native Preview build; publish a verified APK first');
}
if(require.main===module){try{requireRuntime(JSON.parse(fs.readFileSync(process.argv[2],'utf8')),JSON.parse(fs.readFileSync(process.argv[3],'utf8')));console.log('Published Preview runtime matches current native fingerprint');}catch{console.error('Preview OTA blocked: publish a compatible verified native build first');process.exitCode=1;}}
module.exports={requireRuntime};
