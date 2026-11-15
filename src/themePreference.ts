import type {ThemeMode} from './themeTokens';
export const THEME_PREFERENCE_KEY='smokeless:appearance:v1';
type Storage={getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>};
export function isThemeMode(value:unknown):value is ThemeMode{return value==='light'||value==='dark'||value==='system';}
export function createThemePreference(storage:Storage){
 let state={mode:'system' as ThemeMode,ready:false,saving:false,error:''};
 let version=0,loadPromise:Promise<void>|null=null,queue:Promise<void>=Promise.resolve(),committed:ThemeMode='system';
 const listeners=new Set<()=>void>();
 const update=(next:Partial<typeof state>)=>{state={...state,...next};listeners.forEach(fn=>fn());};
 return {
  getSnapshot:()=>state,
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
  load(){
   if(loadPromise)return loadPromise;
   const initialVersion=version;
   loadPromise=(async()=>{try{const raw=await storage.getItem(THEME_PREFERENCE_KEY);if(raw!==null&&!isThemeMode(raw))throw Error('Invalid theme');if(version===initialVersion){committed=raw===null?'system':raw as ThemeMode;update({mode:committed,error:''});}}catch{if(version===initialVersion)update({error:'Kunde inte läsa utseendet. Välj tema för att spara ett nytt val.'});}finally{update({ready:true});}})();
   return loadPromise;
  },
  setMode(mode:ThemeMode){
   if(!isThemeMode(mode))return Promise.reject(Error('Invalid theme'));
   const own=++version;
   update({mode,saving:true,error:''});
   const write=queue.catch(()=>{}).then(()=>storage.setItem(THEME_PREFERENCE_KEY,mode));
   queue=write;
   return write.then(()=>{committed=mode;if(version===own)update({saving:false,error:''});},()=>{if(version===own)update({mode:committed,saving:false,error:'Kunde inte spara utseendet. Försök igen.'});});
  },
 };
}
