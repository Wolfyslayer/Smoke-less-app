'use strict';
async function main(){
 const {GITHUB_REPOSITORY:repo,GITHUB_SHA:sha,GITHUB_TOKEN:token}=process.env;
 if(!/^Wolfyslayer\/Smoke-less-app$/.test(repo||'')||!/^[a-f0-9]{40}$/.test(sha||'')||!token)throw Error('Missing CI identity');
 const response=await fetch(`https://api.github.com/repos/${repo}/commits/${sha}/check-runs?per_page=100`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('CI status unavailable');const data=await response.json();
 for(const name of ['validate','rules']){const checks=(data.check_runs||[]).filter(c=>c.name===name&&c.head_sha===sha).sort((a,b)=>b.id-a.id);if(checks[0]?.conclusion!=='success'||checks[0]?.status!=='completed')throw Error('Required latest CI has not passed');}
 console.log('Required latest CI passed');
}
if(require.main===module)main().catch(()=>{console.error('Preview publication blocked: required CI is not verified');process.exitCode=1;});
