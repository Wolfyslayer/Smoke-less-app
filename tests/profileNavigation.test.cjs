const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function navigation(){let tab='home',refIndex=0;const refs=[];const react={useState:()=>[tab,value=>tab=value],useRef:initial=>{const index=refIndex++;return refs[index]??(refs[index]={current:initial});},useCallback:fn=>fn};const context={exports:{},require:id=>{assert.equal(id,'react');return react;}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/hooks/useSessionNavigation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);return {render:()=>{refIndex=0;return context.exports.useSessionNavigation();}};}
test('category navigation returns through plan settings, journey and profile without duplicate history',()=>{
 const n=navigation();for(const tab of ['profile','journey','plan','plan-settings']){n.render().setTab(tab);n.render().setTab(tab);}
 for(const expected of ['plan','journey','profile','home']){assert.equal(n.render().goBack(),true);assert.equal(n.render().tab,expected);}assert.equal(n.render().goBack(),false);
});
test('account opened from data returns to data and session reset removes category history',()=>{
 const n=navigation();for(const tab of ['profile','backup','account'])n.render().setTab(tab);assert(n.render().goBack());assert.equal(n.render().tab,'backup');n.render().setTab('about');n.render().resetToHome();assert.equal(n.render().tab,'home');assert.equal(n.render().goBack(),false);
});
