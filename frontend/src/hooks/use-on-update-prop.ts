import { useState } from 'react';

export function useOnUpdateProp<T>(value: T, callback: (value: T) => void) {
  const [prevValue, setPrevValue] = useState<T>(value);

  if (prevValue !== value) {
    setPrevValue(value);

    callback(value);
  }
}
