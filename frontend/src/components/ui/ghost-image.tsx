"use client";

/** @author Tolga Malkoc <ghostlexly@gmail.com> */

import { cn } from "@/lib/utils";
import type { ImageProps, StaticImageData } from "next/image";
import Image from "next/image";

type GhostImageProps = ImageProps & {
  src: StaticImageData | string;
  className?: string;
};

/**
 * Generate a react-optimized image with automatic lazy, blur and quality change.
 *
 * Sharp is highly recommanded for optimization: yarn add sharp
 *
 */
export const GhostImage = ({
  src,
  className = "",
  ...settings
}: GhostImageProps) => {
  return (
    <Image
      className={cn("overflow-hidden", className)}
      key={settings.key ? settings.key : src.toString()}
      src={src}
      quality={75}
      width={settings.width}
      height={settings.height}
      alt={settings.alt}
      fill={settings.fill}
      sizes={
        settings.sizes ||
        "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      }
      onError={settings.onError}
    />
  );
};
