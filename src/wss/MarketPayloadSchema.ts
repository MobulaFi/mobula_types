import { z } from 'zod';

export const MarketPayloadSchema = z.object({
  interval: z.number().default(30),
  subscriptionId: z.string().optional(),
  assets: z
    .array(
      z.union([
        z.object({ name: z.string() }),
        z.object({ symbol: z.string() }),
        z.object({
          address: z.string(),
          blockchain: z.string(),
        }),
      ]),
    )
    .max(100),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  tag: z.string().max(50).optional(),
});

export type MarketPayloadType = z.input<typeof MarketPayloadSchema>;
