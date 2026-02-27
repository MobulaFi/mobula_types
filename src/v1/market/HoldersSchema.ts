import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

export const MarketTokenHoldersParamsSchema = z
  .object({
    blockchain: z.string().optional(),
    asset: z.string().optional(),
    symbol: z.string().optional(),
    limit: z.coerce.number().max(100).optional().default(20),
    offset: z.coerce.number().optional().default(0),
    backfill: z
      .union([z.boolean(), z.string()])
      .default(false)
      .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
    includeZeroBalance: z
      .union([z.boolean(), z.string()])
      .default(false)
      .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  })
  .transform(({ blockchain, asset, symbol, limit, offset, backfill, includeZeroBalance }) => ({
    blockchain: blockchain,
    asset: asset || symbol ? { name: asset, symbol: symbol } : undefined,
    limit,
    offset,
    backfill,
    includeZeroBalance,
  }));

export type MarketTokenHoldersParams = z.input<typeof MarketTokenHoldersParamsSchema>;

export const MarketTokenHoldersParamsSchemaOpenAPI = createOpenAPIParams(MarketTokenHoldersParamsSchema, {
  omit: ['backfill', 'includeZeroBalance'],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    asset: 'Token contract address',
    symbol: 'Token symbol',
    limit: 'Number of holders per page (max 100, default: 20)',
    offset: 'Offset for pagination (default: 0)',
  },
});

export const MarketTokenHoldersResponseSchema = z.object({
  data: z.array(
    z.object({
      address: z.string(),
      tag: z.string(),
      amountRaw: z.string(),
      amount: z.number(),
      chainId: z.string(),
      totalSupplyShare: z.number(),
      amountUSD: z.number(),
    }),
  ),
  total_count: z.number(),
});

export type MarketTokenHoldersResponse = z.infer<typeof MarketTokenHoldersResponseSchema>;
