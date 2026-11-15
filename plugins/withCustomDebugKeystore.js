
const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withCustomDebugKeystore(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      throw new Error('Endast Groovy build.gradle stöds.');
    }

    const source = config.modResults.contents;
    const start = source.indexOf('signingConfigs {');
    const end = source.indexOf('buildTypes {', start);

    if (start === -1 || end === -1) {
      throw new Error('Kunde inte hitta signingConfigs.');
    }

    const section = source.slice(start, end);
    const debug = /debug\s*\{[^{}]*\}/;

    if (!debug.test(section)) {
      throw new Error('Kunde inte hitta debug-signering.');
    }

    const replacement = `debug {
        def keyPath = System.getenv("SMOKELESS_KEYSTORE_PATH")
        if (!keyPath) {
            throw new GradleException("SMOKELESS_KEYSTORE saknas")
        }
        storeFile file(keyPath)
        storePassword System.getenv("SMOKELESS_KEYSTORE_PASSWORD")
        keyAlias System.getenv("SMOKELESS_KEY_ALIAS")
        keyPassword System.getenv("SMOKELESS_KEY_PASSWORD")
    }`;

    config.modResults.contents =
      source.slice(0, start) +
      section.replace(debug, replacement) +
      source.slice(end);

    return config;
  });
};
