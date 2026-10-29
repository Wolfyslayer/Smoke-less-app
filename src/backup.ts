import AsyncStorage from '@react-native-async-storage/async-storage';
import {Profile} from './model';
import {IntervalPlan} from './interval';
import {loadProfile,saveProfile} from './storage';
import {loadIntervalPlan,saveIntervalPlan} from './intervalStorage';
export type Backup={format:'smoke-less-backup';version:1;exportedAt:string;profile:Profile;interval:IntervalPlan};
export async function exportBackup():Promise<string>{
 const backup:Backup={format:'smoke-less-backup',version:1,exportedAt:new Date().toISOString(),profile:await loadProfile(),interval:await loadIntervalPlan()};
 return JSON.stringify(backup,null,2);
}
export function validateBackup(value:unknown):Backup{
 if(!value||typeof value!=='object')throw new Error('Ogiltig säkerhetskopia');
 const x=value as Partial<Backup>;
 if(x.format!=='smoke-less-backup'||x.version!==1||!x.profile||!x.interval)throw new Error('Formatet stöds inte');
 const p=x.profile as Profile, i=x.interval as IntervalPlan;
 if(!Array.isArray(p.cravings)||!Number.isFinite(p.cigarettesPerDay)||!Number.isFinite(p.packPrice)||!Number.isFinite(p.cigarettesPerPack)||!Array.isArray(i.history??[])||!Number.isFinite(i.minutes))throw new Error('Säkerhetskopian innehåller ogiltig data');
 if((i.history??[]).some(e=>!e||typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at))||!Number.isFinite(e.elapsedMinutes)))throw new Error('Ogiltig cigaretthistorik');
 return x as Backup;
}
export async function importBackup(json:string){
 const backup=validateBackup(JSON.parse(json));
 // Validate before modifying any stored data.
 await saveProfile(backup.profile);
 await saveIntervalPlan(backup.interval);
 await AsyncStorage.setItem('smokeless-onboarded-v1','yes');
 return backup;
}
