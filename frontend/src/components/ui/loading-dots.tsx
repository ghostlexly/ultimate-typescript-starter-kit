"use client";

/** @author GhostLexly <ghostlexly@gmail.com> */

import React from "react";
import { cn } from "@/lib/utils";

const LoadingDots = ({
  color = "black",
  className,
}: {
  color?: string;
  className?: string;
}): React.ReactElement => {
  return (
    <div className={cn("flex size-16 space-x-2", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-[20%] w-[20%] animate-bounce rounded-full"
          style={{
            backgroundColor: color,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export { LoadingDots };
