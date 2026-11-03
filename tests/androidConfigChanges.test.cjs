const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../plugins/withAndroidConfigChanges.js'), 'utf8');
const pluginModule = { exports: {} };
vm.runInNewContext(source, {
  module: pluginModule,
  require(name) {
    assert.equal(name, 'expo/config-plugins');
    return { withAndroidManifest: (_config, callback) => callback };
  },
});
const apply = pluginModule.exports({});

function createManifest(changes, activityName = '.MainActivity') {
  return {
    modResults: {
      manifest: {
        application: [{ activity: [{ $: { 'android:name': activityName, 'android:configChanges': changes } }] }],
      },
    },
  };
}

test('preserves existing configChanges and adds fontScale and density', () => {
  const config = createManifest('keyboard|screenSize|uiMode');
  apply(config);
  assert.equal(config.modResults.manifest.application[0].activity[0].$['android:configChanges'],
    'keyboard|screenSize|uiMode|fontScale|density');
});

test('does not duplicate flags when applied repeatedly', () => {
  const config = createManifest('keyboard|fontScale|density');
  apply(config);
  apply(config);
  assert.equal(config.modResults.manifest.application[0].activity[0].$['android:configChanges'],
    'keyboard|fontScale|density');
});

test('fails when MainActivity is absent', () => {
  assert.throws(() => apply(createManifest('keyboard', '.OtherActivity')), /MainActivity/);
});
