const {withAndroidManifest,withDangerousMod}=require('expo/config-plugins');
const fs=require('node:fs');
const path=require('node:path');
const packageName='com.smokeless.app';
const providerName=packageName+'.SmokeLessWidgetProvider';
module.exports=function withSmokeLessWidget(config){
 config=withAndroidManifest(config,c=>{
  const app=c.modResults.manifest.application?.[0];
  if(!app)throw Error('Missing Android application manifest');
  app.receiver??=[];
  if(!app.receiver.some(r=>r.$?.['android:name']===providerName)){
   app.receiver.push({$:{'android:name':providerName,'android:exported':'true','android:label':'Smoke Less'},'intent-filter':[{'action':[{$:{'android:name':'android.appwidget.action.APPWIDGET_UPDATE'}}]}],'meta-data':[{$:{'android:name':'android.appwidget.provider','android:resource':'@xml/smoke_less_widget_info'}}]});
  }
  return c;
 });
 return withDangerousMod(config,['android',async c=>{
  const root=c.modRequest.platformProjectRoot;
  const javaDir=path.join(root,'app/src/main/java',...packageName.split('.'));
  const res=path.join(root,'app/src/main/res');
  for(const d of [javaDir,path.join(res,'layout'),path.join(res,'xml'),path.join(res,'drawable')])fs.mkdirSync(d,{recursive:true});
  const files={
   [path.join(javaDir,'SmokeLessWidgetProvider.kt')]:`package com.smokeless.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.RemoteViews

/** Neutral by default: personal statistics are never rendered without an explicit native bridge. */
class SmokeLessWidgetProvider : AppWidgetProvider() {
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
   val layout = if (width >= 250) R.layout.smoke_less_widget_wide else R.layout.smoke_less_widget
   val views = RemoteViews(context.packageName, layout)
   val launch = Intent(Intent.ACTION_VIEW, Uri.parse("smokeless://")).apply {
    setPackage(context.packageName)
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
   }
   val pending = PendingIntent.getActivity(context, id, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
   views.setOnClickPendingIntent(R.id.smoke_less_widget_root, pending)
   manager.updateAppWidget(id, views)
 }
}
`,
   [path.join(res,'xml/smoke_less_widget_info.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
 android:minWidth="180dp" android:minHeight="90dp"
 android:minResizeWidth="120dp" android:minResizeHeight="70dp"
 android:initialLayout="@layout/smoke_less_widget"
 android:resizeMode="horizontal|vertical"
 android:widgetCategory="home_screen"
 android:updatePeriodMillis="0"
 android:description="@string/app_name" />
`,
   [path.join(res,'layout/smoke_less_widget.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
 android:id="@+id/smoke_less_widget_root"
 android:layout_width="match_parent" android:layout_height="match_parent"
 android:orientation="vertical" android:gravity="center_vertical"
 android:padding="16dp" android:background="@drawable/smoke_less_widget_background">
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:text="Smoke Less" android:textColor="#B7F37C" android:textStyle="bold" android:textSize="18sp" />
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:layout_marginTop="6dp" android:text="Öppna appen för dagens framsteg"
 android:textColor="#FFFFFF" android:textSize="13sp" />
</LinearLayout>
`,
   [path.join(res,'layout/smoke_less_widget_wide.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
 android:id="@+id/smoke_less_widget_root"
 android:layout_width="match_parent" android:layout_height="match_parent"
 android:orientation="vertical" android:gravity="center_vertical"
 android:padding="20dp" android:background="@drawable/smoke_less_widget_background">
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:text="Smoke Less · Dagens framsteg" android:textColor="#B7F37C" android:textStyle="bold" android:textSize="18sp" />
 <TextView android:layout_width="match_parent" android:layout_height="wrap_content"
 android:layout_marginTop="8dp" android:text="Öppna appen för att se din dag"
 android:textColor="#FFFFFF" android:textSize="15sp" />
</LinearLayout>
`,
   [path.join(res,'drawable/smoke_less_widget_background.xml')]:`<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
 <solid android:color="#101A15" />
 <corners android:radius="18dp" />
</shape>
`
  };
  for(const [file,content] of Object.entries(files))fs.writeFileSync(file,content,'utf8');
  return c;
 }]);
};
