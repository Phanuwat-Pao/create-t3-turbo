"use client";

import type { RouterOutputs } from "@acme/api";

import { CreatePostSchema } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";
import { ORPCError } from "@orpc/client";
import { useForm } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCallback } from "react";

import { orpc } from "~/rpc/react";

function TextField(props: {
  field: {
    handleBlur: () => void;
    handleChange: (value: string) => void;
    name: string;
    state: {
      meta: {
        errors: ({ message?: string } | undefined)[];
        isTouched: boolean;
        isValid: boolean;
      };
      value: string;
    };
  };
  label: string;
  placeholder: string;
}) {
  const { field, label, placeholder } = props;
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.handleChange(e.target.value);
    },
    [field]
  );

  return (
    <Field data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      </FieldContent>
      <Input
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={handleChange}
        placeholder={placeholder}
        value={field.state.value}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function CreatePostForm() {
  const queryClient = useQueryClient();
  const createPost = useMutation(
    orpc.post.create.mutationOptions({
      onError: (err) => {
        const isUnauthorized =
          err instanceof ORPCError && err.code === "UNAUTHORIZED";
        toast.error(
          isUnauthorized
            ? "You must be logged in to post"
            : "Failed to create post"
        );
      },
      onSuccess: async () => {
        form.reset();
        await queryClient.invalidateQueries({ queryKey: orpc.post.key() });
      },
    })
  );

  const form = useForm({
    defaultValues: {
      content: "",
      title: "",
    },
    onSubmit: (data) => createPost.mutate(data.value),
    validators: {
      onSubmit: CreatePostSchema,
    },
  });

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      form.handleSubmit();
    },
    [form]
  );

  return (
    <form className="w-full max-w-2xl" onSubmit={handleSubmit}>
      <FieldGroup>
        <form.Field name="title">
          {(field) => (
            <TextField field={field} label="Bug Title" placeholder="Title" />
          )}
        </form.Field>
        <form.Field name="content">
          {(field) => (
            <TextField field={field} label="Content" placeholder="Content" />
          )}
        </form.Field>
      </FieldGroup>
      <Button type="submit">Create</Button>
    </form>
  );
}

export function PostList() {
  const { data: posts } = useSuspenseQuery(orpc.post.all.queryOptions());

  if (posts.length === 0) {
    return (
      <div className="relative flex w-full flex-col gap-4">
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />
        <PostCardSkeleton pulse={false} />

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
          <p className="text-2xl font-bold text-white">No posts yet</p>
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

export function PostCard(props: {
  post: RouterOutputs["post"]["all"][number];
}) {
  const queryClient = useQueryClient();
  const deletePost = useMutation(
    orpc.post.delete.mutationOptions({
      onError: (err) => {
        const isUnauthorized =
          err instanceof ORPCError && err.code === "UNAUTHORIZED";
        toast.error(
          isUnauthorized
            ? "You must be logged in to delete a post"
            : "Failed to delete post"
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
          Delete
        </Button>
      </div>
    </div>
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
