import { z } from 'zod';

/**
 * Bridge Quote Query Schema (Alpha Preview)
 *
 * Get a quote for a cross-chain bridge transfer, including deposit transaction data.
 *
 * Flow:
 * 1. Client calls GET /bridge/quote -> gets deposit transaction data
 * 2. Client signs and sends the deposit transaction
 * 3. Solver detects deposit and fills on destination chain
 * 4. Client polls GET /bridge/status/:id for confirmation
 */
export const BridgeQuoteQuerySchema = z.object({
  originChainId: z.string().min(1, 'originChainId is required'),
  destinationChainId: z.string().min(1, 'destinationChainId is required'),
  originToken: z.string().optional(),
  destinationToken: z.string().optional(),
  amount: z.string().min(1, 'amount is required'),
  walletAddress: z.string().min(1, 'walletAddress is required'),
  slippage: z.string().optional(),
});

export type BridgeQuoteParams = z.infer<typeof BridgeQuoteQuerySchema>;

export const BridgeStepSchema = z.object({
  type: z.string(),
  description: z.string(),
  tx: z.object({
    to: z.string(),
    data: z.string(),
    value: z.string(),
    chainId: z.number(),
    approvalAddress: z.string().optional(),
    approvalToken: z.string().optional(),
    approvalAmount: z.string().optional(),
  }),
});

export const BridgeSolanaDepositSchema = z.object({
  to: z.string(),
  amount: z.string(),
  memo: z.string(),
  mint: z.string().optional(),
  decimals: z.number().optional(),
  type: z.string().optional(),
});

export const BridgeEvmDepositSchema = z.object({
  to: z.string(),
  data: z.string(),
  value: z.string(),
  chainId: z.number(),
  approvalAddress: z.string().optional(),
  approvalToken: z.string().optional(),
  approvalAmount: z.string().optional(),
});

export const BridgeQuoteResponseSchema = z.object({
  data: z.object({
    estimatedAmountOut: z.string(),
    estimatedAmountOutUsd: z.string(),
    fees: z.object({
      bridgeFeeBps: z.number(),
      gasFeeUsd: z.string(),
      totalFeeUsd: z.string(),
    }),
    estimatedTimeMs: z.number(),
    maxTradeUsd: z.number(),
    steps: z.array(BridgeStepSchema).optional(),
    deposit: z.object({
      evm: BridgeEvmDepositSchema.optional(),
      solana: BridgeSolanaDepositSchema.optional(),
    }),
  }),
});

export type BridgeQuoteResponse = z.infer<typeof BridgeQuoteResponseSchema>;
