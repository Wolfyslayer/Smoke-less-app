const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');const React=require('react');const {renderToStaticMarkup:render}=require('react-dom/server');
let width=360,fontScale=1,capturedActions=null,capturedViews=null;
let controlledStates=null,controlledIndex=0;const renderReact={...React,useState:initial=>{if(!controlledStates)return React.useState(initial);const i=controlledIndex++;if(!(i in controlledStates))controlledStates[i]=initial;return [controlledStates[i],value=>controlledStates[i]=typeof value==='function'?value(controlledStates[i]):value];}};
const flat=style=>Object.assign({},...[typeof style==='function'?style({pressed:false}):style].flat(Infinity).filter(Boolean));
const element=tag=>function Element({children,style,accessibilityRole,accessibilityLabel,accessibilityState,accessible,...props}){if(capturedActions&&tag==='button')capturedActions.push({label:accessibilityLabel,children,onPress:props.onPress,disabled:props.disabled,state:accessibilityState});if(capturedViews&&props.testID)capturedViews.push({id:props.testID,style:flat(style)});return React.createElement(tag,{style:flat(style),role:accessibilityRole,'aria-label':accessibilityLabel,...(tag==='button'?{disabled:props.disabled}:{}),...(props.fill?{fill:props.fill}:{}),...(props.stroke?{stroke:props.stroke}:{})},children);};
const rn={Switch:element('input'),View:element('div'),Text:element('span'),Pressable:element('button'),ScrollView:element('section'),Modal:({visible,children})=>visible?children:null,StyleSheet:{create:s=>s},useWindowDimensions:()=>({width,height:900,fontScale}),ActivityIndicator:element('span')};
const svg={__esModule:true,default:element('svg'),Circle:element('circle'),Rect:element('rect'),Text:element('text'),TSpan:element('tspan'),Path:element('path'),Defs:element('defs'),LinearGradient:element('linearGradient'),RadialGradient:element('radialGradient'),Stop:element('stop')};
const cache=new Map();
function load(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 const out={};cache.set(file,out);
 const context={exports:out,require:id=>{
  if(id==='react')return renderReact;if(id==='react-native')return rn;if(id==='react-native-svg')return svg;
  if(id==='lucide-react-native')return new Proxy({},{get:()=>element('span')});
  if(id==='react-native-safe-area-context')return {useSafeAreaInsets:()=>({top:24,bottom:24,left:0,right:0})};
  if(id==='@react-native-async-storage/async-storage')return {getItem:async()=>null,setItem:async()=>assert.fail('Render must not save'),getAllKeys:async()=>[]};
  if(id==='expo-constants')return {expoConfig:{version:'QA'}};
  if(['expo-notifications','expo-sharing','expo-file-system/legacy'].includes(id))return {};
  if(id.endsWith('.png'))return 1;
  if(id.endsWith('useReducedMotion'))return {useReducedMotion:()=>true};
  if(id.startsWith('.')){const p=path.resolve(path.dirname(file),id);for(const suffix of ['.ts','.tsx','/index.ts'])if(fs.existsSync(p+suffix))return load(p+suffix);}
  throw Error('Unexpected dependency '+id);
 }};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText,context);return out;
}
const {ThemeContext,palettes}=load('src/theme.ts');
const {AppCard,AppButton}=load('src/components/ui.tsx');
const {BottomNavigation}=load('src/components/BottomNavigation.tsx');
const {ConfirmationDialog}=load('src/components/ConfirmationDialog.tsx');
const {CompactDateModal}=load('src/components/CompactDateModal.tsx');
const {DailyProgressShareArtwork}=load('src/components/DailyProgressShareArtwork.tsx');
const {AppearanceSettings}=load('src/components/AppearanceSettings.tsx');
rn.TextInput=element('input');rn.Image=()=>React.createElement('img',{alt:'Smoke Less'});rn.Platform={OS:'web'};rn.NativeModules={};rn.Animated={View:element('div')};rn.Linking={openURL:()=>assert.fail('Render must not navigate')};
function themed(name,child,extra={}){return render(React.createElement(ThemeContext.Provider,{value:{mode:name,name,colors:palettes[name],ready:true,saving:false,error:'',setMode:async()=>assert.fail('Render must not save'),...extra}},child));}
test('shared controls, navigation, dialogs and SVG render with the chosen palette',()=>{
 for(const name of ['light','dark'])for(const size of [320,768])for(const scale of [1,2]){width=size;fontScale=scale;
  const ui=themed(name,React.createElement(AppCard,null,React.createElement(AppButton,{title:'Registrera',onPress:()=>assert.fail()})));assert(ui.includes(palettes[name].surface));assert(ui.includes(palettes[name].onAccent));
  const nav=themed(name,React.createElement(BottomNavigation,{tab:'home',onNavigate:()=>assert.fail()}));assert(nav.includes('Hem'));assert(nav.includes(palettes[name].accent));
  const dialog=themed(name,React.createElement(ConfirmationDialog,{dialog:{title:'Bekräfta',message:'Kontrollerat test',confirm:()=>assert.fail()},onClose:()=>{}}));assert(dialog.includes(palettes[name].surface));assert(dialog.includes('Kontrollerat test'));
  const date=themed(name,React.createElement(CompactDateModal,{visible:true,value:null,onCancel:()=>{},onConfirm:()=>assert.fail()}));assert(date.includes('Välj stoppdatum'));
  for(const [todayCount,dailyGoal] of [[0,0],[2,10],[15,10]]){const art=themed(name,React.createElement(DailyProgressShareArtwork,{todayCount,dailyGoal}));assert(art.includes(palettes[name].surface));assert(art.includes(palettes[name].accent));assert(art.includes('Dagens framsteg'));}
 }
});
test('appearance choices and recoverable storage errors remain visible in both themes',()=>{
 for(const name of ['light','dark']){const html=themed(name,React.createElement(AppearanceSettings),{error:'Kunde inte spara utseendet.',saving:false});for(const text of ['System','Ljust','Mörkt','Kunde inte spara utseendet.'])assert(html.includes(text));assert(html.includes(palettes[name].danger));}
});
test('plan, history, stats, settings, profile, benefits and onboarding render both themes without data writes',()=>{
 const noop=()=>assert.fail('Render must not invoke actions');
 const clock=Date.parse('2026-11-15T12:00:00Z'),today='2026-11-15';
 const profile={mode:'reduce',baseline:12,packSize:20,packPrice:0,speed:'gentle',startAt:'2026-11-01T12:00:00Z'};
 const data={profile,entries:[],cravings:[],checkins:[]};
 const cases=[
  ['HomeScreen',{uid:null,clock,data,goal:10,todayCount:0,duration:'',weekly:[],today,onRegister:noop,onSOS:noop,onPlan:noop,onHistory:noop,onStats:noop,onConfirmToday:noop}],
  ['SOSScreen',{breathScale:{interpolate:()=>1},breathing:false,breathSeconds:0,sosIdeas:[{title:'Vatten',detail:'Test'}],sosTip:0,trigger:'Stress',sosTimer:0,sosStartIntensity:null}],
  ['BackupScreen',{accountEmail:null,syncStatus:'Test',onGuestReset:noop,onOpenAccount:noop,onBack:noop}],
  ['PlanScreen',{profile,goal:10,todayReduction:2,confirmedDays:0,withinDays:0,planWeek:[],clock,onChangeProfile:noop}],
  ['RegisterScreen',{todayCount:0,goal:10,duration:'',sorted:[],today,onOpenRegister:noop,onOpenHistory:noop,onRemove:noop}],
  ['HistoryScreen',{entries:[],sorted:[],onRemove:noop}],
  ['StatsScreen',{data,period:7,onPeriodChange:noop,clock,weekly:[0,0,0,0,0,0,0],todayCount:0,recentCravingsCount:0,cravingTriggers:[],cigaretteTriggers:[]}],
  ['SettingsScreen',{profile,goal:10,data,onChangeMode:noop,onChangeDailyTarget:noop}],
  ['ProfileScreen',{profile,accountEmail:null,todayCount:0,dailyGoal:10,onNavigate:noop}],
  ['JourneyScreen',{profile,accountEmail:null,todayCount:0,dailyGoal:10,onNavigate:noop}],
  ['AboutScreen',{onNavigate:noop}],
  ['BenefitsScreen',{data}],
  ['AccountScreen',{accountUser:null,accountMode:'login',accountEmail:'',accountPassword:'',syncStatus:'Test',onBack:noop,googleConfigured:false}],
  ...[0,1,2,3].map(onStep=>['OnboardingScreen',{onStep,mode:'reduce',speed:'gentle',scheduled:false,quitDay:'',baseline:'12',packSize:'20',packPrice:'0',setOnStep:noop,setMode:noop,setSpeed:noop,setScheduled:noop,setQuitDay:noop,setBaseline:noop,setPackSize:noop,setPackPrice:noop,begin:noop}]),
 ];
 const before=JSON.stringify(data);
 for(const name of ['light','dark'])for(const size of [320,768])for(const scale of [1,2]){width=size;fontScale=scale;for(const [screen,props] of cases){const Component=load(`src/screens/${screen}.tsx`)[screen];const html=themed(name,React.createElement(Component,props));assert(html.length>0,screen);assert(html.includes(palettes[name].text)||html.includes(palettes[name].textMuted),`${name}: ${screen}`);}}
 assert.equal(JSON.stringify(data),before);
});
test('UI modules no longer import a fixed palette or use hardcoded surface colors',()=>{
 function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(dir,d.name)):[path.join(dir,d.name)]);}
 for(const file of files('src').filter(f=>f.endsWith('.tsx'))){const s=fs.readFileSync(file,'utf8');assert.doesNotMatch(s,/import\s*\{C\}\s*from/,file);assert.doesNotMatch(s,/#[0-9a-f]{3,8}\b/i,file);}
});

