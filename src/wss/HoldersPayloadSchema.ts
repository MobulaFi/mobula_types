import { z } from 'zod';
import type { HoldersStreamNewTokenPayload } from '../utils/schemas/EnrichedHoldersData.ts';

export const HoldersPayloadSchema = z.object({
  tokens: z.array(
    z.object({
      address: z.string(),
      blockchain: z.string(),
    }),
  ),
  sortBy: z.enum(['balance', 'realizedPnl']).default('balance'),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  tag: z.string().max(50).optional(),
  maxUpdatesPerMinute: z.coerce.number().optional(),
});

export type HoldersPayloadType = z.input<typeof HoldersPayloadSchema>;

export type WssHoldersResponse = { data: z.infer<typeof HoldersStreamNewTokenPayload>; subscriptionId: string };
