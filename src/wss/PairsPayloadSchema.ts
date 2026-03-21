import { z } from 'zod';

export const PairsPayloadSchema = z.object({
  mode: z
    .enum(['asset', 'pair', 'pool'])
    .optional()
    .default('pair')
    .transform((val) => (val === 'pool' ? 'pair' : val) as 'pair' | 'asset'),
  subscriptionId: z.string().optional(),
  blockchain: z.string().optional(),
  factory: z.string().optional(),
  interval: z.number().default(30),
  address: z.string().optional(),
  asset: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  tag: z.string().max(50).optional(),
});

export type PairsPayloadType = z.input<typeof PairsPayloadSchema>;
