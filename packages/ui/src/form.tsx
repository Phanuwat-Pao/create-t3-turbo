"use client";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import { Checkbox } from "@acme/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { PasswordInput } from "@acme/ui/password-input";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import {
  createFormHook,
  createFormHookContexts,
  useStore,
} from "@tanstack/react-form";
import { format } from "date-fns";
import { CalendarIcon, Loader2, X } from "lucide-react";
import * as React from "react";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

interface FieldMessage {
  message: string;
}

/**
 * Field errors can be zod issues, plain strings from `onSubmitAsync`, or
 * anything a custom validator returns. Normalise to what FieldError renders.
 */
function toFieldErrors(errors: unknown[]): FieldMessage[] {
  const messages: FieldMessage[] = [];
  for (const error of errors) {
    if (typeof error === "string") {
      messages.push({ message: error });
      continue;
    }
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      messages.push({ message: error.message });
    }
  }
  return messages;
}

interface BaseFieldProps {
  description?: React.ReactNode;
  id?: string;
  label: React.ReactNode;
}

interface TextFieldProps
  extends
    BaseFieldProps,
    Omit<
      React.ComponentProps<typeof Input>,
      "id" | "name" | "onBlur" | "onChange" | "value"
    > {
  /** Rendered on the same row as the label, pushed to the end. */
  labelSuffix?: React.ReactNode;
}

