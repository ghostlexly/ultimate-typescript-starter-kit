'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useLayoutEffect,
  useRef,
} from 'react';
import { usePathname } from 'next/navigation';
import { useOnUpdateProp } from '@/hooks/use-on-update-prop';

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
  const pathname = usePathname();

  useOnUpdateProp(pathname, () => {
    setBreadcrumbs([]);
  });

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
 * Does not clear on unmount — the next page overwrites them,
 * avoiding a flash of empty/loading state between navigations.
 */
export function useSetBreadcrumbs(items: BreadcrumbItem[]) {
  const { setBreadcrumbs } = useBreadcrumb();
  const prevItemsRef = useRef<string>('');

  useLayoutEffect(() => {
    const serialized = JSON.stringify(items);

    if (prevItemsRef.current !== serialized) {
      prevItemsRef.current = serialized;
      setBreadcrumbs(items);
    }
  }, [setBreadcrumbs, items]);
}
