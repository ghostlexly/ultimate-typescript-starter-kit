'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);

  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }

  return context;
}

/**
 * Sets breadcrumbs for the current page.
 * Automatically clears them on unmount.
 */
export function useSetBreadcrumbs(items: BreadcrumbItem[]) {
  const { setBreadcrumbs } = useBreadcrumb();
  const prevItemsRef = useRef<string>('');

  useEffect(() => {
    const serialized = JSON.stringify(items);

    if (prevItemsRef.current !== serialized) {
      prevItemsRef.current = serialized;
      setBreadcrumbs(items);
    }

    return () => {
      setBreadcrumbs([]);
    };
  }, [setBreadcrumbs, items]);
}
