import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    expoClient({
      scheme: "expo-appointments-silvio",
      storagePrefix: "expo-appointments-silvio",
      storage: SecureStore,
    }),
  ],
  baseURL: "http://localhost:3000",
});
