const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function setup(variant='preview'){
 const actions=[],events=[];let asked=null;
 const React={createElement:(type,props,...children)=>({type,props:{...props,children}}),Fragment:'fragment',useSyncExternalStore:(subscribe,snapshot)=>snapshot()};
 const service={info:{version:'6.0.0',build:10,runtime:'fingerprint'},getSnapshot:()=>({status:'ready',otaAvailable:true,nativeRelease:{version:'6.0.1',build:11,publishedAt:'2026-11-16T00:00:00.000Z',releaseNotes:'Nya förbättringar'},lastCheck:100000,message:'Test'}),subscribe:()=>()=>{},check:manual=>events.push(['check',manual]),download:()=>events.push(['download']),openNative:()=>events.push(['native'])};
 const deps={'react':React,'react-native':{Text:'text',View:'view'},'expo-constants':{expoConfig:{extra:{appVariant:variant}}},'../updates/previewUpdateClient':{getPreviewUpdateService:()=>{events.push(['client']);return service;}},'../theme':{useThemeColors:()=>({})},'./ui':{AppCard:({children})=>({type:'card',props:{children}}),AppButton:props=>{actions.push(props);return null;}},'./ConfirmationDialog':{ConfirmationDialog:()=>null},'../hooks/useConfirmationDialog':{useConfirmationDialog:()=>({dialog:null,setDialog(){},ask:(title,message,confirm,label)=>asked={title,message,confirm,label}})}};
 const context={exports:{},require:id=>{assert(id in deps,id);return deps[id]}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/components/PreviewUpdateSettings.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,context);
 function walk(node){if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(walk);return;}if(typeof node.type==='function')walk(node.type(node.props));else walk(node.props?.children);}
 const root=context.exports.PreviewUpdateSettings();walk(root);return {actions,events,get asked(){return asked},root};
}
test('OTA download and native link both require our confirmation before acting',()=>{
 for(const [title,event] of [['Hämta appuppdatering','download'],['Ladda ner uppdatering','native']]){const s=setup();assert.deepEqual(s.events,[['client']]);s.actions.find(a=>a.title===title).onPress();assert.deepEqual(s.events,[['client']]);assert(s.asked);s.asked.confirm();assert.deepEqual(s.events.at(-1),[event]);}
});
test('manual update check is explicit and production never constructs the update client',()=>{
 const preview=setup();preview.actions.find(a=>a.title==='Sök efter uppdateringar').onPress();assert.deepEqual(preview.events.at(-1),['check',true]);const prod=setup('production');assert.equal(prod.root,null);assert.deepEqual(prod.events,[]);
});
