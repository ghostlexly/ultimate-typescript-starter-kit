"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCommand,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

export interface SingleSelectComboboxItem {
  value: string;
  label: string;
}

export interface SingleSelectComboboxProps<T extends SingleSelectComboboxItem>
  extends Omit<
    React.ComponentPropsWithoutRef<"button">,
    "value" | "onChange" | "children"
  > {
  items: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  getItemKeywords?: (item: T) => string[];
  renderItem?: (item: T) => React.ReactNode;
  onSearchChange?: (search: string) => void;
  shouldFilter?: boolean;
}

/**
 * SingleSelectCombobox - A reusable single-select combobox component
 *
 * Follows shadcn/ui design patterns and works seamlessly with react-hook-form
 */
export function SingleSelectCombobox<T extends SingleSelectComboboxItem>({
  items,
  value,
  onChange,
  placeholder = "Select item...",
  emptyMessage = "No items found.",
  searchPlaceholder = "Search...",
  className,
  disabled = false,
  loading = false,
  getItemKeywords,
  renderItem,
  onSearchChange,
  shouldFilter = true,
  ...buttonProps
}: SingleSelectComboboxProps<T>) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open);

      if (!open) {
        onSearchChange?.("");
      }
    },
    [onSearchChange]
  );

  const handleSelect = useCallback(
    (selectedValue: string) => {
      const selectedItem = items.find((item) => item.value === selectedValue);

      if (!selectedItem) {
        return;
      }

      if (value?.value === selectedValue) {
        onChange(null);
      } else {
        onChange(selectedItem);
      }
    },
    [items, onChange, value]
  );

  const defaultRenderItem = useCallback((item: T) => item.label, []);
  const itemRenderer = renderItem || defaultRenderItem;

  return (
    <Combobox open={open} onOpenChange={handleOpenChange} loading={loading}>
      <ComboboxTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("justify-between", className)}
          disabled={disabled}
          {...buttonProps}
        >
          {value ? (
            <span>{value.label}</span>
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
                <ComboboxItem
                  key={item.value}
                  value={item.value}
                  keywords={getItemKeywords?.(item)}
                  onSelect={handleSelect}
                >
                  <ComboboxItemIndicator
                    checked={value?.value === item.value}
                  />
                  {itemRenderer(item)}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxCommand>
      </ComboboxContent>
    </Combobox>
  );
}
