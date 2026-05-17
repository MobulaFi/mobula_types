import { z } from 'zod';
/**
 * Bridge History Schema (Alpha Preview)
 *
 * List bridge intents for a wallet (sender or recipient), newest-first,
 * with cursor-based pagination.
 *
 * Status lifecycle:
 * pending -> deposited -> filling -> filled -> settling -> settled
 * Failure path:
 * filling -> retrying -> refunded | failed
 */
export const BridgeHistoryStatusSchema = z.enum([
  'pending',
  'deposited',
  'filling',
  'filled',
  'settling',
  'settled',
  'retrying',
  'refunded',
  'failed',
]);

export type BridgeHistoryStatus = z.infer<typeof BridgeHistoryStatusSchema>;

export const BridgeHistoryParamsSchema = z
  .object({
    // wallet is no longer mandatory: the endpoint can be scoped by API-key
    // ownership (customerId / apiKey) instead, optionally narrowed further by
    // chain. At least one scoping dimension is still required so we never run
    // an unbounded global scan. orgId is intentionally not supported here —
    // history is per-wallet/customer/key only.
    wallet: z.string().min(1).optional(),
    customerId: z.string().min(1).optional(),
    apiKey: z.string().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(50),
    cursor: z.string().optional(),
    status: BridgeHistoryStatusSchema.optional(),
    originChainId: z.string().optional(),
    destinationChainId: z.string().optional(),
  })
  .refine((d) => [d.customerId, d.apiKey].filter((v) => v != null).length <= 1, {
    message: 'customerId and apiKey are mutually exclusive — provide at most one',
  })
  .refine((d) => d.wallet != null || d.customerId != null || d.apiKey != null, {
    message: 'at least one of wallet, customerId, or apiKey is required',
  });

export type BridgeHistoryParams = z.infer<typeof BridgeHistoryParamsSchema>;
export type BridgeHistoryInferType = z.infer<typeof BridgeHistoryParamsSchema>;

export const BridgeHistoryItemSchema = z.object({
  intentId: z.string(),
  status: BridgeHistoryStatusSchema,
  originChainId: z.string(),
  destinationChainId: z.string(),
  sender: z.string(),
  recipient: z.string(),
  originToken: z.string(),
  originMeta: z.object({
    name: z.string().nullable(),
    symbol: z.string().nullable(),
    logo: z.string().nullable(),
  }),
  destinationToken: z.string(),
  destinationMeta: z.object({
    name: z.string().nullable(),
    symbol: z.string().nullable(),
    logo: z.string().nullable(),
  }),
  amountIn: z.string(),
  amountOut: z.string().nullable(),
  amountInUsd: z.number().nullable(),
  amountOutUsd: z.number().nullable(),
  depositTxHash: z.string().nullable(),
  fillTxHash: z.string().nullable(),
  settleTxHash: z.string().nullable(),
  latencyMs: z.number().nullable(),
  timestamps: z.object({
    depositDetected: z.number().nullable(),
    fillSent: z.number().nullable(),
    fillConfirmed: z.number().nullable(),
    settled: z.number().nullable(),
  }),
  createdAt: z.number(),
});

export type BridgeHistoryItem = z.infer<typeof BridgeHistoryItemSchema>;

export const BridgeHistoryPaginationSchema = z.object({
  limit: z.number(),
  pageEntries: z.number(),
  nextCursor: z.string().nullable(),
});

export const BridgeHistoryResponseSchema = z.object({
  data: z.array(BridgeHistoryItemSchema),
  pagination: BridgeHistoryPaginationSchema,
});

export type BridgeHistoryResponse = z.infer<typeof BridgeHistoryResponseSchema>;
