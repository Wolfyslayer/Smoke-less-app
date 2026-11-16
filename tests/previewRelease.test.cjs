const {test}=require('node:test'),assert=require('node:assert/strict');
const identity=require('../config/projectIdentity.json');
const {verifyEvidence}=require('../scripts/verify-preview-apk.cjs');
const {releaseManifest,assertNewer}=require('../scripts/create-preview-release.cjs');
const {requireRuntime}=require('../scripts/require-preview-runtime.cjs');
const build={platform:'ANDROID',status:'FINISHED',buildProfile:'preview',distribution:'INTERNAL',updateChannel:{name:'preview'},app:{id:identity.preview.projectId},appIdentifier:identity.preview.package,appBuildVersion:'11',appVersion:'6.0.1',runtime:{version:'a'.repeat(40)},artifacts:{applicationArchiveUrl:'https://expo.dev/artifacts/eas/example.apk'}};
const evidence={package:identity.preview.package,build:11,version:'6.0.1',runtime:'a'.repeat(40),projectId:identity.preview.projectId,channel:'preview',certificates:['b'.repeat(64)],sha256:'c'.repeat(64),debuggable:false,standalone:true};
test('APK gate rejects signing changes, tampered identity, runtime, channel and development artifacts',()=>{
 assert.equal(verifyEvidence(build,evidence,'b'.repeat(64)).sha256,evidence.sha256);
 for(const patch of [{package:identity.production.package},{build:10},{version:'6.0.0'},{runtime:'other'},{projectId:identity.production.projectId},{channel:'production'},{certificates:[]},{certificates:['d'.repeat(64)]},{certificates:['b'.repeat(64),'d'.repeat(64)]},{sha256:'invalid'},{standalone:false},{debuggable:true}])assert.throws(()=>verifyEvidence(build,{...evidence,...patch},'b'.repeat(64)));
 for(const certificate of ['',undefined,'bad','d'.repeat(64)])assert.throws(()=>verifyEvidence(build,evidence,certificate));
});
test('GitHub release manifest binds build, APK URL, checksum, certificate, date and user notes',()=>{
 const manifest=releaseManifest(verifyEvidence(build,evidence,'b'.repeat(64)),'  Förbättrad navigering  ','2026-11-16T00:00:00.000Z');
 assert.equal(manifest.schemaVersion,2);assert.equal(manifest.apkUrl,'https://github.com/Wolfyslayer/Smoke-less-app/releases/download/preview-build-11/SmokeLess-Preview-11.apk');assert.equal(manifest.sha256,evidence.sha256);assert.equal(manifest.releaseNotes,'Förbättrad navigering');assert.equal(manifest.certificateSha256,'b'.repeat(64));assert.equal(manifest.publishedAt,'2026-11-16T00:00:00.000Z');
 for(const notes of ['', ' '.repeat(10),'a'.repeat(4001),'bad\u0000text'])assert.throws(()=>releaseManifest(verifyEvidence(build,evidence,'b'.repeat(64)),notes));
 assert.doesNotThrow(()=>assertNewer(null,manifest));assert.doesNotThrow(()=>assertNewer({...manifest,build:10},manifest));
 for(const patch of [{build:11},{build:12},{build:'10'},{applicationId:identity.production.package},{projectId:identity.production.projectId}])assert.throws(()=>assertNewer({...manifest,...patch},manifest));
});
test('OTA publication requires an already published native Preview with matching fingerprint',()=>{
 const manifest=releaseManifest(verifyEvidence(build,evidence,'b'.repeat(64)),'Preview');
 assert.doesNotThrow(()=>requireRuntime({hash:'a'.repeat(40)},manifest));
 for(const patch of [{runtime:'different'},{channel:'production'},{applicationId:identity.production.package},{projectId:identity.production.projectId},{schemaVersion:1},{sha256:''}])assert.throws(()=>requireRuntime({hash:'a'.repeat(40)},{...manifest,...patch}));
 assert.throws(()=>requireRuntime({hash:'native changed'},manifest));assert.throws(()=>requireRuntime({},null));
});
test('failed GitHub upload checksum leaves release draft and never advances the app manifest',async()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'smokeless-release-test-')),apk=path.join(dir,'preview.apk'),file=path.join(dir,'preview.json');
 fs.writeFileSync(apk,'disposable non-APK test bytes');
 const manifest=releaseManifest(verifyEvidence(build,evidence,'b'.repeat(64)),'Preview');manifest.sha256=crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex');fs.writeFileSync(file,JSON.stringify(manifest));
 const originalFetch=global.fetch,originalArgs=process.argv,keys=['GITHUB_REPOSITORY','GITHUB_SHA','GITHUB_TOKEN','APK_RELEASE_ACCEPTANCE_JSON'],originalEnv=keys.map(k=>process.env[k]),requests=[];
 try{
  Object.assign(process.env,{GITHUB_REPOSITORY:'Wolfyslayer/Smoke-less-app',GITHUB_SHA:'a'.repeat(40),GITHUB_TOKEN:'test-only-placeholder'});process.argv=['node','script',file,apk];
  global.fetch=async(url,options={})=>{
   requests.push({url,method:options.method||'GET'});
   const response=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
   if(url==='https://api.github.com/repos/Wolfyslayer/Smoke-less-app')return response(200,{private:false});
   if(url.includes('/contents/')||url.includes('/releases/tags/')||url.includes('/git/ref/tags/'))return response(404,{});
   if(url.endsWith('/releases')&&options.method==='POST'){assert.equal(JSON.parse(options.body).draft,true);return response(201,{id:123,...JSON.parse(options.body)});}
   if(url.includes('/releases/123/assets?'))return response(200,[]);
   if(url.startsWith('https://uploads.github.com/'))return response(201,{size:options.body.length,digest:'sha256:incorrect'});
   throw Error('Unexpected publication request');
  };
  delete process.env.APK_RELEASE_ACCEPTANCE_JSON;
  await assert.rejects(require('../scripts/publish-preview-release.cjs').main());
  assert.equal(requests.length,0,'unapproved releases must not perform any GitHub operation');
  process.env.APK_RELEASE_ACCEPTANCE_JSON=JSON.stringify({...require('../config/apkReleaseReadiness.json'),publicReleaseApproved:true,privacyPolicyApproved:true,supportAndDeletionRouteVerified:true,nativeAccountDeletionVerified:true,twoDeviceDataProtectionVerified:true,androidAccessibilityRegressionVerified:true,retentionAndRecoveryApproved:true,candidate:{commit:'a'.repeat(40),sha256:manifest.sha256,certificateSha256:manifest.certificateSha256,build:manifest.build,runtime:manifest.runtime,applicationId:manifest.applicationId}});
  await assert.rejects(require('../scripts/publish-preview-release.cjs').main());
  assert.equal(requests.filter(r=>r.url.startsWith('https://uploads.github.com/')).length,1);
  assert.equal(requests.filter(r=>r.method==='PATCH'||r.method==='PUT').length,0);
 }finally{
  global.fetch=originalFetch;process.argv=originalArgs;keys.forEach((k,i)=>{if(originalEnv[i]===undefined)delete process.env[k];else process.env[k]=originalEnv[i]});fs.unlinkSync(apk);fs.unlinkSync(file);fs.rmdirSync(dir);
 }
});
test('website receives the same verified candidate metadata, never operator-invented version/runtime',()=>{
 const {websiteManifest}=require('../scripts/website-preview-manifest.cjs');
 const release=releaseManifest(verifyEvidence(build,evidence,'b'.repeat(64)),'Preview');
 const web=websiteManifest(release);assert.equal(web.available,true);assert.equal(web.versionCode,release.build);assert.equal(web.runtimeVersion,release.runtime);assert.equal(web.downloadUrl,release.apkUrl);assert.equal(web.sha256,release.sha256);assert.equal(web.packageName,release.applicationId);
 for(const patch of [{build:12},{applicationId:identity.production.package},{channel:'production'},{projectId:identity.production.projectId},{runtime:''},{sha256:'bad'},{certificateSha256:''},{publishedAt:null},{schemaVersion:1},{releaseNotes:''},{apkUrl:'https://evil.test/app.apk'}])assert.throws(()=>websiteManifest({...release,...patch}));
});
