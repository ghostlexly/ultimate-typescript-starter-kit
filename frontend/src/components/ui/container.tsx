"use client";

import { cn } from "@/lib/utils";

const Container = ({ children, className = "" }) => {
  return (
    <div className={cn("container mx-auto px-6 lg:px-16", className)}>
      {children}
    </div>
  );
};

export default Container;
