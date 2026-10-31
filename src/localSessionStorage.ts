import type {Data} from './domain';
import {validateData} from './domain';
import {load as loadGuest, save as saveGuest} from './storage';
import {loadAccountData, saveAccountData, accountStorageKey} from './accountStorage';

export type LocalSession = {kind: 'guest'} | {kind: 'account'; uid: string};
export type SessionSnapshot = {session: LocalSession; data: Data};

/**
 * Serialized local storage controller. This is a preparatory module, not yet
 * wired to the UI. All writes and switches pass through the same queue.
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

  getSnapshot(): SessionSnapshot | null {
    return this.current;
  }

  /** Blocks new operations; queued operations reject before touching storage. */
  dispose(): void {
    this.disposed = true;
    this.current = null;
  }
}
