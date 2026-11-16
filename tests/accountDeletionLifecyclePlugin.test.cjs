const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm');
test('restart helper is internal, process-isolated, package-bound and idempotently registered',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'smokeless-restart-'));
 try{
  for(const pkg of ['com.smokeless.app','com.smokeless.app.preview','com.smokeless.app.deletionqa']){
   const dir=path.join(root,'app/src/main/java',...pkg.split('.'));fs.mkdirSync(dir,{recursive:true});
   const mainFile=path.join(dir,'MainApplication.kt');fs.writeFileSync(mainFile,'override fun onCreate() { super.onCreate()\n loadReactNative()\n}\nPackageList(this).packages.apply {\n}\n');
   const module={exports:{}};
   vm.runInNewContext(fs.readFileSync('plugins/withAccountDeletionLifecycle.js','utf8'),{module,require:id=>id==='expo/config-plugins'?{withAndroidManifest:(c,fn)=>fn(c),withDangerousMod:(c,[,fn])=>fn(c)}:require(id)});
   const c={android:{package:pkg},modRequest:{platformProjectRoot:root},modResults:{manifest:{application:[{activity:[]}]}}};
   await module.exports(c);await module.exports(c);
   const activities=c.modResults.manifest.application[0].activity;assert.equal(activities.length,1);
   const a=activities[0].$;assert.equal(a['android:name'],pkg+'.SmokeLessDeletionRestartActivity');assert.equal(a['android:exported'],'false');assert.equal(a['android:process'],':deletionrestart');
   const helper=fs.readFileSync(path.join(dir,'SmokeLessDeletionRestartActivity.kt'),'utf8'),bridge=fs.readFileSync(path.join(dir,'SmokeLessDeletionLifecycle.kt'),'utf8'),main=fs.readFileSync(mainFile,'utf8');
   assert.ok(helper.includes('getLaunchIntentForPackage(packageName)'));assert.ok(helper.includes('launch?.component?.packageName != packageName'));assert.ok(helper.includes('previous.uid != Process.myUid()'));
   assert.ok(helper.indexOf('Process.killProcess(previousPid)')<helper.indexOf('startActivity(launch)'));
   assert.ok(bridge.includes('if (!restartRequired)'));assert.ok(bridge.includes('Intent(context, SmokeLessDeletionRestartActivity::class.java)'));
   assert.equal(main.split('add(SmokeLessDeletionLifecyclePackage())').length-1,1);assert.equal(main.split('Skip React startup').length-1,1);
   assert.ok(main.indexOf('ownProcess?.processName')<main.indexOf('loadReactNative()'));
  }
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
