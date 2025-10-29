// import { useState } from "react";
// import { Pressable, Text, TextInput, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Link, Stack } from "expo-router";
// import { LegendList } from "@legendapp/list";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import type { RouterOutputs } from "~/utils/api";
// import { trpc } from "~/utils/api";
// import { authClient } from "~/utils/auth";

// function PostCard(props: {
//   post: RouterOutputs["post"]["all"][number];
//   onDelete: () => void;
// }) {
//   return (
//     <View className="bg-muted flex flex-row rounded-lg p-4">
//       <View className="grow">
//         <Link
//           asChild
//           href={{
//             pathname: "/post/[id]",
//             params: { id: props.post.id },
//           }}
//         >
//           <Pressable className="">
//             <Text className="text-primary text-xl font-semibold">
//               {props.post.title}
//             </Text>
//             <Text className="text-foreground mt-2">{props.post.content}</Text>
//           </Pressable>
//         </Link>
//       </View>
//       <Pressable onPress={props.onDelete}>
//         <Text className="text-primary font-bold uppercase">Delete</Text>
//       </Pressable>
//     </View>
//   );
// }

// function CreatePost() {
//   const queryClient = useQueryClient();

//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");

//   const { mutate, error } = useMutation(
//     trpc.post.create.mutationOptions({
//       async onSuccess() {
//         setTitle("");
//         setContent("");
//         await queryClient.invalidateQueries(trpc.post.all.queryFilter());
//       },
//     }),
//   );

//   return (
//     <View className="mt-4 flex gap-2">
//       <TextInput
//         className="border-input bg-background text-foreground items-center rounded-md border px-3 text-lg leading-tight"
//         value={title}
//         onChangeText={setTitle}
//         placeholder="Title"
//       />
//       {error?.data?.zodError?.fieldErrors.title && (
//         <Text className="text-destructive mb-2">
//           {error.data.zodError.fieldErrors.title}
//         </Text>
//       )}
//       <TextInput
//         className="border-input bg-background text-foreground items-center rounded-md border px-3 text-lg leading-tight"
//         value={content}
//         onChangeText={setContent}
//         placeholder="Content"
//       />
//       {error?.data?.zodError?.fieldErrors.content && (
//         <Text className="text-destructive mb-2">
//           {error.data.zodError.fieldErrors.content}
//         </Text>
//       )}
//       <Pressable
//         className="bg-primary flex items-center rounded-sm p-2"
//         onPress={() => {
//           mutate({
//             title,
//             content,
//           });
//         }}
//       >
//         <Text className="text-foreground">Create</Text>
//       </Pressable>
//       {error?.data?.code === "UNAUTHORIZED" && (
//         <Text className="text-destructive mt-2">
//           You need to be logged in to create a post
//         </Text>
//       )}
//     </View>
//   );
// }

// function MobileAuth() {
//   const { data: session } = authClient.useSession();

//   return (
//     <>
//       <Text className="text-foreground pb-2 text-center text-xl font-semibold">
//         {session?.user.name ? `Hello, ${session.user.name}` : "Not logged in"}
//       </Text>
//       <Pressable
//         onPress={() =>
//           session
//             ? authClient.signOut()
//             : authClient.signIn.social({
//                 provider: "discord",
//                 callbackURL: "/",
//               })
//         }
//         className="bg-primary flex items-center rounded-sm p-2"
//       >
//         <Text>{session ? "Sign Out" : "Sign In With Discord"}</Text>
//       </Pressable>
//     </>
//   );
// }

// export default function Index() {
//   const queryClient = useQueryClient();

//   const postQuery = useQuery(trpc.post.all.queryOptions());

//   const deletePostMutation = useMutation(
//     trpc.post.delete.mutationOptions({
//       onSettled: () =>
//         queryClient.invalidateQueries(trpc.post.all.queryFilter()),
//     }),
//   );

//   return (
//     <SafeAreaView className="bg-background">
//       {/* Changes page title visible on the header */}
//       <Stack.Screen options={{ title: "Home Page" }} />
//       <View className="bg-background h-full w-full p-4">
//         <Text className="text-foreground pb-2 text-center text-5xl font-bold">
//           Create <Text className="text-primary">T3</Text> Turbo
//         </Text>

//         <MobileAuth />

//         <View className="py-2">
//           <Text className="text-primary font-semibold italic">
//             Press on a post
//           </Text>
//         </View>

//         <LegendList
//           data={postQuery.data ?? []}
//           estimatedItemSize={20}
//           keyExtractor={(item) => item.id}
//           ItemSeparatorComponent={() => <View className="h-2" />}
//           renderItem={(p) => (
//             <PostCard
//               post={p.item}
//               onDelete={() => deletePostMutation.mutate(p.item.id)}
//             />
//           )}
//         />

//         <CreatePost />
//       </View>
//     </SafeAreaView>
//   );
// }
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
