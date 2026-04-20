import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
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
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
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
// GET: address + chainId/blockchain required
export const TokenOHLCVHistoryParamsSchema = TokenOHLCVHistoryItemSchema.refine(
  (data) => data.address && (data.chainId || data.blockchain),
  { message: 'address and chainId are required' },
);

export type TokenOHLCVHistoryParams = SDKInput<typeof TokenOHLCVHistoryParamsSchema, 'blockchain'>;
export type TokenOHLCVHistoryInferType = z.infer<typeof TokenOHLCVHistoryParamsSchema>;

export const TokenOHLCVHistoryParamsSchemaOpenAPI = createOpenAPIParams(TokenOHLCVHistoryItemSchema, {
  omit: ['blockchain'],
  describe: {
    address: 'Token contract address',
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    from: 'Start date (timestamp or ISO string)',
    to: 'End date (timestamp or ISO string)',
    period: 'Candle period (e.g., "5m", "1h", "1d")',
    amount: 'Maximum number of candles (max 2000)',
    usd: 'Return USD prices (default: true)',
  },
});

// Array schema for batch items
const TokenOHLCVHistoryArraySchema = z
  .array(TokenOHLCVHistoryItemSchema)
  .min(1, 'At least one token is required')
  .max(50, 'Maximum 50 tokens per request');

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
