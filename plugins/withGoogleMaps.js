const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withGoogleMaps(config) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application?.[0];

    if (!mainApplication) {
      throw new Error('Android application element not found');
    }

    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    const metaData = mainApplication['meta-data'];

    const existing = metaData.find(
      (item) =>
        item.$?.['android:name'] ===
        'com.google.android.geo.API_KEY'
    );

    const apiKey = process.env.EXPO_PUBLIC_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error(
        'EXPO_PUBLIC_MAPS_API_KEY is not defined'
      );
    }

    if (existing) {
      existing.$['android:value'] = apiKey;
    } else {
      metaData.push({
        $: {
          'android:name': 'com.google.android.geo.API_KEY',
          'android:value': apiKey,
        },
      });
    }

    return config;
  });
};