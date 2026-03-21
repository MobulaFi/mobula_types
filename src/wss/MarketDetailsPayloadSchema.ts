import { z } from 'zod';
import type { BaseMessageType } from '../utils/schemas/BaseMessage.ts';

export const MarketDetailsPayloadSchema = z.object({
  pools: z.array(
    z.object({
      address: z.string(),
      blockchain: z.string(),
    }),
  ),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  maxUpdatesPerMinute: z.coerce.number().optional(),
  tag: z.string().max(50).optional(),
});

export type MarketDetailsPayloadType = z.input<typeof MarketDetailsPayloadSchema>;

export interface WssMarketDetailsResponseType extends Omit<BaseMessageType, 'tokenData'> {
  subscriptionId: string;
  updated: true;
  timestamp: number;
}
