import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, KeyboardAvoidingView, View } from "react-native";
import * as z from "zod";

import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { revalidateLogic, useAppForm } from "~/components/ui/form";
import { Text } from "~/components/ui/text";
import { authClient } from "~/utils/auth";

import logoImage from "../../images/logo.png";

export default function SignUp() {
  const router = useRouter();
  const { t } = useTranslation();

  const signUpSchema = z.object({
    email: z.email(t("validation.emailRequired")),
    name: z.string().trim().min(1, t("validation.nameRequired")),
    password: z.string().min(8, t("validation.passwordMinLength")),
  });

  const form = useAppForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          name: value.name,
          password: value.password,
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
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: signUpSchema,
    },
  });

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
      <form.AppForm>
        <KeyboardAvoidingView className="gap-2 px-6">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                autoComplete="name"
                placeholder={t("auth.signUp.namePlaceholder")}
              />
            )}
          </form.AppField>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder={t("auth.signUp.emailPlaceholder")}
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                autoComplete="new-password"
                placeholder={t("auth.signUp.passwordPlaceholder")}
                secureTextEntry
              />
            )}
          </form.AppField>
        </KeyboardAvoidingView>
        <CardFooter>
          <View className="mt-2 w-full">
            <form.SubmitButton>
              <Text>{t("auth.signUp.signUpButton")}</Text>
            </form.SubmitButton>
            <Text className="mt-2 text-center">
              {t("auth.signUp.hasAccount")}{" "}
              <Text className="underline" onPress={handleSignIn}>
                {t("auth.signUp.signIn")}
              </Text>
            </Text>
          </View>
        </CardFooter>
      </form.AppForm>
    </Card>
  );
}
