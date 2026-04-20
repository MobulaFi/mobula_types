import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';

/**
 * V2 Token Price Schema
 * Current token price data (market cap, liquidity, etc.)
 * For historical point-in-time prices, use TokenPriceAtSchema.
 */

// Single item params (for GET and batch items)
const TokenPriceItemParams = z.object({
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  address: z.string().optional(),
});

export const TokenPriceParamsSchema = TokenPriceItemParams;

export const TokenPriceParamsSchemaOpenAPI = createOpenAPIParams(TokenPriceItemParams, {
  omit: ['blockchain'],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    address: 'Token contract address',
  },
});

export const TokenPriceBatchParamsSchema = z.union([
  z.array(TokenPriceItemParams),
  z.object({
    items: z.array(TokenPriceItemParams),
  }),
]);

export type TokenPriceParams = SDKInput<typeof TokenPriceParamsSchema, 'blockchain'>;
export type TokenPriceBatchParams = z.input<typeof TokenPriceBatchParamsSchema>;

// Response item with USD suffix naming convention
const TokenPriceItemResponseSchema = z.object({
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  logo: z.string().nullable(),
  priceUSD: z.number().nullable(),
  marketCapUSD: z.number().nullable(),
  marketCapDilutedUSD: z.number().nullable(),
  liquidityUSD: z.number().nullable(),
  liquidityMaxUSD: z.number().nullable(),
});

export const TokenPriceResponseSchema = z.object({
  data: TokenPriceItemResponseSchema,
});

export const TokenPriceBatchResponseSchema = z.object({
  payload: z.array(TokenPriceItemResponseSchema.or(z.object({ error: z.string().optional() })).nullable()),
});

export type TokenPriceResponse = z.infer<typeof TokenPriceResponseSchema>;
export type TokenPriceBatchResponse = z.infer<typeof TokenPriceBatchResponseSchema>;
export type TokenPriceItem = z.infer<typeof TokenPriceItemResponseSchema>;
