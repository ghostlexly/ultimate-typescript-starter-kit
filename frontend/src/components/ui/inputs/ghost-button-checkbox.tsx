"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef, useEffect, useId, useState } from "react";

type GhostButtonCheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
  "value"
> & {
  classNames?: {
    wrapper?: string;
    root?: string;
    rootChecked?: string;
  };
  isGroup?: boolean;
  defaultValue?: any;
  formValue: any;
  value?: any;
  errorMessage?: string;
  onChange: (value: any) => void;
};

/**
  A checkbox that looks like a button inside a box.
  
  @param isGroup - If true, you can add multiple values to the same field while selecting multiple checkboxes.
 */
const GhostButtonCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  GhostButtonCheckboxProps
>(
  (
    {
      classNames,
      value = true,
      onChange,
      defaultValue = false,
      formValue,
      isGroup = false,
      children,
      errorMessage,
      ...props
    },
    ref
  ) => {
    const uniqueId = useId();
    const [checked, setChecked] = useState<boolean | undefined>();

    // ------------------------------
    // set checked state on mount
    // ------------------------------
    useEffect(() => {
      if (checked === undefined) {
        if (isGroup) {
          if (Array.isArray(formValue)) {
            if (formValue.includes(value)) {
              setChecked(true);
            }
          }
        } else {
          if (String(formValue) === String(value)) {
            setChecked(true);
          }
        }
      }
    }, [checked, formValue, value, isGroup]);

    // ------------------------------
    // for individual selection, uncheck automatically if the value has changed to something else
    // ------------------------------
    useEffect(() => {
      if (!isGroup && checked === true) {
        if (String(formValue) !== String(value)) {
          setChecked(false);
        }
      }
    }, [checked, formValue, value, isGroup]);

    // ------------------------------
    // handle check change
    // ------------------------------
    const handleCheckChange = (e) => {
      setChecked(e);

      if (e === false) {
        // remove this item
        if (isGroup) {
          const data = formValue.filter((v) => v !== value);
          onChange(data);
        } else {
          onChange(defaultValue);
        }
      } else {
        // add this item
        if (isGroup) {
          if (Array.isArray(formValue)) {
            onChange([...formValue, value]);
          } else {
            onChange([value]);
          }
        } else {
          onChange(value);
        }
      }
    };
    return (
      <>
        <div className={cn("flex items-center space-x-2", classNames?.wrapper)}>
          <CheckboxPrimitive.Root
            ref={ref}
            id={uniqueId}
            className={cn(
              "relative flex h-full flex-col rounded-md border-2",
              checked && "border-primary",
              classNames?.root,
              checked && classNames?.rootChecked
            )}
            checked={checked}
            onCheckedChange={handleCheckChange}
            {...props}
          >
            {children}
            <CheckboxPrimitive.Indicator
              className={cn("flex items-center justify-center")}
            >
              <Check
                strokeWidth={4}
                className="absolute right-1 top-1 h-4 w-4 text-primary"
              />
            </CheckboxPrimitive.Indicator>
          </CheckboxPrimitive.Root>
        </div>
        {/* Error message */}
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </>
    );
  }
);
GhostButtonCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { GhostButtonCheckbox };