test('profile category buttons navigate to five distinct destinations and keep sharing outside the overview',()=>{
 const {profileCategories}=load('src/profileCategories.ts');const {ProfileOverview}=load('src/components/ProfileOverview.tsx');
 assert.equal(profileCategories.length,5);assert.equal(new Set(profileCategories.map(c=>c.destination)).size,5);
 for(const accountEmail of [null,'qa@example.invalid']){const events=[];capturedActions=[];const html=themed('light',React.createElement(ProfileOverview,{accountEmail,onNavigate:tab=>events.push(tab)}));assert.deepEqual(events,[]);for(const category of profileCategories){const action=capturedActions.find(a=>a.label===category.title);assert(action);action.onPress();assert.equal(events.at(-1),category.destination);}assert.equal(html.includes('Gästläge'),accountEmail===null);assert.equal(html.includes('qa@example.invalid'),accountEmail!==null);assert(!html.includes('Förbered bild för delning'));capturedActions=null;}
});

test('data category forwards existing guarded actions and separates guest reset from account imports',()=>{
 const {AccountSettingsRoutes}=load('src/components/AccountSettingsRoutes.tsx');
 const p={mode:'reduce',baseline:12,packSize:20,packPrice:0,speed:'gentle',startAt:'2026-11-01T12:00:00Z'};
 for(const signedIn of [false,true]){const events=[];const action=name=>()=>events.push(name);const model={p,data:{profile:p,entries:[],cravings:[],checkins:[]},tab:'backup',accountUser:signedIn?{uid:'qa',email:'qa@example.invalid'}:null,syncStatus:'Test',go:action('navigate'),goBack:()=>{events.push('back');return true},accountEmail:'',accountPassword:'',deletion:{enabled:false,request:action('delete')},retrySync:action('retry'),requestGuestReset:action('guest-reset'),requestGuestMigration:action('migrate'),previewCloud:action('preview'),requestCloudImport:action('import'),inspectCloudData:action('inspect')};
  capturedActions=[];themed('dark',React.createElement(AccountSettingsRoutes,{model}));assert.deepEqual(events,[]);
  const reset=capturedActions.find(a=>a.label==='Radera gästhistorik (med bekräftelse)');const importAction=capturedActions.find(a=>a.label==='Importera molnhistorik (med bekräftelse)');assert.equal(!!reset,!signedIn);assert.equal(!!importAction,signedIn);if(signedIn){importAction.onPress();assert.deepEqual(events,['import']);}else{reset.onPress();assert.deepEqual(events,['guest-reset']);}capturedActions=null;
 }
});

