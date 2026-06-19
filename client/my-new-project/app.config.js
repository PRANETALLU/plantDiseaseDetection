import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.eas', override: true });

export default {
  expo: {
    name: 'PlantDetect',
    slug: 'plant-disease-detection',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.plantdisease.detector',
      infoPlist: {
        NSCameraUsageDescription: 'This app uses the camera to scan plant leaves for disease detection.',
        NSPhotoLibraryUsageDescription: 'This app accesses your photos to analyze plant images.',
      },
    },
    android: {
      package: 'com.plantdisease.detector',
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['CAMERA'],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: process.env.EXPO_PUBLIC_SUPABASE_KEY,
      API_BASE_URL:
        process.env.EXPO_PUBLIC_API_BASE_URL ??
        process.env.ML_BASE_API_URL ??
        'http://127.0.0.1:8000',
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  },
};
