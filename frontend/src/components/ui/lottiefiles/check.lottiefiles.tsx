"use client";

import { useLottie } from "lottie-react";
import CheckJSON from "@/assets/lottiefiles/check.json";

const CheckLottie = () => {
  const element = useLottie({
    animationData: CheckJSON,
    loop: false,
    autoplay: true,
    initialSegment: [0, 50], // will play from frame 0 to frame 50
  });

  return <>{element.View}</>;
};

export { CheckLottie };
