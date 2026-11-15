const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
function load(file,deps,globals={}){const context={exports:{},require:id=>{assert(id in deps,id);return deps[id]},...globals};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);return context.exports;}
test('reduced motion defaults safe and a late initial read cannot overwrite a newer event',async()=>{
 let state,effect,event,resolve,removed=false;const initial=new Promise(r=>resolve=r);
 const {useReducedMotion}=load('src/hooks/useReducedMotion.ts',{'react':{useState:value=>{if(state===undefined)state=value;return [state,value=>state=value]},useEffect:fn=>effect=fn},'react-native':{AccessibilityInfo:{isReduceMotionEnabled:()=>initial,addEventListener:(name,fn)=>{assert.equal(name,'reduceMotionChanged');event=fn;return {remove:()=>removed=true};}}}});
 assert.equal(useReducedMotion(),true);const cleanup=effect();event(false);resolve(true);await initial;assert.equal(state,false);cleanup();assert(removed);event(true);assert.equal(state,false);
});
test('breathing retains its guidance clock while scale animation is disabled for reduced motion',()=>{
 for(const reduced of [true,false]){let index=0,loops=0,ticks=0;const effects=[];const value={stopAnimation(){},setValue(){}};
  const hook=load('src/hooks/useBreathing.ts',{'./useReducedMotion':{useReducedMotion:()=>reduced},'react':{useState:init=>[index++===0?true:init,()=>{}],useRef:init=>({current:init}),useEffect:fn=>effects.push(fn)},'react-native':{Animated:{Value:function(){return value},loop:()=>{loops++;return {start(){},stop(){}}},sequence:x=>x,timing:()=>({}),delay:()=>({})},Easing:{inOut:x=>x,sin:()=>{}},Platform:{OS:'web'},Vibration:{cancel(){},vibrate(){assert.fail()}}}},{setInterval:()=>{ticks++;return 1},clearInterval(){}}).useBreathing;
  hook();const cleanups=effects.map(fn=>fn());assert.equal(ticks,1);assert.equal(loops,reduced?0:1);cleanups.forEach(fn=>fn?.());
 }
});
