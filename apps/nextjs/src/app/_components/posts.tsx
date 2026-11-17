"use client";

import type { RouterOutputs } from "@acme/api";
import { CreatePostSchema } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { FieldGroup } from "@acme/ui/field";
import { revalidateLogic, useAppForm } from "@acme/ui/form";
import { toast } from "@acme/ui/toast";
import { ORPCError } from "@orpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { orpc } from "~/rpc/react";

export function CreatePostForm() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const createPost = useMutation(
    orpc.post.create.mutationOptions({
      onError: (err) => {
        const isUnauthorized =
          err instanceof ORPCError && err.code === "UNAUTHORIZED";
        toast.error(
          isUnauthorized ? t("posts.loginToCreate") : t("posts.failedToCreate")
        );
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.post.key() });
      },
    })
  );

  const form = useAppForm({
    defaultValues: {
      content: "",
      title: "",
    },
    onSubmit: async ({ formApi, value }) => {
      try {
        await createPost.mutateAsync(value);
        formApi.reset();
      } catch {
        // Error feedback is handled by the mutation's onError toast.
      }
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: CreatePostSchema,
    },
  });

  return (
    <form.AppForm>
      <form.Form className="w-full max-w-2xl">
        <FieldGroup>
          <form.AppField name="title">
            {(field) => (
              <field.TextField
                label={t("posts.titleLabel")}
                placeholder={t("posts.titlePlaceholder")}
              />
            )}
          </form.AppField>
          <form.AppField name="content">
            {(field) => (
              <field.TextField
                label={t("posts.contentLabel")}
                placeholder={t("posts.contentPlaceholder")}
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.SubmitButton>{t("posts.create")}</form.SubmitButton>
      </form.Form>
    </form.AppForm>
  );
}

export function PostCardSkeleton(props: { pulse?: boolean }) {
  const { pulse = true } = props;
  return (
    <div className="bg-muted flex flex-row rounded-lg p-4">
      <div className="grow">
        <h2
          className={cn(
            "bg-primary w-1/4 rounded-sm text-2xl font-bold",
            pulse && "animate-pulse"
          )}
        >
          &nbsp;
        </h2>
        <p
          className={cn(
            "mt-2 w-1/3 rounded-sm bg-current text-sm",
            pulse && "animate-pulse"
          )}
        >
          &nbsp;
        </p>
      </div>
    </div>
  );
}

export function PostCard(props: {
  post: RouterOutputs["post"]["all"][number];
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deletePost = useMutation(
    orpc.post.delete.mutationOptions({
      onError: (err) => {
        const isUnauthorized =
          err instanceof ORPCError && err.code === "UNAUTHORIZED";
        toast.error(
          isUnauthorized ? t("posts.loginToDelete") : t("posts.failedToDelete")
        );
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.post.key() });
      },
    })
  );

  const handleDelete = useCallback(() => {
    deletePost.mutate({ id: props.post.id });
  }, [deletePost, props.post.id]);

  return (
    <div className="bg-muted flex flex-row rounded-lg p-4">
      <div className="grow">
        <h2 className="text-primary text-2xl font-bold">{props.post.title}</h2>
        <p className="mt-2 text-sm">{props.post.content}</p>
      </div>
      <div>
        <Button
          className="text-primary cursor-pointer text-sm font-bold uppercase hover:bg-transparent hover:text-white"
          onClick={handleDelete}
          variant="ghost"
        >
          {t("common.delete")}
        </Button>
      </div>
    </div>
  );
}

export function PostList() {
  const { t } = useTranslation();
  const { data: posts } = useSuspenseQuery(orpc.post.all.queryOptions());

  if (posts.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">{t("posts.empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
