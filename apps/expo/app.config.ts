import type { ConfigContext, ExpoConfig } from "expo/config";

export const appName = "Agendar";
export const appScheme = "br-tec-agendar";
export const appBundleIdentifier = "br.tec.agendar";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: appName,
  slug: appScheme,
  scheme: appScheme,
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#001240",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: appBundleIdentifier,
    supportsTablet: true,
  },
  android: {
    package: appBundleIdentifier,
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#001240",
    },
  },
  extra: {
    eas: {
      projectId: "458ee79f-adcb-4966-bb53-23f07a8754c1",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-image-picker",
      {
        photosPermission:
          "The app accesses your photos to let you share them with your friends.",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#001240",
        image: "./assets/icon.png",
        imageWidth: 200,
      },
    ],
  ],
});
