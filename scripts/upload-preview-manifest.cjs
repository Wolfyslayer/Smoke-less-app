'use strict';
const fs=require('node:fs');
async function main(){
 const {GITHUB_REPOSITORY:repo,GITHUB_SHA:sha,GITHUB_TOKEN:token}=process.env;
 if(repo!=='Wolfyslayer/Smoke-less-app'||!/^[a-f0-9]{40}$/.test(sha||'')||!token)throw Error('Missing repository identity');
 const base=`https://api.github.com/repos/${repo}`,branch='preview-release',file='releases/preview.json';
 const headers={Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
 const request=(url,method='GET',body)=>fetch(url,{method,headers,...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
 let ref=await request(`${base}/git/ref/heads/${branch}`);if(ref.status===404){ref=await request(`${base}/git/refs`,'POST',{ref:`refs/heads/${branch}`,sha});}if(!ref.ok)throw Error('Release branch unavailable');
 const content=fs.readFileSync(process.argv[2],'utf8'),next=JSON.parse(content);
 const current=await request(`${base}/contents/${file}?ref=${branch}`);let fileSha;
 if(current.ok){const entry=await current.json();fileSha=entry.sha;const previous=JSON.parse(Buffer.from(entry.content.replace(/\s/g,''),'base64'));if(previous.projectId!==next.projectId||previous.applicationId!==next.applicationId||!Number.isSafeInteger(previous.build)||previous.build>=next.build)throw Error('Manifest would replace a newer or mismatched build');}else if(current.status!==404)throw Error('Current manifest unavailable');
 const result=await request(`${base}/contents/${file}`,'PUT',{branch,message:`Preview build ${next.build}`,content:Buffer.from(content).toString('base64'),...(fileSha?{sha:fileSha}:{})});if(!result.ok)throw Error('Manifest write rejected');console.log('Preview manifest published');
}
if(require.main===module)main().catch(()=>{console.error('Preview manifest was not published');process.exitCode=1;});
