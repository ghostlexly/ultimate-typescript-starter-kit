import { AlertTriangle } from "lucide-react";

const QueryErrorMessage = () => {
  return (
    <div className="flex justify-center">
      <div className="my-4 flex flex-col items-center">
        <AlertTriangle className="mb-2 h-6 w-6" strokeWidth={1.5} />
        <p>Something went wrong. Please try again.</p>
        <p>
          If the problem persists, please contact support at{" "}
          <a className="font-bold" href="mailto:hello@fenriss.com">
            hello@fenriss.com
          </a>
        </p>
      </div>
    </div>
  );
};

export { QueryErrorMessage };
