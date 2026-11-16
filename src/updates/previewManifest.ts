import identity from '../../config/projectIdentity.json';
export const PREVIEW_MANIFEST_URL='https://raw.githubusercontent.com/Wolfyslayer/Smoke-less-app/preview-release/releases/preview.json';
export type InstalledPreview={applicationId:string;version:string;build:number;runtime:string;channel:string;projectId:string};
export type NativePreviewRelease={schemaVersion:2;platform:'android';channel:'preview';applicationId:string;projectId:string;build:number;version:string;runtime:string;apkUrl:string;sha256:string;certificateSha256:string;publishedAt:string;releaseNotes:string};
export function trustedApkUrl(value:unknown):value is string{
 if(typeof value!=='string'||value.length>500)return false;
 try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='github.com'&&!u.port&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/Wolfyslayer\/Smoke-less-app\/releases\/download\/preview-build-[1-9]\d*\/SmokeLess-Preview-[1-9]\d*\.apk$/.test(u.pathname);}catch{return false;}
}
export function validInstalledPreview(info:InstalledPreview){return info.applicationId===identity.preview.package&&info.projectId===identity.preview.projectId&&info.channel==='preview'&&Number.isSafeInteger(info.build)&&info.build>0&&typeof info.runtime==='string'&&info.runtime.length>0;}
export function parseNativePreviewRelease(raw:unknown,info:InstalledPreview,now=Date.now()):NativePreviewRelease|null{
 if(!validInstalledPreview(info)||!raw||typeof raw!=='object')return null;
 const r=raw as Record<string,unknown>;
 if(r.schemaVersion!==2||r.platform!=='android'||r.channel!=='preview'||r.applicationId!==info.applicationId||r.projectId!==info.projectId||!Number.isSafeInteger(r.build)||Number(r.build)<=info.build||typeof r.version!=='string'||!/^\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?$/.test(r.version)||typeof r.runtime!=='string'||r.runtime.length<1||r.runtime.length>200||!trustedApkUrl(r.apkUrl))return null;
 if(r.apkUrl!==`https://github.com/Wolfyslayer/Smoke-less-app/releases/download/preview-build-${r.build}/SmokeLess-Preview-${r.build}.apk`||typeof r.sha256!=='string'||! /^[a-f0-9]{64}$/.test(r.sha256)||typeof r.certificateSha256!=='string'||! /^[a-f0-9]{64}$/.test(r.certificateSha256)||typeof r.publishedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(r.publishedAt)||!Number.isFinite(Date.parse(r.publishedAt))||Date.parse(r.publishedAt)>now+300000||typeof r.releaseNotes!=='string'||r.releaseNotes.trim().length<1||r.releaseNotes.length>4000||/[\u0000-\u0008\u000b-\u001f\u007f]/.test(r.releaseNotes))return null;
 return {schemaVersion:2,platform:'android',channel:'preview',applicationId:r.applicationId as string,projectId:r.projectId as string,build:Number(r.build),version:r.version,runtime:r.runtime,apkUrl:r.apkUrl,sha256:r.sha256,certificateSha256:r.certificateSha256,publishedAt:r.publishedAt,releaseNotes:r.releaseNotes};
}
