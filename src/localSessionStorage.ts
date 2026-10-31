import type {Data} from './domain';
import {validateData} from './domain';
import {load as loadGuest, save as saveGuest} from './storage';
import {loadAccountData, saveAccountData, accountStorageKey} from './accountStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {migrateGuestHistoryWithBackup, type MigrationResult} from './accountMigration';

export type LocalSession = {kind: 'guest'} | {kind: 'account'; uid: string};
export type SessionSnapshot = {session: LocalSession; data: Data};

/**
 * Serialized local storage controller for guest and account sessions.
 * All writes, switches and explicit migrations pass through the same queue.
 */
export class LocalSessionStorage {
  private queue: Promise<unknown> = Promise.resolve();
  private current: SessionSnapshot | null = null;
  private disposed = false;

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const operation = this.queue.then(async () => {
      if (this.disposed) throw new Error('Lagringssessionen är avslutad.');
      return task();
    });
    this.queue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  async switchTo(session: LocalSession): Promise<SessionSnapshot> {
    return this.enqueue(async () => {
      if (session.kind === 'account') accountStorageKey(session.uid);
      // A switch waits for all preceding writes to finish. The next session
      // is only published after its own storage has loaded successfully.
      this.current = null;
      const data = session.kind === 'guest'
        ? await loadGuest()
        : await loadAccountData(session.uid);
      const next = {session, data};
      this.current = next;
      return next;
    });
  }

  async save(session: LocalSession, value: Data): Promise<void> {
    if (!validateData(value)) throw new Error('Ogiltig historik.');
    return this.enqueue(async () => {
      const active = this.current?.session;
      if (!active || active.kind !== session.kind ||
          (active.kind === 'account' && session.kind === 'account' && active.uid !== session.uid)) {
        throw new Error('Kontot har ändrats. Sparningen avbröts.');
      }
      if (session.kind === 'guest') await saveGuest(value);
      else await saveAccountData(session.uid, value);
      this.current = {session, data: value};
    });
  }

  /** Explicit, serialized guest copy. Never silently overwrites an account record. */
  async migrateGuestToActiveAccount(uid: string, verifyUid: () => string | null): Promise<MigrationResult> {
    return this.enqueue(async () => {
      if (this.current?.session.kind !== 'account' || this.current.session.uid !== uid || verifyUid() !== uid) {
        throw new Error('Kontot ändrades. Migreringen avbröts.');
      }
      // Unlike the legacy guest loader, do not treat malformed history as empty.
      const raw = await AsyncStorage.getItem('smoke-less-v6');
      if (raw === null) throw new Error('Det finns ingen gästhistorik att kopiera.');
      let guest: unknown;
      try { guest = JSON.parse(raw); } catch { throw new Error('Gästhistoriken kunde inte läsas. Ingen data har ändrats.'); }
      if (!validateData(guest)) throw new Error('Gästhistoriken är skadad. Ingen data har ändrats.');
      if (!guest.profile && guest.entries.length === 0 && guest.cravings.length === 0 && guest.checkins.length === 0) {
        throw new Error('Gästhistoriken är tom.');
      }
      if (verifyUid() !== uid) throw new Error('Kontot ändrades. Migreringen avbröts.');
      const result = await migrateGuestHistoryWithBackup(uid, guest, verifyUid, true);
      if (result.status === 'copied') {
        if (verifyUid() !== uid) throw new Error('Kontot ändrades efter kopieringen. Gästhistoriken finns kvar.');
        this.current = {session: {kind: 'account', uid}, data: guest};
      }
      return result;
    });
  }

  getSnapshot(): SessionSnapshot | null {
    return this.current;
  }

  /** Blocks new operations; queued operations reject before touching storage. */
  dispose(): void {
    this.disposed = true;
    this.current = null;
  }
}
