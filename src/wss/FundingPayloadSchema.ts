import { z } from 'zod';

export const FundingPayloadSchema = z.object({
  symbol: z.string(),
  quote: z.string().optional(),
  exchange: z
    .string()
    .optional()
    .transform((val) => {
      const validExchanges = ['binance', 'bybit', 'hyperliquid', 'deribit', 'okx', 'gate', 'lighter'];

      if (!val) return validExchanges;

      const requestedExchanges = val
        .split(',')
        .map((ex) => ex.trim().toLowerCase())
        .filter((ex) => validExchanges.includes(ex));

      return requestedExchanges.length > 0 ? requestedExchanges : validExchanges;
    }),
  protocol: z.enum(['xyz', 'flx', 'vntl', 'hyna', 'km', 'cash']).optional(),
  interval: z.number().optional().default(5),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z.string().optional(),
  tag: z.string().max(50).optional(),
});

export type FundingPayloadType = z.input<typeof FundingPayloadSchema>;
