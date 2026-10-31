import type {Data, Cigarette, Craving, Checkin, Profile} from './domain';

export const CLOUD_SCHEMA_VERSION = 1 as const;
export const CLOUD_COLLECTIONS = ['entries', 'cravings', 'checkins'] as const;
export type CloudCollection = typeof CLOUD_COLLECTIONS[number];

const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const iso = (v: unknown) => typeof v === 'string' && v.length <= 40 && Number.isFinite(Date.parse(v));
const id = (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 128 && !v.includes('/');
const shortText = (v: unknown) => typeof v === 'string' && v.length <= 200;
const keys = (v: Record<string, unknown>, allowed: readonly string[]) => Object.keys(v).every(k => allowed.includes(k));

export function isCloudProfile(v: unknown): v is Profile {
  if (!isObject(v) || !keys(v, ['mode','baseline','packSize','packPrice','speed','startAt','dailyTargetOverride'])) return false;
  return (v.mode === 'reduce' || v.mode === 'quit') &&
    (v.speed === 'gentle' || v.speed === 'balanced' || v.speed === 'fast') &&
    Number.isInteger(v.baseline) && (v.baseline as number) >= 0 && (v.baseline as number) <= 200 &&
    Number.isInteger(v.packSize) && (v.packSize as number) >= 1 && (v.packSize as number) <= 200 &&
    typeof v.packPrice === 'number' && Number.isFinite(v.packPrice) && v.packPrice >= 0 && v.packPrice <= 100000 &&
    iso(v.startAt) && (v.dailyTargetOverride === null || (Number.isInteger(v.dailyTargetOverride) && (v.dailyTargetOverride as number) >= 0 && (v.dailyTargetOverride as number) <= 200));
}
export function isCloudEntry(v: unknown): v is Cigarette {
  return isObject(v) && keys(v,['id','at','feeling','trigger']) && id(v.id) && iso(v.at) &&
    (v.feeling === undefined || shortText(v.feeling)) && (v.trigger === undefined || shortText(v.trigger));
}
export function isCloudCraving(v: unknown): v is Craving {
  return isObject(v) && keys(v,['id','at','intensity','trigger']) && id(v.id) && iso(v.at) &&
    Number.isInteger(v.intensity) && (v.intensity as number) >= 1 && (v.intensity as number) <= 5 && shortText(v.trigger);
}
export function isCloudCheckin(v: unknown): v is Checkin {
  return isObject(v) && keys(v,['date','complete','smokeFree']) && typeof v.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) && typeof v.complete === 'boolean' && typeof v.smokeFree === 'boolean';
}
export function isCloudData(v: unknown): v is Data {
  return isObject(v) && keys(v,['profile','entries','cravings','checkins']) &&
    (v.profile === null || isCloudProfile(v.profile)) &&
    Array.isArray(v.entries) && v.entries.length <= 100000 && v.entries.every(isCloudEntry) &&
    Array.isArray(v.cravings) && v.cravings.length <= 100000 && v.cravings.every(isCloudCraving) &&
    Array.isArray(v.checkins) && v.checkins.length <= 50000 && v.checkins.every(isCloudCheckin);
}
export function userDocumentPath(uid: string): string {
  if (!id(uid)) throw new Error('Invalid Firebase user ID');
  return 'users/' + uid;
}
export function recordDocumentPath(uid: string, collection: CloudCollection, recordId: string): string {
  if (!CLOUD_COLLECTIONS.includes(collection) || !id(recordId)) throw new Error('Invalid cloud record path');
  return userDocumentPath(uid) + '/' + collection + '/' + recordId;
}
