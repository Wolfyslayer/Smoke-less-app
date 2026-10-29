import AsyncStorage from '@react-native-async-storage/async-storage';
import {Profile} from './model';
import {IntervalPlan} from './interval';
import {loadProfile,saveProfile} from './storage';
import {loadIntervalPlan,saveIntervalPlan} from './intervalStorage';
import {DailyCheckin,loadCheckins,replaceCheckins} from './dailyCheckins';
type LegacyBackup={format:'smoke-less-backup';version:1;exportedAt:string;profile:Profile;interval:IntervalPlan};
export type Backup={format:'smoke-less-backup';version:2;exportedAt:string;profile:Profile;interval:IntervalPlan;checkins:DailyCheckin[]};
export async function exportBackup():Promise<string>{
 const [profile,interval,checkins]=await Promise.all([loadProfile(),loadIntervalPlan(),loadCheckins()]);
 const backup:Backup={format:'smoke-less-backup',version:2,exportedAt:new Date().toISOString(),profile,interval,checkins};
 return JSON.stringify(backup,null,2);
}
export function validateBackup(value:unknown):Backup|LegacyBackup{
 if(!value||typeof value!=='object')throw new Error('Ogiltig säkerhetskopia');
 const x=value as Partial<Omit<Backup,'version'>> & {version?:number};
 if(x.format!=='smoke-less-backup'||(x.version!==1&&x.version!==2)||!x.profile||!x.interval)throw new Error('Formatet stöds inte');
 const p=x.profile as Profile,i=x.interval as IntervalPlan;
 if(!Array.isArray(p.cravings)||!Number.isFinite(p.cigarettesPerDay)||!Number.isFinite(p.packPrice)||!Number.isFinite(p.cigarettesPerPack)||!Array.isArray(i.history??[])||!Number.isFinite(i.minutes))throw new Error('Säkerhetskopian innehåller ogiltig data');
 if((i.history??[]).some(e=>!e||typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at))||!Number.isFinite(e.elapsedMinutes)))throw new Error('Ogiltig cigaretthistorik');
 if(x.version===2&&(!Array.isArray(x.checkins)||x.checkins.some(c=>!c||!/^\\d{4}-\\d{2}-\\d{2}$/.test(c.date)||typeof c.complete!=='boolean'||typeof c.smokeFree!=='boolean'||(c.note!==undefined&&typeof c.note!=='string'))))throw new Error('Ogiltiga dagliga avstämningar');
 return x as Backup|LegacyBackup;
}
export async function importBackup(json:string){
 const backup=validateBackup(JSON.parse(json));
 await saveProfile(backup.profile);
 await saveIntervalPlan(backup.interval);
 if(backup.version===2)await replaceCheckins(backup.checkins);
 await AsyncStorage.setItem('smokeless-onboarded-v1','yes');
 return backup;
}
