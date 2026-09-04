import Icons from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import * as z from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { revalidateLogic, useAppForm } from "~/components/ui/form";
import { Text } from "~/components/ui/text";
import { authClient } from "~/utils/auth";

export default function ForgetPassword() {
  const { t } = useTranslation();

  const forgetPasswordSchema = z.object({
    email: z.email(t("validation.emailRequired")),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.requestPasswordReset(
        {
          email: value.email,
          redirectTo: "/reset-password",
        },
        {
          onError: (ctx) => {
            Alert.alert(t("common.error"), ctx.error.message);
          },
          onSuccess: () => {
            Alert.alert(
              t("auth.forgotPassword.title"),
              t("auth.forgotPassword.emailSent")
            );
          },
        }
      );
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: forgetPasswordSchema,
    },
  });

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
      <form.AppForm>
        <View className="mb-2 px-6">
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
              />
            )}
          </form.AppField>
        </View>
        <CardFooter>
          <View className="w-full gap-2">
            <form.SubmitButton className="w-full" variant="default">
              <Text>{t("auth.forgotPassword.sendEmail")}</Text>
            </form.SubmitButton>
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
      </form.AppForm>
    </Card>
  );
}
