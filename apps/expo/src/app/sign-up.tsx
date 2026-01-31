import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, KeyboardAvoidingView, View } from "react-native";

import { Button } from "~/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { authClient } from "~/lib/auth-client";

import logoImage from "../../assets/images/logo.png";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { t } = useTranslation();

  const handleSignUp = useCallback(async () => {
    await authClient.signUp.email(
      {
        email,
        name,
        password,
      },
      {
        onError: (ctx) => {
          Alert.alert(t("common.error"), ctx.error.message);
        },
        onSuccess: () => {
          router.push("/dashboard");
        },
      }
    );
  }, [email, name, password, router, t]);

  const handleSignIn = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <Card className="z-50 mx-6">
      <CardHeader className="flex items-center justify-center gap-8">
        <Image
          source={logoImage}
          style={{
            height: 40,
            width: 40,
          }}
        />
        <CardTitle>{t("auth.signUp.title")}</CardTitle>
      </CardHeader>
      <View className="px-6">
        <KeyboardAvoidingView>
          <Input
            placeholder={t("auth.signUp.namePlaceholder")}
            className="rounded-b-none border-b-0"
            value={name}
            onChangeText={setName}
          />
        </KeyboardAvoidingView>
        <KeyboardAvoidingView>
          <Input
            placeholder={t("auth.signUp.emailPlaceholder")}
            className="rounded-b-none border-b-0"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </KeyboardAvoidingView>

        <KeyboardAvoidingView>
          <Input
            placeholder={t("auth.signUp.passwordPlaceholder")}
            secureTextEntry
            className="rounded-t-none"
            value={password}
            onChangeText={setPassword}
          />
        </KeyboardAvoidingView>
      </View>
      <CardFooter>
        <View className="mt-2 w-full">
          <Button onPress={handleSignUp}>
            <Text>{t("auth.signUp.signUpButton")}</Text>
          </Button>
          <Text className="mt-2 text-center">
            {t("auth.signUp.hasAccount")}{" "}
            <Text className="underline" onPress={handleSignIn}>
              {t("auth.signUp.signIn")}
            </Text>
          </Text>
        </View>
      </CardFooter>
    </Card>
  );
}
