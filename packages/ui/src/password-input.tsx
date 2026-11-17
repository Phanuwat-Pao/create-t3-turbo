"use client";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import * as React from "react";

const PasswordInput = ({
  ref,
  className,
  hidePasswordLabel = "Hide password",
  showPasswordLabel = "Show password",
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  /** Screen-reader text of the toggle while the password is visible. */
  hidePasswordLabel?: string;
  ref?: React.RefObject<HTMLInputElement>;
  /** Screen-reader text of the toggle while the password is hidden. */
  showPasswordLabel?: string;
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const disabled =
    props.value === "" || props.value === undefined || props.disabled;

  const toggleShowPassword = React.useCallback(
    () => setShowPassword((prev) => !prev),
    []
  );

  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        name="password_fake"
        className={cn("hide-password-toggle pr-10", className)}
        ref={ref}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={toggleShowPassword}
        disabled={disabled}
      >
        {showPassword && !disabled ? (
          <EyeOpenIcon className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EyeClosedIcon className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only">
          {showPassword ? hidePasswordLabel : showPasswordLabel}
        </span>
      </Button>

      {/* hides browsers password toggles */}
      <style>{`
                .hide-password-toggle::-ms-reveal,
                .hide-password-toggle::-ms-clear {
                    visibility: hidden;
                    pointer-events: none;
                    display: none;
                }
            `}</style>
    </div>
  );
};
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
