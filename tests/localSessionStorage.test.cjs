const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(file, dependencies) {
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
  }).outputText;
  const exports = {};
  vm.runInNewContext(js, {
    exports, require: (id) => {
      if (!(id in dependencies)) throw new Error('Unexpected dependency: ' + id);
      return dependencies[id];
    },
  }, {filename: file});
  return exports;
}
function setup() {
  const records = new Map();
  const events = [];
  const valid = value => Boolean(value && Array.isArray(value.entries));
  const storage = {
    load: async () => {events.push('guest-load'); return records.get('guest') || {profile:null, entries:[], cravings:[], checkins:[]};},
    save: async value => {events.push('guest-save'); records.set('guest', value);},
  };
  const accounts = {
    accountStorageKey: uid => {if (!/^[a-z0-9]+$/i.test(uid)) throw Error('Invalid UID'); return 'account:' + uid;},
    loadAccountData: async uid => {events.push('load:' + uid); if (uid === 'broken') throw Error('Invalid account record'); return records.get('account:' + uid) || {profile:null, entries:[], cravings:[], checkins:[]};},
    saveAccountData: async (uid,value) => {events.push('save:' + uid); records.set('account:' + uid,value);},
  };
  const asyncStorage = {
    async getItem(key) {return records.has(key) ? records.get(key) : null;},
    async setItem(key,value) {records.set(key,value);},
  };
  const migration = {
    async migrateGuestHistoryWithBackup() {throw Error('Migration not expected in session tests');},
  };
  const guestMerge = loadModule('src/guestMerge.ts', {});
  const mod = loadModule('src/localSessionStorage.ts', {
    './domain':{validateData:valid}, './storage':storage,
    './accountStorage':accounts,
    '@react-native-async-storage/async-storage':asyncStorage,
    './accountMigration':migration,
    './guestMerge':guestMerge,
  });
  return {controller:new mod.LocalSessionStorage(), records, events};
}
const empty = () => ({profile:null, entries:[], cravings:[], checkins:[]});
const withEntry = id => ({...empty(),entries:[{id,at:'2026-10-31T10:00:00Z'}]});

test('guest and two accounts never share records', async () => {
  const {controller:c} = setup();
  await c.switchTo({kind:'guest'});
  await c.save({kind:'guest'},withEntry('guest'));
  await c.switchTo({kind:'account',uid:'a'});
  assert.equal(c.getSnapshot().data.entries.length,0);
  await c.save({kind:'account',uid:'a'},withEntry('a'));
  await c.switchTo({kind:'account',uid:'b'});
  assert.equal(c.getSnapshot().data.entries.length,0);
  await assert.rejects(c.save({kind:'account',uid:'a'},withEntry('wrong')),/Kontot har ändrats/);
  await c.switchTo({kind:'account',uid:'a'});
  assert.equal(c.getSnapshot().data.entries[0].id,'a');
  await c.switchTo({kind:'guest'});
  assert.equal(c.getSnapshot().data.entries[0].id,'guest');
});
test('pending saves complete before switching and stale saves reject', async () => {
  const {controller:c,events} = setup();
  await c.switchTo({kind:'account',uid:'a'});
  const save = c.save({kind:'account',uid:'a'},withEntry('a'));
  const switchTask = c.switchTo({kind:'account',uid:'b'});
  await Promise.all([save,switchTask]);
  assert.ok(events.indexOf('save:a') < events.indexOf('load:b'));
  await assert.rejects(c.save({kind:'account',uid:'a'},withEntry('late')),/Kontot har ändrats/);
});
test('failed account load never exposes previous account snapshot', async () => {
  const {controller:c} = setup();
  await c.switchTo({kind:'account',uid:'a'});
  await c.save({kind:'account',uid:'a'},withEntry('a'));
  await assert.rejects(c.switchTo({kind:'account',uid:'broken'}),/Invalid account record/);
  assert.equal(c.getSnapshot(),null);
});
test('disposed controller refuses new operations', async () => {
  const {controller:c} = setup();
  c.dispose();
  await assert.rejects(c.switchTo({kind:'guest'}),/avslutad/);
});


test('guest plan edits persist locally without authentication or network and preserve history', async () => {
  const {controller:c,records} = setup();
  await c.switchTo({kind:'guest'});
  const original = {...withEntry('guest-old'),profile:{mode:'reduce',baseline:12,packSize:20,packPrice:85,speed:'balanced',startAt:'2026-10-01T12:00:00.000Z',dailyTargetOverride:null}};
  original.cravings=[{id:'urge',at:'2026-10-02T12:00:00.000Z',intensity:3,trigger:'stress'}];
  original.checkins=[{date:'2026-10-03',complete:true,smokeFree:false}];
  await c.save({kind:'guest'},original);
  const changed={...original,profile:{...original.profile,plannedQuitAt:'2026-12-01T12:00:00.000Z',planStartTarget:10,originalStartAt:original.profile.startAt}};
  await c.save({kind:'guest'},changed);
  await c.switchTo({kind:'account',uid:'alice'});
  assert.equal(c.getSnapshot().data.profile,null);
  assert.equal(c.getSnapshot().data.entries.length,0);
  await c.switchTo({kind:'guest'});
  const restored=c.getSnapshot().data;
  assert.equal(restored.profile.plannedQuitAt,'2026-12-01T12:00:00.000Z');
  assert.equal(restored.profile.originalStartAt,original.profile.startAt);
  assert.deepEqual(restored.entries,original.entries);
  assert.deepEqual(restored.cravings,original.cravings);
  assert.deepEqual(restored.checkins,original.checkins);
  assert.equal(records.get('account:alice'),undefined);
});

