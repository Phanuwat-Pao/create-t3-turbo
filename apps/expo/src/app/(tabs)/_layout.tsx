import Ionicons from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";

import { AppsIcon, HomeIcon, TargetIcon } from "~/components/icons/icon-tab";

export default function LineTabsLayout() {
  const colorScheme = useColorScheme();
  const headerTint = colorScheme === "dark" ? "#000" : "#FFFFFF";
  const tabTint = colorScheme === "dark" ? "#000" : "#FFFFFF";
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Tabs
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: "transparent",
          },
          headerTintColor: headerTint,
          headerTransparent: true,
          tabBarActiveTintColor: tabTint,
          tabBarBackground: () => (
            <LinearGradient
              colors={["#244BDD", "#508AEB", "#2B99FF", "#8667F2"]}
              end={{ x: 3.5, y: 1.4 }}
              locations={[0.06, 0.15, 0.19, 0.309]}
              start={{ x: -0.3, y: 0 }}
              style={{
                borderRadius: 50,
                bottom: 0,
                left: 0,
                position: "absolute",
                right: 0,
                top: 0,
              }}
            />
          ),

          tabBarIconStyle: {
            marginTop: 15,
          },
          tabBarInactiveTintColor: "#000000",
          tabBarLabelStyle: {
            display: "none",
          },
          tabBarStyle: {
            alignSelf: "center",
            backgroundColor: "transparent",
            borderRadius: 50,
            bottom: "3%",
            elevation: 5,
            height: 70,
            marginLeft: "10%",
            marginRight: "10%",
            position: "absolute",
            shadowColor: "#000",
            shadowOffset: { height: 2, width: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => (
              // <Ionicons name="home" color={color} size={size} />
              <HomeIcon color={color} size={size} />
            ),
            title: t("home"),
          }}
        />
        <Tabs.Screen
          name="rooms"
          options={{
            tabBarIcon: ({ color, size }) => (
              // <Ionicons name="message" color={color} size={size} />
              <TargetIcon color={color} size={size} />
            ),
            title: t("rooms"),
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            tabBarIcon: ({ color, size }) => (
              // <Ionicons name="dashboard" color={color} size={size} />
              <AppsIcon color={color} size={size} />
            ),
            title: t("contacts"),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons color={color} name="menu" size={size} />
            ),
            title: t("settings"),
          }}
        />
      </Tabs>
    </>
  );
}
