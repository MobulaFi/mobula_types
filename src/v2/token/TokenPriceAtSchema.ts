import { z } from 'zod';

/**
 * V2 Token Price-At Schema
 * Dedicated endpoint for point-in-time historical price lookups.
 * Finds the closest swap to a given unix timestamp.
 */

const TokenPriceAtItemParams = z.object({
  blockchain: z.string().optional(),
  address: z.string().optional(),
  timestamp: z.coerce.number().int().positive(),
});

export const TokenPriceAtParamsSchema = TokenPriceAtItemParams;

export const TokenPriceAtBatchParamsSchema = z.union([
  z.array(TokenPriceAtItemParams),
  z.object({
    items: z.array(TokenPriceAtItemParams),
  }),
]);

export type TokenPriceAtParams = z.input<typeof TokenPriceAtParamsSchema>;
export type TokenPriceAtBatchParams = z.input<typeof TokenPriceAtBatchParamsSchema>;

const TokenPriceAtItemResponseSchema = z.object({
  name: z.string().nullable(),
  symbol: z.string().nullable(),
  logo: z.string().nullable(),
  priceUSD: z.number(),
  marketCapUSD: z.number().nullable(),
  marketCapDilutedUSD: z.number().nullable(),
  timestamp: z.number(),
  swapTimestamp: z.number(),
  poolAddress: z.string(),
});

export const TokenPriceAtResponseSchema = z.object({
  data: TokenPriceAtItemResponseSchema,
});

export const TokenPriceAtBatchResponseSchema = z.object({
  payload: z.array(TokenPriceAtItemResponseSchema.or(z.object({ error: z.string().optional() })).nullable()),
});

export type TokenPriceAtResponse = z.infer<typeof TokenPriceAtResponseSchema>;
export type TokenPriceAtBatchResponse = z.infer<typeof TokenPriceAtBatchResponseSchema>;
