import { UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";

type IApiErrors = {
  err: any;
  form?: UseFormReturn<any>;
  prefix?: string;
};

const handleApiErrors = ({ err, form, prefix }: IApiErrors) => {
  if (err.data?.violations) {
    // decompose the error object
    const { message, violations } = err.data;

    // --------------------
    // If we have a form and errors list, display the errors in the form
    // --------------------
    if (form && violations) {
      toast.error(message);

      Object.entries(violations).map(([key, item]: [string, any]) => {
        const path = prefix ? prefix + "." + item.path : item.path;

        const field = form.getValues(path);
        form.setError(path, { message: item.message }, { shouldFocus: true });
      });
    } else if (!form && violations) {
      // --------------------
      // If we don't have a form, display the errors in a toast message
      // --------------------
      const errors = violations.map(
        (violation: any) => `${violation.path}: ${violation.message}`
      );
      toast.error(errors.join("\n"));
    }
  } else if (err.message) {
    toast.error(err.message);
  } else {
    // --------------------
    // if the error doesn't have a message, display a generic toast message
    // --------------------
    toast.error("An error occurred, please try again in a few minutes.");
  }
};

export { handleApiErrors };
