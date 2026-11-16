const {withAndroidManifest,withDangerousMod}=require('expo/config-plugins');
const fs=require('node:fs');
const path=require('node:path');
module.exports=function withSmokeLessWidget(config){
 const packageName=config.android?.package||'com.smokeless.app';
 if(!/^com\.smokeless\.app(?:\.preview)?$/.test(packageName))throw Error('Unsupported widget application package');
 const providerName=packageName+'.SmokeLessWidgetProvider';
 const displayName=packageName.endsWith('.preview')?'Smoke Less Preview':'Smoke Less';
 const variants=[
  {provider:providerName,resource:'smoke_less_widget_info',label:displayName},
  {provider:packageName+'.SmokeLessCompactWidgetProvider',resource:'smoke_less_compact_widget_info',label:displayName+' · Kompakt dag'},
  {provider:packageName+'.SmokeLessRegisterWidgetProvider',resource:'smoke_less_register_widget_info',label:displayName+' · Registrera'},
  {provider:packageName+'.SmokeLessSosWidgetProvider',resource:'smoke_less_sos_widget_info',label:displayName+' · SOS'},
 ];
 const scheme=config.scheme||'smokeless';
 if(!['smokeless','smokeless-preview'].includes(scheme))throw Error('Unsupported widget URI scheme');
 config=withAndroidManifest(config,c=>{
  const app=c.modResults.manifest.application?.[0];
  if(!app)throw Error('Missing Android application manifest');
  app.receiver??=[];
  c.modResults.manifest['uses-permission']??=[];
  if(!c.modResults.manifest['uses-permission'].some(p=>p.$?.['android:name']==='android.permission.RECEIVE_BOOT_COMPLETED')){
   c.modResults.manifest['uses-permission'].push({$:{'android:name':'android.permission.RECEIVE_BOOT_COMPLETED'}});
  }
  for(const variant of variants){const providerName=variant.provider;
  if(!app.receiver.some(r=>r.$?.['android:name']===providerName)){
   app.receiver.push({$:{'android:name':providerName,'android:exported':'true','android:label':variant.label},'intent-filter':[{'action':[{$:{'android:name':'android.appwidget.action.APPWIDGET_UPDATE'}},{$:{'android:name':'android.intent.action.BOOT_COMPLETED'}},{$:{'android:name':'android.intent.action.DATE_CHANGED'}},{$:{'android:name':'android.intent.action.TIME_CHANGED'}},{$:{'android:name':'android.intent.action.TIMEZONE_CHANGED'}}]}],'meta-data':[{$:{'android:name':'android.appwidget.provider','android:resource':'@xml/'+variant.resource}}]});
  }
  }
  return c;
 });
 return withDangerousMod(config,['android',async c=>{
  const root=c.modRequest.platformProjectRoot;
  const javaDir=path.join(root,'app/src/main/java',...packageName.split('.'));
  const res=path.join(root,'app/src/main/res');
  for(const d of [javaDir,path.join(res,'layout'),path.join(res,'xml'),path.join(res,'drawable')])fs.mkdirSync(d,{recursive:true});
  const files={
   [path.join(javaDir,'SmokeLessWidgetModule.kt')]:`package ${packageName}

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

/** Writes only approved daily aggregates; never accepts identity or history. */
class SmokeLessWidgetModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
 override fun getName() = "SmokeLessWidget"
 @ReactMethod fun publish(date: String, todayCount: Int, dailyGoal: Int, promise: Promise) {
  try {
   val today = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(java.util.Date())
   require(date == today && todayCount >= 0 && dailyGoal >= 0) { "Invalid widget snapshot" }
   val prefs = reactContext.getSharedPreferences("smokeless_widget_v1", Context.MODE_PRIVATE)
   check(prefs.edit().putString("date", date).putInt("todayCount", todayCount)
    .putInt("dailyGoal", dailyGoal).putBoolean("enabled", true).commit()) { "Widget storage failed" }
   updateWidgets()
   promise.resolve(null)
  } catch (e: Exception) { promise.reject("WIDGET_PUBLISH_FAILED", e) }
 }
 @ReactMethod fun clear(promise: Promise) {
  try {
   val prefs = reactContext.getSharedPreferences("smokeless_widget_v1", Context.MODE_PRIVATE)
   check(prefs.edit().clear().commit()) { "Widget clear failed" }
   updateWidgets()
   promise.resolve(null)
  } catch (e: Exception) { promise.reject("WIDGET_CLEAR_FAILED", e) }
 }
 private fun updateWidgets() {
  val manager = AppWidgetManager.getInstance(reactContext)
  val providers = listOf(SmokeLessWidgetProvider(), SmokeLessCompactWidgetProvider(), SmokeLessRegisterWidgetProvider(), SmokeLessSosWidgetProvider())
  for (provider in providers) {
   val ids = manager.getAppWidgetIds(ComponentName(reactContext, provider.javaClass))
   provider.onUpdate(reactContext, manager, ids)
  }
 }
}
`,
   [path.join(javaDir,'SmokeLessWidgetPackage.kt')]:`package ${packageName}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SmokeLessWidgetPackage : ReactPackage {
 override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
  listOf(SmokeLessWidgetModule(context))
 override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
`,

   [path.join(javaDir,'SmokeLessWidgetProvider.kt')]:`package ${packageName}

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Neutral by default: personal statistics are never rendered without an explicit native bridge. */
open class SmokeLessWidgetProvider : AppWidgetProvider() {
 protected open val kind = "daily"
 override fun onReceive(context: Context, intent: Intent) {
  super.onReceive(context, intent)
  if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_DATE_CHANGED || intent.action == Intent.ACTION_TIME_CHANGED || intent.action == Intent.ACTION_TIMEZONE_CHANGED) {
   val manager = AppWidgetManager.getInstance(context)
   val ids = manager.getAppWidgetIds(ComponentName(context, javaClass))
   onUpdate(context, manager, ids)
  }
 }
 override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
  for (id in ids) {
   render(context, manager, id)
  }
 }
 override fun onAppWidgetOptionsChanged(context: Context, manager: AppWidgetManager, appWidgetId: Int, newOptions: Bundle) {
  super.onAppWidgetOptionsChanged(context, manager, appWidgetId, newOptions)
  render(context, manager, appWidgetId)
 }
 private fun render(context: Context, manager: AppWidgetManager, id: Int) {
   val width = manager.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 180)
   val shortcut = kind == "register" || kind == "sos"
   val layout = when {
    shortcut -> R.layout.smoke_less_widget_shortcut
    kind == "compact" -> R.layout.smoke_less_widget_compact
    width >= 250 -> R.layout.smoke_less_widget_wide
    else -> R.layout.smoke_less_widget
   }
   val views = RemoteViews(context.packageName, layout)
   // Native preferences are private to this application. The JS bridge is added separately.
   val prefs = context.getSharedPreferences("smokeless_widget_v1", Context.MODE_PRIVATE)
   val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
   val enabled = prefs.getBoolean("enabled", false)
   val storedDate = prefs.getString("date", null)
   val count = prefs.getInt("todayCount", -1)
   val goal = prefs.getInt("dailyGoal", -1)
   val valid = enabled && storedDate == today && count >= 0 && goal >= 0
   val summary = when {
    kind == "register" -> "Öppna registrering"
    kind == "sos" -> "Stöd vid röksug"
    !valid -> "Öppna appen för dagens framsteg"
    goal == 0 && count == 0 -> "Dagens mål: 0 cigaretter"
    goal == 0 -> "Idag: $count cigaretter · mål 0"
    else -> "Idag: $count / $goal cigaretter"
   }
   views.setTextViewText(R.id.smoke_less_widget_summary, summary)
   if (shortcut) views.setTextViewText(R.id.smoke_less_widget_title, if (kind == "sos") "SOS" else "Registrera")
   views.setContentDescription(R.id.smoke_less_widget_root, "Smoke Less. $summary. Tryck för att öppna appen.")
   val action = when (kind) { "register" -> "register"; "sos" -> "sos"; else -> null }
   val uri = if (action == null) Uri.parse("${scheme}://") else Uri.parse("${scheme}://?widget=$action")
   val launch = Intent(Intent.ACTION_VIEW, uri).apply {
    setPackage(context.packageName)
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
   }
   val pending = PendingIntent.getActivity(context, id, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
   views.setOnClickPendingIntent(R.id.smoke_less_widget_root, pending)
   manager.updateAppWidget(id, views)
 }
}

class SmokeLessCompactWidgetProvider : SmokeLessWidgetProvider() { override val kind = "compact" }
class SmokeLessRegisterWidgetProvider : SmokeLessWidgetProvider() { override val kind = "register" }
class SmokeLessSosWidgetProvider : SmokeLessWidgetProvider() { override val kind = "sos" }
`,
   [path.join(res,'xml/smoke_less_widget_info.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
 android:minWidth="180dp" android:minHeight="90dp"
 android:minResizeWidth="120dp" android:minResizeHeight="70dp"
 android:initialLayout="@layout/smoke_less_widget"
 android:resizeMode="horizontal|vertical" android:targetCellWidth="2" android:targetCellHeight="1"
 android:widgetCategory="home_screen"
 android:updatePeriodMillis="0"
 android:description="@string/app_name" />
`,
   [path.join(res,'layout/smoke_less_widget.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
 android:id="@+id/smoke_less_widget_root"
 android:layout_width="match_parent" android:layout_height="match_parent"
 android:orientation="vertical" android:gravity="center_vertical"
 android:contentDescription="Smoke Less. Öppna appen för dagens framsteg."
 android:padding="16dp" android:background="@drawable/smoke_less_widget_background">
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:text="Smoke Less" android:textColor="#B7F37C" android:textStyle="bold" android:textSize="18sp" />
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:id="@+id/smoke_less_widget_summary" android:layout_marginTop="6dp" android:text="Öppna appen för dagens framsteg"
 android:textColor="#FFFFFF" android:textSize="13sp" android:maxLines="3" android:ellipsize="end" />
</LinearLayout>
`,
   [path.join(res,'layout/smoke_less_widget_wide.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
 android:id="@+id/smoke_less_widget_root"
 android:layout_width="match_parent" android:layout_height="match_parent"
 android:orientation="vertical" android:gravity="center_vertical"
 android:contentDescription="Smoke Less. Öppna appen för dagens framsteg."
 android:padding="20dp" android:background="@drawable/smoke_less_widget_background">
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:text="${displayName} · Dagens framsteg" android:textColor="#B7F37C" android:textStyle="bold" android:textSize="18sp" />
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:id="@+id/smoke_less_widget_summary" android:layout_marginTop="8dp" android:text="Öppna appen för att se din dag"
 android:textColor="#FFFFFF" android:textSize="15sp" android:maxLines="3" android:ellipsize="end" />
</LinearLayout>
`,
   [path.join(res,'drawable/smoke_less_widget_background.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
 <solid android:color="#101A15" />
 <corners android:radius="18dp" />
</shape>
`
  };
  files[path.join(res,'layout/smoke_less_widget_compact.xml')]=files[path.join(res,'layout/smoke_less_widget.xml')].replace('android:padding="16dp"','android:padding="12dp"').replace('android:text="Smoke Less"','android:text="Dagens framsteg"').replace('android:textSize="18sp"','android:textSize="14sp"');
  files[path.join(res,'layout/smoke_less_widget_shortcut.xml')]=files[path.join(res,'layout/smoke_less_widget_compact.xml')].replace('android:text="Dagens framsteg"','android:id="@+id/smoke_less_widget_title" android:text="Öppna appen"').replace('android:text="Öppna appen för dagens framsteg"','android:text="Öppna appen"').replace('android:contentDescription="Smoke Less. Öppna appen för dagens framsteg."','android:contentDescription="Smoke Less. Öppna appen."');
  for(const variant of variants.slice(1)){
   files[path.join(res,'xml',variant.resource+'.xml')]=files[path.join(res,'xml/smoke_less_widget_info.xml')].replace('android:minWidth="180dp"','android:minWidth="110dp"').replace('android:minResizeWidth="120dp"','android:minResizeWidth="90dp"').replace('android:targetCellWidth="2"','android:targetCellWidth="1"').replace('@layout/smoke_less_widget"',variant.resource.includes('compact')?'@layout/smoke_less_widget_compact"':'@layout/smoke_less_widget_shortcut"');
  }
  for(const [file,content] of Object.entries(files))fs.writeFileSync(file,content,'utf8');
  // Register the local React Native module after Expo prebuild regenerates MainApplication.
  const application=path.join(javaDir,'MainApplication.kt');
  if(!fs.existsSync(application))throw Error('Missing MainApplication.kt for widget bridge registration');
  let main=fs.readFileSync(application,'utf8');
  if(!main.includes('SmokeLessWidgetPackage()')){
   const pattern=/PackageList\(this\)\.packages\.apply\s*\{/;
   if(!pattern.test(main))throw Error('Unsupported MainApplication package registration layout');
   main=main.replace(pattern,match=>match+'\n              add(SmokeLessWidgetPackage())');
   fs.writeFileSync(application,main,'utf8');
  }

  return c;
 }]);
};
