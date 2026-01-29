import { useRef } from 'react';

export function useFirstMount(callback?: () => void): boolean {
  const isFirstMountRef = useRef(true);

  if (isFirstMountRef.current) {
    isFirstMountRef.current = false;
    callback?.();

    return true;
  }

  return false;
}
