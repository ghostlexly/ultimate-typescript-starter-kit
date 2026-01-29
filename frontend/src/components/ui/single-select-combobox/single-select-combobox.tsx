'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

/**
 * Access nested properties using dot notation (e.g., "account.email")
 */
const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export interface SingleSelectComboboxProps<T extends Record<string, any>> extends Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'value' | 'onChange' | 'children'
> {
  items: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  valueKey?: string;
  renderLabel?: (item: T) => React.ReactNode;
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
 * Features:
 * - Searchable dropdown with keyboard navigation
 * - Loading state support
 * - Custom item rendering
 * - Works seamlessly with react-hook-form
 * - Accessible with ARIA roles
 * - Custom value and label keys
 */
const defaultRenderLabel = (item: Record<string, any>) => String(item.label);

export function SingleSelectCombobox<T extends Record<string, any>>({
  items,
  value,
  onChange,
  valueKey = 'value',
  renderLabel = defaultRenderLabel,
  placeholder = 'Select item...',
  emptyMessage = 'No items found.',
  searchPlaceholder = 'Search...',
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

  const getValue = useCallback((item: T) => getNestedValue(item, valueKey), [valueKey]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);

      if (!newOpen) {
        onSearchChange?.('');
      }
    },
    [onSearchChange],
  );

  const handleSelect = useCallback(
    (selectedValue: string) => {
      const selectedItem = items.find((item) => String(getValue(item)) === selectedValue);

      if (!selectedItem) {
        return;
      }

      if (value && String(getValue(value)) === selectedValue) {
        onChange(null);
      } else {
        onChange(selectedItem);
      }

      onSearchChange?.('');
      setOpen(false);
    },
    [items, onChange, value, onSearchChange, getValue],
  );

  const itemRenderer = renderItem || renderLabel;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', className)}
          disabled={disabled}
          {...buttonProps}
        >
          {value ? (
            <span>{renderLabel(value)}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <Command shouldFilter={shouldFilter} className="overflow-hidden">
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearchChange} />
          <CommandList>
            {loading ? (
              <CommandEmpty>
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              </CommandEmpty>
            ) : (
              <>
                <CommandEmpty>
                  <div className="px-2 text-center">{emptyMessage}</div>
                </CommandEmpty>
                <CommandGroup>
                  {items.map((item) => {
                    const itemValue = String(getValue(item));
                    return (
                      <CommandItem
                        key={itemValue}
                        value={itemValue}
                        keywords={getItemKeywords?.(item)}
                        onSelect={handleSelect}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center',
                            value && String(getValue(value)) === itemValue
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        {itemRenderer(item)}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
