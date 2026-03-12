import { z } from 'zod';

const base64ToBuffer = z
  .string()
  .min(1, 'signedTransaction is required')
  .transform((val) => {
    try {
      return Buffer.from(val, 'base64');
    } catch {
      throw new Error('signedTransaction must be a valid base64 string');
    }
  });

/** A candidate transaction targeting a specific lander (block engine). */
const SwapSendCandidateSchema = z.object({
  lander: z.string().min(1, 'lander is required'),
  signedTransaction: base64ToBuffer,
});

export type SwapSendCandidate = z.infer<typeof SwapSendCandidateSchema>;

/**
 * Swap send schema — backward-compatible.
 *
 * Single mode:  { chainId, signedTransaction }
 * Batch mode:   { chainId, candidates: [{ lander, signedTransaction }, ...] }
 */
export const SwapSendSchema = z
  .object({
    chainId: z.string(),
    signedTransaction: base64ToBuffer.optional(),
    candidates: z.array(SwapSendCandidateSchema).min(1).optional(),
    /** When true, the endpoint blocks until on-chain confirmation and returns swap data. */
    awaitLanding: z.boolean().optional(),
  })
  .refine((data) => data.signedTransaction || data.candidates, {
    message: 'Either signedTransaction or candidates must be provided',
  })
  .refine((data) => !(data.signedTransaction && data.candidates), {
    message: 'Provide signedTransaction or candidates, not both',
  });

export type SwapSendParams = z.infer<typeof SwapSendSchema>;
