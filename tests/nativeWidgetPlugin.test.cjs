const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('widget plugin declares provider, launcher action and neutral privacy-safe initial layout',()=>{
 const plugin=fs.readFileSync('plugins/withSmokeLessWidget.js','utf8');
 const app=JSON.parse(fs.readFileSync('app.json','utf8'));
 assert.ok(app.expo.plugins.includes('./plugins/withSmokeLessWidget'));
 assert.match(plugin,/withAndroidManifest/);
 assert.match(plugin,/android\.appwidget\.action\.APPWIDGET_UPDATE/);
 assert.match(plugin,/SmokeLessWidgetProvider/);
 assert.match(plugin,/PendingIntent\.FLAG_IMMUTABLE/);
 assert.match(plugin,/smokeless:\/\//);
 assert.match(plugin,/android:updatePeriodMillis="0"/);
 assert.match(plugin,/getSharedPreferences\("smokeless_widget_v1", Context\.MODE_PRIVATE\)/);
 assert.match(plugin,/prefs\.getBoolean\("enabled", false\)/);
 assert.match(plugin,/storedDate == today/);
 assert.match(plugin,/count >= 0 && goal >= 0/);
 assert.match(plugin,/goal == 0 && count == 0/);
 assert.ok(plugin.includes('views.setContentDescription(R.id.smoke_less_widget_root'));
 assert.match(plugin,/!valid ->/);
 assert.doesNotMatch(plugin,/accountEmail|Firebase|authToken|userUid/);
});

test('widget launcher deep link matches Expo scheme and routes to the app home',()=>{
 const app=JSON.parse(fs.readFileSync('app.json','utf8'));
 const plugin=fs.readFileSync('plugins/withSmokeLessWidget.js','utf8');
 const index=fs.readFileSync('app/index.tsx','utf8');
 const layout=fs.readFileSync('app/_layout.tsx','utf8');
 assert.equal(app.expo.scheme,'smokeless');
 assert.ok(plugin.includes('Uri.parse("smokeless://")'));
 assert.ok(plugin.includes('Intent.ACTION_VIEW'));
 assert.ok(plugin.includes('setPackage(context.packageName)'));
 assert.ok(plugin.includes('PendingIntent.FLAG_IMMUTABLE'));
 assert.ok(index.includes('SmokeLess'));
 assert.ok(layout.includes('<Stack'));
 assert.ok(!plugin.includes('registerCigarette'),'widget tap must never register a cigarette');
});
