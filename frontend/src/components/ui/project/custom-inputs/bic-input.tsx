import { ChangeEvent, forwardRef } from "react";
import { NumberFormatBase, NumberFormatBaseProps } from "react-number-format";
import { GhostInput } from "@/components/ui/inputs/ghost-input";

type BICInputProps = NumberFormatBaseProps & {
  label: string;
  errorMessage?: string;
};

export const BICInput = forwardRef<HTMLInputElement, BICInputProps>(
  ({ label, errorMessage, ...props }, ref) => (
    <NumberFormatBase
      // Format BIC by allowing only letters and digits, without spaces
      format={(value) =>
        value
          .replace(/\s+/g, "")
          .replace(/[^A-Z0-9]/gi, "")
          .toLocaleUpperCase()
      }
      // A function given a formatted string, returns boundaries of valid cursor position.
      getCaretBoundary={(value) =>
        Array(value.length + 1)
          .fill(0)
          .map((v) => true)
      }
      // Allowed characters, prevent any other characters
      onKeyDown={(e) =>
        !/^(?:[a-z0-9]|Backspace|Delete|Home|End|ArrowLeft|ArrowRight|Shift|CapsLock|Control|NumLock|Tab|Paste|Redo|Undo)$/i.test(
          e.key
        ) && e.preventDefault()
      }
      // Remove spaces and invalid characters on the form's final value
      removeFormatting={(value) =>
        value.replace(/\s+/gi, "").replace(/[^A-Z0-9]/gi, "")
      }
      // When the value changes, we update form's final value with removeFormatting's result
      onValueChange={(values, { event }) => {
        props?.onChange?.(
          Object.assign({} as ChangeEvent<HTMLInputElement>, event, {
            target: {
              name: props.name,
              value: values.value.toLocaleUpperCase(),
            },
          })
        );
      }}
      // -- Custom input props
      customInput={GhostInput}
      getInputRef={ref} // Pass the ref to the customInput
      label={label}
      errorMessage={errorMessage}
    />
  )
);
BICInput.displayName = "BICInput";
