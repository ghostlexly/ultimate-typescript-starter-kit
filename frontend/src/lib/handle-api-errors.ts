import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { toast } from 'react-toastify';

interface Violation {
  path: string;
  message: string;
}

interface ApiErrorResponse {
  data?: {
    message?: string;
    violations?: Violation[];
  };
  message?: string;
}

interface ApiError {
  response?: ApiErrorResponse;
  message?: string;
}

type HandleApiErrorsProps<T extends FieldValues = FieldValues> = {
  error: unknown;
  form?: UseFormReturn<T>;
  prefix?: string;
};

const DEFAULT_ERROR_MESSAGE =
  'Une erreur est survenue, veuillez réessayer dans quelques minutes.';

// Utilities to extract data from the error
const getErrorData = (error: unknown) => {
  if (typeof error !== 'object' || !error) return null;

  const apiError = error as ApiError;
  return apiError.response?.data || null;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error !== 'object' || !error) return null;

  const apiError = error as ApiError;
  return apiError.response?.data?.message || apiError.message || null;
};

const getViolations = (error: unknown): Violation[] => {
  const errorData = getErrorData(error);
  return errorData?.violations || [];
};

// Handle validation errors for forms
const handleFormViolations = <T extends FieldValues>(
  violations: Violation[],
  form: UseFormReturn<T>,
  prefix?: string,
) => {
  violations.forEach((violation) => {
    let fieldPath = violation.path;
    if (prefix) {
      fieldPath = `${prefix}.${fieldPath}`;
    }

    // Check if the field exists in the form
    const fieldValue = form.getValues(fieldPath as Path<T>);
    if (fieldValue !== undefined) {
      form.setError(
        fieldPath as Path<T>,
        { message: violation.message },
        { shouldFocus: true },
      );
    }
  });
};

const handleApiErrors = <T extends FieldValues = FieldValues>({
  error,
  form,
  prefix,
}: HandleApiErrorsProps<T>) => {
  const violations = getViolations(error);
  const errorMessage = getErrorMessage(error);

  // If we have validation violations
  if (violations.length > 0) {
    if (form) {
      // Display the main message and set errors on the fields
      toast.error(errorMessage || 'Validation error');
      handleFormViolations(violations, form, prefix);
    } else {
      // Display all violations in a single message
      const violationMessages = violations.map((v) => `${v.path}: ${v.message}`);
      toast.error(violationMessages.join('\n'));
    }
    return;
  }

  // Display the simple error message or the default message
  toast.error(errorMessage ?? DEFAULT_ERROR_MESSAGE);
};

export { handleApiErrors };
