import { forwardRef } from "react";
import { PatternFormat, PatternFormatProps } from "react-number-format";
import { GhostInput } from "@/components/ui/inputs/ghost-input";

type CustomFormatInputProps = PatternFormatProps & {
  label: string;
  errorMessage?: string;
};

export const CustomFormatInput = forwardRef<
  HTMLInputElement,
  CustomFormatInputProps
>(({ label, errorMessage, format, ...props }, ref) => (
  <PatternFormat
    {...props}
    format={format} // Format Date with slashes every 2 characters for the user
    mask={"_"}
    // -- Custom input props
    customInput={GhostInput}
    getInputRef={ref} // Pass the ref to the customInput
    label={label}
    errorMessage={errorMessage}
  />
));
CustomFormatInput.displayName = "CustomFormatInput";
