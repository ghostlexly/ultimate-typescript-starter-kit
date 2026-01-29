import { useEffect, useState } from 'react';

/**
 * Hook that returns a debounced value
 * Useful for delaying API calls until the user stops typing
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebouncedValue(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This will only run 300ms after the user stops typing
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