test('cloud data controls stay disabled while another account operation is active',()=>{
 const {AccountCloudActions}=load('src/components/AccountCloudActions.tsx');
 for(const state of [{busy:true},{migrationBusy:true},{cloudBusy:true}]){capturedActions=[];themed('light',React.createElement(AccountCloudActions,{busy:false,migrationBusy:false,cloudBusy:false,...state,result:null,onMigrate:()=>assert.fail(),onPreview:()=>assert.fail(),onImport:()=>assert.fail(),onInspect:()=>assert.fail()}));assert.equal(capturedActions.length,4);assert(capturedActions.every(action=>action.disabled));capturedActions=null;}
});

test('selected bottom tabs use a round indicator without a filled selection rectangle',()=>{
 for(const name of ['light','dark'])for(const tab of ['home','plan','register','stats','profile']){capturedViews=[];capturedActions=[];themed(name,React.createElement(BottomNavigation,{tab,onNavigate:()=>{}}));const selected=capturedActions.filter(action=>action.state?.selected);assert.equal(selected.length,1);const dots=capturedViews.filter(v=>v.id.startsWith('bottom-nav-indicator-'));assert.equal(dots.filter(v=>v.style.backgroundColor===palettes[name].accent).length,1);assert(dots.every(v=>v.style.borderRadius>=v.style.width/2&&v.style.width===v.style.height));for(const icon of capturedViews.filter(v=>v.id.startsWith('bottom-nav-icon-'))){assert(icon.style.borderRadius>=Math.min(icon.style.width,icon.style.height)/2);if(!icon.id.endsWith('register'))assert.equal(icon.style.backgroundColor,undefined);}capturedViews=null;capturedActions=null;}
});

