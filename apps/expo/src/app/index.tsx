import { LegendList } from "@legendapp/list";
import { ORPCError } from "@orpc/client";
import {
  type UseMutationResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { memo, useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { type RouterOutputs, orpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

type Post = RouterOutputs["post"]["all"][number];
type DeleteMutation = UseMutationResult<unknown, Error, string>;

const PostCard = memo(function PostCard(props: {
  deletePostMutation: DeleteMutation;
  post: Post;
}) {
  const handleDelete = useCallback(() => {
    props.deletePostMutation.mutate(props.post.id);
  }, [props.deletePostMutation, props.post.id]);

  return (
    <View className="bg-muted flex flex-row rounded-lg p-4">
      <View className="grow">
        <Link
          asChild
          href={{
            params: { id: props.post.id },
            pathname: "/post/[id]",
          }}
        >
          <Pressable className="">
            <Text className="text-primary text-xl font-semibold">
              {props.post.title}
            </Text>
            <Text className="text-foreground mt-2">{props.post.content}</Text>
          </Pressable>
        </Link>
      </View>
      <Pressable onPress={handleDelete}>
        <Text className="text-primary font-bold uppercase">Delete</Text>
      </Pressable>
    </View>
  );
});

function CreatePost() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { error, mutate } = useMutation(
    orpc.post.create.mutationOptions({
      async onSuccess() {
        setTitle("");
        setContent("");
        await queryClient.invalidateQueries({ queryKey: orpc.post.key() });
      },
    })
  );

  const isUnauthorized =
    error instanceof ORPCError && error.code === "UNAUTHORIZED";

  const handleCreate = useCallback(() => {
    mutate({
      content,
      title,
    });
  }, [content, mutate, title]);

  return (
    <View className="mt-4 flex gap-2">
      <TextInput
        className="border-input bg-background text-foreground items-center rounded-md border px-3 text-lg leading-tight"
        onChangeText={setTitle}
        placeholder="Title"
        value={title}
      />
      <TextInput
        className="border-input bg-background text-foreground items-center rounded-md border px-3 text-lg leading-tight"
        onChangeText={setContent}
        placeholder="Content"
        value={content}
      />
      <Pressable
        className="bg-primary flex items-center rounded-sm p-2"
        onPress={handleCreate}
      >
        <Text className="text-foreground">Create</Text>
      </Pressable>
      {isUnauthorized && (
        <Text className="text-destructive mt-2">
          You need to be logged in to create a post
        </Text>
      )}
    </View>
  );
}

function MobileAuth() {
  const { data: session } = authClient.useSession();

  const handleAuthPress = useCallback(() => {
    if (session) {
      authClient.signOut();
    } else {
      authClient.signIn.social({
        callbackURL: "/",
        provider: "discord",
      });
    }
  }, [session]);

  return (
    <>
      <Text className="text-foreground pb-2 text-center text-xl font-semibold">
        {session?.user.name ? `Hello, ${session.user.name}` : "Not logged in"}
      </Text>
      <Pressable
        className="bg-primary flex items-center rounded-sm p-2"
        onPress={handleAuthPress}
      >
        <Text>{session ? "Sign Out" : "Sign In With Discord"}</Text>
      </Pressable>
    </>
  );
}

const ItemSeparator = memo(function ItemSeparator() {
  return <View className="h-2" />;
});

function keyExtractor(item: Post) {
  return item.id;
}

export default function Index() {
  const queryClient = useQueryClient();

  const postQuery = useQuery(orpc.post.all.queryOptions());

  const deletePostMutation = useMutation(
    orpc.post.delete.mutationOptions({
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: orpc.post.key() }),
    })
  );

  const renderItem = useCallback(
    (p: { item: Post }) => (
      <PostCard deletePostMutation={deletePostMutation} post={p.item} />
    ),
    [deletePostMutation]
  );

  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="bg-background h-full w-full p-4">
        <Text className="text-foreground pb-2 text-center text-5xl font-bold">
          Create <Text className="text-primary">T3</Text> Turbo
        </Text>

        <MobileAuth />

        <View className="py-2">
          <Text className="text-primary font-semibold italic">
            Press on a post
          </Text>
        </View>

        <LegendList
          data={postQuery.data ?? []}
          estimatedItemSize={20}
          ItemSeparatorComponent={ItemSeparator}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
        />

        <CreatePost />
      </View>
    </SafeAreaView>
  );
}
