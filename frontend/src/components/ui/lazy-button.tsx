"use client";

/** @author Tolga Malkoc <ghostlexly@gmail.com> */

import { cn } from "@/lib/utils";
import React, { lazy } from "react";
import RipplesEffect from "@/components/ui/effects/ripples";
import { cva, type VariantProps } from "class-variance-authority";

type LazyButtonProps = VariantProps<typeof variants> & {
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: (event) => void;
  className?: string;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  spinnerColor?: string;
};

const variants = cva(
  "relative rounded-lg text-sm font-medium normal-case transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary border-primary border text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-secondary border-secondary border hover:bg-secondary/80 text-secondary-foreground",
      },
    },
  }
);

/**
 * Add a submit button with a spinner for loading purpose.
 */
const LazyButton = React.forwardRef<HTMLButtonElement, LazyButtonProps>(
  (
    {
      isLoading = false,
      children,
      onClick,
      className,
      type = "button" as React.ButtonHTMLAttributes<HTMLButtonElement>["type"],
      variant = "primary",
      spinnerColor = "#ffffff",
      ...props
    },
    ref
  ) => {
    // -- handle on click event to prevent the submit if the button is on loading state
    // info: we can't use the disabled property cause it will stop the MUI's animation
    const handleClick = (event) => {
      if (!isLoading && onClick) {
        onClick(event);
      }
    };

    return (
      <button
        ref={ref}
        suppressHydrationWarning={true} // prevent hydration warning with Apple's Password extension adding control-id on buttons
        onClick={handleClick}
        className={cn(
          variants({ variant }),
          isLoading && "pointer-events-none cursor-not-allowed opacity-50",
          className
        )}
        type={type}
        {...props}
      >
        <>
          <RipplesEffect />
          <div>
            {isLoading ? (
              <div className="relative">
                {/* Loading Spinner */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                  <LoadingSpinner spinnerColor={spinnerColor} />
                </div>

                {/* Invisible content to keep the button height & width */}
                <div className="invisible">{children}</div>
              </div>
            ) : (
              <>{children}</>
            )}
          </div>
        </>
      </button>
    );
  }
);
LazyButton.displayName = "LazyButton";

const LoadingSpinner = ({ spinnerColor }) => {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg"
        fill={spinnerColor}
        className="h-9 w-9"
      >
        <circle cx="15" cy="15" r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          ></animate>
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          ></animate>
        </circle>
        <circle cx="60" cy="15" r="9" fillOpacity="0.3">
          <animate
            attributeName="r"
            from="9"
            to="9"
            begin="0s"
            dur="0.8s"
            values="9;15;9"
            calcMode="linear"
            repeatCount="indefinite"
          ></animate>
          <animate
            attributeName="fill-opacity"
            from="0.5"
            to="0.5"
            begin="0s"
            dur="0.8s"
            values=".5;1;.5"
            calcMode="linear"
            repeatCount="indefinite"
          ></animate>
        </circle>
        <circle cx="105" cy="15" r="15">
          <animate
            attributeName="r"
            from="15"
            to="15"
            begin="0s"
            dur="0.8s"
            values="15;9;15"
            calcMode="linear"
            repeatCount="indefinite"
          ></animate>
          <animate
            attributeName="fill-opacity"
            from="1"
            to="1"
            begin="0s"
            dur="0.8s"
            values="1;.5;1"
            calcMode="linear"
            repeatCount="indefinite"
          ></animate>
        </circle>
      </svg>
    </div>
  );
};

export default LazyButton;
