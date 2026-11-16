const {withDangerousMod}=require('expo/config-plugins');
const fs=require('node:fs'),path=require('node:path');
module.exports=config=>withDangerousMod(config,['android',async c=>{
 const pkg=c.android?.package;
 if(!['com.smokeless.app','com.smokeless.app.preview','com.smokeless.app.deletionqa'].includes(pkg))throw Error('Unsupported deletion lifecycle package');
 const dir=path.join(c.modRequest.platformProjectRoot,'app/src/main/java',...pkg.split('.'));
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'SmokeLessDeletionLifecycle.kt'),`package ${pkg}

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
 @ReactMethod fun closeAfterDeletion(promise: Promise) {
  if (!restartRequired) { promise.reject("restart_not_required", "No deletion restart is pending"); return }
  Handler(Looper.getMainLooper()).post {
   context.currentActivity?.finishAndRemoveTask()
   // Closing only the Activity leaves the terminated Firestore instance alive.
   Process.killProcess(Process.myPid())
  }
 }
}
class SmokeLessDeletionLifecyclePackage : ReactPackage {
 override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(SmokeLessDeletionLifecycle(context))
 override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
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
 return c;
}]);
