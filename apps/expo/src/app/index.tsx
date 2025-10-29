import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { router, useNavigationContainerRef } from "expo-router";
import Ionicons from "@expo/vector-icons/AntDesign";
import { useStore } from "@nanostores/react";

import { Button } from "~/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Text } from "~/components/ui/text";
import { authClient } from "~/utils/auth";

export default function Index() {
  const { data: isAuthenticated } = useStore(authClient.useSession);
  const navContainerRef = useNavigationContainerRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      if (navContainerRef.isReady()) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, navContainerRef.isReady()]);
  return (
    <Card className="z-50 mx-6 bg-gray-200/70 backdrop-blur-lg">
      <CardHeader className="flex items-center justify-center gap-8">
        <Image
          source={require("../../assets/images/logo.png")}
          style={{
            width: 40,
            height: 40,
          }}
        />
        <CardTitle>Sign In to your account</CardTitle>
      </CardHeader>
      <View className="flex gap-2 px-6">
        <Button
          onPress={() => {
            authClient.signIn.social({
              provider: "google",
              callbackURL: "/dashboard",
            });
          }}
          variant="secondary"
          className="flex flex-row items-center gap-2 bg-white/50"
        >
          <Ionicons name="google" size={16} />
          <Text>Sign In with Google</Text>
        </Button>
        <Button
          variant="secondary"
          className="flex flex-row items-center gap-2 bg-white/50"
          onPress={() => {
            authClient.signIn.social({
              provider: "github",
              callbackURL: "/dashboard",
            });
          }}
        >
          <Ionicons name="github" size={16} />
          <Text>Sign In with GitHub</Text>
        </Button>
      </View>
      <View className="my-4 w-full flex-row items-center gap-2 px-6">
        <Separator className="w-3/12 flex-grow" />
        <Text>or continue with</Text>
        <Separator className="w-3/12 flex-grow" />
      </View>
      <View className="px-6">
        <Input
          placeholder="Email Address"
          className="rounded-b-none border-b-0"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
          }}
        />
        <Input
          placeholder="Password"
          className="rounded-t-none"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
          }}
        />
      </View>
      <CardFooter>
        <View className="w-full">
          <Button
            variant="link"
            className="w-full"
            onPress={() => {
              router.push("/forget-password");
            }}
          >
            <Text className="text-center underline">Forget Password?</Text>
          </Button>
          <Button
            onPress={() => {
              authClient.signIn.email(
                {
                  email,
                  password,
                },
                {
                  onError: (ctx) => {
                    alert(ctx.error.message);
                  },
                },
              );
            }}
          >
            <Text>Continue</Text>
          </Button>
          <Text className="mt-2 text-center">
            Don't have an account?{" "}
            <Text
              className="underline"
              onPress={() => {
                router.push("/sign-up");
              }}
            >
              Create Account
            </Text>
          </Text>
        </View>
      </CardFooter>
    </Card>
  );
}
