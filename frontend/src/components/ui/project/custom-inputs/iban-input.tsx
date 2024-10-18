import { ChangeEvent, forwardRef } from "react";
import { NumberFormatBase, NumberFormatBaseProps } from "react-number-format";
import { GhostInput } from "@/components/ui/inputs/ghost-input";

type IBANInputProps = NumberFormatBaseProps & {
  label: string;
  errorMessage?: string;
};

export const IBANInput = forwardRef<HTMLInputElement, IBANInputProps>(
  ({ label, errorMessage, ...props }, ref) => (
    <NumberFormatBase
      // Format IBAN with spaces every 4 characters for the user
      format={(value) =>
        value
          .replace(/\s+/g, "")
          .replace(/([a-z0-9]{4})/gi, "$1 ")
          .trim()
          .toLocaleUpperCase()
      }
      // A function given a formatted string, returns boundaries of valid cursor position. basically an array of boolean, where index of specify caret position. true at a index signifies user can put their caret at the position, false means the caret position is not allowed and the caret will move to closet allowed position.
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
      // Remove spaces on the form's final value
      removeFormatting={(value) => value.replace(/\s+/gi, "")}
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
IBANInput.displayName = "IBANInput";
