import z from 'zod';

export const booleanFromString = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    return val === '1' || val === 'true';
  });
