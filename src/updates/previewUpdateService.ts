import {parseNativePreviewRelease,trustedApkUrl,validInstalledPreview,type InstalledPreview,type NativePreviewRelease} from './previewManifest';
export const UPDATE_CHECK_KEY='smokeless:preview-update-check:v1';
export const UPDATE_CHECK_INTERVAL=6*60*60*1000;
type Dependencies={info:InstalledPreview;now:()=>number;storage:{getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>};checkOta:()=>Promise<{isAvailable:boolean;isRollBackToEmbedded?:boolean}>;fetchOta:()=>Promise<{isNew:boolean;isRollBackToEmbedded?:boolean}>;fetchManifest:()=>Promise<unknown>;openUrl:(url:string)=>Promise<unknown>};
export function createPreviewUpdateService(deps:Dependencies){
 let state={status:'idle' as 'idle'|'checking'|'ready'|'downloading'|'downloaded'|'error',otaAvailable:false,nativeRelease:null as NativePreviewRelease|null,lastCheck:null as number|null,message:''};
 let inFlight:Promise<void>|null=null;const listeners=new Set<()=>void>();
 const update=(next:Partial<typeof state>)=>{state={...state,...next};listeners.forEach(fn=>fn());};
 const check=(manual=false):Promise<void>=>{
  if(!validInstalledPreview(deps.info))return Promise.resolve();
  if(inFlight)return inFlight;
  if(state.status==='downloading'||state.status==='downloaded')return Promise.resolve();
  inFlight=(async()=>{
   if(!manual){try{const timestamp=Number(await deps.storage.getItem(UPDATE_CHECK_KEY));const age=deps.now()-timestamp;if(timestamp>0&&age>=0&&age<UPDATE_CHECK_INTERVAL){update({lastCheck:timestamp});return;}}catch{/* A failed preference read must not disable update checks. */}}
   update({status:'checking',message:''});
   const [ota,native]=await Promise.allSettled([deps.checkOta(),deps.fetchManifest()]);
   const at=deps.now();let otaAvailable=false,nativeRelease:NativePreviewRelease|null=null;
   if(ota.status==='fulfilled')otaAvailable=ota.value.isAvailable||ota.value.isRollBackToEmbedded===true;
   if(native.status==='fulfilled')nativeRelease=parseNativePreviewRelease(native.value,deps.info,at);
   const nativeFailed=native.status==='rejected'||(native.status==='fulfilled'&&native.value!=null&&!nativeRelease&&!(typeof native.value==='object'&&Number.isSafeInteger((native.value as {build?:number}).build)&&(native.value as {build:number}).build<=deps.info.build));
   const failed=ota.status==='rejected'&&nativeFailed;
   update({status:failed?'error':'ready',lastCheck:at,otaAvailable,nativeRelease,message:failed?'Kunde inte söka efter uppdateringar. Kontrollera anslutningen och försök igen.':otaAvailable?'En appuppdatering finns att hämta.':nativeRelease?'En ny Preview-version finns att installera.':ota.status==='rejected'||nativeFailed?'Kontrollen kunde bara slutföras delvis. Försök igen senare.':'Ingen ny uppdatering hittades.'});
   await deps.storage.setItem(UPDATE_CHECK_KEY,String(at)).catch(()=>{});
  })().finally(()=>{inFlight=null;});return inFlight;
 };
 const download=async()=>{
  if(!validInstalledPreview(deps.info)||!state.otaAvailable||state.status!=='ready')return;
  update({status:'downloading',message:'Hämtar uppdateringen…'});
  try{const result=await deps.fetchOta();const available=result.isNew||result.isRollBackToEmbedded===true;update({status:available?'downloaded':'ready',otaAvailable:false,message:available?'Uppdateringen är hämtad och används nästa gång appen startas.':'Ingen ny uppdatering behövde hämtas.'});}catch{update({status:'ready',message:'Kunde inte hämta uppdateringen. Försök igen.'});}
 };
 return {info:deps.info,getSnapshot:()=>state,subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},check,download,
  async openNative(){const release=state.nativeRelease;if(!release||!validInstalledPreview(deps.info)||!trustedApkUrl(release.apkUrl))return;if(!parseNativePreviewRelease(release,deps.info,deps.now())){update({nativeRelease:null,message:'Nedladdningslänken har gått ut. Sök efter uppdateringar igen.'});return;}try{await deps.openUrl(release.apkUrl);}catch{update({message:'Kunde inte öppna nedladdningen. Försök igen.'});}}
 };
}
export type PreviewUpdateService=ReturnType<typeof createPreviewUpdateService>;
