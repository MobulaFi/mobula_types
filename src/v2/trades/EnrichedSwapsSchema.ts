import { z } from 'zod';
import { SwapType, Tags } from '../../utils/constants/constants.ts';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import DateQuery from '../../utils/schemas/DateQuery.ts';
import { MarketDetailsOutput } from '../../utils/schemas/MarketDetailsOutput.ts';
import { PlatformMetadataOutput } from '../../utils/schemas/PlatformMetadataOutput.ts';
import { stringOrArray } from '../../utils/schemas/StringOrArray.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';
import { WalletMetadataOutput } from '../../utils/schemas/WalletMetadataOutput.ts';
import { TokenTradeType, TradeOperation } from '../token/TokenTradesSchema.ts';

/**
 * EnrichedTradesParams - Query parameters for the token/trades-enriched endpoint
 *
 * Same access pattern as token/trades (pool-focused, offset/limit pagination)
 * but returns swaps in BaseMessageType format (same as WebSocket streams),
 * including full pairData (MarketDetailsOutput) and tokenData (TokenDetailsOutput).
 */
export const EnrichedTradesParamsSchema = z.object({
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  address: z.string().optional(),
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().optional().default(10),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  label: z.nativeEnum(Tags).optional(),
  swapTypes: stringOrArray
    .optional()
    .transform((val) =>
      val?.map((v) => v.toUpperCase()).filter((v) => Object.values(SwapType).includes(v as SwapType)),
    ),
  type: z.enum(['buy', 'sell']).optional(),
  transactionSenderAddresses: stringOrArray.optional().refine((arr) => !arr || arr.length <= 25, {
    message: 'Maximum 25 transaction sender addresses allowed',
  }),
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  maxAmountUSD: z.coerce.number().optional(),
  minAmountUSD: z.coerce.number().optional(),
  fromDate: DateQuery.transform((val) => val ?? undefined),
  toDate: DateQuery.transform((val) => val ?? undefined),
});

export type EnrichedTradesParams = SDKInput<typeof EnrichedTradesParamsSchema, 'blockchain'>;
export type EnrichedTradesInferType = z.infer<typeof EnrichedTradesParamsSchema>;

/**
 * OpenAPI-safe params schema (stripped of transforms/effects, with descriptions)
 */
export const EnrichedTradesParamsSchemaOpenAPI = createOpenAPIParams(EnrichedTradesParamsSchema, {
  omit: ['useSwapRecipient', 'blockchain'],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    address: 'Pool/pair contract address',
    offset: 'Offset for pagination (default: 0)',
    limit: 'Number of trades per page (default: 10)',
    sortOrder: 'Sort order: asc or desc (default: desc)',
    label: 'Filter by wallet label (e.g., sniper, insider, bundler)',
    swapTypes: 'Comma-separated swap types to filter (e.g., "REGULAR,MEV")',
    type: 'Filter by trade direction: "buy" or "sell"',
    transactionSenderAddresses: 'Comma-separated wallet addresses to filter (max 25)',
    maxAmountUSD: 'Maximum trade amount in USD',
    minAmountUSD: 'Minimum trade amount in USD',
    fromDate: 'Start date filter (timestamp or ISO string)',
    toDate: 'End date filter (timestamp or ISO string)',
  },
});

/**
 * Enriched trade output — matches the WebSocket stream `swap-enriched` event format.
 *
 * The REST endpoint mirrors the stream's BuildMessageReturn (CuratedSwap + deriveSwapView fields).
 * All field names are camelCase, matching the stream output exactly.
 *
 * ## Fields NOT available from REST (only present in real-time stream)
 *
 * These fields exist in the stream but are populated in-memory by the extractors and never
 * persisted to the warehouse DB. They will be absent from REST responses:
 *
 * - `rawPostBalanceRecipient0` / `rawPostBalanceRecipient1` — recipient token balances after swap
 * - `rawPostBalanceNativeSender` / `rawPostBalanceNativeRecipient` — native SOL balances (Solana only)
 * - `miniBlockSlot` — Solana mini-block ordering slot (internal to swap-extractor)
 * - `blockHeight` / `blockHash` / `logIndex` / `transactionIndex` — returned as null (not stored in warehouse)
 *
 * ## REST-only enrichments (not in stream)
 *
 * - `labels` — wallet labels (sniper, insider, bundler, dev, etc.)
 * - `walletMetadata` — entity name/label for known wallets
 * - `platformMetadata` — DEX platform metadata (name, logo, etc.)
 */
