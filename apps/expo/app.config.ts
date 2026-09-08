import type { ConfigContext, ExpoConfig } from "expo/config";

// EAS project (@telecorp/create-t3-turbo) that builds and OTA updates publish
// under. Forks override it with EAS_PROJECT_ID (also set in each EAS
// environment via `eas env:set`) after running `eas init` against their
// own account; set it to an empty string to disable updates entirely.
const easProjectId =
  process.env.EAS_PROJECT_ID ?? "353d8212-0cc4-4fe4-abc1-3f24c2ec36ac";

function defineConfig({ config }: ConfigContext): ExpoConfig {
  return {
    ...config,
    android: {
      adaptiveIcon: {
        backgroundColor: "#1F104A",
        foregroundImage: "./assets/icon-light.png",
      },
      package: "com.createt3turbo.app",
    },
    assetBundlePatterns: ["**/*"],
    experiments: {
      reactCompiler: true,
      tsconfigPaths: true,
      typedRoutes: true,
    },
    icon: "./assets/icon-light.png",
    ios: {
      bundleIdentifier: "com.createt3turbo.app",
      icon: {
        dark: "./assets/icon-dark.png",
        light: "./assets/icon-light.png",
      },
      supportsTablet: true,
    },
    name: "create-t3-turbo",
    orientation: "portrait",
    // The EAS account that owns the project. Pinned so `eas build` and
    // `eas update` publish here no matter which account the CLI is logged
    // in as; the CLI otherwise defaults to the personal account.
    owner: "telecorp",

    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-status-bar",
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
    // Deep-link scheme. Must stay in sync with the mobile origin trusted in
    // packages/auth (a session cookie is redirected to it after OAuth), and
    // must be unique to this app — a generic scheme can be claimed by any
    // other app installed on the device.
    scheme: "create-t3-turbo",
    slug: "create-t3-turbo",
    userInterfaceStyle: "automatic",
    version: "0.1.0",
    ...(easProjectId
      ? {
          extra: { eas: { projectId: easProjectId } },
          // Native fingerprint as the runtime version: an OTA update reaches
          // every installed build whose native code matches, and a change to
          // a native module, plugin or asset yields a new fingerprint so the
          // update cannot land on an incompatible binary.
          runtimeVersion: { policy: "fingerprint" },
          updates: {
            fallbackToCacheTimeout: 0,
            url: `https://u.expo.dev/${easProjectId}`,
          },
        }
      : {
          updates: {
            fallbackToCacheTimeout: 0,
          },
        }),
  };
}

export default defineConfig;
