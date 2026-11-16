const {test}=require('node:test'),assert=require('node:assert/strict');
const {assetDigest,missingDraftAssets}=require('../scripts/preview-draft-assets.cjs');
const sha='a'.repeat(40),tag='preview-build-3';
const draft={id:123,draft:true,prerelease:true,tag_name:tag,target_commitish:sha};
const expected=[['SmokeLess-Preview-3.apk',Buffer.from('signed candidate fixture'),'application/vnd.android.package-archive'],['preview.json',Buffer.from('{"build":3}'),'application/json']];
const uploaded=([name,data])=>({name,state:'uploaded',size:data.length,digest:assetDigest(data)});
test('draft retry preserves verified assets and returns only missing uploads',()=>{
 assert.deepEqual(missingDraftAssets(draft,[],expected,sha,tag),expected);
 assert.deepEqual(missingDraftAssets(draft,[uploaded(expected[0])],expected,sha,tag),[expected[1]]);
 assert.deepEqual(missingDraftAssets(draft,expected.map(uploaded),expected,sha,tag),[]);
});
test('published, foreign-source, mutable branch and wrong-tag releases cannot be resumed',()=>{
 for(const patch of [{draft:false},{prerelease:false},{target_commitish:'preview/build-3-source'},{target_commitish:'b'.repeat(40)},{tag_name:'preview-build-4'},{id:0}])assert.throws(()=>missingDraftAssets({...draft,...patch},[],expected,sha,tag));
});
test('changed, duplicate, incomplete and unknown existing assets are never overwritten',()=>{
 const good=uploaded(expected[0]);
 for(const patch of [{name:'old.apk'},{size:good.size+1},{digest:'sha256:'+'b'.repeat(64)},{state:'starter'},{digest:undefined}])assert.throws(()=>missingDraftAssets(draft,[{...good,...patch}],expected,sha,tag));
 assert.throws(()=>missingDraftAssets(draft,[good,good],expected,sha,tag));
 assert.throws(()=>missingDraftAssets(draft,[...expected.map(uploaded),good],expected,sha,tag));
});

test('publisher resumes a verified draft and rechecks every asset before publication',async()=>{
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
 const {releaseManifest}=require('../scripts/create-preview-release.cjs');
 const identity=require('../config/projectIdentity.json');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'smokeless-draft-'));
 const apk=path.join(dir,'candidate.apk'),file=path.join(dir,'preview.json');
 const bytes=Buffer.from('synthetic signed APK fixture');fs.writeFileSync(apk,bytes);
 const manifest=releaseManifest({metadata:{build:3,version:'6.0.0',runtime:'r',platform:'android',channel:'preview',applicationId:identity.preview.package,projectId:identity.preview.projectId},sha256:assetDigest(bytes).slice(7),certificateSha256:'b'.repeat(64)},'Preview');
 fs.writeFileSync(file,JSON.stringify(manifest));
 const keys=['GITHUB_REPOSITORY','GITHUB_SHA','GITHUB_TOKEN','APK_RELEASE_ACCEPTANCE_JSON'],previous=keys.map(k=>process.env[k]);
 const originalFetch=global.fetch,originalArgs=process.argv;
 try{
  Object.assign(process.env,{GITHUB_REPOSITORY:'Wolfyslayer/Smoke-less-app',GITHUB_SHA:sha,GITHUB_TOKEN:'test-only',APK_RELEASE_ACCEPTANCE_JSON:JSON.stringify({...require('../config/apkReleaseReadiness.json'),publicReleaseApproved:true,privacyPolicyApproved:true,supportAndDeletionRouteVerified:true,nativeAccountDeletionVerified:true,twoDeviceDataProtectionVerified:true,androidAccessibilityRegressionVerified:true,retentionAndRecoveryApproved:true,candidate:{commit:sha,sha256:manifest.sha256,certificateSha256:manifest.certificateSha256,build:3,runtime:'r',applicationId:manifest.applicationId}})});
  process.argv=['node','script',file,apk];
  for(const tamper of [false,true]){
   const assets=[uploaded(['SmokeLess-Preview-3.apk',bytes])],requests=[];let reads=0;
   global.fetch=async(url,options={})=>{
    const method=options.method||'GET';requests.push({url,method});
    const response=(status,data)=>({ok:status>=200&&status<300,status,json:async()=>data});
    if(url==='https://api.github.com/repos/Wolfyslayer/Smoke-less-app')return response(200,{private:false});
    if(url.includes('/contents/')&&method==='GET')return response(404,{});
    if(url.includes('/git/ref/tags/'))return response(200,{object:{type:'commit',sha}});
    if(url.includes('/releases/tags/'))return response(200,draft);
    if(url.startsWith('https://api.github.com/')&&url.includes('/releases/123/assets?')){reads++;return response(200,tamper&&reads>1?[{...assets[0],digest:'changed'},...assets.slice(1)]:[...assets]);}
    if(url.startsWith('https://uploads.github.com/')){const name=new URL(url).searchParams.get('name');assert.notEqual(name,'SmokeLess-Preview-3.apk');const a=uploaded([name,options.body]);assets.push(a);return response(201,a);}
    if(url.endsWith('/releases/123')&&method==='GET')return response(200,draft);
    if(url.endsWith('/releases/123')&&method==='PATCH'){assert.deepEqual(JSON.parse(options.body),{draft:false,tag_name:tag,target_commitish:sha});assert.equal(reads,2);return response(200,{...draft,draft:false});}
    if(url.includes('/git/ref/heads/'))return response(200,{});
    if(url.endsWith('/contents/releases/preview.json')&&method==='PUT')return response(200,{});
    throw Error('Unexpected request');
   };
   if(tamper){await assert.rejects(require('../scripts/publish-preview-release.cjs').main());assert.equal(requests.some(r=>['PATCH','PUT'].includes(r.method)),false);}
   else {await require('../scripts/publish-preview-release.cjs').main();assert.equal(requests.at(-1).method,'PUT');}
   assert.equal(requests.some(r=>r.url.endsWith('/releases')&&r.method==='POST'),false);
  }
 }finally{global.fetch=originalFetch;process.argv=originalArgs;keys.forEach((k,i)=>previous[i]===undefined?delete process.env[k]:process.env[k]=previous[i]);fs.rmSync(dir,{recursive:true,force:true});}
});