export const EnrichedTradeOutput = z.object({
  // CuratedSwap core fields
  addressToken0: z.string(),
  addressToken1: z.string(),
  amount0: z.number(),
  amount1: z.number(),
  amountUSD: z.number().optional(),
  rawAmount0: z.string(),
  rawAmount1: z.string(),
  priceUSDToken0: z.number().optional(),
  priceUSDToken1: z.number().optional(),
  swapType: z.nativeEnum(SwapType),
  poolType: z.string().nullable(),
  poolAddress: z.string(),
  swapSenderAddress: z.string().nullable(),
  transactionHash: z.string(),
  transactionSenderAddress: z.string(),
  transactionIndex: z.number().nullable(),
  transactionSwapsCount: z.number(),
  swapRecipient: z.string().nullable().optional(),
  swapIndex: z.number(),
  ratio: z.number(),
  chainId: z.string(),
  timestamp: z.string(),
  blockHeight: z.unknown().nullable(),
  blockHash: z.string().nullable(),
  logIndex: z.number().nullable(),
  platform: z.string().nullable().optional(),

  // Raw balance fields (from warehouse DB)
  rawPreBalance0: z.string().nullable(),
  rawPreBalance1: z.string().nullable(),
  rawPostBalance0: z.string().nullable(),
  rawPostBalance1: z.string().nullable(),

  // Fee fields
  gasFeesUSD: z.number(),
  platformFeesUSD: z.number(),
  mevFeesUSD: z.number(),
  totalFeesUSD: z.number(),
  gasFeesNativeRaw: z.string(),
  platformFeesNativeRaw: z.string(),
  mevFeesNativeRaw: z.string(),
  totalFeesNativeRaw: z.string(),

  // deriveSwapView derived fields
  baseToken: z.string(),
  quoteToken: z.string(),
  pair: z.string(),
  date: z.coerce.date(),
  tokenPrice: z.number(),
  tokenPriceVs: z.number(),
  priceNative: z.number(),
  tokenAmount: z.number(),
  tokenAmountVs: z.number(),
  tokenAmountUSD: z.number().optional(),
  type: TokenTradeType,
  operation: TradeOperation,
  blockchain: z.string(),
  hash: z.string(),
  sender: z.string(),
  tokenAmountRaw: z.string(),
  tokenAmountRawVs: z.string(),

  // Enrichment data
  baseTokenData: TokenDetailsOutput.optional(),
  quoteTokenData: TokenDetailsOutput.optional(),
  pairData: MarketDetailsOutput.optional(),
  marketCapUSD: z.number().optional(),
  marketCapDilutedUSD: z.number().optional(),
  totalSupply: z.number().optional(),
  circulatingSupply: z.number().optional(),

  // Position data
  position: z
    .object({
      balance: z.number(),
      rawBalance: z.string(),
      amountUSD: z.number(),
      nativeBalanceRaw: z.string(),
      nativeBalance: z.number(),
      buys: z.number(),
      sells: z.number(),
      volumeBuyToken: z.number(),
      volumeSellToken: z.number(),
      volumeBuy: z.number(),
      volumeSell: z.number(),
      avgBuyPriceUSD: z.number(),
      avgSellPriceUSD: z.number(),
      realizedPnlUSD: z.number(),
      unrealizedPnlUSD: z.number(),
      totalPnlUSD: z.number(),
      realizedPnlPercent: z.number(),
      unrealizedPnlPercent: z.number(),
    })
    .optional(),

  // REST-only enrichments
  labels: z.array(z.string()).optional(),
  walletMetadata: WalletMetadataOutput.nullable().optional(),
  platformMetadata: PlatformMetadataOutput.nullable().optional(),
});

export type EnrichedTradeOutputType = z.infer<typeof EnrichedTradeOutput>;

/**
 * Response schema for token/trades-enriched endpoint
 */
export const EnrichedTradesResponseSchema = z.object({
  data: z.array(EnrichedTradeOutput),
});

export type EnrichedTradesResponse = z.infer<typeof EnrichedTradesResponseSchema>;
