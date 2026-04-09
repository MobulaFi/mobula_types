import { z } from 'zod';

/**
 * Bridge Status Schema (Alpha Preview)
 *
 * Query the status of a bridge intent by intentId (bytes32) or deposit TX hash.
 *
 * Status lifecycle:
 * pending -> deposited -> filling -> filled -> settled
 *
 * Failure path:
 * filling -> retrying -> refunded | failed
 */
export const BridgeStatusQuerySchema = z.object({
  id: z.string().min(1, 'id is required'),
});

export type BridgeStatusParams = z.infer<typeof BridgeStatusQuerySchema>;

export const BridgeStatusResponseSchema = z.object({
  data: z.object({
    intentId: z.string().optional(),
    status: z.enum(['pending', 'deposited', 'filling', 'filled', 'settled', 'retrying', 'refunded', 'failed']),
    originChainId: z.string().optional(),
    destinationChainId: z.string().optional(),
    sender: z.string().optional(),
    recipient: z.string().optional(),
    amountIn: z.string().optional(),
    amountOut: z.string().nullable().optional(),
    depositTxHash: z.string().nullable().optional(),
    fillTxHash: z.string().nullable().optional(),
    settleTxHash: z.string().nullable().optional(),
    latencyMs: z.number().nullable().optional(),
    timestamps: z
      .object({
        depositDetected: z.string().nullable().optional(),
        fillSent: z.string().nullable().optional(),
        fillConfirmed: z.string().nullable().optional(),
        settled: z.string().nullable().optional(),
      })
      .optional(),
    createdAt: z.string().optional(),
    message: z.string().optional(),
  }),
});

export type BridgeStatusResponse = z.infer<typeof BridgeStatusResponseSchema>;