function TextField({
  description,
  id,
  label,
  labelSuffix,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const inputId = id ?? field.name;
  const errors = toFieldErrors(field.state.meta.errors);
  const isInvalid = errors.length > 0;

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      field.handleChange(event.target.value);
    },
    [field]
  );

  return (
    <Field data-invalid={isInvalid}>
      {labelSuffix ? (
        <div className="flex items-center">
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          {labelSuffix}
        </div>
      ) : (
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      <Input
        aria-invalid={isInvalid}
        id={inputId}
        name={field.name}
        onBlur={field.handleBlur}
        onChange={handleChange}
        value={field.state.value}
        {...props}
      />
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

type PasswordFieldProps = BaseFieldProps &
  Omit<
    React.ComponentProps<typeof PasswordInput>,
    "id" | "name" | "onBlur" | "onChange" | "value"
  > & {
    labelSuffix?: React.ReactNode;
  };

function PasswordField({
  description,
  id,
  label,
  labelSuffix,
  ...props
}: PasswordFieldProps) {
  const field = useFieldContext<string>();
  const inputId = id ?? field.name;
  const errors = toFieldErrors(field.state.meta.errors);
  const isInvalid = errors.length > 0;

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      field.handleChange(event.target.value);
    },
    [field]
  );

  return (
    <Field data-invalid={isInvalid}>
      {labelSuffix ? (
        <div className="flex items-center">
          <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
          {labelSuffix}
        </div>
      ) : (
        <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      <PasswordInput
        aria-invalid={isInvalid}
        id={inputId}
        onBlur={field.handleBlur}
        onChange={handleChange}
        value={field.state.value}
        {...props}
      />
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

interface CheckboxFieldProps extends BaseFieldProps {
  disabled?: boolean;
}

function CheckboxField({
  description,
  disabled,
  id,
  label,
}: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const inputId = id ?? field.name;
  const errors = toFieldErrors(field.state.meta.errors);
  const isInvalid = errors.length > 0;

  const handleCheckedChange = React.useCallback(
    (checked: boolean | "indeterminate") => {
      field.handleChange(checked === true);
    },
    [field]
  );

  return (
    <Field data-invalid={isInvalid} orientation="horizontal">
      <Checkbox
        aria-invalid={isInvalid}
        checked={field.state.value}
        disabled={disabled}
        id={inputId}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={handleCheckedChange}
      />
      <FieldLabel className="font-normal" htmlFor={inputId}>
        {label}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

interface SelectFieldProps extends BaseFieldProps {
  /** `SelectItem` elements. */
  children: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
}

function SelectField({
  children,
  description,
  disabled,
  id,
  label,
  placeholder,
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  const inputId = id ?? field.name;
  const errors = toFieldErrors(field.state.meta.errors);
  const isInvalid = errors.length > 0;

  const handleValueChange = React.useCallback(
    (value: string) => {
      field.handleChange(value);
    },
    [field]
  );

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Select
        disabled={disabled}
        name={field.name}
        onValueChange={handleValueChange}
        value={field.state.value}
      >
        <SelectTrigger
          aria-invalid={isInvalid}
          id={inputId}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

interface DateFieldProps extends BaseFieldProps {
  disabled?: boolean;
  placeholder?: string;
}

function DateField({
  description,
  disabled,
  id,
  label,
  placeholder = "Pick a date",
}: DateFieldProps) {
  const field = useFieldContext<Date | undefined>();
  const inputId = id ?? field.name;
  const errors = toFieldErrors(field.state.meta.errors);
  const isInvalid = errors.length > 0;
  const { value } = field.state;

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      field.handleChange(date);
    },
    [field]
  );

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            aria-invalid={isInvalid}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
            id={inputId}
            onBlur={field.handleBlur}
            type="button"
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            autoFocus
            mode="single"
            onSelect={handleSelect}
            selected={value}
          />
        </PopoverContent>
      </Popover>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

interface FileFieldProps extends BaseFieldProps {
  accept?: string;
  className?: string;
  clearLabel?: string;
  disabled?: boolean;
  previewAlt?: string;
}

function FileField({
  accept,
  className,
  clearLabel = "Clear file",
  description,
  disabled,
  id,
  label,
  previewAlt = "",
}: FileFieldProps) {
  const field = useFieldContext<File | null>();
  const inputId = id ?? field.name;
  const errors = toFieldErrors(field.state.meta.errors);
  const isInvalid = errors.length > 0;
  const file = field.state.value;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const previewUrl = React.useMemo(
    () => (file?.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file]
  );

  React.useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      field.handleChange(event.target.files?.item(0) ?? null);
    },
    [field]
  );

  const handleClear = React.useCallback(() => {
    field.handleChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [field]);

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
      <div className="flex items-end gap-4">
        {previewUrl && (
          <div className="relative h-16 w-16 overflow-hidden rounded-sm">
            {/* oxlint-disable-next-line nextjs/no-img-element -- blob URLs cannot go through the Next image optimizer, and this package is framework-agnostic */}
            <img
              alt={previewAlt}
              className="h-full w-full object-cover"
              src={previewUrl}
            />
          </div>
        )}
        <div className="flex w-full items-center gap-2">
          <Input
            accept={accept}
            aria-invalid={isInvalid}
            className={cn("w-full", className)}
            disabled={disabled}
            id={inputId}
            name={field.name}
            onBlur={field.handleBlur}
            onChange={handleChange}
            ref={inputRef}
            type="file"
          />
          {file && (
            <Button
              aria-label={clearLabel}
              disabled={disabled}
              onClick={handleClear}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X />
            </Button>
          )}
        </div>
      </div>
      {isInvalid && <FieldError errors={errors} />}
    </Field>
  );
}

type FormProps = Omit<React.ComponentProps<"form">, "onSubmit">;

/** A `<form>` wired to the surrounding `useAppForm` instance. */
function Form({ noValidate = true, ...props }: FormProps) {
  const form = useFormContext();

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();
      form.handleSubmit();
    },
    [form]
  );

  return <form noValidate={noValidate} onSubmit={handleSubmit} {...props} />;
}

type SubmitButtonProps = Omit<React.ComponentProps<typeof Button>, "type"> & {
  /** Shown next to the spinner while the form is submitting. */
  submittingLabel?: React.ReactNode;
};

function SubmitButton({
  children,
  disabled,
  submittingLabel,
  ...props
}: SubmitButtonProps) {
  const form = useFormContext();
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <Button disabled={disabled || isSubmitting} type="submit" {...props}>
      {isSubmitting ? (
        <>
          <Loader2 className="animate-spin" size={16} />
          {submittingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Renders the form-level `onSubmit` error, e.g. from an `onSubmitAsync` validator. */
function FormError({ className, ...props }: React.ComponentProps<"div">) {
  const form = useFormContext();
  const error = useStore(form.store, (state) => state.errorMap.onSubmit);

  if (typeof error !== "string" || error.length === 0) {
    return null;
  }

  return (
    <FieldError className={className} {...props}>
      {error}
    </FieldError>
  );
}

const { useAppForm, withFieldGroup, withForm } = createFormHook({
  fieldComponents: {
    CheckboxField,
    DateField,
    FileField,
    PasswordField,
    SelectField,
    TextField,
  },
  fieldContext,
  formComponents: {
    Form,
    FormError,
    SubmitButton,
  },
  formContext,
});

export { revalidateLogic, useStore } from "@tanstack/react-form";
export {
  toFieldErrors,
  useAppForm,
  useFieldContext,
  useFormContext,
  withFieldGroup,
  withForm,
};
