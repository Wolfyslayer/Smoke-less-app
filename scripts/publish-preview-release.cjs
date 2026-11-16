'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const {assertNewer}=require('./create-preview-release.cjs');
const {assertReleaseReady}=require('./check-apk-release-readiness.cjs');
const {websiteManifest}=require('./website-preview-manifest.cjs');
const {assetDigest,missingDraftAssets}=require('./preview-draft-assets.cjs');
async function main(){
 const repo='Wolfyslayer/Smoke-less-app',{GITHUB_REPOSITORY:repository,GITHUB_SHA:sha,GITHUB_TOKEN:token}=process.env;
 if(repository!==repo||!/^[a-f0-9]{40}$/.test(sha||'')||!token)throw Error('Release identity missing');
 const [manifestFile,apk]=process.argv.slice(2),manifest=JSON.parse(fs.readFileSync(manifestFile,'utf8'));
 if(manifest.schemaVersion!==2||manifest.sha256!==crypto.createHash('sha256').update(fs.readFileSync(apk)).digest('hex'))throw Error('APK changed after verification');
 const acceptance=JSON.parse(process.env.APK_RELEASE_ACCEPTANCE_JSON||fs.readFileSync('config/apkReleaseReadiness.json','utf8'));
 assertReleaseReady(acceptance,{commit:sha,sha256:manifest.sha256,certificateSha256:manifest.certificateSha256,build:manifest.build,runtime:manifest.runtime,applicationId:manifest.applicationId});
 const base=`https://api.github.com/repos/${repo}`;
 const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 const api=async(path,method='GET',body)=>fetch(`${base}${path}`,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
 const repositoryResponse=await api('');if(!repositoryResponse.ok||(await repositoryResponse.json()).private!==false)throw Error('Anonymous release distribution requires a public repository');
 const current=await api('/contents/releases/preview.json?ref=preview-release');
 if(current.ok){const entry=await current.json();assertNewer(JSON.parse(Buffer.from(entry.content.replace(/\s/g,''),'base64')),manifest);}else if(current.status!==404)throw Error('Cannot verify latest release');
 const tag=`preview-build-${manifest.build}`,asset=`SmokeLess-Preview-${manifest.build}.apk`;
 const expected=[[asset,fs.readFileSync(apk),'application/vnd.android.package-archive'],['preview.json',fs.readFileSync(manifestFile),'application/json'],['website-preview.json',Buffer.from(JSON.stringify(websiteManifest(manifest),null,2)+'\n'),'application/json'],[`${asset}.sha256`,Buffer.from(`${manifest.sha256}  ${asset}\n`),'text/plain']];
 // Existing tags must already resolve to exactly this source, never another build.
 const checkTag=async()=>{const r=await api(`/git/ref/tags/${tag}`);if(r.status===404)return;if(!r.ok)throw Error('Cannot verify source tag');const ref=await r.json();if(ref.object?.type!=='commit'||ref.object.sha!==sha)throw Error('Release tag source differs');};
 await checkTag();
 const existing=await api(`/releases/tags/${tag}`);
 let release;
 if(existing.ok)release=await existing.json();
 else if(existing.status===404){
  const created=await api('/releases','POST',{tag_name:tag,target_commitish:sha,name:`Smoke Less Preview ${manifest.version} (${manifest.build})`,body:manifest.releaseNotes,draft:true,prerelease:true});
  if(!created.ok)throw Error('Cannot create draft release');release=await created.json();
 }else throw Error('Cannot inspect existing release');
 const readAssets=async()=>{const r=await api(`/releases/${release.id}/assets?per_page=100`);if(!r.ok)throw Error('Cannot inspect draft assets');return r.json();};
 for(const [name,data,type] of missingDraftAssets(release,await readAssets(),expected,sha,tag)){
  const uploaded=await fetch(`https://uploads.github.com/repos/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(name)}`,{method:'POST',headers:{...headers,'Content-Type':type},body:data,signal:AbortSignal.timeout(300000)});
  if(!uploaded.ok)throw Error('Draft asset upload failed');const result=await uploaded.json();
  if(result.name!==name||result.state!=='uploaded'||result.size!==data.length||result.digest!==assetDigest(data))throw Error('GitHub asset checksum mismatch');
 }
 const final=await api(`/releases/${release.id}`);if(!final.ok)throw Error('Cannot recheck draft');
 if(missingDraftAssets(await final.json(),await readAssets(),expected,sha,tag).length)throw Error('Draft is incomplete');
 await checkTag();
 // Publish only after GitHub confirms all asset digests. The app pointer is advanced last.
 const published=await api(`/releases/${release.id}`,'PATCH',{draft:false,tag_name:tag,target_commitish:sha});if(!published.ok)throw Error('Release publication failed');
 const result=await published.json();if(result.id!==release.id||result.draft!==false||result.tag_name!==tag||result.target_commitish!==sha)throw Error('Published release identity differs; do not advance pointer');
 const {uploadManifest}=require('./upload-preview-manifest.cjs');await uploadManifest(manifestFile);
 console.log('Verified Preview release and manifest published');
}
if(require.main===module)main().catch(()=>{console.error('Preview release did not complete. Inspect draft/release and manifest before retrying; existing assets are never replaced.');process.exitCode=1;});
module.exports={main};
