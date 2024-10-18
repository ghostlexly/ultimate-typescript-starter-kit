"use client";

import React from "react";
import { m } from "framer-motion";

export default function TextWordsAppearingAnimation({
  text,
  className,
}: {
  text: string;
  className?: string;
}): React.ReactElement {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      x: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <m.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      className={className}
    >
      {words.map((word, index) => (
        <m.span key={index} variants={child}>
          {word}{" "}
        </m.span>
      ))}
    </m.div>
  );
}
