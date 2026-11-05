const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');

test('Expo widget prebuild generates native provider, bridge, resources and registers package exactly once',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'smokeless-widget-'));
 try{
  const javaDir=path.join(root,'app/src/main/java/com/smokeless/app');
  fs.mkdirSync(javaDir,{recursive:true});
  const mainPath=path.join(javaDir,'MainApplication.kt');
  fs.writeFileSync(mainPath,'package com.smokeless.app\\nclass MainApplication { val packages = PackageList(this).packages.apply {\\n } }'.replaceAll('\\n','\n'));
  const source=fs.readFileSync('plugins/withSmokeLessWidget.js','utf8');
  let manifestMod,dangerousMod;
  const context={module:{exports:{}},exports:{},require:id=>{
   if(id==='expo/config-plugins')return {
    withAndroidManifest:(c,fn)=>{manifestMod=fn;return c},
    withDangerousMod:(c,[platform,fn])=>{assert.equal(platform,'android');dangerousMod=fn;return c}
   };
   if(id==='node:fs')return fs;
   if(id==='node:path')return path;
   throw Error(id);
  }};
  vm.runInNewContext(source,context,{filename:'withSmokeLessWidget.js'});
  context.module.exports({});
  const manifest={modResults:{manifest:{application:[{receiver:[]}]}}};
  manifestMod(manifest);
  assert.equal(manifest.modResults.manifest.application[0].receiver.length,1);
  await dangerousMod({modRequest:{platformProjectRoot:root}});
  await dangerousMod({modRequest:{platformProjectRoot:root}});
  const main=fs.readFileSync(mainPath,'utf8');
  assert.equal(main.split('add(SmokeLessWidgetPackage())').length-1,1);
  for(const name of ['SmokeLessWidgetModule.kt','SmokeLessWidgetPackage.kt','SmokeLessWidgetProvider.kt']){
   assert.ok(fs.existsSync(path.join(javaDir,name)),name);
  }
  const provider=fs.readFileSync(path.join(javaDir,'SmokeLessWidgetProvider.kt'),'utf8');
  const bridge=fs.readFileSync(path.join(javaDir,'SmokeLessWidgetModule.kt'),'utf8');
  assert.match(provider,/storedDate == today/);
  assert.match(bridge,/MODE_PRIVATE/);
  assert.ok(bridge.includes('prefs.edit().clear().commit()'));
  assert.ok(fs.existsSync(path.join(root,'app/src/main/res/xml/smoke_less_widget_info.xml')));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
