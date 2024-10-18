"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ text }) {
  const router = useRouter();

  const doNavigate = () => {
    router.back();
  };

  return (
    <div
      className="flex cursor-pointer items-center gap-2 pl-2"
      onClick={doNavigate}
    >
      <svg
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
        className="h-3 w-3"
      >
        <path d="M396.011 512l387.137-387.137c28.564-28.564 28.564-74.876 0-103.44s-74.876-28.564-103.44 0l-438.857 438.857c-28.564 28.564-28.564 74.876 0 103.44l438.857 438.857c28.564 28.564 74.876 28.564 103.44 0s28.564-74.876 0-103.44l-387.137-387.137z"></path>
      </svg>{" "}
      <p className="text-xs uppercase">{text}</p>
    </div>
  );
}
