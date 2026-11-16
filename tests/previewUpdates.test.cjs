const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const identity=require('../config/projectIdentity.json');
function load(file,deps={}){const context={exports:{},URL,require:id=>{assert(id in deps,id);return deps[id]}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,context);return context.exports;}
const manifest=load('src/updates/previewManifest.ts',{'../../config/projectIdentity.json':identity});const {createPreviewUpdateService,UPDATE_CHECK_KEY}=load('src/updates/previewUpdateService.ts',{'./previewManifest':manifest});
const info={applicationId:identity.preview.package,projectId:identity.preview.projectId,channel:'preview',build:10,version:'6.0.0',runtime:'native-1'};
const release={schemaVersion:2,platform:'android',channel:'preview',applicationId:info.applicationId,projectId:info.projectId,build:11,version:'6.0.1',runtime:'native-2',apkUrl:'https://github.com/Wolfyslayer/Smoke-less-app/releases/download/preview-build-11/SmokeLess-Preview-11.apk',sha256:'a'.repeat(64),certificateSha256:'b'.repeat(64),publishedAt:'1970-01-01T00:00:01.000Z',releaseNotes:'Förbättringar i Preview'};
test('native update accepts a newer native runtime but rejects wrong identity, old build, expired or untrusted links',()=>{
 assert(manifest.parseNativePreviewRelease(release,info));
 for(const patch of [{channel:'production'},{platform:'ios'},{projectId:identity.production.projectId},{applicationId:identity.production.package},{build:10},{build:9},{build:NaN},{runtime:''},{publishedAt:'bad date'},{sha256:'tampered'},{certificateSha256:''},{releaseNotes:''},{schemaVersion:1},...['http://expo.dev/artifacts/eas/a.apk','https://evil.test/a.apk','https://expo.dev.evil.test/artifacts/eas/a.apk','https://user@expo.dev/artifacts/eas/a.apk','https://expo.dev/artifacts/eas/a.apk?token=secret','javascript:bad()','https://expo.dev/other.apk'].map(apkUrl=>({apkUrl}))])assert.equal(manifest.parseNativePreviewRelease({...release,...patch},info),null);
});
function setup(overrides={}){let at=100000000,writes=[],calls={ota:0,download:0,manifest:0,open:[]};const values=new Map();const deps={info,now:()=>at,storage:{getItem:async key=>values.get(key)??null,setItem:async(key,value)=>{writes.push(key);values.set(key,value)}},checkOta:async()=>{calls.ota++;return {isAvailable:true}},fetchOta:async()=>{calls.download++;return {isNew:true}},fetchManifest:async()=>{calls.manifest++;return release},openUrl:async url=>calls.open.push(url),...overrides};return {service:createPreviewUpdateService(deps),calls,writes,values,setTime:v=>at=v};}
test('startup checks are throttled, manual checks work, and only the isolated timestamp is stored',async()=>{
 const s=setup();await Promise.all([s.service.check(),s.service.check()]);assert.equal(s.calls.ota,1);await s.service.check();assert.equal(s.calls.ota,1);await s.service.check(true);assert.equal(s.calls.ota,2);assert(s.writes.every(key=>key===UPDATE_CHECK_KEY));assert.equal(s.service.getSnapshot().nativeRelease.build,11);
});
test('wrong app/channel cannot check, download or open links',async()=>{
 for(const patch of [{applicationId:identity.production.package},{channel:'production'},{projectId:identity.production.projectId}]){const s=setup({info:{...info,...patch}});await s.service.check(true);await s.service.download();await s.service.openNative();assert.equal(s.calls.ota,0);assert.equal(s.calls.download,0);assert.equal(s.calls.open.length,0);}
});
test('OTA download applies at next start without a programmatic reload or duplicate fetch',async()=>{
 const s=setup();await s.service.check(true);await Promise.all([s.service.download(),s.service.download()]);assert.equal(s.calls.download,1);assert.equal(s.service.getSnapshot().status,'downloaded');await s.service.check(true);assert.equal(s.calls.ota,1);
});
test('offline errors are recoverable and a partial check preserves a usable native update',async()=>{
 const s=setup({checkOta:async()=>{throw Error('offline')}});await s.service.check(true);assert.equal(s.service.getSnapshot().nativeRelease.build,11);assert.equal(s.service.getSnapshot().status,'ready');await s.service.openNative();assert.equal(s.calls.open.length,1);
 const failed=setup({checkOta:async()=>{throw Error('private provider error')},fetchManifest:async()=>{throw Error('offline')}});await failed.service.check(true);assert.equal(failed.service.getSnapshot().status,'error');assert(!failed.service.getSnapshot().message.includes('private provider'));
});
test('native metadata and links are rechecked at activation time',async()=>{
 const s=setup();await s.service.check(true);s.service.getSnapshot().nativeRelease.apkUrl='https://evil.test/update.apk';await s.service.openNative();assert.equal(s.calls.open.length,0);assert.equal(s.calls.open.length,0);
});
test('manifest publisher accepts only finished Preview artifacts',()=>{
 const {manifestFromBuild}=require('../scripts/publish-preview-manifest.cjs');const build={platform:'ANDROID',status:'FINISHED',buildProfile:'preview',distribution:'INTERNAL',updateChannel:{name:'preview'},app:{id:identity.preview.projectId},appIdentifier:identity.preview.package,appBuildVersion:'11',appVersion:'6.0.1',runtime:{version:'native-2'},artifacts:{applicationArchiveUrl:'https://expo.dev/artifacts/eas/example123.apk'}};assert.equal(manifestFromBuild(build).build,11);for(const patch of [{buildProfile:'production'},{status:'ERRORED'},{appIdentifier:identity.production.package},{updateChannel:{name:'production'}},{expirationDate:'2000-01-01T00:00:00Z'}])assert.throws(()=>manifestFromBuild({...build,...patch}));
});
test('no update and failed OTA download preserve history and remain recoverable',async()=>{
 const none=setup({checkOta:async()=>({isAvailable:false}),fetchManifest:async()=>null});await none.service.check(true);
 assert.equal(none.service.getSnapshot().status,'ready');assert.equal(none.service.getSnapshot().otaAvailable,false);assert.equal(none.service.getSnapshot().nativeRelease,null);await none.service.download();assert.equal(none.calls.download,0);
 const failed=setup({fetchOta:async()=>{throw Error('provider secret detail')}});await failed.service.check(true);await failed.service.download();assert.equal(failed.service.getSnapshot().status,'ready');assert.equal(failed.service.getSnapshot().otaAvailable,true);assert(!failed.service.getSnapshot().message.includes('secret'));assert(failed.writes.every(key=>key===UPDATE_CHECK_KEY));
});
