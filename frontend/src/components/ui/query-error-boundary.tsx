import { IoAlertCircle } from 'react-icons/io5';
import { Button } from './button';
import { RotateCcw } from 'lucide-react';

const QueryErrorBoundary = ({ message }: { message?: string }) => {
  const onRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="rounded-full bg-neutral-100 p-2">
        <IoAlertCircle className="size-6 text-neutral-500" />
      </div>

      <div className="mt-4 text-center text-sm font-bold text-gray-800">
        Une erreur est survenue.
      </div>

      {message ? (
        <div className="text-center text-[10px] text-gray-600">{message}</div>
      ) : null}

      <Button onClick={onRetry} variant="outline" size="sm" className="mt-4">
        <RotateCcw className="size-4" />
        <div className="font-medium">Réessayer</div>
      </Button>
    </div>
  );
};

export { QueryErrorBoundary };
