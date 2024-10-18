"use client";

import { LazyMotion } from "framer-motion";
const loadFeatures = () =>
  import("@/lib/framer-features").then((res) => res.default);

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LazyMotion strict features={loadFeatures}>
        {children}
      </LazyMotion>
    </>
  );
}
