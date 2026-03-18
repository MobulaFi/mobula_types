import { z } from 'zod';
import normalizePeriod from '../utils/functions/period.ts';

export const OhlcvPayloadSchema = z.object({
  address: z.string().optional(),
  subscriptionId: z.string().optional(),
  blockchain: z.string().optional(),
  chainId: z.string().optional(),
  period: z
    .string()
    .optional()
    .transform((val) => {
      if (val) {
        return normalizePeriod(val);
      }
      return '5m';
    }),
  asset: z.string().optional(),
  currentPrice: z.string().optional(),
  mode: z
    .enum(['asset', 'pair', 'pool'])
    .optional()
    .transform((val) => (val === 'pool' ? 'pair' : val) as 'pair' | 'asset' | undefined),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  maxUpdatesPerMinute: z.number().optional(),
});

export type OhlcvPayloadType = z.input<typeof OhlcvPayloadSchema>;

export interface WssOhlcvDetailsResponseType {
  subscriptionId?: string;
  high: number | null;
  low: number | null;
  open: number | null;
  close: number | null;
  volume: number;
  time: number;
  period: string;
  tradeTime?: number;
}
