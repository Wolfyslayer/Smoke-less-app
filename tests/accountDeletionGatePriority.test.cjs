const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const box=({children})=>React.createElement('div',null,children);
const exportsObject={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/AppSessionView.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,{exports:exportsObject,require:id=>{
 if(id==='react')return React;
 if(id==='react-native')return {View:box,Text:box,ScrollView:box,Pressable:box,ActivityIndicator:box,StyleSheet:{create:v=>v},Platform:{OS:'android'}};
 if(id==='react-native-safe-area-context')return {useSafeAreaInsets:()=>({top:0,bottom:0})};
 if(id==='../theme')return {C:{},useThemeColors:()=>({}),useThemeStyles:fn=>fn({})};
 if(id==='../hooks/useWidgetNavigation')return {useWidgetNavigation:()=>{}};
 if(id==='./AccountDeletionStatus')return {AccountDeletionStatus:({deletion})=>React.createElement('div',null,'deletion-gate:'+deletion.state.phase)};
 return {};
}});
const render=ready=>renderToStaticMarkup(React.createElement(exportsObject.AppSessionView,{model:{ready:false,loadError:'Blocked account cache',deletion:{ready,state:{phase:'restart'}},setDialog:()=>{},setRegisterOpen:()=>{}}}));
test('deletion recovery remains accessible when the deleted account cache refuses to load',()=>{assert.match(render(false),/deletion-gate:restart/);assert.doesNotMatch(render(false),/Blocked account cache/);});
test('ordinary storage errors remain visible after the deletion gate is ready',()=>{assert.match(render(true),/Blocked account cache/);});
