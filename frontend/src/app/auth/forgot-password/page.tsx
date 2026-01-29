import { GalleryVerticalEndIcon } from 'lucide-react';
import { ForgotPasswordEmailForm } from './email-form';

export default function ForgotPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 rounded-lg p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Acme Inc.
        </a>
        <ForgotPasswordEmailForm />
      </div>
    </div>
  );
}
