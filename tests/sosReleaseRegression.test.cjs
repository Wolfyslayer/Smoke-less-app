const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),React=require('react'),{renderToStaticMarkup:render}=require('react-dom/server');
function load(path,deps){const scope={exports:{},require:id=>{if(id==='./accountDeletionSafety')return load('src/accountDeletionSafety.ts');if(!(id in deps))throw Error(id);return deps[id];}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{fileName:path,compilerOptions:{jsx:ts.JsxEmit.React,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,scope);return scope.exports;}
test('SOS renders immediate breathing support before optional personal plan settings',()=>{
 const Screen=load('src/screens/SOSScreen.tsx',{'react':React,'react-native':{View:'div',Text:'p',Pressable:'button',Animated:{View:'div'},StyleSheet:{create:x=>x}},'lucide-react-native':{Wind:()=>null},'../theme':{C:{}}}).SOSScreen;
 const html=render(React.createElement(Screen,{journeyPanel:React.createElement('p',null,'PERSONAL SETTINGS'),breathScale:{interpolate:()=>1},breathing:false,breathSeconds:0,sosIdeas:[{title:'Water',detail:'Take a break'}],sosTip:0,trigger:'Stress',sosTimer:0,sosStartIntensity:null}));
 assert.ok(html.includes('Starta andningsövning'));assert.ok(html.includes('Min plan för röksug'));assert.ok(!html.includes('PERSONAL SETTINGS'));assert.ok(html.indexOf('Starta andningsövning')<html.indexOf('Min plan för röksug'));
});
test('changing situation clears stale helpful feedback without automatically saving a craving',()=>{
 let index=0,writes=0;const states=[0,null,3,'Stress',true];
 const flow=load('src/hooks/useSosFlow.ts',{'react':{useState:()=>{const key=index++;return [states[key],value=>states[key]=value];}},'./useBreathing':{useBreathing:()=>({breathScale:{}})},'./useSosTimer':{useSosTimer:()=>({})},'../data/sosIdeas':{sosIdeas:[{title:'Water'}]},'../utils/cravingActions':{addCravingEntry:()=>{throw Error('Unexpected write');}}}).useSosFlow;
 const {sosProps}=flow(()=>writes++,()=>{});sosProps.onTrigger('Efter mat');assert.equal(states[3],'Efter mat');assert.equal(states[4],null);assert.equal(writes,0);
});
test('new recovery copies remain scoped to guest or the exact account without changing earlier data',async()=>{
 const values=new Map([['legacy-copy','keep']]);
 const {backupBeforeCloudImport:backup}=load('src/storage.ts',{'@react-native-async-storage/async-storage':{__esModule:true,default:{getItem:async k=>values.get(k)??null,setItem:async(k,v)=>values.set(k,v)}},'./domain':{validateData:()=>true}});
 const data={profile:null,entries:[],cravings:[],checkins:[]};
 for(const uid of [null,'guest','user_a']){const key=await backup(data,uid);assert.ok(key.startsWith(uid===null?'smoke-less-pre-cloud-import:v2:guest:':`smoke-less-pre-cloud-import:v2:account:${uid}:`));assert.equal(values.get(key),JSON.stringify(data));}
 await assert.rejects(backup(data,'user/a'),/Ogiltigt/);assert.equal(values.get('legacy-copy'),'keep');assert.equal(values.size,4);
});
test('home and SOS do not repeat introductory cards above their primary content',()=>{
 const ui=fs.readFileSync('src/components/AppSessionView.tsx','utf8');assert.match(ui,/\(\['plan','register','stats','history','benefits'\] as Tab\[\]\)\.includes\(tab\)\?<SectionIntroCard/);
});
