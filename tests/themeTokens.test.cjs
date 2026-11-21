const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
const output=ts.transpileModule(fs.readFileSync('src/themeTokens.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const context={exports:{}};vm.runInNewContext(output,context);
const {themePalettes,resolveTheme}=context.exports;
function luminance(hex){const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
test('semantic text and action pairs remain readable in both palettes',()=>{
 for(const [name,c] of Object.entries(themePalettes)){
  for(const bg of ['background','surface','elevated','soft','accentSubtle']){
   for(const fg of ['text','textMuted','textSecondary','success','warning','danger'])assert(contrast(c[fg],c[bg])>=4.5,`${name}: ${fg}/${bg}`);
  }
  for(const bg of ['accent','accentPressed'])assert(contrast(c.onAccent,c[bg])>=4.5,`${name}: onAccent/${bg}`);
  assert(contrast(c.background,c.danger)>=4.5,`${name}: filled SOS action`);
 }
});
test('explicit themes override system and missing system theme falls back to light',()=>{
 assert.equal(resolveTheme('light','dark'),'light');assert.equal(resolveTheme('dark','light'),'dark');
 assert.equal(resolveTheme('system','dark'),'dark');assert.equal(resolveTheme('system','light'),'light');
 assert.equal(resolveTheme('system',null),'light');assert.equal(resolveTheme('system',undefined),'light');
});
