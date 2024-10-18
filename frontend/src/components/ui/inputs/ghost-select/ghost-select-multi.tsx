"use client";

import { Check } from "lucide-react";
import { components, OptionProps } from "react-select";

import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { forwardRef, useEffect, useState } from "react";
import SelectPrimitive from "react-select/async-creatable";

type GhostSelectMultiProps = React.ComponentProps<typeof SelectPrimitive> & {
  label: string;
  value: SelectOption[];
  className?: string;
  isCreatable?: boolean;
  options?: SelectOption[];
  errorMessage?: string;
};

type SelectOption = {
  value: string;
  label: string;
};

/**
 * @param isSearchable - Whether the user can search for an option. (like a Combobox)
 * @param isClearable - Display a clear button to reset the value.
 * @param isCreatable - Allow the user to create a new option.
 * @param options - The options should have a "value" and "label" property. The label property can be a string or a ReactNode (DOM Elem).
 * @param loadOptions - give a custom function to load options from an API. This function is ran each time we type something in the input bar.
 * @param formatCreateLabel - A function that returns a string to display when the user creates a new option. (same as translations)
 * @param noOptionsMessage - A function that returns a string to display when there are no results. Ex: Saisissez un code postal pour l'ajouter ✍️
 */
const GhostSelectMulti = forwardRef<HTMLInputElement, GhostSelectMultiProps>(
  (
    {
      label,
      value,
      options,
      loadOptions,
      className,
      isCreatable = false,
      isSearchable = true,
      errorMessage,
      ...props
    },
    ref
  ) => {
    const [canAnimate, setCanAnimate] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [internalOptions, setInternalOptions] = useState(options ?? []);

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
    // debounce the loadOptions function
    // to avoid too many API calls when typing
    // ----------------------------------------
    const debouncedLoadOptions = useDebouncedCallback(
      async (inputValue: string, callback: any) => {
        if (loadOptions) {
          const results = await loadOptions(inputValue, callback);
          callback(results);
        }
      },
      200
    );

    // ----------------------------------------
    // filter options by label & value on local
    // ----------------------------------------
    const loadOptionsLocal = (inputValue: string) =>
      new Promise<any>((resolve) => {
        if (!internalOptions) {
          return resolve([]);
        }

        const found = internalOptions.filter((option: SelectOption) => {
          if (option.label.toLowerCase().includes(inputValue.toLowerCase())) {
            return option;
          }

          if (option.value.toLowerCase().includes(inputValue.toLowerCase())) {
            return option;
          }

          return null;
        });

        return resolve(found);
      });

    // ------------------
    // check if i can create a new option ?
    // ------------------
    const isValidNewOption = (inputValue, value, options) => {
      if (isCreatable && inputValue.length > 0) {
        return true;
      }

      return false;
    };

    // ----------------------------------------
    // check if i can activate the input on new item selection
    // ----------------------------------------
    useEffect(() => {
      if (value && value.length > 0) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }, [value]);

    // ------------------
    // override styles
    // ------------------
    props.classNames = {
      valueContainer: (state) =>
        cn(
          "relative flex w-full rounded-md border border-gray-300 pl-2 pr-10 py-3 focus-within:border-gray-500 transition-all ease-in-out duration-500",
          errorMessage && "border-red-500",
          "pt-5",
          props.classNames?.valueContainer
        ),

      // input
      control: (state) => cn("!border-0", props.classNames?.control),
      input: (state) =>
        cn(
          "peer !translate-y-2 placeholder:text-transparent focus:outline-none pr-6",
          !isActive && "!translate-y-0",
          isActive && "!translate-y-0"
        ),
      placeholder: (state) => cn("text-gray-500"),
      clearIndicator: (state) => cn("!cursor-pointer"),
      indicatorsContainer: (state) =>
        cn(
          "absolute right-2 inset-y-0 text-muted-foreground peer-focus-within:text-black"
        ),

      // selected result label
      singleValue: (state) => cn("translate-y-2"),

      // multi select tags
      multiValue: (state) =>
        cn("flex bg-gray-200 mr-3 px-2 my-2 rounded-md hover:bg-gray-300"),

      // dropdown menu
      menu: (state) =>
        cn("rounded-md bg-white shadow-xl border border-gray-300 mt-1 !z-20"),
      menuList: (state) => cn("py-1"),
      option: (state) =>
        cn(
          "relative cursor-pointer hover:bg-gray-50 p-2 !text-xs !font-normal",
          state.isSelected && "bg-muted",
          state.isFocused && "bg-gray-50"
        ),
    };

    // ------------------
    // override components
    // ------------------
    props.components = {
      Option: ({ ...props }: OptionProps) => {
        return <OptionOverride {...props} />;
      },
    };

    return (
      <div>
        <div className="relative">
          <SelectPrimitive
            onInputChange={(inputValue) => {
              if (inputValue.length > 0) {
                setIsActive(true);
              }
            }}
            isMulti
            isSearchable={isSearchable}
            // 👇 the default options that are shown by default
            defaultOptions={internalOptions}
            // 👇 if a custom loadOptions (ex: remote API call) function is provided, we use it as debounced - If not, we use the local function to filter options.
            loadOptions={loadOptions ? debouncedLoadOptions : loadOptionsLocal}
            // 👇 a blank placeholder to avoid the default "Select..." message
            placeholder={" "}
            // 👇 translations
            noOptionsMessage={({ inputValue }) => "Aucun résultat."}
            loadingMessage={({ inputValue }) => "Veuillez patienter..."}
            formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
            isValidNewOption={isValidNewOption}
            value={value}
            unstyled
            {...props}
          />

          {/* Label top */}
          <label
            className={cn(
              "pointer-events-none absolute left-2 top-3 origin-left transform text-[0.750rem] text-gray-600 transition-all",
              canAnimate ? "duration-500" : "duration-0",
              isActive
                ? "-translate-y-1/2 opacity-75"
                : "translate-y-0 opacity-0"
            )}
          >
            {label}
          </label>

          {/* Label center */}
          <label
            className={cn(
              "pointer-events-none absolute left-2 top-1/2 origin-left -translate-y-1/2 text-base font-normal text-gray-600 transition-all",
              canAnimate ? "duration-100" : "duration-0",
              isActive ? "opacity-0" : "opacity-75 duration-1000"
            )}
          >
            {label}
          </label>
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="whitespace-pre-wrap text-sm text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
GhostSelectMulti.displayName = "GhostSelectMulti";

const OptionOverride = ({ children, ...props }: OptionProps) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center gap-2">
        <Check
          className={cn(
            "h-4 w-4 shrink-0",
            props.isSelected ? "opacity-100" : "opacity-0"
          )}
        />

        <div>{children}</div>
      </div>
    </components.Option>
  );
};

export { GhostSelectMulti };
