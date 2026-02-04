import Ionicons from "@expo/vector-icons/AntDesign";
import { router, Stack, useNavigationContainerRef } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "~/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { authClient } from "~/utils/auth";

// eslint-disable-next-line import/no-relative-parent-imports
import logoImage from "../../images/logo.png";

export default function Index() {
  const { data: isAuthenticated } = authClient.useSession();
  const navContainerRef = useNavigationContainerRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();

  const isNavReady = navContainerRef.isReady();
  useEffect(() => {
    if (isAuthenticated && isNavReady) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isNavReady]);

  const handleGoogleSignIn = useCallback(() => {
    authClient.signIn.social({
      callbackURL: "/dashboard",
      provider: "google",
    });
  }, []);

  const handleGitHubSignIn = useCallback(() => {
    authClient.signIn.social({
      callbackURL: "/dashboard",
      provider: "github",
    });
  }, []);

  const handleForgetPassword = useCallback(() => {
    router.push("/forget-password");
  }, []);

  const handleEmailSignIn = useCallback(() => {
    authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: (ctx) => {
          Alert.alert(t("common.error"), ctx.error.message);
        },
      }
    );
  }, [email, password, t]);

  const handleCreateAccount = useCallback(() => {
    router.push("/sign-up");
  }, []);

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: t("auth.signIn.title") }} />
      <View className="bg-background flex h-full w-full items-center justify-center">
        <Card className="bg-muted/70 z-50 mx-6 backdrop-blur-lg">
          <CardHeader className="flex items-center justify-center gap-8">
            <Image
              source={logoImage}
              style={{
                height: 40,
                width: 40,
              }}
            />
            <CardTitle>{t("auth.signIn.subtitle")}</CardTitle>
          </CardHeader>
          <View className="flex gap-2 px-6">
            <Button
              onPress={handleGoogleSignIn}
              variant="secondary"
              className="bg-background/50 flex flex-row items-center gap-2"
            >
              <Ionicons name="google" size={16} />
              <Text>{t("auth.signIn.withGoogle")}</Text>
            </Button>
            <Button
              variant="secondary"
              className="bg-background/50 flex flex-row items-center gap-2"
              onPress={handleGitHubSignIn}
            >
              <Ionicons name="github" size={16} />
              <Text>{t("auth.signIn.withGitHub")}</Text>
            </Button>
          </View>
          <View className="my-4 w-full flex-row items-center gap-2 px-6">
            <Separator className="w-3/12 grow" />
            <Text>{t("auth.signIn.orContinueWith")}</Text>
            <Separator className="w-3/12 grow" />
          </View>
          <View className="px-6">
            <Input
              placeholder={t("auth.signIn.emailPlaceholder")}
              className="rounded-b-none border-b-0"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              placeholder={t("auth.signIn.passwordPlaceholder")}
              className="rounded-t-none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <CardFooter>
            <View className="w-full">
              <Button
                variant="link"
                className="w-full"
                onPress={handleForgetPassword}
              >
                <Text className="text-center underline">
                  {t("auth.signIn.forgotPassword")}
                </Text>
              </Button>
              <Button onPress={handleEmailSignIn}>
                <Text>{t("common.continue")}</Text>
              </Button>
              <Text className="mt-2 text-center">
                {t("auth.signIn.noAccount")}{" "}
                <Text className="underline" onPress={handleCreateAccount}>
                  {t("auth.signIn.createAccount")}
                </Text>
              </Text>
            </View>
          </CardFooter>
        </Card>
      </View>
    </SafeAreaView>
  );
}
