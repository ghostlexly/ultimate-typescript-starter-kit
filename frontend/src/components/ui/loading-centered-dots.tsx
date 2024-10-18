import { cn } from "@/lib/utils";

type LoadingCenteredDotsProps = {
  className?: string;
  backgroundColor?: string;
};

const LoadingCenteredDots = ({
  className,
  backgroundColor = "bg-neutral-300",
}: LoadingCenteredDotsProps) => {
  return (
    <>
      <div className={cn("flex space-x-1", className)}>
        <div
          className={cn("animate-fade h-1 w-1 rounded-full", backgroundColor)}
        />
        <div
          className={cn(
            "animate-fade h-1 w-1 rounded-full delay-75",
            backgroundColor
          )}
        />
        <div
          className={cn(
            "animate-fade h-1 w-1 rounded-full delay-150",
            backgroundColor
          )}
        />
      </div>
    </>
  );
};

export { LoadingCenteredDots };
