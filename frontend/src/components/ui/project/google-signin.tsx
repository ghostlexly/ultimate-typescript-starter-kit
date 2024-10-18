import Link from "next/link";
import { GhostImage } from "@/components/ui/ghost-image";
import GoogleLogoImg from "@/assets/images/platforms/logos/google.png";

const GoogleSignInButton = () => {
  return (
    <Link href="/api/customer/auth/google" prefetch={false}>
      <div className="relative flex cursor-pointer justify-center rounded-lg border bg-white py-2 text-black hover:bg-neutral-300/30">
        <div className="absolute left-2 h-6 w-6">
          <GhostImage
            src={GoogleLogoImg}
            alt="Google"
            className="object-contain"
            fill
          />
        </div>
        <span className="text-center text-sm">Sign in with Google</span>
      </div>
    </Link>
  );
};

export { GoogleSignInButton };
