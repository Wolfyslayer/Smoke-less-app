const {withAndroidManifest,withDangerousMod}=require('expo/config-plugins');
const fs=require('node:fs');
const path=require('node:path');
module.exports=function withSmokeLessWidget(config){
 const packageName=config.android?.package||'com.smokeless.app';
 if(!/^com\.smokeless\.app(?:\.(?:preview|deletionqa))?$/.test(packageName))throw Error('Unsupported widget application package');
 const providerName=packageName+'.SmokeLessWidgetProvider';
 const displayName=packageName.endsWith('.deletionqa')?'Smoke Less Deletion QA':packageName.endsWith('.preview')?'Smoke Less Preview':'Smoke Less';
 const variants=[
  {provider:providerName,resource:'smoke_less_widget_info',label:displayName},
  {provider:packageName+'.SmokeLessCompactWidgetProvider',resource:'smoke_less_compact_widget_info',label:displayName+' · Kompakt dag'},
  {provider:packageName+'.SmokeLessRegisterWidgetProvider',resource:'smoke_less_register_widget_info',label:displayName+' · Registrera'},
  {provider:packageName+'.SmokeLessSosWidgetProvider',resource:'smoke_less_sos_widget_info',label:displayName+' · SOS'},
 ];
 const scheme=config.scheme||'smokeless';
 if(!['smokeless','smokeless-preview','smokeless-deletionqa'].includes(scheme))throw Error('Unsupported widget URI scheme');
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
   views.setTextViewText(R.id.smoke_less_widget_value, if (valid) count.toString() else "")
   views.setViewVisibility(R.id.smoke_less_widget_value, if (valid && !shortcut) View.VISIBLE else View.GONE)
   views.setViewVisibility(R.id.smoke_less_widget_progress, if (valid && !shortcut && goal > 0) View.VISIBLE else View.GONE)
   val progress = if (goal > 0) (count.toLong() * 100 / goal).coerceIn(0L, 100L).toInt() else 0
   views.setProgressBar(R.id.smoke_less_widget_progress, 100, progress, false)
   views.setImageViewResource(R.id.smoke_less_widget_icon, when (kind) {
    "register" -> R.drawable.smoke_less_widget_plus
    "sos" -> R.drawable.smoke_less_widget_sos
    else -> R.drawable.smoke_less_widget_leaf
   })
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
  };
  const widgetLayout=(title,compact=false)=>`<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
 android:id="@+id/smoke_less_widget_root" android:layout_width="match_parent" android:layout_height="match_parent"
 android:orientation="vertical" android:gravity="center_vertical" android:padding="${compact?'12':'16'}dp"
 android:contentDescription="Smoke Less. Öppna appen för dagens framsteg."
 android:background="@drawable/smoke_less_widget_background">
 <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:gravity="center_vertical">
  <ImageView android:id="@+id/smoke_less_widget_icon" android:layout_width="22dp" android:layout_height="22dp"
   android:src="@drawable/smoke_less_widget_leaf" android:importantForAccessibility="no" />
  <TextView android:id="@+id/smoke_less_widget_title" android:layout_width="0dp" android:layout_weight="1"
   android:layout_height="wrap_content" android:layout_marginStart="8dp" android:text="${title}"
   android:textColor="#F2FCF9" android:textStyle="bold" android:textSize="${compact?'13':'14'}sp"
   android:maxLines="1" android:ellipsize="end" />
 </LinearLayout>
 <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:gravity="center_vertical" android:layout_marginTop="8dp">
  <TextView android:id="@+id/smoke_less_widget_value" android:layout_width="wrap_content" android:layout_height="wrap_content"
   android:layout_marginEnd="10dp" android:textColor="#35EDAC" android:textSize="${compact?'26':'36'}sp"
   android:textStyle="bold" android:visibility="gone" android:importantForAccessibility="no" />
  <TextView android:id="@+id/smoke_less_widget_summary" android:layout_width="0dp" android:layout_weight="1"
   android:layout_height="wrap_content" android:text="Öppna appen för dagens framsteg"
   android:textColor="#B4D0D1" android:textSize="12sp" android:maxLines="3" android:ellipsize="end" />
 </LinearLayout>
 <ProgressBar android:id="@+id/smoke_less_widget_progress" style="?android:attr/progressBarStyleHorizontal"
  android:layout_width="match_parent" android:layout_height="4dp" android:layout_marginTop="8dp"
  android:progressDrawable="@drawable/smoke_less_widget_progress" android:visibility="gone" android:importantForAccessibility="no" />
</LinearLayout>
`;
  files[path.join(res,'layout/smoke_less_widget.xml')]=widgetLayout('Smoke Less');
  files[path.join(res,'layout/smoke_less_widget_wide.xml')]=widgetLayout('Dagens framsteg');
  files[path.join(res,'layout/smoke_less_widget_compact.xml')]=widgetLayout('Dagens framsteg',true);
  files[path.join(res,'layout/smoke_less_widget_shortcut.xml')]=widgetLayout('Öppna appen',true);
  files[path.join(res,'drawable/smoke_less_widget_background.xml')]=`<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
 <gradient android:startColor="#0A3339" android:endColor="#00151B" android:angle="315" />
 <stroke android:width="1dp" android:color="#205259" />
 <corners android:radius="20dp" />
</shape>`;
  files[path.join(res,'drawable/smoke_less_widget_progress.xml')]=`<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
 <item android:id="@android:id/background"><shape><corners android:radius="2dp"/><solid android:color="#205259"/></shape></item>
 <item android:id="@android:id/progress"><clip><shape><corners android:radius="2dp"/><solid android:color="#35EDAC"/></shape></clip></item>
</layer-list>`;
  const icons={
   leaf:'M9,57 C1,43 6,21 26,13 C41,7 48,8 58,1 C65,26 61,49 43,57 C31,63 18,61 9,57 Z M8,61 C16,38 36,35 51,16 C43,35 25,43 8,61 Z',
   plus:'M29,10 L35,10 L35,29 L54,29 L54,35 L35,35 L35,54 L29,54 L29,35 L10,35 L10,29 L29,29 Z',
   sos:'M32,3 A29,29 0,1 0,32,61 A29,29 0,1 0,32,3 M32,17 A15,15 0,1 1,32,47 A15,15 0,1 1,32,17',
  };
  for(const [name,data] of Object.entries(icons))files[path.join(res,'drawable','smoke_less_widget_'+name+'.xml')]=`<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="64" android:viewportHeight="64"><path android:fillColor="#35EDAC" android:fillType="evenOdd" android:pathData="${data}"/></vector>`;
  for(const variant of variants.slice(1)){
   files[path.join(res,'xml',variant.resource+'.xml')]=files[path.join(res,'xml/smoke_less_widget_info.xml')].replace('android:minWidth="180dp"','android:minWidth="150dp"').replace('android:minResizeWidth="120dp"','android:minResizeWidth="110dp"').replace('@layout/smoke_less_widget"',variant.resource.includes('compact')?'@layout/smoke_less_widget_compact"':'@layout/smoke_less_widget_shortcut"');
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
