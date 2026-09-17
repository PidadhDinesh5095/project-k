export default {
  expo: {
    name: 'Dinesh--farms',
    slug: 'Dinesh--farms',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',

    

    ios: {
      supportsTablet: true,
    },

    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },

    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      'expo-splash-screen',
      'expo-status-bar',
      './plugins/withGoogleMaps',
    ],

    experiments: {
      typedRoutes: true,
    },

    android: {
      package: 'com.anonymous.Dineshfarms',

      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_MAPS_API_KEY,
        },
      },
    },
  },
};