import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Data} from './domain';
import {validateData} from './domain';
import {accountStorageKey} from './accountStorage';

const BACKUP_PREFIX = 'smoke-less-v6-migration-backup:';
export type MigrationResult =
  | {status: 'copied'; backupKey: string}
  | {status: 'already-exists'};

/**
 * Must be called only after the user explicitly approves a guest-to-account
 * copy. Does not delete or modify guest history. No Firebase writes.
 *
 * verifyUid must return the currently authenticated UID. It is checked before
 * and after every awaited operation, preventing ordinary sign-out races.
 * Callers must serialize migration and all account writes.
 */
export async function migrateGuestHistoryWithBackup(
  uid: string,
  guest: Data,
  verifyUid: () => string | null,
  confirmed: boolean,
): Promise<MigrationResult> {
  if (!confirmed) throw new Error('Migrering kräver användarens godkännande.');
  if (!validateData(guest)) throw new Error('Ogiltig gästhistorik.');
  const key = accountStorageKey(uid);
  const check = () => {
    if (verifyUid() !== uid) throw new Error('Kontot ändrades. Migreringen avbröts.');
  };
  check();
  if (await AsyncStorage.getItem(key) !== null) return {status: 'already-exists'};
  check();
  const backupKey = BACKUP_PREFIX + uid + ':' + Date.now() + ':' + Math.random().toString(36).slice(2);
  // Save a recovery snapshot BEFORE the destination account can change.
  await AsyncStorage.setItem(backupKey, JSON.stringify(guest));
  check();
  // Guard against an account record appearing while the backup was written.
  if (await AsyncStorage.getItem(key) !== null) return {status: 'already-exists'};
  check();
  await AsyncStorage.setItem(key, JSON.stringify(guest));
  // A sign-out immediately after the write must not remove the saved copy.
  check();
  return {status: 'copied', backupKey};
}
