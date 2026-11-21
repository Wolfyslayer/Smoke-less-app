'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {manifestFromBuild}=require('./publish-preview-manifest.cjs');
function verifyEvidence(build,evidence,expectedCertificate){
 const metadata=manifestFromBuild(build);
 const cert=String(expectedCertificate||'').replace(/:/g,'').toLowerCase();
 if(!/^[a-f0-9]{64}$/.test(cert)||evidence.certificates.length!==1||evidence.certificates[0]!==cert)throw Error('APK signing certificate mismatch');
 if(evidence.package!==metadata.applicationId||evidence.version!==metadata.version||evidence.build!==metadata.build||evidence.runtime!==metadata.runtime||evidence.projectId!==metadata.projectId||evidence.channel!=='preview'||evidence.debuggable||!evidence.standalone||! /^[a-f0-9]{64}$/.test(evidence.sha256))throw Error('APK identity/runtime mismatch');
 return {metadata,sha256:evidence.sha256,certificateSha256:cert};
}
function inspectApk(apk,tools={}){
 const run=(tool,args)=>execFileSync(tool,args,{encoding:'utf8',maxBuffer:32*1024*1024});
 const aapt=tools.aapt||process.env.AAPT||'aapt',signer=tools.apksigner||process.env.APKSIGNER||'apksigner';
 const badging=run(aapt,['dump','badging',apk]);
 const signerArgs=['verify','--verbose','--print-certs',apk];
 const signature=process.platform==='win32'&&signer.endsWith('.bat')?run(require('node:path').join(process.env.JAVA_HOME,'bin','java.exe'),['-jar',require('node:path').join(require('node:path').dirname(signer),'lib','apksigner.jar'),...signerArgs]):run(signer,signerArgs); // Nonzero aborts before publication.
 const xml=run(aapt,['dump','xmltree',apk,'AndroidManifest.xml']);
 const readAsset=name=>process.platform==='win32'?run('tar.exe',['-xOf',apk,`assets/${name}`]):run('unzip',['-p',apk,`assets/${name}`]);
 const meta=name=>{
  const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp(`A: android:name[^\\n]*="${escaped}"[^\\n]*\\n\\s*A: android:value[^\\n]*=(.*)`).exec(xml)?.[1]?.trim();
 };
 const runtimeValue=meta('expo.modules.updates.EXPO_RUNTIME_VERSION');
 const resourceId=/^@(0x[a-f0-9]+)/i.exec(runtimeValue||'')?.[1];
 if(!resourceId)throw Error('Runtime resource unavailable');
 const resources=run(aapt,['dump','--values','resources',apk]);
 const configuredRuntime=new RegExp(`resource ${resourceId} [^\\n]*\\n\\s*\\(string8\\) "([^"\\n]+)"`).exec(resources)?.[1];
 const runtime=configuredRuntime==='file:fingerprint'?readAsset('fingerprint').trim():configuredRuntime;
 const listing=run(aapt,['list',apk]);
 const packageLine=/^package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'/m.exec(badging);
 if(!packageLine)throw Error('APK package metadata missing');
 const project=/^"https:\/\/u\.expo\.dev\/([a-f0-9-]{36})"/.exec(meta('expo.modules.updates.EXPO_UPDATE_URL')||'')?.[1];
 if(!/Number of signers: 1\b/.test(signature))throw Error('Exactly one APK signer is required');
 const certificates=[...new Set([...signature.matchAll(/certificate SHA-256 digest: ([a-f0-9]{64})/gi)].map(m=>m[1].toLowerCase()))];
 return {package:packageLine[1],build:Number(packageLine[2]),version:packageLine[3],runtime,projectId:project,certificates,
  channel:/^"\{\\"expo-channel-name\\":\\"preview\\"\}"/.test(meta('expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY')||'')?'preview':null,
  standalone:listing.includes('assets/index.android.bundle')&&listing.includes('assets/app.manifest')&&/0xffffffff/.test(meta('expo.modules.updates.ENABLED')||''),
  debuggable:/application-debuggable/.test(badging),sha256:crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex')};
}
if(require.main===module){try{
 const [buildFile,apk,out]=process.argv.slice(2);const build=JSON.parse(fs.readFileSync(buildFile,'utf8'));
 if(process.env.GITHUB_SHA&&build.gitCommitHash!==process.env.GITHUB_SHA)throw Error('Build was not produced from the approved commit');
 const verified=verifyEvidence(build,inspectApk(apk),process.env.PREVIEW_CERTIFICATE_SHA256);
 fs.writeFileSync(out,JSON.stringify(verified,null,2)+'\n');console.log('APK signature, identity, runtime and checksum verified');
}catch{console.error('APK verification failed; nothing may be published');process.exitCode=1;}}
module.exports={verifyEvidence,inspectApk};
