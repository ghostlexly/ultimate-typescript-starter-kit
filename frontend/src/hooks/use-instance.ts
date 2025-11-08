import { useState, useEffect } from "react";

/*
 * This hook returns the window and navigator objects.
 */
const useInstance = () => {
  const [instance, setInstance] = useState<{
    window: Window | null;
    navigator: Navigator | null;
  }>({
    window: null,
    navigator: null,
  });

  useEffect(() => {
    // S'assure que window et navigator sont disponibles (côté client uniquement)
    if (typeof window !== "undefined") {
      setInstance({
        window: window,
        navigator: navigator,
      });
    }
  }, []);

  return instance;
};

export { useInstance };
