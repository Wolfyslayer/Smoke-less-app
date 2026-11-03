const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withAndroidConfigChanges(config) {
  return withAndroidManifest(config, (config) => {
    const activities = config.modResults.manifest.application?.[0]?.activity ?? [];
    const mainActivity = activities.find((activity) => activity.$?.['android:name'] === '.MainActivity');
    if (!mainActivity) throw new Error('MainActivity was not found in AndroidManifest.xml');

    const existing = mainActivity.$['android:configChanges'] ?? '';
    const changes = new Set(existing.split('|').filter(Boolean));
    changes.add('fontScale');
    changes.add('density');
    mainActivity.$['android:configChanges'] = [...changes].join('|');
    return config;
  });
};
