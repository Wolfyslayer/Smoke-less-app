'use strict';
const fs=require('node:fs');
const repo='Wolfyslayer/Smoke-less-app';
function releaseManifest(verified,notes,publishedAt=new Date().toISOString()){
 const m=verified.metadata;
 if(!m||!Number.isSafeInteger(m.build)||m.build<1||! /^[a-f0-9]{64}$/.test(verified.sha256)||! /^[a-f0-9]{64}$/.test(verified.certificateSha256)||typeof notes!=='string'||!notes.trim()||notes.length>4000||/[\u0000-\u0008\u000b-\u001f\u007f]/.test(notes)||!Number.isFinite(Date.parse(publishedAt))||new Date(publishedAt).toISOString()!==publishedAt)throw Error('Invalid verified release');
 const {expiresAt,...metadata}=m;
 return {...metadata,schemaVersion:2,apkUrl:`https://github.com/${repo}/releases/download/preview-build-${m.build}/SmokeLess-Preview-${m.build}.apk`,sha256:verified.sha256,certificateSha256:verified.certificateSha256,publishedAt,releaseNotes:notes.trim()};
}
function assertNewer(previous,next){
 if(previous&&(previous.applicationId!==next.applicationId||previous.projectId!==next.projectId||!Number.isSafeInteger(previous.build)||previous.build>=next.build))throw Error('An equal/newer or mismatched release already exists');
}
if(require.main===module){try{
 const [verifiedFile,out]=process.argv.slice(2),next=releaseManifest(JSON.parse(fs.readFileSync(verifiedFile,'utf8')),process.env.RELEASE_NOTES);
 fs.writeFileSync(out,JSON.stringify(next,null,2)+'\n');console.log('Release manifest prepared');
}catch{console.error('Release manifest preparation failed');process.exitCode=1;}}
module.exports={releaseManifest,assertNewer};
