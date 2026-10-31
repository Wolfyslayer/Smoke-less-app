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
  const mod = loadModule('src/localSessionStorage.ts', {'./domain':{validateData:valid}, './storage':storage, './accountStorage':accounts});
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
