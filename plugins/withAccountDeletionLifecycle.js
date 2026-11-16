const {withDangerousMod,withAndroidManifest}=require('expo/config-plugins');
const fs=require('node:fs'),path=require('node:path');
module.exports=config=>{
 config=withAndroidManifest(config,c=>{
  const activity=c.android.package+'.SmokeLessDeletionRestartActivity',app=c.modResults.manifest.application[0];
  app.activity??=[];
  if(!app.activity.some(a=>a.$?.['android:name']===activity))app.activity.push({$:{'android:name':activity,'android:exported':'false','android:process':':deletionrestart','android:excludeFromRecents':'true','android:theme':'@android:style/Theme.NoDisplay'}});
  return c;
 });
 return withDangerousMod(config,['android',async c=>{
 const pkg=c.android?.package;
 if(!['com.smokeless.app','com.smokeless.app.preview','com.smokeless.app.deletionqa'].includes(pkg))throw Error('Unsupported deletion lifecycle package');
 const dir=path.join(c.modRequest.platformProjectRoot,'app/src/main/java',...pkg.split('.'));
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'SmokeLessDeletionLifecycle.kt'),`package ${pkg}

import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.os.Process
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager

class SmokeLessDeletionLifecycle(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
 companion object { @Volatile private var restartRequired = false }
 override fun getName() = "SmokeLessDeletionLifecycle"
 @ReactMethod fun markRestartRequired(promise: Promise) { restartRequired = true; promise.resolve(null) }
 @ReactMethod fun isRestartRequired(promise: Promise) { promise.resolve(restartRequired) }
 @ReactMethod fun restartAfterDeletion(promise: Promise) {
  if (!restartRequired) { promise.reject("restart_not_required", "No deletion restart is pending"); return }
  Handler(Looper.getMainLooper()).post {
   try {
    val restart = Intent(context, SmokeLessDeletionRestartActivity::class.java)
      .putExtra("previousPid", Process.myPid())
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
    context.startActivity(restart)
   } catch (_: RuntimeException) {
    promise.reject("restart_unavailable", "Unable to restart this application")
   }
  }
 }
}
class SmokeLessDeletionLifecyclePackage : ReactPackage {
 override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(SmokeLessDeletionLifecycle(context))
 override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
`,'utf8');
 fs.writeFileSync(path.join(dir,'SmokeLessDeletionRestartActivity.kt'),`package ${pkg}

import android.app.Activity
import android.app.ActivityManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Process

// An internal foreground Activity in a separate process performs the handover.
// No alarms, background launch permissions or external package/URL are used.
class SmokeLessDeletionRestartActivity : Activity() {
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val previousPid = intent.getIntExtra("previousPid", -1)
  val manager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
  val previous = manager.runningAppProcesses?.firstOrNull { it.pid == previousPid }
  if (previousPid <= 0 || previousPid == Process.myPid() || (previous != null && previous.uid != Process.myUid())) {
   finish(); return
  }
  val launch = packageManager.getLaunchIntentForPackage(packageName)
  if (launch?.component?.packageName != packageName) { finish(); return }
  Process.killProcess(previousPid)
  launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
  startActivity(launch)
  finish()
  Process.killProcess(Process.myPid())
 }
}
`,'utf8');
 const file=path.join(dir,'MainApplication.kt');
 let main=fs.readFileSync(file,'utf8');
 if(!main.includes('SmokeLessDeletionLifecyclePackage()')){
  const pattern=/PackageList\(this\)\.packages\.apply\s*\{/;
  if(!pattern.test(main))throw Error('Unsupported deletion lifecycle registration');
  main=main.replace(pattern,m=>m+'\n              add(SmokeLessDeletionLifecyclePackage())');
  fs.writeFileSync(file,main,'utf8');
 }
 if(!main.includes('Skip React startup in the deletion restart helper process')){
  const startup=/override fun onCreate\(\)\s*\{\s*super\.onCreate\(\)/;
  if(!startup.test(main))throw Error('Unsupported application startup layout');
  main=main.replace(startup,m=>m+`\n    // Skip React startup in the deletion restart helper process.\n    val ownProcess = (getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager)\n      .runningAppProcesses?.firstOrNull { it.pid == android.os.Process.myPid() }\n    if (ownProcess?.processName == packageName + ":deletionrestart") return`);
  fs.writeFileSync(file,main,'utf8');
 }
 return c;
}]);
};
