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

// Single market/pool query schema (shared between GET params and POST body items)
const MarketOHLCVHistoryItemSchema = z.object({
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

// ==================== MARKET OHLCV (Pool-based) ====================
// GET: address + chainId required
export const MarketOHLCVHistoryParamsSchema = MarketOHLCVHistoryItemSchema.refine(
  (data) => data.address && data.chainId,
  { message: 'address and chainId are required' },
);

export type MarketOHLCVHistoryParams = z.input<typeof MarketOHLCVHistoryParamsSchema>;
export type MarketOHLCVHistoryInferType = z.infer<typeof MarketOHLCVHistoryParamsSchema>;

// Array schema for batch items
const MarketOHLCVHistoryArraySchema = z
  .array(MarketOHLCVHistoryItemSchema)
  .min(1, 'At least one market is required')
  .max(10, 'Maximum 10 markets per request');

// POST request schema - supports both array and object with 'markets' key
export const MarketOHLCVHistoryBatchParamsSchema = z.union([
  MarketOHLCVHistoryArraySchema,
  z.object({ markets: MarketOHLCVHistoryArraySchema }),
]);

export type MarketOHLCVHistoryBatchParams = z.input<typeof MarketOHLCVHistoryBatchParamsSchema>;

// ==================== RESPONSE SCHEMA ====================
const OHLCVCandleSchema = z.object({
  v: z.number(),
  o: z.number(),
  h: z.number(),
  l: z.number(),
  c: z.number(),
  t: z.number(),
});

export const MarketOHLCVHistoryResponseSchema = z.object({
  data: z.array(OHLCVCandleSchema),
});

export type MarketOHLCVHistoryResponse = z.infer<typeof MarketOHLCVHistoryResponseSchema>;

// Single market batch response data schema
const MarketOHLCVHistoryDataSchema = z.object({
  ohlcv: z.array(OHLCVCandleSchema),
  address: z.string(),
  chainId: z.string(),
  error: z.string().optional(),
});

// POST response schema (batch - array of markets)
export const MarketOHLCVHistoryBatchResponseSchema = z.object({
  data: z.array(MarketOHLCVHistoryDataSchema),
});

export type MarketOHLCVHistoryBatchResponse = z.infer<typeof MarketOHLCVHistoryBatchResponseSchema>;
