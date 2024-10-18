import { cn } from "@/lib/utils";
import { useDebouncedCallback } from "@mantine/hooks";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type GhostComboboxProps = {
  label: string;
  value: string;
  options?: Array<any>;
  isClearable?: boolean;
  isSearchable?: boolean;
  classNames?: {
    wrapper?: string;
    button?: string;
    popoverContent?: string;
  };
  onChange: (value: any) => void;
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => string;
  loadOptions?: (inputValue: string) => any;
  loadDefaultOption?: () => any;
  errorMessage?: string;
  commandEmptyMessage?: string;
};

const GhostCombobox = forwardRef<HTMLInputElement, GhostComboboxProps>(
  (
    {
      label,
      value,
      options = [],
      isClearable = false,
      isSearchable = false,
      classNames,
      onChange,
      getOptionLabel = (option) => option?.label,
      getOptionValue = (option) => option?.value,
      loadOptions,
      loadDefaultOption,
      errorMessage,
      commandEmptyMessage,
      ...props
    },
    ref
  ) => {
    const [canAnimate, setCanAnimate] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [hasLoadedOnMount, setHasLoadedOnMount] = useState(false);
    const [hasLoadedDefaultOption, setHasLoadedDefaultOption] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<any | null>(null);
    const [internalOptions, setInternalOptions] = useState(options);
    const [isLoading, setIsLoading] = useState(false);

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
    // activate the label (top animation)
    // if the selected option is not null
    // ----------------------------------------
    useEffect(() => {
      if (selectedOption !== null) {
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }, [selectedOption]);

    // ----------------------------------------
    // load options (local filter)
    // this function is called each time we type something in the input bar
    // we send the results to the callback function
    // ----------------------------------------
    if (loadOptions === undefined) {
      loadOptions = async (inputValue: string) => {
        const results = options.filter((option: any) => {
          const label = getOptionLabel(option);
          const value = getOptionValue(option);

          if (value?.toLowerCase().includes(inputValue.toLowerCase())) {
            return option;
          }

          // -- if the default options are already loaded (because we need to search only by value received from the form first), we also check the label
          if (hasLoadedDefaultOption) {
            if (label?.toLowerCase().includes(inputValue.toLowerCase())) {
              return option;
            }
          }

          return null;
        });

        return results;
      };
    }

    // ----------------------------------------
    // debounce the loadOptions function
    // to avoid too many API calls when typing
    // ----------------------------------------
    const debouncedLoadOptions = useDebouncedCallback(
      async (inputValue: string) => {
        const filteredResults = await loadOptions(inputValue);
        setInternalOptions(filteredResults);
        setIsLoading(false);
      },
      200
    );

    // ----------------------------------------
    // clear the value
    // ----------------------------------------
    const clearValue = (event) => {
      event.stopPropagation();
      event.preventDefault();

      setSelectedOption(null);
      onChange("");
      setOpen(false);
      setInternalOptions(options);
    };

    // ----------------------------------------
    // on mount, if the value prop is empty,
    // load the options by default to display the first options instead of an empty list
    // ----------------------------------------
    useEffect(() => {
      if (
        hasLoadedOnMount === false &&
        value === "" &&
        selectedOption === null
      ) {
        debouncedLoadOptions("");
        setHasLoadedOnMount(true);
      }
    }, [debouncedLoadOptions, hasLoadedOnMount, value, selectedOption]);

    // ----------------------------------------
    // select the default value from the options array on mount
    // --
    // if a value (string) prop is provided
    // and the selectedOption is null (it's the default state of the component on mount)
    // ----------------------------------------
    const defaultLoadDefaultOption = useCallback(async () => {
      if (value && selectedOption === null) {
        return await loadOptions(value);
      }

      return [];
    }, [value, selectedOption, loadOptions]);

    useEffect(() => {
      const load = async () => {
        if (!hasLoadedDefaultOption) {
          let results: any[] = [];

          if (loadDefaultOption !== undefined) {
            results = await loadDefaultOption();
          } else {
            results = await defaultLoadDefaultOption();
          }

          if (results.length > 0) {
            setSelectedOption(results[0]);
          }

          setHasLoadedDefaultOption(true);
        }
      };

      load();
    }, [
      value,
      selectedOption,
      loadOptions,
      loadDefaultOption,
      defaultLoadDefaultOption,
      hasLoadedDefaultOption,
    ]);

    // ----------------------------------------
    // transmit the selected option to the form
    // --
    // if the value prop is different from the selectedOption value
    // and the selectedOption is not null (it's the default state of the component on mount)
    // ----------------------------------------
    useEffect(() => {
      if (value !== getOptionValue(selectedOption) && selectedOption !== null) {
        onChange(selectedOption);
      }
    }, [selectedOption, onChange, value, getOptionValue]);

    return (
      <>
        <div className="relative">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              {/* Input container */}
              <div
                className={cn(
                  "relative flex w-full cursor-pointer rounded-md border bg-background px-2 py-3 transition-all duration-500 ease-in-out focus-within:border-gray-500",
                  classNames?.wrapper,
                  errorMessage && "border-red-500"
                )}
              >
                {/* input */}
                <div
                  className={cn(
                    "peer flex w-full items-center justify-between focus:outline-none",
                    classNames?.button
                  )}
                >
                  {/* left items */}
                  <div
                    className={cn("translate-y-2", !isActive && "invisible")}
                  >
                    {selectedOption ? (
                      <>{getOptionLabel(selectedOption)}</>
                    ) : (
                      <>Placeholder</>
                    )}
                  </div>

                  {/* right items */}
                  <div className="flex items-center gap-2">
                    {/* clear button */}
                    {isClearable && (
                      <X
                        className={cn(
                          "h-4 w-4 shrink-0 opacity-50",
                          selectedOption ? "opacity-50" : "hidden"
                        )}
                        onClick={clearValue}
                      />
                    )}

                    {/* chevrons */}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </div>

                {/* Label top */}
                <div
                  className={cn(
                    "pointer-events-none absolute left-2 top-3 origin-left transform text-[0.750rem] text-foreground/60 transition-all",
                    canAnimate ? "duration-500" : "duration-0",
                    isActive
                      ? "-translate-y-1/2 opacity-75"
                      : "translate-y-0 opacity-0"
                  )}
                >
                  {label}
                </div>

                {/* Label center */}
                <div
                  className={cn(
                    "pointer-events-none absolute left-2 origin-left text-base font-normal text-foreground/60 transition-all",
                    canAnimate ? "duration-100" : "duration-0",
                    isActive ? "opacity-0" : "opacity-75 duration-1000"
                  )}
                >
                  {label}
                </div>
              </div>
            </PopoverTrigger>

            <PopoverContent
              className={cn("p-0", classNames?.popoverContent)}
              align="start"
            >
              <Command
                shouldFilter={false}
                defaultValue={getOptionValue(selectedOption)}
              >
                <CommandInput
                  placeholder="Rechercher..."
                  isLoading={isLoading}
                  onValueChange={async (inputValue: string) => {
                    // -- if the input is empty, reset the options
                    if (inputValue === "" || inputValue === null) {
                      debouncedLoadOptions("");
                      return;
                    }

                    // -- load the options (filter)
                    setIsLoading(true);
                    debouncedLoadOptions(inputValue);
                  }}
                />
                <CommandList>
                  <CommandEmpty>
                    {commandEmptyMessage || "Aucun résultat."}
                  </CommandEmpty>

                  <CommandGroup>
                    {internalOptions.map((item) => (
                      <CommandItem
                        key={JSON.stringify(item)}
                        value={getOptionValue(item)}
                        onSelect={(value) => {
                          setSelectedOption(item);
                          setOpen(false);

                          // -- reset the options after a short delay
                          setTimeout(() => {
                            debouncedLoadOptions("");
                          }, 200);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              getOptionValue(item) ===
                                getOptionValue(selectedOption)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />

                          <div>{getOptionLabel(item)}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Error message */}
          {errorMessage && (
            <p className="text-sm text-red-500">{errorMessage}</p>
          )}
        </div>
      </>
    );
  }
);
GhostCombobox.displayName = "GhostCombobox";

export { GhostCombobox };
