const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(path,deps={}){const scope={exports:{},Date,require:id=>{if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{fileName:path,compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,scope);return scope.exports;}
const {parseOnboardingNumbers:parse}=load('src/utils/onboardingValidation.ts'),{completeOnboarding:complete}=load('src/domain/onboarding.ts'),guidance=load('src/domain/gettingStarted.ts');
const {createLocalPreferences:create}=load('src/localPreferences.ts');
test('setup requires an explicit valid baseline and allows zero-price optional economy',()=>{
 assert.equal(parse('0','20','0').baseline,0);assert.equal(parse('12','20','85,50').packPrice,85.5);
 for(const b of ['',' ','-1','201','1.2','1e2','0x10','NaN'])assert.equal(parse(b,'20','0'),null,b);
 for(const [p,c] of [['0','0'],['201','0'],['20','100000.01'],['1.5','0'],['20',''],['20','-1'],['20','1e3'],['20','85,555']])assert.equal(parse('12',p,c),null);
});
test('initial profile creation preserves all prior records and never replaces an existing plan',()=>{
 const data={profile:null,entries:[{id:'cig'}],cravings:[{id:'craving'}],checkins:[{date:'2026-11-15'}]},profile={mode:'reduce'};
 const result=complete(data,profile);assert.equal(result.entries,data.entries);assert.equal(result.cravings,data.cravings);assert.equal(result.checkins,data.checkins);assert.equal(data.profile,null);assert.equal(result.profile,profile);assert.equal(complete(result,{mode:'quit'}),result);
});
test('scheduled setup rejects missing, impossible and past dates while preserving records',()=>{
 for(const quitDay of ['', '2099-02-30','2000-01-01','2099-12-01']){
  let index=0,saved=false,message=false;const values=[0,'reduce',true,'gentle',quitDay,'12','20','0'];
  const hook=load('src/hooks/useOnboardingFlow.ts',{'react':{useState:()=>[values[index++],()=>{}]},'../domain/onboarding':{completeOnboarding:complete},'../utils/onboardingValidation':{parseOnboardingNumbers:parse}}).useOnboardingFlow;
  let data={profile:null,entries:[{id:'keep'}],cravings:[],checkins:[]};
  const flow=hook(update=>{data=update(data);saved=true;},()=>message=true);
  const valid=quitDay==='2099-12-01';assert.equal(flow.begin(),valid);assert.equal(saved,valid);assert.equal(message,!valid);assert.equal(data.entries[0].id,'keep');
 }
});
test('dismissal preferences whitelist IDs and persist independently for guest and accounts',async()=>{
 const values=new Map([['history','sentinel']]),store=create('guidance',{getItem:async k=>values.get(k)??null,setItem:async(k,v)=>values.set(k,v)},guidance.normalizeGuidance);
 await store.save(null,{version:1,dismissed:['sos','sos','unknown']});await store.save('guest',{version:1,dismissed:['plan']});
 assert.equal(JSON.stringify((await store.load(null)).dismissed),'["sos"]');assert.equal(JSON.stringify((await store.load('guest')).dismissed),'["plan"]');assert.equal((await store.load('other')).dismissed.length,0);assert.equal(values.get('history'),'sentinel');
 for(const id of guidance.GUIDANCE_IDS)assert.ok(guidance.guidanceText[id].text.length>50);
});
test('onboarding preserves choices, offers optional details and leaves guest/account consent intact',()=>{
 const ui=fs.readFileSync('src/screens/OnboardingScreen.tsx','utf8'),hook=fs.readFileSync('src/hooks/useOnboardingFlow.ts','utf8'),auth=fs.readFileSync('src/components/OnboardingAuthModal.tsx','utf8'),tip=fs.readFileSync('src/components/GettingStartedTip.tsx','utf8');
 assert.doesNotMatch(ui,/Animated|setTimeout/);assert.match(ui,/economyOpen/);assert.match(ui,/speedOpen/);assert.match(ui,/onStep===2&&!parseOnboardingNumbers/);assert.match(ui,/setOnStep\(v=>v-1\)/);assert.match(hook,/setData\(current=>completeOnboarding\(current/);assert.match(auth,/fortsätt som gäst/);assert.match(tip,/if\(!prefs.ready\|\|prefs.value.dismissed.includes\(id\)\)return null/);assert.match(tip,/prefs.ready\?dismiss:prefs.retry/);assert.doesNotMatch(tip,/setData|fetch\(|Notifications/);
});
test('next-step validation blocks empty input and back navigation preserves entered values',()=>{
 const React=require('react');let index=0;const states=[];
 const react={...React,useState:initial=>{const key=index++;if(!(key in states))states[key]=initial;return [states[key],value=>states[key]=typeof value==='function'?value(states[key]):value];}};
 const Button=()=>null;const fake=()=>null;
 const ui=load('src/screens/OnboardingScreen.tsx',{'react':react,'react-native':{View:'div',Text:'p',Image:'img',Pressable:'button',ScrollView:'main',StyleSheet:{create:x=>x}},'react-native-safe-area-context':{useSafeAreaInsets:()=>({top:0,bottom:0,left:0,right:0})},'../utils/onboardingValidation':{parseOnboardingNumbers:parse},'../theme':{C:{}},'../components/ui':{AppCard:'section',AppButton:Button},'../components/OnboardingControls':{OnboardingField:fake,OnboardingChoice:fake},'../components/CompactDateModal':{CompactDateModal:fake}}).OnboardingScreen;
 const props={onStep:2,baseline:'',packSize:'20',packPrice:'0',mode:'reduce',speed:'gentle',scheduled:false,quitDay:'',setOnStep:value=>props.onStep=value(props.onStep)};
 const all=[];function walk(node){if(!node)return;if(Array.isArray(node)){node.forEach(walk);return;}if(node.type===Button)all.push(node);walk(node.props?.children);}
 function buttons(){all.length=0;index=0;walk(ui(props));return all;}
 buttons().find(x=>x.props.title==='Fortsätt').props.onPress();assert.equal(props.onStep,2);assert.ok(states[3]);
 props.baseline='12';buttons().find(x=>x.props.title==='Fortsätt').props.onPress();assert.equal(props.onStep,3);
 buttons().find(x=>x.props.title==='Tillbaka').props.onPress();assert.equal(props.onStep,2);assert.equal(props.baseline,'12');assert.equal(props.packPrice,'0');
});
