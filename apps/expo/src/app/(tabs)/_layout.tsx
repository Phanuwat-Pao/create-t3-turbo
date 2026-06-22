import Ionicons from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { type ColorValue, useColorScheme } from "react-native";

import { AppsIcon, HomeIcon, TargetIcon } from "~/components/icons/icon-tab";

interface TabBarIconProps {
  color: ColorValue;
  size: number;
}

const renderTabBarBackground = () => (
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
);

const HomeTabBarIcon = ({ color, size }: TabBarIconProps) => (
  <HomeIcon color={color as string} size={size} />
);

const RoomsTabBarIcon = ({ color, size }: TabBarIconProps) => (
  <TargetIcon color={color as string} size={size} />
);

const ContactsTabBarIcon = ({ color, size }: TabBarIconProps) => (
  <AppsIcon color={color as string} size={size} />
);

const SettingsTabBarIcon = ({ color, size }: TabBarIconProps) => (
  <Ionicons color={color} name="menu" size={size} />
);

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
          tabBarBackground: renderTabBarBackground,

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
            tabBarIcon: HomeTabBarIcon,
            title: t("navigation.home"),
          }}
        />
        <Tabs.Screen
          name="rooms"
          options={{
            tabBarIcon: RoomsTabBarIcon,
            title: t("navigation.rooms"),
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            tabBarIcon: ContactsTabBarIcon,
            title: t("navigation.contacts"),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: SettingsTabBarIcon,
            title: t("navigation.settings"),
          }}
        />
      </Tabs>
    </>
  );
}
