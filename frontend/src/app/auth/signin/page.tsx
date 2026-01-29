import { GalleryVerticalEndIcon } from 'lucide-react';
import { SigninForm } from './signin-form';

export default async function SigninPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 rounded-lg p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          Acme Inc.
        </a>
        <SigninForm searchParams={resolvedSearchParams} />
      </div>
    </div>
  );
}
