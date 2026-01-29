'use client';

import { Badge } from '@/components/ui/badge';
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
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallback, useState } from 'react';

/**
 * Access nested properties using dot notation (e.g., "account.email")
 */
const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export interface MultiSelectComboboxProps<T extends Record<string, any>> extends Omit<
  React.ComponentPropsWithoutRef<'button'>,
  'value' | 'onChange' | 'children'
> {
  items: T[];
  value: T[];
  onChange: (value: T[]) => void;
  valueKey?: string;
  renderLabel?: (item: T) => React.ReactNode;
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
 * Features:
 * - Searchable dropdown with keyboard navigation
 * - Multiple item selection with badges
 * - Loading state support
 * - Custom item and badge rendering
 * - Works seamlessly with react-hook-form
 * - Accessible with ARIA roles
 * - Custom value and label keys (supports nested paths like "account.email")
 */
const defaultRenderLabel = (item: Record<string, any>) => String(item.label);

export function MultiSelectCombobox<T extends Record<string, any>>({
  items,
  value,
  onChange,
  valueKey = 'value',
  renderLabel = defaultRenderLabel,
  placeholder = 'Select items...',
  emptyMessage = 'No items found.',
  searchPlaceholder = 'Search...',
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

  const getValue = useCallback((item: T) => getNestedValue(item, valueKey), [valueKey]);

  const isItemSelected = useCallback(
    (itemValue: string) => {
      return value.some((item) => String(getValue(item)) === itemValue);
    },
    [value, getValue],
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen);

      if (!newOpen) {
        onSearchChange?.('');
      }
    },
    [onSearchChange],
  );

  const toggleItem = useCallback(
    (item: T) => {
      const itemValue = String(getValue(item));
      if (isItemSelected(itemValue)) {
        onChange(value.filter((v) => String(getValue(v)) !== itemValue));
      } else {
        onChange([...value, item]);
      }
    },
    [isItemSelected, onChange, value, getValue],
  );

  const removeItem = useCallback(
    (itemValue: string) => {
      onChange(value.filter((v) => String(getValue(v)) !== itemValue));
    },
    [onChange, value, getValue],
  );

  const itemRenderer = renderItem || renderLabel;
  const badgeRenderer = renderBadge || renderLabel;

  return (
    <>
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
            {value.length > 0 ? (
              <span>
                {value.length === 1 ? '1 item' : `${value.length} items`} selected
              </span>
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
            <CommandInput
              placeholder={searchPlaceholder}
              onValueChange={onSearchChange}
            />
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
                          onSelect={() => toggleItem(item)}
                          className="cursor-pointer"
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center',
                              isItemSelected(itemValue) ? 'opacity-100' : 'opacity-0',
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

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => {
            const itemValue = String(getValue(item));
            return (
              <Badge key={itemValue} variant="secondary" className="gap-1">
                {badgeRenderer(item)}
                <button
                  type="button"
                  onClick={() => removeItem(itemValue)}
                  className="hover:bg-destructive/20 rounded-full"
                  disabled={disabled}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </>
  );
}
