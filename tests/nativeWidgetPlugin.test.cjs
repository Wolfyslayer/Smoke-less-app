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
 assert.doesNotMatch(plugin,/todayCount|dailyGoal|accountEmail|Firebase|SharedPreferences/);
});
