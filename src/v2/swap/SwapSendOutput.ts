import { z } from 'zod';

export const SwapSendResponseSchema = z.object({
  data: z.object({
    success: z.boolean(),
    transactionHash: z.string().optional(),
    requestId: z.string(),
    /** Which lander landed the transaction (batch mode only) */
    lander: z.string().optional(),
    /** Time in ms from send to first RPC acceptance */
    landingTimeMs: z.number().optional(),
  }),
  error: z.string().optional(),
});

export type SwapSendResponse = z.infer<typeof SwapSendResponseSchema>;
