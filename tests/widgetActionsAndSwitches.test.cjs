const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,deps){const scope={exports:{},require:id=>{assert(id in deps,id);return deps[id]}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,scope);return scope.exports;}
const navigation=load('src/widgets/widgetNavigation.ts',{});
test('widget links only select an allowed screen in the configured app',()=>{
 for(const scheme of ['smokeless','smokeless-preview'])for(const destination of ['register','sos'])assert.equal(navigation.widgetDestination(`${scheme}://?widget=${destination}`,scheme),destination);
 for(const url of ['https://evil/?widget=register','smokeless://?widget=register','smokeless-preview://register','smokeless-preview://?widget=delete','smokeless-preview://?widget=register&submit=true','smokeless-preview://?widget=sos#extra','smokeless-preview://?widget=REGISTER'])assert.equal(navigation.widgetDestination(url,'smokeless-preview'),null);
});
test('settings switches expose labels, values and theme colors and ignore disabled or duplicate changes',()=>{
 const calls=[],react={createElement:(type,props,...children)=>({type,props,children})};const colors={text:'text',textMuted:'muted',border:'border',accent:'accent',onAccent:'onAccent'};
 const {SettingsSwitch}=load('src/components/SettingsSwitch.tsx',{react,'react-native':{Switch:'Switch',Text:'Text',View:'View'},'../theme':{useThemeColors:()=>colors}});
 const render=(value,disabled=false)=>SettingsSwitch({label:'Tysta tider',value,disabled,onValueChange:next=>calls.push(next)}).children.find(n=>n.type==='Switch');
 let control=render(false);assert.equal(control.props.accessibilityLabel,'Tysta tider');assert.equal(control.props.value,false);assert.equal(control.props.trackColor.true,'accent');control.props.onValueChange(false);assert.equal(calls.length,0);control.props.onValueChange(true);assert.deepEqual(calls,[true]);
 control=render(true,true);assert.equal(control.props.disabled,true);control.props.onValueChange(false);assert.deepEqual(calls,[true]);
});
function widgetHook(){
 let states=[],refs=[],effects=[],si,ri,ei,listener,initialReads=0,resolveInitial;const navigated=[];const initial=new Promise(resolve=>resolveInitial=resolve);
 const react={useState:initial=>{const i=si++;if(!(i in states))states[i]=initial;return [states[i],next=>states[i]=next]},useRef:initial=>{const i=ri++;return refs[i]??(refs[i]={current:initial})},useEffect:(fn,deps)=>{const i=ei++,old=effects[i];if(old&&deps.every((x,n)=>Object.is(x,old.deps[n])))return;old?.cleanup?.();effects[i]={deps,cleanup:fn()}}};
 const linking={addEventListener:(_,fn)=>{listener=fn;return {remove(){}}},getInitialURL:()=>{initialReads++;return initial}};
 const hook=load('src/hooks/useWidgetNavigation.ts',{react,'react-native':{Linking:linking},'expo-constants':{expoConfig:{scheme:'smokeless-preview'}},'../widgets/widgetNavigation':navigation}).useWidgetNavigation;
 return {render:available=>{si=ri=ei=0;hook(available,d=>navigated.push(d))},resolve:async url=>{resolveInitial(url);await new Promise(setImmediate)},event:url=>listener({url}),navigated,reads:()=>initialReads,remount(){effects.forEach(e=>e?.cleanup?.());states=[];refs=[];effects=[]}};
}
test('widget navigation waits for session/onboarding/dialog guards and replays no completed cold action',async()=>{
 const f=widgetHook();f.render(false);await f.resolve('smokeless-preview://?widget=register');f.render(false);assert.deepEqual(f.navigated,[]);f.render(true);assert.deepEqual(f.navigated,['register']);f.render(true);assert.equal(f.navigated.length,1);
 f.render(false);f.event('smokeless-preview://?widget=sos');f.render(false);assert.equal(f.navigated.length,1);f.render(true);assert.deepEqual(f.navigated,['register','sos']);f.remount();f.render(true);assert.equal(f.reads(),1);assert.equal(f.navigated.length,2);
});
test('a cold widget action survives a session remount while initial URL is resolving',async()=>{
 const f=widgetHook();f.render(false);f.remount();f.render(false);await f.resolve('smokeless-preview://?widget=sos');f.render(true);assert.deepEqual(f.navigated,['sos']);
});
