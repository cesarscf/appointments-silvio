import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { appScheme } from "app.config";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    expoClient({
      scheme: appScheme,
      storagePrefix: appScheme,
      storage: SecureStore,
    }),
  ],
  baseURL: "http://localhost:3000",
});
