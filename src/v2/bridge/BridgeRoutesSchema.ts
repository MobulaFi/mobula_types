import { z } from 'zod';

/**
 * Bridge Routes Schema (Alpha Preview)
 *
 * Lists all supported cross-chain bridge routes.
 * Routes are all-to-all between supported chains (excluding same-chain).
 *
 * Supported chains:
 * - evm:8453 (Base)
 * - evm:56 (BSC)
 * - evm:42161 (Arbitrum)
 * - evm:137 (Polygon)
 * - solana:solana (Solana)
 * - hl:mainnet (HyperLiquid L1)
 */
export const BridgeRouteSchema = z.object({
  originChainId: z.string(),
  destinationChainId: z.string(),
  estimatedTimeMs: z.number(),
  maxTradeUsd: z.number(),
  feeBps: z.number(),
  supportedTokens: z.string(),
});

export const BridgeRoutesResponseSchema = z.object({
  data: z.object({
    routes: z.array(BridgeRouteSchema),
  }),
});

export type BridgeRoutesResponse = z.infer<typeof BridgeRoutesResponseSchema>;
