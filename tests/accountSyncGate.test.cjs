const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
test('sync gate derives loading from phase, hides status until expanded and retries explicitly',()=>{
 let expanded=false,retries=0;
 const react={createElement:(type,props,...children)=>({type,props:props||{},children}),Fragment:'Fragment',useState:()=>[expanded,value=>expanded=typeof value==='function'?value(expanded):value]};
 const native=Object.fromEntries(['ActivityIndicator','Pressable','ScrollView','Text','View'].map(x=>[x,x]));native.StyleSheet={create:x=>x};
 const deps={react,'react-native':native,'lucide-react-native':Object.fromEntries(['CloudOff','ChevronDown','ChevronUp','ShieldCheck'].map(x=>[x,x])),'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:0,bottom:0})},'../theme':{useThemeColors:()=>({}),useThemeStyles:fn=>fn({})}};
 const scope={exports:{},require:id=>{assert(id in deps,id);return deps[id]}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/AccountSyncGate.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,scope);
 const nodes=tree=>tree&&typeof tree==='object'?[tree,...tree.children.flatMap(nodes)]:[];
 const render=phase=>scope.exports.AccountSyncGate({phase,message:'Kontrollera anslutningen.',onRetry:()=>retries++});
 for(const phase of ['idle','syncing']){const all=nodes(render(phase));assert(all.some(x=>x.type==='ActivityIndicator'));assert(!all.some(x=>x.type==='Pressable'));}
 let tree=render('error'),all=nodes(tree);assert(!JSON.stringify(tree).includes('Kontrollera anslutningen.'));assert.equal(retries,0);
 all.filter(x=>x.type==='Pressable')[1].props.onPress();tree=render('error');assert(JSON.stringify(tree).includes('Kontrollera anslutningen.'));
 nodes(tree).filter(x=>x.type==='Pressable')[0].props.onPress();assert.equal(retries,1);assert.equal(expanded,false);
});
