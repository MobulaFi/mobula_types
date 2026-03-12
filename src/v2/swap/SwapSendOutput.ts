import { z } from 'zod';

const SwapTokenSchema = z.object({
  address: z.string(),
  amount: z.string(),
});

export const SwapSendResponseSchema = z.object({
  data: z.object({
    success: z.boolean(),
    transactionHash: z.string().optional(),
    requestId: z.string(),
    /** Which lander landed the transaction (batch mode only) */
    lander: z.string().optional(),
    /** Time in ms from send to first RPC acceptance */
    landingTimeMs: z.number().optional(),
    /** Landing status (only present when awaitLanding is true) */
    status: z.enum(['broadcasted', 'processed', 'confirmed', 'failed', 'timeout']).optional(),
    /** Time in ms from broadcast to on-chain confirmation */
    onchainLandingTimeMs: z.number().optional(),
    /** Parsed swap data from the confirmed transaction */
    swap: z
      .object({
        tokenIn: SwapTokenSchema,
        tokenOut: SwapTokenSchema,
      })
      .optional(),
  }),
  error: z.string().optional(),
});

export type SwapSendResponse = z.infer<typeof SwapSendResponseSchema>;
