import { z } from 'zod';
import type { BaseMessageType } from '../utils/schemas/BaseMessage.ts';

export const TokenDetailsPayloadSchema = z.object({
  tokens: z.array(
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
  filterOutliers: z.coerce.boolean().default(false),
  tag: z.string().max(50).optional(),
});

export type TokenDetailsPayloadType = z.input<typeof TokenDetailsPayloadSchema>;

export interface WssTokenDetailsResponseType extends Omit<BaseMessageType, 'pairData'> {
  subscriptionId: string;
  updated: true;
  timestamp: number;
}
