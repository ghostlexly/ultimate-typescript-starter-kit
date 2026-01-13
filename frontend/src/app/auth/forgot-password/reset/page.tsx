import { GalleryVerticalEndIcon } from "lucide-react";
import { ForgotPasswordResetForm } from "./reset-form";

type Params = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ForgotPasswordResetPage({
  searchParams,
}: {
  searchParams: Params;
}) {
  const params = await searchParams;
  const email = typeof params.email === "string" ? params.email : null;
  const token = typeof params.token === "string" ? params.token : null;
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 rounded-lg bg-muted">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Acme Inc.
        </a>
        <ForgotPasswordResetForm email={email} token={token} />
      </div>
    </div>
  );
}
