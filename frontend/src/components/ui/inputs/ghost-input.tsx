"use client";

/** @author Tolga Malkoc <hello@fenriss.com> */

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import React, { forwardRef, useEffect, useId, useState } from "react";

type GhostInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  value?: string | readonly string[] | number | undefined; // copy from [InputHTMLAttributes]
  classNames?: {
    wrapper?: string;
    input?: string;
    border?: string;
  };
  rightSection?: React.ReactNode;
  rightSectionWidth?: string;
  leftSection?: React.ReactNode;
  leftSectionWidth?: string;
  errorMessage?: string;
};

/**
 * Customized Input for text and password.
 *
 * @example
 * ```tsx
 * <GhostInput
 *       control={control}
 *       name="name"
 *       label="Nom de la page"
 *       rightSection={<Eye />}
 *       rightSectionWidth="pr-9"
 *       required
 *     />
 * ```
 */
export const GhostInput = forwardRef<HTMLInputElement, GhostInputProps>(
  (
    {
      classNames,
      type,
      label,
      value,
      rightSection,
      rightSectionWidth = "pr-9",
      leftSection,
      leftSectionWidth = "pl-5",
      errorMessage,
      ...props
    },
    ref
  ) => {
    const [canAnimate, setCanAnimate] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const inputId = useId();
    const [inputType, setInputType] = useState(type);

    // ----------------------------------------
    // lazy activate animations
    // prevent the animation to be triggered on the first render if the input has a initial value
    // ----------------------------------------
    useEffect(() => {
      setTimeout(() => {
        setCanAnimate(true);
      }, 1000);
    }, []);

    // ----------------------------------------
    // hide or display password input
    // ----------------------------------------
    const toggleDisplayPassword = () => {
      if (inputType === "password") {
        setInputType("text");
      } else {
        setInputType("password");
      }
    };

    // ----------------------------------------
    // display an eye icon if the input is a password
    // ----------------------------------------
    if (type === "password") {
      if (inputType === "password") {
        rightSection = (
          <Eye
            className="cursor-pointer text-muted-foreground"
            onClick={toggleDisplayPassword}
          />
        );
      } else {
        rightSection = (
          <EyeOff
            className="cursor-pointer text-muted-foreground"
            onClick={toggleDisplayPassword}
          />
        );
      }
    }

    // ----------------------------------------
    // if the field has a initial value, we need to activate the input by default
    // ----------------------------------------
    useEffect(() => {
      setIsActive(value || String(value) === "0" ? true : false);
    }, [value]);

    return (
      <>
        <div className={cn("relative", classNames?.wrapper)}>
          {/* Input container */}
          <div
            className={cn(
              "relative flex w-full rounded-md border border-input bg-background px-2 py-3 text-foreground transition-all duration-500 ease-in-out focus-within:border-primary",
              errorMessage && "border-red-500",
              classNames?.border
            )}
          >
            {/* input */}
            <input
              {...props}
              ref={ref}
              id={inputId}
              value={value}
              className={cn(
                "peer w-full translate-y-2 bg-background placeholder:text-transparent focus:outline-none",
                !isActive && "translate-y-0",
                inputType === "password" && "font-serif",
                classNames?.input,
                rightSection && rightSectionWidth,
                leftSection && leftSectionWidth
              )}
              type={inputType}
              placeholder=" "
            />

            {/* Label top */}
            <label
              className={cn(
                "pointer-events-none absolute left-2 top-3 origin-left transform text-[0.750rem] text-foreground/60 transition-all",
                canAnimate ? "duration-500" : "duration-0",
                isActive
                  ? "-translate-y-1/2 opacity-75"
                  : "translate-y-0 opacity-0",
                leftSection && leftSectionWidth
              )}
              htmlFor={inputId}
            >
              {label}
            </label>

            {/* Label center */}
            <label
              className={cn(
                "pointer-events-none absolute left-2 origin-left text-base font-normal text-foreground/60 transition-all",
                canAnimate ? "duration-100" : "duration-0",
                isActive ? "opacity-0" : "opacity-75 duration-1000",
                leftSection && leftSectionWidth
              )}
              htmlFor={inputId}
            >
              {label}
            </label>

            {/* Left section */}
            {leftSection && (
              <div className="absolute inset-y-0 left-0 flex items-center pr-2">
                {leftSection}
              </div>
            )}

            {/* Right section */}
            {rightSection && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {rightSection}
              </div>
            )}
          </div>

          {/* Error message */}
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </>
    );
  }
);
GhostInput.displayName = "GhostInput";
