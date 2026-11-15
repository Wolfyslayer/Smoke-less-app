import identity from '../../config/projectIdentity.json';
export const PREVIEW_MANIFEST_URL='https://raw.githubusercontent.com/Wolfyslayer/Smoke-less-app/preview-release/releases/preview.json';
export type InstalledPreview={applicationId:string;version:string;build:number;runtime:string;channel:string;projectId:string};
export type NativePreviewRelease={schemaVersion:1;platform:'android';channel:'preview';applicationId:string;projectId:string;build:number;version:string;runtime:string;apkUrl:string;expiresAt?:string};
export function trustedApkUrl(value:unknown):value is string{
 if(typeof value!=='string'||value.length>500)return false;
 try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='expo.dev'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/artifacts\/eas\/[A-Za-z0-9_-]+\.apk$/.test(u.pathname);}catch{return false;}
}
export function validInstalledPreview(info:InstalledPreview){return info.applicationId===identity.preview.package&&info.projectId===identity.preview.projectId&&info.channel==='preview'&&Number.isSafeInteger(info.build)&&info.build>0&&typeof info.runtime==='string'&&info.runtime.length>0;}
export function parseNativePreviewRelease(raw:unknown,info:InstalledPreview,now=Date.now()):NativePreviewRelease|null{
 if(!validInstalledPreview(info)||!raw||typeof raw!=='object')return null;
 const r=raw as Record<string,unknown>;
 if(r.expiresAt!==undefined&&(typeof r.expiresAt!=='string'||!Number.isFinite(Date.parse(r.expiresAt))||Date.parse(r.expiresAt)<=now))return null;
 if(r.schemaVersion!==1||r.platform!=='android'||r.channel!=='preview'||r.applicationId!==info.applicationId||r.projectId!==info.projectId||!Number.isSafeInteger(r.build)||Number(r.build)<=info.build||typeof r.version!=='string'||!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(r.version)||typeof r.runtime!=='string'||r.runtime.length<1||r.runtime.length>200||!trustedApkUrl(r.apkUrl))return null;
 return {schemaVersion:1,platform:'android',channel:'preview',applicationId:r.applicationId as string,projectId:r.projectId as string,build:Number(r.build),version:r.version,runtime:r.runtime,apkUrl:r.apkUrl,...(typeof r.expiresAt==='string'?{expiresAt:r.expiresAt}:{})};
}
