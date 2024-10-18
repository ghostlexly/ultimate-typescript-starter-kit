"use client";

import { useLottie } from "lottie-react";
import MailJSON from "@/assets/lottiefiles/mail.json";

const MailLottie = () => {
  const element = useLottie({
    animationData: MailJSON,
    loop: true,
    autoplay: true,
  });

  return <>{element.View}</>;
};

export { MailLottie };