test('compact reference header buttons retain working destinations and back behavior',()=>{
 const {ScreenHeader}=load('src/components/ScreenHeader.tsx');
 for(const [tab,label,destination] of [['home','Öppna appinställningar','settings'],['profile','Öppna appinställningar','settings'],['plan','Öppna min profil','profile']]){
  const calls=[];capturedActions=[];themed('dark',React.createElement(ScreenHeader,{tab,clock:Date.parse('2026-11-16T12:00:00Z'),onNavigate:value=>calls.push(value)}));assert.deepEqual(calls,[]);const action=capturedActions.find(a=>a.label===label);assert(action);action.onPress();assert.deepEqual(calls,[destination]);
 }
 let back=0;capturedActions=[];themed('light',React.createElement(ScreenHeader,{tab:'settings',clock:0,onNavigate:()=>assert.fail('Back should use the existing history'),onBack:()=>back++}));capturedActions.find(a=>a.label==='Tillbaka').onPress();assert.equal(back,1);capturedActions=null;
});


test('reference statistics tabs reveal the existing data sections without modifying history',()=>{
 const {StatsScreen}=load('src/screens/StatsScreen.tsx');
 const data={profile:{mode:'reduce',baseline:12,packSize:20,packPrice:85,speed:'gentle',startAt:'2026-11-01T12:00:00Z'},entries:[],cravings:[],checkins:[]},before=JSON.stringify(data);
 const props={data,clock:Date.parse('2026-11-15T12:00:00Z'),period:7,weekly:[0,0,0,0,0,0,0],todayCount:0,recentCravingsCount:0,cravingTriggers:[],cigaretteTriggers:[],onPeriodChange:()=>assert.fail('Rendering or switching sections must not change the period')};
 const draw=()=>{controlledIndex=0;capturedActions=[];return themed('dark',React.createElement(StatsScreen,props));};
 try{
  controlledStates=[];let html=draw();assert(html.includes('Cigaretter per dag'));assert(!html.includes('Så räknas din besparing'));assert(!html.includes('Diagrammet visar alltid'));
  capturedActions.find(a=>a.label==='Om diagrammet').onPress();html=draw();assert(html.includes('Diagrammet visar alltid'));capturedActions.find(a=>a.label==='Om diagrammet').onPress();html=draw();assert(!html.includes('Diagrammet visar alltid'));
  for(const [label,expected] of [['Hälsa','Din hälsa, i din takt'],['Ekonomi','Så räknas din besparing'],['Historik','Strategier som hjälpt dig'],['Översikt','Cigaretter per dag']]){const action=capturedActions.find(a=>a.label===label);assert(action,label);action.onPress();html=draw();assert(html.includes(expected),label);assert.equal(capturedActions.filter(a=>a.state?.selected&&['Översikt','Hälsa','Ekonomi','Historik'].includes(a.label)).length,1);}
  assert.equal(JSON.stringify(data),before);
 }finally{controlledStates=null;capturedActions=null;}
});
