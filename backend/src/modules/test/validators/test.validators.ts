import { phoneNumberTransformer } from "@/common/transformers/phone-number.transformer";
import { phoneNumberValidator } from "@/common/validators/phone-number.validators";
import { z } from "zod";

export const updateAccountValidator = z.object({
  body: z.object({
    name: z.string(),
    bookings: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ),
    phoneNumber: z
      .string()
      .pipe(phoneNumberValidator)
      .pipe(phoneNumberTransformer),
  }),
});
