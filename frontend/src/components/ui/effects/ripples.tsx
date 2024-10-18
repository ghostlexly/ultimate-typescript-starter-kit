"use client";

import { cn } from "@/lib/utils";
import { useDebouncedState } from "@mantine/hooks";
import { useEffect, useState } from "react";

type RipplesEffectProps = {
  className?: string;
};

/**
 * Make a ripples effect on click like Material UI buttons.
 *
 * @requires to add the following CSS code:
 * ```css
 * @keyframes ripple {
 *  to {
 *    transform: scale(4);
 *    opacity: 0;
 *  }
 * }
 * ```
 *
 */
const RipplesEffect: React.FC<RipplesEffectProps> = ({ className }) => {
  const [ripples, setRipples] = useState<React.CSSProperties[]>([]);
  const [debouncedRipples, setDebouncedRipples] = useDebouncedState<
    React.CSSProperties[]
  >([], 3000);

  const handleClick = (e: React.MouseEvent) => {
    const elem = e.currentTarget;

    const rect = elem.getBoundingClientRect();
    const left = e.clientX - rect.left;
    const top = e.clientY - rect.top;
    const height = elem.clientHeight;
    const width = elem.clientWidth;
    const diameter = Math.max(width, height);
    setRipples([
      ...ripples,
      {
        top: top - diameter / 2,
        left: left - diameter / 2,
        height: Math.max(width, height),
        width: Math.max(width, height),
      },
    ]);
  };

  useEffect(() => {
    if (debouncedRipples.length) {
      setRipples([]);
    }
  }, [debouncedRipples]);

  useEffect(() => {
    setDebouncedRipples(ripples);
  }, [ripples, setDebouncedRipples]);

  return (
    <div
      className={cn("absolute top-0 h-full w-full overflow-hidden", className)}
      onClick={handleClick}
    >
      {ripples?.map((style, i) => (
        <span
          key={i}
          className="animate-ripple absolute scale-0 rounded-full bg-[#FFFFFF]"
          style={{
            ...style,
          }}
        />
      ))}
    </div>
  );
};

export default RipplesEffect;
