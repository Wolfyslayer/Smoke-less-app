import type {Data, Profile, Cigarette, Craving, Checkin} from './domain';

/**
 * A non-destructive preview of combining local and remote Smoke Less data.
 * No Firebase calls or AsyncStorage writes happen here.
 * Conflicting IDs are reported, never silently overwritten.
 * Deletions require tombstones before automatic two-way sync can be enabled.
 */
export type SyncConflict = {collection: 'profile' | 'entries' | 'cravings' | 'checkins'; key: string};
export type MergePreview = {merged: Data; conflicts: SyncConflict[]; safeToApply: boolean};

const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function combine<T>(
  collection: 'entries' | 'cravings' | 'checkins',
  local: T[],
  remote: T[],
  keyOf: (item: T) => string,
  conflicts: SyncConflict[],
): T[] {
  const values = new Map<string, T>();
  for (const item of remote) values.set(keyOf(item), item);
  for (const item of local) {
    const key = keyOf(item);
    if (values.has(key) && !equal(values.get(key), item)) {
      conflicts.push({collection, key});
      continue; // Preserve remote in preview; caller MUST NOT apply on conflicts.
    }
    values.set(key, item);
  }
  return [...values.values()];
}

export function previewMerge(local: Data, remote: Data): MergePreview {
  const conflicts: SyncConflict[] = [];
  let profile: Profile | null = local.profile ?? remote.profile;
  if (local.profile && remote.profile && !equal(local.profile, remote.profile)) {
    conflicts.push({collection: 'profile', key: 'profile'});
    profile = remote.profile;
  }
  const entries = combine<Cigarette>('entries', local.entries, remote.entries, e => e.id, conflicts);
  const cravings = combine<Craving>('cravings', local.cravings, remote.cravings, e => e.id, conflicts);
  const checkins = combine<Checkin>('checkins', local.checkins, remote.checkins, e => e.date, conflicts);
  return {merged: {profile, entries, cravings, checkins}, conflicts, safeToApply: conflicts.length === 0};
}
