import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import * as React from "react";
import { type TextInputProps, ActivityIndicator, View } from "react-native";

import { type ButtonProps, Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

/**
 * Field errors can be zod issues, plain strings from `onSubmitAsync`, or
 * anything a custom validator returns. Normalise to the messages we render.
 */
function toErrorMessages(errors: unknown[]): string[] {
  const messages: string[] = [];
  for (const error of errors) {
    if (typeof error === "string") {
      messages.push(error);
      continue;
    }
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      messages.push(error.message);
    }
  }
  return [...new Set(messages)];
}

interface TextFieldProps extends Omit<
  TextInputProps,
  "onBlur" | "onChangeText" | "value"
> {
  /** Wraps the input and error so callers can shape stacked inputs. */
  containerClassName?: string;
  label?: string;
}

function TextField({
  containerClassName,
  label,
  className,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const errors = toErrorMessages(field.state.meta.errors);
  const isInvalid = errors.length > 0;

  const handleChangeText = React.useCallback(
    (text: string) => {
      field.handleChange(text);
    },
    [field]
  );

  return (
    <View className={containerClassName}>
      {label && <Text className="mb-1 text-sm font-medium">{label}</Text>}
      <Input
        accessibilityLabel={label ?? props.placeholder}
        className={cn(isInvalid && "border-destructive", className)}
        onBlur={field.handleBlur}
        onChangeText={handleChangeText}
        value={field.state.value}
        {...props}
      />
      {isInvalid && (
        <Text className="text-destructive mt-1 text-sm">
          {errors.join("\n")}
        </Text>
      )}
    </View>
  );
}

type SubmitButtonProps = Omit<ButtonProps, "onPress">;

function SubmitButton({ children, disabled, ...props }: SubmitButtonProps) {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const handlePress = React.useCallback(() => {
    form.handleSubmit();
  }, [form]);

  return (
    <Button
      disabled={disabled || isSubmitting}
      onPress={handlePress}
      {...props}
    >
      {isSubmitting ? <ActivityIndicator color="white" /> : children}
    </Button>
  );
}

const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {
    TextField,
  },
  fieldContext,
  formComponents: {
    SubmitButton,
  },
  formContext,
});

export { revalidateLogic, useStore } from "@tanstack/react-form";
export {
  useAppForm,
  useFieldContext,
  useFormContext,
  withFieldGroup,
  withForm,
};
