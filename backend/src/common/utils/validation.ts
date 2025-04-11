import { AnyZodObject, ZodEffects, ZodError } from "zod";
import { ValidationException } from "@/common/exceptions/validation-exception";
import { z } from "zod";

/**
 * Validates data without middleware functionality
 * @param zodSchema Zod validator that will be used to validate the data
 * @param data Object containing body, query, params, file, files to validate
 * @returns The validated data with proper typing from the schema
 */
export const validateData = async <
  T extends AnyZodObject | ZodEffects<AnyZodObject>,
>(
  zodSchema: T,
  data: {
    body?: any;
    query?: any;
    params?: any;
    file?: any;
    files?: any;
  }
): Promise<z.infer<T>> => {
  try {
    // Validate the provided data
    const validatedData = (await zodSchema.parseAsync(data)) as z.infer<T>;
    return validatedData;
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationException({
        message: error.errors[0].message,
        violations: error.errors.map((e) => ({
          code: e.code,
          message: e.message,
          path: e.path.join("."),
        })),
        cause: error,
      });
    }
    throw error;
  }
};
