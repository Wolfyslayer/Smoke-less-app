import AsyncStorage from '@react-native-async-storage/async-storage';
import {Data, EMPTY, validateData} from './domain';

/**
 * Independent storage namespace for each authenticated account.
 * Legacy key smoke-less-v6 remains untouched until a separate, explicit migration.
 * Never fall back to another account's history on a missing or invalid record.
 */
const PREFIX = 'smoke-less-v6-account:';
export function accountStorageKey(uid: string): string {
  if (typeof uid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(uid)) {
    throw new Error('Ogiltigt konto-ID');
  }
  return PREFIX + uid;
}

export async function loadAccountData(uid: string): Promise<Data> {
  const raw = await AsyncStorage.getItem(accountStorageKey(uid));
  if (raw === null) return {...EMPTY, entries: [], cravings: [], checkins: []};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Kontots lokala historik kan inte läsas. Ingen data har ändrats.');
  }
  if (!validateData(parsed)) {
    throw new Error('Kontots lokala historik har ogiltigt format. Ingen data har ändrats.');
  }
  return parsed;
}

export async function saveAccountData(uid: string, value: Data): Promise<void> {
  if (!validateData(value)) throw new Error('Kan inte spara ogiltig historik');
  await AsyncStorage.setItem(accountStorageKey(uid), JSON.stringify(value));
}

/**
 * Explicit guest-to-account copy, not a move. Never overwrite an existing
 * account record, even when it is empty or corrupt. Caller must first obtain
 * clear user consent and handle the returned outcome in the UI.
 */
export async function copyGuestDataToAccount(uid: string, guest: Data): Promise<'copied' | 'already-exists'> {
  const key = accountStorageKey(uid);
  if (!validateData(guest)) throw new Error('Ogiltig gästhistorik');
  if (await AsyncStorage.getItem(key) !== null) return 'already-exists';
  // AsyncStorage has no compare-and-swap; callers must serialize migrations per account.
  await AsyncStorage.setItem(key, JSON.stringify(guest));
  return 'copied';
}
