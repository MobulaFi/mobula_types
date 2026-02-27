import { z } from 'zod';

// Supported timeframes for token price history
const PriceHistoryTimeframe = z.enum(['5m', '15m', '1h', '24h', '7d', '30d', '1y']).default('24h');

// Single token price history params (shared between GET params and POST body items)
const TokenPriceHistoryItemSchema = z.object({
  address: z.string(),
  chainId: z.string(),
  timeframe: PriceHistoryTimeframe,
});

// ==================== TOKEN PRICE HISTORY ====================
// GET: address + chainId required
export const TokenPriceHistoryParamsSchema = TokenPriceHistoryItemSchema.refine(
  (data) => data.address && data.chainId,
  { message: 'address and chainId are required' },
);

export type TokenPriceHistoryParams = z.input<typeof TokenPriceHistoryParamsSchema>;
export type TokenPriceHistoryInferType = z.infer<typeof TokenPriceHistoryParamsSchema>;

// Array schema for batch items - up to 50 tokens
const TokenPriceHistoryArraySchema = z
  .array(TokenPriceHistoryItemSchema)
  .min(1, 'At least one token is required')
  .max(50, 'Maximum 50 tokens per request');

// POST request schema - supports both array and object with 'items' key
export const TokenPriceHistoryBatchParamsSchema = z.union([
  TokenPriceHistoryArraySchema,
  z.object({ items: TokenPriceHistoryArraySchema }),
]);

export type TokenPriceHistoryBatchParams = z.input<typeof TokenPriceHistoryBatchParamsSchema>;

// ==================== RESPONSE SCHEMA ====================
// Aligned with asset/price-history: priceHistory as [[timestamp, price], ...]

// Single token GET response
const TokenPriceHistoryDataSchema = z.object({
  priceHistory: z.array(z.array(z.number())),
  address: z.string(),
  chainId: z.string(),
  error: z.string().optional(),
});

export const TokenPriceHistoryResponseSchema = z.object({
  data: TokenPriceHistoryDataSchema,
});

export type TokenPriceHistoryResponse = z.infer<typeof TokenPriceHistoryResponseSchema>;

// POST response schema (batch - array of tokens)
export const TokenPriceHistoryBatchResponseSchema = z.object({
  data: z.array(TokenPriceHistoryDataSchema),
});

export type TokenPriceHistoryBatchResponse = z.infer<typeof TokenPriceHistoryBatchResponseSchema>;
