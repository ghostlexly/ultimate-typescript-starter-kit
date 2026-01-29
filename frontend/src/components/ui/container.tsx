'use client';

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const containerVariants = cva('flex flex-1 flex-col', {
  variants: {
    variant: {
      centered: 'max-w-7xl mx-auto',
      full: '',
    },
  },
  defaultVariants: {
    variant: 'full',
  },
});

const Container = ({
  children,
  className = '',
  variant,
}: ContainerProps & VariantProps<typeof containerVariants>) => {
  return (
    <div className={containerVariants({ variant })}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div
          className={cn(
            'flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export { Container };
