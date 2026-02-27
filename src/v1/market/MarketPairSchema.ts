import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import { EnrichedPoolDataSchema } from '../../utils/schemas/EnrichedMarketData.ts';

export const MarketPairParamsSchema = z.object({
  blockchain: z.string().optional(),
  asset: z.string().optional(),
  symbol: z.string().optional(),
  address: z.string().optional(),
  baseToken: z.string().optional(),
  stats: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  force: z.coerce.boolean().optional().default(false),
});

export type MarketPairParams = z.input<typeof MarketPairParamsSchema>;

export const MarketPairParamsSchemaOpenAPI = createOpenAPIParams(MarketPairParamsSchema, {
  omit: ['force'],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    asset: 'Token contract address',
    symbol: 'Token symbol',
    address: 'Pool/pair address',
    baseToken: 'Base token address',
    stats: 'Include pool statistics',
  },
});

export const MarketPairResponseSchema = z.object({
  data: EnrichedPoolDataSchema,
});

export type MarketPairResponse = z.infer<typeof MarketPairResponseSchema>;
