import z from 'zod';

export const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === '1' || val === 'true') return true;

    return false;
  });
