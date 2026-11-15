const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
test('application confirmations never call platform alert or browser confirm',()=>{
 function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)]);}
 for(const file of [...files('src'),...files('app')].filter(f=>/\.tsx?$/.test(f))){const source=fs.readFileSync(file,'utf8');assert.doesNotMatch(source,/\bAlert\s*\.|\b(?:window\.)?(?:alert|confirm)\s*\(/,file);}
});
test('legacy-copy deletion requires the app modal and cancellation never removes anything',async()=>{
 const values=[],refs=[];let index=0,refIndex=0,removed=0;
 const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),Fragment:'fragment',useState:init=>{const i=index++;if(!(i in values))values[i]=i===1?2:init;return [values[i],v=>{values[i]=typeof v==='function'?v(values[i]):v;}]},useRef:init=>{const i=refIndex++;return refs[i]??(refs[i]={current:init})},useEffect:()=>{}};
 function load(file,deps){const scope={exports:{},require:id=>{assert(id in deps,id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,scope);return scope.exports;}
 const hook=load('src/hooks/useConfirmationDialog.ts',{'react':React});
 const {LegacyRecoveryCleanup}=load('src/components/LegacyRecoveryCleanup.tsx',{'react':React,'react-native':{Pressable:'button',Text:'text',View:'view',StyleSheet:{create:s=>s}},'@react-native-async-storage/async-storage':{},'../theme':{useThemeStyles:fn=>fn({})},'./ConfirmationDialog':{ConfirmationDialog:'app-dialog'},'../hooks/useConfirmationDialog':hook,'../localRecoveryCopies':{listLegacyRecoveryCopies:async()=>[],removeLegacyRecoveryCopies:async(storage,confirmed)=>{assert.equal(confirmed,true);removed++;}}});
 const render=()=>{index=0;refIndex=0;return LegacyRecoveryCleanup();};
 function find(node,type){if(!node||typeof node!=='object')return null;if(node.type===type)return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child,type);if(found)return found;}return null;}
 let tree=render();find(tree,'button').props.onPress();assert.equal(removed,0);tree=render();let dialog=find(tree,'app-dialog');assert.equal(dialog.props.dialog.confirmLabel,'Radera äldre kopior');dialog.props.onClose();assert.equal(removed,0);tree=render();assert.equal(find(tree,'app-dialog').props.dialog,null);
 find(tree,'button').props.onPress();tree=render();dialog=find(tree,'app-dialog');dialog.props.dialog.confirm();dialog.props.dialog.confirm();await new Promise(resolve=>setImmediate(resolve));assert.equal(removed,1);
});
