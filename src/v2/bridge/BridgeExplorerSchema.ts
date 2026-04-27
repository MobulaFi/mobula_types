import { z } from 'zod';
import { BridgeHistoryStatusSchema } from './BridgeHistorySchema.ts';

/**
 * Bridge Intent Explorer Schema (Alpha Preview)
 *
 * Public, global view of bridge intents — no wallet filter. Two endpoints:
 *   - /bridge/explorer/stats   → aggregate stats (volume, total orders)
 *   - /bridge/explorer/intents → latest 10 intents across all wallets
 *
 * Status enum is shared with BridgeHistorySchema.
 */

export const BridgeExplorerStatsSchema = z.object({
  volumeSettledUsd: z.number(),
  totalOrders: z.number().int(),
});

export const BridgeExplorerStatsResponseSchema = z.object({
  data: BridgeExplorerStatsSchema,
});

export type BridgeExplorerStats = z.infer<typeof BridgeExplorerStatsSchema>;
export type BridgeExplorerStatsResponse = z.infer<typeof BridgeExplorerStatsResponseSchema>;

export const BridgeExplorerItemSchema = z.object({
  intentId: z.string(),
  status: BridgeHistoryStatusSchema,
  originChainId: z.string(),
  destinationChainId: z.string(),
  sender: z.string(),
  recipient: z.string(),
  originToken: z.string(),
  destinationToken: z.string(),
  amountIn: z.string(),
  amountInUsd: z.number().nullable(),
  amountOut: z.string().nullable(),
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

export type BridgeExplorerItem = z.infer<typeof BridgeExplorerItemSchema>;

export const BridgeExplorerIntentsResponseSchema = z.object({
  data: z.array(BridgeExplorerItemSchema),
});

export type BridgeExplorerIntentsResponse = z.infer<typeof BridgeExplorerIntentsResponseSchema>;
