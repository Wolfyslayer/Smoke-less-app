export type Craving = { id: string; date: string; intensity: number; trigger: string; resisted: boolean };
export type Profile = { mode?: 'quit'|'taper'; planStartAt?: string; reductionSpeed?: 'gentle'|'balanced'|'fast'; dailyTargetOverride?: number|null; quitAt: string; cigarettesPerDay: number; packPrice: number; cigarettesPerPack: number; cravings: Craving[]; reminderEnabled: boolean; language: 'sv' | 'en' };
export const initialProfile: Profile = { mode:'taper', reductionSpeed:'balanced', dailyTargetOverride:null, planStartAt:new Date().toISOString(), quitAt: new Date().toISOString(), cigarettesPerDay: 15, packPrice: 80, cigarettesPerPack: 20, cravings: [], reminderEnabled: false, language: 'sv' };
export function stats(profile: Profile, now = Date.now()) {
 const days = Math.max(0, (now - new Date(profile.quitAt).getTime()) / 86400000);
 const avoided = Math.floor(days * profile.cigarettesPerDay);
 const saved = days * profile.cigarettesPerDay * profile.packPrice / Math.max(1,profile.cigarettesPerPack);
 return { days, avoided, saved };
}
