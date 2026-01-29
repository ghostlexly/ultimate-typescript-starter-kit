import { cn } from '@/lib/utils';

const LoadingSpinner = ({ className }: { className?: string }) => {
  return (
    <>
      <style>
        {`
          .loader {
            --_m: conic-gradient(#0000 10%, #000),
                  linear-gradient(#000 0 0) content-box;
            -webkit-mask: var(--_m);
                    mask: var(--_m);
            -webkit-mask-composite: source-out;
                    mask-composite: subtract;
          }
        `}
      </style>
      <div
        role="status"
        aria-label="Loading"
        className={cn(
          'loader aspect-square size-4 animate-[spin_0.5s_linear_infinite] rounded-full bg-black p-[5px]',
          className,
        )}
      />
    </>
  );
};

export { LoadingSpinner };