test('account plan changes do not overwrite offline guest plan after switching back', async () => {
  const {controller:c}=setup();
  const guest={...empty(),profile:{mode:'reduce',baseline:8,packSize:20,packPrice:80,speed:'gentle',startAt:'2026-10-01T12:00:00.000Z',dailyTargetOverride:null,plannedQuitAt:'2026-12-01T12:00:00.000Z'}};
  await c.switchTo({kind:'guest'});
  await c.save({kind:'guest'},guest);
  await c.switchTo({kind:'account',uid:'alice'});
  await c.save({kind:'account',uid:'alice'},{...empty(),profile:{...guest.profile,plannedQuitAt:'2027-01-01T12:00:00.000Z'}});
  await assert.rejects(c.save({kind:'guest'},guest),/Kontot har ändrats/);
  await c.switchTo({kind:'guest'});
  assert.equal(c.getSnapshot().data.profile.plannedQuitAt,'2026-12-01T12:00:00.000Z');
  await c.switchTo({kind:'account',uid:'alice'});
  assert.equal(c.getSnapshot().data.profile.plannedQuitAt,'2027-01-01T12:00:00.000Z');
});


test('logout to guest retains each account plan and blocks stale writes',async()=>{
 const {controller:c,records}=setup();
 const a={...withEntry('a-entry'),profile:{mode:'reduce',baseline:12,packSize:20,packPrice:80,speed:'balanced',startAt:'2026-10-01T12:00:00.000Z',dailyTargetOverride:null,plannedQuitAt:'2026-12-01T12:00:00.000Z'}};
 const b={...withEntry('b-entry'),profile:{...a.profile,plannedQuitAt:'2027-01-01T12:00:00.000Z'}};
 await c.switchTo({kind:'account',uid:'a'});
 await c.save({kind:'account',uid:'a'},a);
 await c.switchTo({kind:'guest'});
 assert.equal(c.getSnapshot().data.profile,null);
 await assert.rejects(c.save({kind:'account',uid:'a'},b),/Kontot har ändrats/);
 await c.switchTo({kind:'account',uid:'b'});
 assert.equal(c.getSnapshot().data.profile,null);
 await c.save({kind:'account',uid:'b'},b);
 await c.switchTo({kind:'account',uid:'a'});
 assert.equal(c.getSnapshot().data.profile.plannedQuitAt,a.profile.plannedQuitAt);
 assert.equal(c.getSnapshot().data.entries[0].id,'a-entry');
 assert.equal(records.get('account:b').profile.plannedQuitAt,b.profile.plannedQuitAt);
 await c.switchTo({kind:'guest'});
 assert.equal(c.getSnapshot().data.entries.length,0);
});

test('queued plan save cannot leak into a new account after switch',async()=>{
 const {controller:c,events,records}=setup();
 await c.switchTo({kind:'account',uid:'a'});
 const plan={...empty(),profile:{mode:'reduce',baseline:10,packSize:20,packPrice:80,speed:'gentle',startAt:'2026-10-01T12:00:00.000Z',dailyTargetOverride:null,plannedQuitAt:'2026-12-01T12:00:00.000Z'}};
 const pending=c.save({kind:'account',uid:'a'},plan);
 const switching=c.switchTo({kind:'account',uid:'b'});
 await Promise.all([pending,switching]);
 assert.ok(events.indexOf('save:a')<events.indexOf('load:b'));
 assert.equal(c.getSnapshot().data.profile,null);
 assert.equal(records.get('account:a').profile.plannedQuitAt,plan.profile.plannedQuitAt);
 await assert.rejects(c.save({kind:'account',uid:'a'},plan),/Kontot har ändrats/);
 assert.equal(records.get('account:b'),undefined);
});

test('failed account switch hides previous plan and refuses saves until recovery',async()=>{
 const {controller:c,records}=setup();
 await c.switchTo({kind:'account',uid:'a'});
 await c.save({kind:'account',uid:'a'},withEntry('private'));
 await assert.rejects(c.switchTo({kind:'account',uid:'broken'}),/Invalid account record/);
 assert.equal(c.getSnapshot(),null);
 await assert.rejects(c.save({kind:'account',uid:'a'},withEntry('stale')),/Kontot har ändrats/);
 await c.switchTo({kind:'guest'});
 assert.equal(c.getSnapshot().data.entries.length,0);
 assert.equal(records.get('account:a').entries[0].id,'private');
});


test('signing in after repeating guest onboarding never writes guest plan or history into existing account',async()=>{
 const {controller:c,records,events}=setup();
 const savedAccount={...withEntry('account-original'),profile:{mode:'quit',baseline:6,startAt:'2026-09-01T10:00:00Z'}};
 records.set('account:alice',savedAccount);
 await c.switchTo({kind:'guest'});
 const repeatedOnboarding={...withEntry('new-onboarding'),profile:{mode:'reduce',baseline:24,startAt:'2026-11-03T10:00:00Z'}};
 await c.save({kind:'guest'},repeatedOnboarding);
 const writesBefore=events.filter(x=>x==='save:alice').length;
 await c.switchTo({kind:'account',uid:'alice'});
 assert.equal(c.getSnapshot().data.profile.baseline,6);
 assert.equal(c.getSnapshot().data.entries[0].id,'account-original');
 assert.equal(events.filter(x=>x==='save:alice').length,writesBefore);
 assert.equal(records.get('account:alice'),savedAccount);
 await assert.rejects(c.save({kind:'guest'},repeatedOnboarding),/Kontot har ändrats/);
 await c.switchTo({kind:'guest'});
 assert.equal(c.getSnapshot().data.profile.baseline,24);
 assert.equal(c.getSnapshot().data.entries[0].id,'new-onboarding');
});
