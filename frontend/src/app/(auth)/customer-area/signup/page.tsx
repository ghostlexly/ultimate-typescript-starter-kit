import { GalleryVerticalEndIcon } from "lucide-react";
import { SignUpForm } from "./signup-form";

export default function SignUpPage({ searchParams }: { searchParams: any }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 rounded-lg bg-muted">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Acme Inc.
        </a>
        <SignUpForm searchParams={searchParams} />
      </div>
    </div>
  );
}
