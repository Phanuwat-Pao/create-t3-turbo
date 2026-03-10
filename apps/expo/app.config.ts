import type { ConfigContext, ExpoConfig } from "expo/config";

function defineConfig({ config }: ConfigContext): ExpoConfig {
  return {
    ...config,
    android: {
      adaptiveIcon: {
        backgroundColor: "#1F104A",
        foregroundImage: "./assets/icon-light.png",
      },
      package: "your.bundle.identifier",
    },
    assetBundlePatterns: ["**/*"],
    // extra: {
    //   eas: {
    //     projectId: "your-eas-project-id",
    //   },
    // },
    experiments: {
      reactCompiler: true,
      tsconfigPaths: true,
      typedRoutes: true,
    },
    icon: "./assets/icon-light.png",
    ios: {
      bundleIdentifier: "your.bundle.identifier",
      icon: {
        dark: "./assets/icon-dark.png",
        light: "./assets/icon-light.png",
      },
      supportsTablet: true,
    },
    name: "expo",
    orientation: "portrait",

    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-web-browser",
      "expo-updates",
      ["expo-font"],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#E4E4E7",
          dark: {
            backgroundColor: "#18181B",
            image: "./assets/icon-dark.png",
          },
          image: "./assets/icon-light.png",
        },
      ],
      [
        "expo-sqlite",
        {
          enableFTS: true,
          useSQLCipher: true,
          // android: {
          //   // Override the shared configuration for Android
          //   enableFTS: false,
          //   useSQLCipher: false,
          // },
          // ios: {
          //   // You can also override the shared configurations for iOS
          //   customBuildFlags: [
          //     "-DSQLITE_ENABLE_DBSTAT_VTAB=1 -DSQLITE_ENABLE_SNAPSHOT=1",
          //   ],
          // },
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],
      [
        "expo-audio",
        {
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone.",
        },
      ],
      [
        "expo-localization",
        {
          supportedLocales: {
            android: ["th", "en"],
            ios: ["th", "en"],
          },
        },
      ],
      [
        "expo-notifications",
        {
          color: "#ffffff",
          defaultChannel: "default",
          enableBackgroundRemoteNotifications: false,
          // icon: "./local/assets/notification_icon.png",
          // sounds: [
          //   "./local/assets/notification_sound.wav",
          //   "./local/assets/notification_sound_other.wav",
          // ],
        },
      ],
      ["expo-asset"],
    ],
    scheme: "expo",
    slug: "expo",
    updates: {
      fallbackToCacheTimeout: 0,
    },
    userInterfaceStyle: "automatic",
    version: "0.1.0",
  };
}

export default defineConfig;
