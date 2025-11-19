"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCommand,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { CommandItem } from "@/components/ui/command";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

export interface MultiSelectComboboxItem {
  value: string;
  label: string;
}

export interface MultiSelectComboboxProps<T extends MultiSelectComboboxItem>
  extends Omit<
    React.ComponentPropsWithoutRef<"button">,
    "value" | "onChange" | "children"
  > {
  items: T[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  getItemKeywords?: (item: T) => string[];
  renderBadge?: (item: T) => React.ReactNode;
  renderItem?: (item: T) => React.ReactNode;
  onSearchChange?: (search: string) => void;
  shouldFilter?: boolean;
}

/**
 * MultiSelectCombobox - A reusable multi-select combobox component
 *
 * Follows shadcn/ui design patterns and works seamlessly with react-hook-form
 */
export function MultiSelectCombobox<T extends MultiSelectComboboxItem>({
  items,
  value,
  onChange,
  placeholder = "Select items...",
  emptyMessage = "No items found.",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
  loading = false,
  getItemKeywords,
  renderBadge,
  renderItem,
  onSearchChange,
  shouldFilter = true,
  ...buttonProps
}: MultiSelectComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const isItemSelected = useCallback(
    (itemValue: string) => {
      return value.some((item) => item.value === itemValue);
    },
    [value]
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Update the open state
      setOpen(open);

      // Clear the search input on popover close
      onSearchChange?.("");
    },
    [onSearchChange]
  );

  const toggleItem = useCallback(
    (item: T) => {
      if (isItemSelected(item.value)) {
        onChange(value.filter((v) => v.value !== item.value));
      } else {
        onChange([...value, item]);
      }
    },
    [isItemSelected, onChange, value]
  );

  const removeItem = useCallback(
    (itemValue: string) => {
      onChange(value.filter((v) => v.value !== itemValue));
    },
    [onChange, value]
  );

  const defaultRenderItem = useCallback((item: T) => item.label, []);
  const defaultRenderBadge = useCallback((item: T) => item.label, []);

  const itemRenderer = renderItem || defaultRenderItem;
  const badgeRenderer = renderBadge || defaultRenderBadge;

  return (
    <>
      <Combobox open={open} onOpenChange={handleOpenChange} loading={loading}>
        <ComboboxTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn("justify-between", className)}
            disabled={disabled}
            {...buttonProps}
          >
            {value.length > 0 ? (
              <span>
                {value.length === 1 ? "1 item" : `${value.length} items`}{" "}
                selected
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxCommand shouldFilter={shouldFilter}>
            <ComboboxInput
              placeholder={searchPlaceholder}
              onValueChange={onSearchChange}
            />
            <ComboboxList>
              <ComboboxEmpty>
                <div className="text-center px-2">{emptyMessage}</div>
              </ComboboxEmpty>
              <ComboboxGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    keywords={getItemKeywords?.(item)}
                    onSelect={() => {
                      toggleItem(item);
                    }}
                    className="cursor-pointer"
                  >
                    <ComboboxItemIndicator
                      checked={isItemSelected(item.value)}
                    />
                    {itemRenderer(item)}
                  </CommandItem>
                ))}
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxCommand>
        </ComboboxContent>
      </Combobox>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge key={item.value} variant="secondary" className="gap-1">
              {badgeRenderer(item)}
              <button
                type="button"
                onClick={() => removeItem(item.value)}
                className="hover:bg-destructive/20 rounded-full"
                disabled={disabled}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </>
  );
}
