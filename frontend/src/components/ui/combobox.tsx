"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
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

/**
 * Combobox context type
 * Provides methods to control the combobox state
 */
type ComboboxContextValue = {
  onClose: () => void;
};

/**
 * Context for sharing combobox state between components
 * Enables automatic closing when an item is selected
 */
const ComboboxContext = React.createContext<ComboboxContextValue | undefined>(
  undefined
);

/**
 * Hook to access combobox context
 * Must be used within a Combobox component
 * @throws Error if used outside of Combobox
 */
const useCombobox = () => {
  const context = React.useContext(ComboboxContext);
  if (!context) {
    throw new Error("Combobox components must be used within a Combobox");
  }
  return context;
};

/**
 * Combobox root component
 * Wraps a Popover and manages open/close state
 * Supports both controlled and uncontrolled modes
 *
 * @example
 * // Uncontrolled (recommended)
 * <Combobox>
 *   <ComboboxTrigger asChild>
 *     <Button>Select...</Button>
 *   </ComboboxTrigger>
 *   <ComboboxContent>...</ComboboxContent>
 * </Combobox>
 *
 * @example
 * // Controlled
 * <Combobox open={open} onOpenChange={setOpen}>
 *   ...
 * </Combobox>
 */
function Combobox({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  ...props
}: React.ComponentProps<typeof Popover>) {
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

  // Use controlled value if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  // Handle open state changes for both controlled and uncontrolled modes
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      // Update internal state only in uncontrolled mode
      if (controlledOpen === undefined) {
        setInternalOpen(open);
      }
      // Always notify parent of changes
      onOpenChange?.(open);
    },
    [controlledOpen, onOpenChange]
  );

  // Callback to close the combobox (used by ComboboxItem)
  const onClose = React.useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  return (
    <ComboboxContext.Provider value={{ onClose }}>
      <Popover
        data-slot="combobox"
        open={isOpen}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </ComboboxContext.Provider>
  );
}

/**
 * ComboboxTrigger - The button/element that opens the combobox
 * Typically used with `asChild` prop to render a custom trigger (e.g., Button)
 *
 * @example
 * <ComboboxTrigger asChild>
 *   <Button>Select framework...</Button>
 * </ComboboxTrigger>
 */
function ComboboxTrigger({
  ...props
}: React.ComponentProps<typeof PopoverTrigger>) {
  return <PopoverTrigger data-slot="combobox-trigger" {...props} />;
}

/**
 * ComboboxAnchor - Optional anchor for positioning the combobox
 */
function ComboboxAnchor({ ...props }: React.ComponentProps<typeof Popover>) {
  return <Popover data-slot="combobox-anchor" {...props} />;
}

/**
 * ComboboxContent - The popover content wrapper
 * Automatically matches the width of the trigger element
 * Contains the Command component and search functionality
 *
 * @example
 * <ComboboxContent>
 *   <ComboboxCommand>...</ComboboxCommand>
 * </ComboboxContent>
 */
function ComboboxContent({
  className,
  align = "start",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      data-slot="combobox-content"
      align={align}
      sideOffset={sideOffset}
      className={cn("w-[--radix-popover-trigger-width] p-0", className)}
      {...props}
    />
  );
}

/**
 * ComboboxCommand - Wrapper for the Command component
 * Provides keyboard navigation and filtering functionality
 */
function ComboboxCommand({
  className,
  ...props
}: React.ComponentProps<typeof Command>) {
  return (
    <Command
      data-slot="combobox-command"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

/**
 * ComboboxInput - Search input field for filtering items
 *
 * @example
 * <ComboboxInput placeholder="Search frameworks..." />
 */
function ComboboxInput({
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  return <CommandInput data-slot="combobox-input" {...props} />;
}

/**
 * ComboboxList - Container for the list of items
 * Handles scrolling and overflow
 */
function ComboboxList({ ...props }: React.ComponentProps<typeof CommandList>) {
  return <CommandList data-slot="combobox-list" {...props} />;
}

/**
 * ComboboxEmpty - Displayed when no items match the search query
 *
 * @example
 * <ComboboxEmpty>No results found.</ComboboxEmpty>
 */
function ComboboxEmpty({
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  return <CommandEmpty data-slot="combobox-empty" {...props} />;
}

/**
 * ComboboxGroup - Groups related items together
 * Useful for categorizing options
 *
 * @example
 * <ComboboxGroup heading="Frameworks">
 *   <ComboboxItem>Next.js</ComboboxItem>
 *   <ComboboxItem>Remix</ComboboxItem>
 * </ComboboxGroup>
 */
function ComboboxGroup({
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return <CommandGroup data-slot="combobox-group" {...props} />;
}

/**
 * ComboboxItem - Individual selectable item in the combobox
 * Automatically closes the combobox when selected
 *
 * @example
 * <ComboboxItem
 *   value="next.js"
 *   onSelect={(value) => setValue(value)}
 * >
 *   <ComboboxItemIndicator checked={value === "next.js"} />
 *   Next.js
 * </ComboboxItem>
 */
function ComboboxItem({
  className,
  children,
  onSelect,
  ...props
}: React.ComponentProps<typeof CommandItem>) {
  const { onClose } = useCombobox();

  // Handle item selection and automatically close the combobox
  const handleSelect = (value: string) => {
    onSelect?.(value);
    onClose();
  };

  return (
    <CommandItem
      data-slot="combobox-item"
      className={cn("cursor-pointer", className)}
      onSelect={handleSelect}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

/**
 * ComboboxItemIndicator - Visual indicator (check icon) for selected items
 * Shows/hides based on the `checked` prop
 *
 * @example
 * <ComboboxItemIndicator checked={value === "next.js"} />
 */
function ComboboxItemIndicator({
  className,
  checked,
  ...props
}: React.ComponentProps<"div"> & { checked?: boolean }) {
  return (
    <div
      data-slot="combobox-item-indicator"
      className={cn(
        "flex items-center justify-center",
        checked ? "opacity-100" : "opacity-0",
        className
      )}
      {...props}
    >
      <Check className="h-4 w-4" />
    </div>
  );
}

export {
  Combobox,
  ComboboxTrigger,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxCommand,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxItemIndicator,
  useCombobox,
};
