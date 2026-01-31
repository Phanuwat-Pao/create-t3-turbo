import Icons from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { authClient } from "~/utils/auth";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const { t } = useTranslation();

  const handleSendEmail = useCallback(() => {
    (
      authClient as unknown as {
        forgetPassword: (opts: { email: string; redirectTo: string }) => void;
      }
    ).forgetPassword({
      email,
      redirectTo: "/reset-password",
    });
  }, [email]);

  const handleBack = useCallback(() => {
    router.push("/");
  }, []);

  return (
    <Card className="w-10/12">
      <CardHeader>
        <CardTitle>{t("auth.forgotPassword.title")}</CardTitle>
        <CardDescription>
          {t("auth.forgotPassword.description")}
        </CardDescription>
      </CardHeader>
      <View className="mb-2 px-6">
        <Input
          autoCapitalize="none"
          placeholder={t("auth.forgotPassword.emailPlaceholder")}
          value={email}
          onChangeText={setEmail}
        />
      </View>
      <CardFooter>
        <View className="w-full gap-2">
          <Button
            onPress={handleSendEmail}
            className="w-full"
            variant="default"
          >
            <Text>{t("auth.forgotPassword.sendEmail")}</Text>
          </Button>
          <Button
            onPress={handleBack}
            className="w-full flex-row items-center gap-4"
            variant="outline"
          >
            <Icons name="arrow-left" size={18} />
            <Text>{t("auth.forgotPassword.backToSignIn")}</Text>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
}
