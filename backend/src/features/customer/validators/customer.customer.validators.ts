import z from 'zod';

export const customerCustomerInformationsSchema = z.object({
  body: z.object({
    countryCode: z.string().min(2).max(2),
  }),
});
export type CustomerCustomerInformationsDto = z.infer<
  typeof customerCustomerInformationsSchema
>;
