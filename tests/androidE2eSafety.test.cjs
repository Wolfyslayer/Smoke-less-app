const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
test('E2E runner rejects a physical phone before reading APK or invoking device tools',{skip:process.platform!=='win32'},()=>{
 const result=cp.spawnSync('powershell',['-NoProfile','-File','scripts/run-android-e2e.ps1','-Serial','physical-phone','-ApkPath','nonexistent.apk','-ApkSha256','bad','-ReportDirectory','nonexistent'],{encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/Only a disposable Android emulator is allowed/);
});
test('E2E workflow is manual, offline, Preview-only and never builds or publishes',()=>{
 const runner=fs.readFileSync('scripts/run-android-e2e.ps1','utf8'),workflow=fs.readFileSync('.github/workflows/android-release-smoke.yml','utf8'),flow=fs.readFileSync('.maestro/guest-smoke.yaml','utf8');
 assert.match(runner,/Get-FileHash/);assert.match(runner,/ro.kernel.qemu/);assert.match(runner,/-contains 'SmokeLess_QA'/);
 const clear=runner.indexOf("'pm','clear'");for(const guard of ["Expected disposable AVD","Only the Preview package","'wifi','disable'","'data','disable'"])assert(runner.indexOf(guard)<clear);
 assert.match(workflow,/workflow_dispatch/);assert.match(workflow,/self-hosted, smokeless-qa/);assert.match(workflow,/require-green-ci/);assert.doesNotMatch(workflow,/pull_request:|push:|eas build|eas update|EXPO_TOKEN/);
 assert.match(flow,/appId: com.smokeless.app.preview/);assert.doesNotMatch(flow,/clearState: true|clearKeychain|Fortsätt med Google|inputText:.*@|Radera konto/);
 for(const tab of ['register','stats','profile'])assert.match(flow,new RegExp('id: bottom-nav-'+tab));
});
