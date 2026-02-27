import { z } from 'zod';
import normalizePeriod from '../../utils/functions/period.ts';
import DateQuery from '../../utils/schemas/DateQuery.ts';

// Helper for boolean parsing from query string
const booleanFromString = z
  .union([z.boolean(), z.string()])
  .optional()
  .default(true)
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'false' || val === '0') return false;
    return true;
  });

// Single token query schema (shared between GET params and POST body items)
const TokenOHLCVHistoryItemSchema = z.object({
  address: z.string(),
  chainId: z.string(),
  from: DateQuery.transform((val) => val ?? 0),
  to: DateQuery.transform((val) => val ?? new Date()),
  period: z
    .string()
    .optional()
    .transform((val) => (val ? normalizePeriod(val) : '5m')),
  amount: z.coerce
    .number()
    .optional()
    .transform((val) => (val !== undefined ? Math.min(val, 2000) : undefined)),
  usd: booleanFromString,
});

// ==================== TOKEN OHLCV ====================
// GET: address + chainId required
export const TokenOHLCVHistoryParamsSchema = TokenOHLCVHistoryItemSchema.refine(
  (data) => data.address && data.chainId,
  { message: 'address and chainId are required' },
);

export type TokenOHLCVHistoryParams = z.input<typeof TokenOHLCVHistoryParamsSchema>;
export type TokenOHLCVHistoryInferType = z.infer<typeof TokenOHLCVHistoryParamsSchema>;

// Array schema for batch items
const TokenOHLCVHistoryArraySchema = z
  .array(TokenOHLCVHistoryItemSchema)
  .min(1, 'At least one token is required')
  .max(10, 'Maximum 10 tokens per request');

// POST request schema - supports both array and object with 'tokens' key
export const TokenOHLCVHistoryBatchParamsSchema = z.union([
  TokenOHLCVHistoryArraySchema,
  z.object({ tokens: TokenOHLCVHistoryArraySchema }),
]);

export type TokenOHLCVHistoryBatchParams = z.input<typeof TokenOHLCVHistoryBatchParamsSchema>;

// ==================== RESPONSE SCHEMA ====================
const OHLCVCandleSchema = z.object({
  v: z.number(),
  o: z.number(),
  h: z.number(),
  l: z.number(),
  c: z.number(),
  t: z.number(),
});

export const TokenOHLCVHistoryResponseSchema = z.object({
  data: z.array(OHLCVCandleSchema),
});

export type TokenOHLCVHistoryResponse = z.infer<typeof TokenOHLCVHistoryResponseSchema>;

// Single token batch response data schema
const TokenOHLCVHistoryDataSchema = z.object({
  ohlcv: z.array(OHLCVCandleSchema),
  address: z.string(),
  chainId: z.string(),
  error: z.string().optional(),
});

// POST response schema (batch - array of tokens)
export const TokenOHLCVHistoryBatchResponseSchema = z.object({
  data: z.array(TokenOHLCVHistoryDataSchema),
});

export type TokenOHLCVHistoryBatchResponse = z.infer<typeof TokenOHLCVHistoryBatchResponseSchema>;
