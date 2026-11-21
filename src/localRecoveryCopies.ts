type RecoveryStorage={getAllKeys:()=>Promise<readonly string[]>;multiRemove:(keys:string[])=>Promise<unknown>};
// Old versions wrote copies without an owner. Never infer an account from content.
const isLegacyCopy=(key:string)=>/^smoke-less-pre-cloud-import-\d+-[a-z0-9]*$/.test(key);
export async function listLegacyRecoveryCopies(storage:RecoveryStorage){
 return (await storage.getAllKeys()).filter(isLegacyCopy);
}
export async function removeLegacyRecoveryCopies(storage:RecoveryStorage,confirmed:boolean){
 if(!confirmed)throw new Error('Radering kräver ditt uttryckliga godkännande.');
 const keys=await listLegacyRecoveryCopies(storage);
 if(keys.length)await storage.multiRemove(keys);
 // Do not report success after a partial removal or a newly created legacy copy.
 if((await listLegacyRecoveryCopies(storage)).length)throw new Error('Alla äldre kopior kunde inte tas bort. Försök igen.');
 return keys.length;
}
