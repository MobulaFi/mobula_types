import { z } from 'zod';

const SwapQuotingBatchItemSchema = z
  .object({
    chainId: z.string(),
    tokenIn: z.string().min(1, 'tokenIn is required'),
    tokenOut: z.string().min(1, 'tokenOut is required'),
    amount: z.number().positive('Amount must be a positive number').optional(),
    amountRaw: z
      .string()
      .regex(/^\d+$/, 'amountRaw must be a positive integer string')
      .refine((val) => BigInt(val) > 0n, 'amountRaw must be positive')
      .transform((val) => BigInt(val))
      .optional(),
    slippage: z.number().min(0).max(100, 'Slippage must be between 0 and 100').default(1),
    walletAddress: z.string().min(1, 'walletAddress is required'),
    excludedProtocols: z.array(z.string()).optional(),
    onlyProtocols: z.array(z.string()).optional(),
    poolAddress: z.string().optional(),
    onlyRouters: z
      .array(z.enum(['jupiter', 'naos', 'kyberswap', 'lifi']))
      .optional()
      .transform((val) => (val?.length ? val : undefined)),
    /**
     * Priority fee configuration for Solana transactions.
     * Can be 'auto', a preset name, or a number in microLamports per CU.
     */
    priorityFee: z
      .union([
        z.literal('auto'),
        z.number().positive(),
        z.object({
          preset: z.enum(['low', 'medium', 'high', 'veryHigh']),
        }),
      ])
      .optional(),
    /**
     * Compute unit limit for Solana transactions.
     * Can be true for dynamic limit or a specific number.
     */
    computeUnitLimit: z.union([z.literal(true), z.number().positive()]).optional(),
    /**
     * Jito tip amount in lamports for Solana transactions.
     * This adds a SOL transfer instruction to a Jito tip account.
     */
    jitoTipLamports: z.number().positive().optional(),
    /**
     * Fee percentage to charge on the swap (0 to 99).
     * On Solana: Fee is always taken from SOL/WSOL (native token).
     */
    feePercentage: z.number().min(0).max(99).optional(),
    /**
     * Wallet address to receive fees (Solana only).
     * Required when feePercentage is set on Solana chains.
     */
    feeWallet: z.string().optional(),
    /**
     * Payer wallet address for Solana transactions (fee abstraction).
     * This wallet will be the fee payer (paying SOL rent/transaction fees) and the signer of the transaction.
     * The swap itself will still use the `walletAddress` for token transfers.
     *
     * Only supported for Solana chains.
     */
    payerAddress: z.string().optional(),
  })
  .refine((data) => (data.amount !== undefined) !== (data.amountRaw !== undefined), {
    message: 'Either amount or amountRaw must be provided (but not both)',
    path: ['amount'],
  });

export const SwapQuotingBatchBodySchema = z.object({
  requests: z
    .array(SwapQuotingBatchItemSchema)
    .min(1, 'At least one request is required')
    .max(30, 'Maximum 30 requests allowed per batch'),
});

export type SwapQuotingBatchItem = z.infer<typeof SwapQuotingBatchItemSchema>;
export type SwapQuotingBatchBody = z.infer<typeof SwapQuotingBatchBodySchema>;
