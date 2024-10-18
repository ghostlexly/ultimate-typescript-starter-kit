import { forwardRef } from "react";
import { PatternFormat, PatternFormatProps } from "react-number-format";
import { GhostInput } from "@/components/ui/inputs/ghost-input";

type DateInputProps = Omit<PatternFormatProps, "format"> & {
  label: string;
  errorMessage?: string;
};

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ label, errorMessage, ...props }, ref) => (
    <PatternFormat
      {...props}
      format="##/##/####" // Format Date with slashes every 2 characters for the user
      mask={"_"}
      // -- Custom input props
      customInput={GhostInput}
      getInputRef={ref} // Pass the ref to the customInput
      label={label}
      errorMessage={errorMessage}
    />
  )
);
DateInput.displayName = "DateInput";
