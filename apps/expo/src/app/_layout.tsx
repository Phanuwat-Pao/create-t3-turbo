import { StrictMode } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";

import { authClient } from "~/utils/auth";

import "../styles.css";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error("EXPO_PUBLIC_CONVEX_URL is not set");
}
const convex = new ConvexReactClient(convexUrl, {
  // Optionally pause queries until the user is authenticated
  expectAuth: true,
  unsavedChangesWarning: false,
});
// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <StrictMode>
      <ConvexBetterAuthProvider client={convex} authClient={authClient}>
        {/*
          The Stack component displays the current page.
          It also allows you to configure your screens 
        */}
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#c03484",
            },
            contentStyle: {
              backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
            },
          }}
        />
        <StatusBar />
      </ConvexBetterAuthProvider>
    </StrictMode>
  );
}
