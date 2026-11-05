const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('widget deep link resolves to the Expo Router home route without a registration action',()=>{
 const app=JSON.parse(fs.readFileSync('app.json','utf8'));
 const provider=fs.readFileSync('plugins/withSmokeLessWidget.js','utf8');
 const index=fs.readFileSync('app/index.tsx','utf8');
 const layout=fs.readFileSync('app/_layout.tsx','utf8');
 assert.equal(app.expo.scheme,'smokeless');
 assert.ok(app.expo.plugins.includes('expo-router'));
 assert.ok(provider.includes('Uri.parse("smokeless://")'));
 assert.ok(provider.includes('setPackage(context.packageName)'));
 assert.ok(provider.includes('views.setOnClickPendingIntent(R.id.smoke_less_widget_root, pending)'));
 assert.ok(index.includes("import SmokeLess from '../src/SmokeLess'"));
 assert.ok(index.includes('<SmokeLess/>'));
 assert.ok(layout.includes('<Stack'));
 assert.ok(!provider.includes('ACTION_REGISTER_CIGARETTE'));
});
