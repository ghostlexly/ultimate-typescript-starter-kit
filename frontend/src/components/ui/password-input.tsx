"use client";

import { forwardRef, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import type React from "react";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <InputGroup>
        <InputGroupInput
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
        />
        <InputGroupAddon align="inline-end">
          {showPassword ? (
            <EyeOffIcon
              className="size-4 cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowPassword(false);
              }}
            />
          ) : (
            <EyeIcon
              className="size-4 cursor-pointer"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowPassword(true);
              }}
            />
          )}
        </InputGroupAddon>
      </InputGroup>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
