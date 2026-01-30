"use client";

import { Button } from "@acme/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@acme/ui/field";
import { Input } from "@acme/ui/input";
import { Loader2, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import * as z from "zod";

import { authClient } from "~/auth/client";
import { useImagePreview } from "~/hooks/use-image-preview";
import { convertImageToBase64 } from "~/lib/utils";

const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address."),
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    passwordConfirmation: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;
type FormErrors = Partial<Record<keyof SignUpFormValues, { message: string }>>;

interface SignUpFormProps {
  onSuccess?: () => void;
  callbackURL?: string;
}

export function SignUpForm({
  onSuccess,
  callbackURL = "/dashboard",
}: SignUpFormProps) {
  const [loading, startTransition] = useTransition();
  const { image, imagePreview, handleImageChange, clearImage } =
    useImagePreview();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((): boolean => {
    const result = signUpSchema.safeParse({
      email,
      firstName,
      lastName,
      password,
      passwordConfirmation,
    });
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormValues;
        fieldErrors[field] = { message: issue.message };
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [email, firstName, lastName, password, passwordConfirmation]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) {
        return;
      }

      startTransition(async () => {
        await authClient.signUp.email({
          callbackURL,
          email,
          fetchOptions: {
            onError: (ctx: { error: { message: string } }) => {
              toast.error(ctx.error.message);
            },
            onSuccess: async () => {
              toast.success("Successfully signed up");
              onSuccess?.();
            },
          },
          image: image ? await convertImageToBase64(image) : "",
          name: `${firstName} ${lastName}`,
          password,
        });
      });
    },
    [
      validate,
      callbackURL,
      email,
      image,
      firstName,
      lastName,
      password,
      onSuccess,
    ]
  );

  const handleFirstNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value),
    []
  );

  const handleLastNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value),
    []
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
    []
  );

  const handlePasswordConfirmationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPasswordConfirmation(e.target.value),
    []
  );

  return (
    <form onSubmit={handleSubmit} className="grid gap-2">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.firstName}>
            <FieldLabel htmlFor="sign-up-first-name">First name</FieldLabel>
            <Input
              id="sign-up-first-name"
              placeholder="Max"
              aria-invalid={!!errors.firstName}
              autoComplete="given-name"
              value={firstName}
              onChange={handleFirstNameChange}
            />
            {errors.firstName && <FieldError errors={[errors.firstName]} />}
          </Field>
          <Field data-invalid={!!errors.lastName}>
            <FieldLabel htmlFor="sign-up-last-name">Last name</FieldLabel>
            <Input
              id="sign-up-last-name"
              placeholder="Robinson"
              aria-invalid={!!errors.lastName}
              autoComplete="family-name"
              value={lastName}
              onChange={handleLastNameChange}
            />
            {errors.lastName && <FieldError errors={[errors.lastName]} />}
          </Field>
        </div>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
          <Input
            id="sign-up-email"
            type="email"
            placeholder="m@example.com"
            aria-invalid={!!errors.email}
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
          />
          {errors.email && <FieldError errors={[errors.email]} />}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
            <Input
              id="sign-up-password"
              type="password"
              placeholder="Password"
              aria-invalid={!!errors.password}
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordChange}
            />
            {errors.password && <FieldError errors={[errors.password]} />}
          </Field>
          <Field data-invalid={!!errors.passwordConfirmation}>
            <FieldLabel htmlFor="sign-up-password-confirmation">
              Confirm Password
            </FieldLabel>
            <Input
              id="sign-up-password-confirmation"
              type="password"
              placeholder="Confirm Password"
              aria-invalid={!!errors.passwordConfirmation}
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={handlePasswordConfirmationChange}
            />
            {errors.passwordConfirmation && (
              <FieldError errors={[errors.passwordConfirmation]} />
            )}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="sign-up-image">
            Profile Image (optional)
          </FieldLabel>
          <div className="flex items-end gap-4">
            {imagePreview && (
              <div className="relative h-16 w-16 overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex w-full items-center gap-2">
              <Input
                id="sign-up-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full"
              />
              {imagePreview && (
                <X className="cursor-pointer" onClick={clearImage} />
              )}
            </div>
          </div>
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Create an account"
        )}
      </Button>
    </form>
  );
}
