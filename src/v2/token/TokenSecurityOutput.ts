import { z } from 'zod';

/**
 * Static analysis status enum:
 * - completed: Analysis has been performed and results are included
 * - pending: Analysis has been triggered and is in progress (results will be available on next request)
 * - not_available: Chain not supported for static analysis or service disabled
 * - insufficient_liquidity: Token doesn't meet minimum liquidity requirements
 * - not_evm: Static analysis only available for EVM chains
 */
export const StaticAnalysisStatusEnum = z.enum([
  'completed',
  'pending',
  'not_available',
  'insufficient_liquidity',
  'not_evm',
]);

export type StaticAnalysisStatus = z.infer<typeof StaticAnalysisStatusEnum>;

export const TokenSecurityOutput = z.object({
  address: z.string(),
  chainId: z.string(),
  contractHoldingsPercentage: z.number().nullable(),
  contractBalanceRaw: z.string().nullable(),
  burnedHoldingsPercentage: z.number().nullable(),
  totalBurnedBalanceRaw: z.string().nullable(),
  buyFeePercentage: z.number(),
  sellFeePercentage: z.number(),
  maxWalletAmountRaw: z.string().nullable(),
  maxSellAmountRaw: z.string().nullable(),
  maxBuyAmountRaw: z.string().nullable(),
  maxTransferAmountRaw: z.string().nullable(),
  // Additional security fields
  isLaunchpadToken: z.boolean().nullable(),
  top10HoldingsPercentage: z.number().nullable(),
  top50HoldingsPercentage: z.number().nullable(),
  top100HoldingsPercentage: z.number().nullable(),
  top200HoldingsPercentage: z.number().nullable(),
  isMintable: z.boolean().nullable(),
  isFreezable: z.boolean().nullable(),
  // Terminal volume percentage: (feesPaid24h / volume24h) * 100 * 50 - estimates % of 24h volume from terminal users
  proTraderVolume24hPercentage: z.number().nullable(),
  // Security flags from SecuritySchemas
  transferPausable: z.boolean().nullable(),
  isBlacklisted: z.boolean().nullable(),
  isHoneypot: z.boolean().nullable(),
  isNotOpenSource: z.boolean().nullable(),
  renounced: z.boolean().nullable(),
  locked: z.string().nullable(),
  isWhitelisted: z.boolean().nullable(),
  balanceMutable: z.boolean().nullable(),
  lowLiquidity: z.string().nullable(),
  burnRate: z.string().nullable(),
  modifyableTax: z.boolean().nullable(),
  selfDestruct: z.boolean().nullable(),
  // Static analysis status
  staticAnalysisStatus: StaticAnalysisStatusEnum.nullable(),
  staticAnalysisDate: z.string().nullable(),
  // Liquidity burn: percentage of LP tokens sent to dead/zero addresses
  liquidityBurnPercentage: z.number().nullable(),
});

export type TokenSecurityOutputType = z.infer<typeof TokenSecurityOutput>;

export const TokenSecurityResponseSchema = z.object({
  data: TokenSecurityOutput,
  hostname: z.string().optional(),
});

export type TokenSecurityResponse = z.infer<typeof TokenSecurityResponseSchema>;
