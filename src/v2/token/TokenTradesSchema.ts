import { z } from 'zod';
import { SwapType, Tags } from '../../utils/constants/constants.ts';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import DateQuery from '../../utils/schemas/DateQuery.ts';
import { PlatformMetadataOutput } from '../../utils/schemas/PlatformMetadataOutput.ts';
import { stringOrArray } from '../../utils/schemas/StringOrArray.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';
import { TokenMetadataMinimal } from '../../utils/schemas/TokenMetadataMinimal.ts';
import { WalletMetadataOutput } from '../../utils/schemas/WalletMetadataOutput.ts';

export const TradeDirection = z.enum(['buy', 'sell']);

export const TokenTradesParamsSchema = z.object({
  blockchain: z.string().optional(),
  address: z.string().optional(),
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().optional().default(10),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  mode: z
    .enum(['pair', 'pool', 'asset'])
    .default('pair')
    .transform((val) => (val === 'pool' ? 'pair' : val) as 'pair' | 'asset'),
  label: z.nativeEnum(Tags).optional(),
  swapTypes: stringOrArray
    .optional()
    .transform((val) =>
      val?.map((v) => v.toUpperCase()).filter((v) => Object.values(SwapType).includes(v as SwapType)),
    ),
  type: TradeDirection.optional(),
  transactionSenderAddresses: stringOrArray.optional().refine((arr) => !arr || arr.length <= 25, {
    message: 'Maximum 25 transaction sender addresses allowed',
  }),
  /** If true, filter by swap_recipient_address; if false, filter by transaction_sender_address. Same semantics as wallet positions. Default: false. */
  useSwapRecipient: z.coerce.boolean().optional().default(true),
  maxAmountUSD: z.coerce.number().optional(),
  minAmountUSD: z.coerce.number().optional(),
  fromDate: DateQuery.transform((val) => val ?? undefined),
  toDate: DateQuery.transform((val) => val ?? undefined),
});

export type TokenTradesParams = z.input<typeof TokenTradesParamsSchema>;
export type TokenTradesInferType = z.infer<typeof TokenTradesParamsSchema>;

export const TokenTradesParamsSchemaOpenAPI = createOpenAPIParams(TokenTradesParamsSchema, {
  omit: ['useSwapRecipient', 'mode'],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    address: 'Token or pool contract address',
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

export const TokenTradeOutput = z.object({
  id: z.string(),
  operation: z.string(),
  type: z.string(),
  baseTokenAmount: z.number(),
  baseTokenAmountRaw: z.string(),
  baseTokenAmountUSD: z.number(),
  quoteTokenAmount: z.number(),
  quoteTokenAmountRaw: z.string(),
  quoteTokenAmountUSD: z.number(),
  preBalanceBaseToken: z.string().nullable().optional(),
  preBalanceQuoteToken: z.string().nullable().optional(),
  postBalanceBaseToken: z.string().nullable().optional(),
  postBalanceQuoteToken: z.string().nullable().optional(),
  date: z.number(),
  swapSenderAddress: z.string(),
  transactionSenderAddress: z.string(),
  /**
   * The swap recipient is the most important wallet address in a trade transaction.
   * It represents the actual beneficiary of the swap - the wallet that receives the output tokens.
   *
   * This is critical for Account Abstraction (AA) scenarios where:
   * - The transaction sender (tx.from) is often a bundler, relayer, or smart contract wallet
   * - The swap sender may be an intermediate router or aggregator contract
   * - Only the swap recipient represents the real user/beneficiary of the trade
   *
   * For accurate wallet PnL tracking and portfolio analysis, always use swapRecipient
   * instead of transactionSenderAddress when available.
   */
  swapRecipient: z.string().nullable().optional(),
  blockchain: z.string(),
  transactionHash: z.string(),
  marketAddress: z.string(),
  marketAddresses: z.array(z.string()).optional(),
  baseTokenPriceUSD: z.number(),
  quoteTokenPriceUSD: z.number(),
  // Labels (sniper, bundler, insider, dev, proTrader, smartTrader, freshTrader)
  labels: z.array(z.string()).nullable().optional().default([]),
  // Wallet metadata from scraping_wallets (entity info)
  walletMetadata: WalletMetadataOutput.nullable().optional(),
  baseToken: TokenMetadataMinimal.nullable().optional(),
  quoteToken: TokenMetadataMinimal.nullable().optional(),
  // Platform where the trade was executed (e.g. Photon, BullX, Maestro, etc.)
  platform: PlatformMetadataOutput.nullable().optional(),
  // Fees breakdown
  totalFeesUSD: z.number().nullable().optional(),
  gasFeesUSD: z.number().nullable().optional(),
  platformFeesUSD: z.number().nullable().optional(),
  mevFeesUSD: z.number().nullable().optional(),
});

export const TokenTradeResponseSchema = z.object({
  data: z.array(TokenTradeOutput),
});

export type TokenTradesResponse = z.infer<typeof TokenTradeResponseSchema>;

// Single trade output - uses full TokenDetailsOutput for baseToken/quoteToken (prod alignment)
export const SingleTokenTradeOutput = z.object({
  id: z.string(),
  operation: z.string(),
  type: z.string(),
  baseTokenAmount: z.number(),
  baseTokenAmountRaw: z.string(),
  baseTokenAmountUSD: z.number(),
  quoteTokenAmount: z.number(),
  quoteTokenAmountRaw: z.string(),
  quoteTokenAmountUSD: z.number(),
  preBalanceBaseToken: z.string().nullable().optional(),
  preBalanceQuoteToken: z.string().nullable().optional(),
  postBalanceBaseToken: z.string().nullable().optional(),
  postBalanceQuoteToken: z.string().nullable().optional(),
  date: z.number(),
  swapSenderAddress: z.string(),
  transactionSenderAddress: z.string(),
  swapRecipient: z.string().nullable().optional(),
  blockchain: z.string(),
  transactionHash: z.string(),
  marketAddress: z.string(),
  marketAddresses: z.array(z.string()).optional(),
  baseTokenPriceUSD: z.number(),
  quoteTokenPriceUSD: z.number(),
  labels: z.array(z.string()).nullable().optional().default([]),
  walletMetadata: WalletMetadataOutput.nullable().optional(),
  baseToken: TokenDetailsOutput.optional(),
  quoteToken: TokenDetailsOutput.optional(),
  platform: PlatformMetadataOutput.nullable().optional(),
  totalFeesUSD: z.number().nullable().optional(),
  gasFeesUSD: z.number().nullable().optional(),
  platformFeesUSD: z.number().nullable().optional(),
  mevFeesUSD: z.number().nullable().optional(),
});

export const SingleTokenTradeResponseSchema = z.object({
  data: SingleTokenTradeOutput,
});

export type SingleTokenTradeResponse = z.infer<typeof SingleTokenTradeResponseSchema>;

export const FormattedTokenTradeOutput = z.object({
  // Labels (sniper, bundler, insider, dev, proTrader, smartTrader, freshTrader)
  labels: z.array(z.string()).nullable().optional().default([]),
  // Wallet metadata from scraping_wallets (entity info)
  walletMetadata: WalletMetadataOutput.nullable().optional(),
  pair: z.string(),
  date: z.number(),
  tokenPrice: z.number(),
  tokenPriceVs: z.number(),
  tokenAmount: z.number(),
  tokenAmountVs: z.number(),
  tokenAmountUsd: z.number(),
  tokenAmountVsUsd: z.number(),
  type: z.string(),
  operation: z.string(),
  blockchain: z.string(),
  hash: z.string(),
  sender: z.string(),
  /**
   * The swap recipient is the most important wallet address in a trade transaction.
   * It represents the actual beneficiary of the swap - the wallet that receives the output tokens.
   *
   * This is critical for Account Abstraction (AA) scenarios where:
   * - The transaction sender (tx.from) is often a bundler, relayer, or smart contract wallet
   * - The swap sender may be an intermediate router or aggregator contract
   * - Only the swap recipient represents the real user/beneficiary of the trade
   *
   * For accurate wallet PnL tracking and portfolio analysis, always use swapRecipient
   * instead of sender when available.
   */
  swapRecipient: z.string().nullable().optional(),
  tokenAmountRaw: z.string(),
  tokenAmountRawVs: z.string(),
  // Platform where the trade was executed (e.g. Photon, BullX, Maestro, etc.)
  platform: PlatformMetadataOutput.nullable().optional(),
  // Fees breakdown
  totalFeesUSD: z.number().nullable().optional(),
  gasFeesUSD: z.number().nullable().optional(),
  platformFeesUSD: z.number().nullable().optional(),
  mevFeesUSD: z.number().nullable().optional(),
});

export const FormattedTokenTradeResponseSchema = z.object({
  data: z.array(FormattedTokenTradeOutput),
});

export type FormattedTokenTradesResponse = z.infer<typeof FormattedTokenTradeResponseSchema>;

export const TokenTradeParamsSchema = z.object({
  blockchain: z.string().optional(),
  transactionHash: z.string().min(1, 'Transaction hash is required'),
});

export type TokenTradeParams = z.input<typeof TokenTradeParamsSchema>;
export type TokenTradeInferType = z.infer<typeof TokenTradeParamsSchema>;

export const TokenTradeParamsSchemaOpenAPI = z.object({
  blockchain: z.string().describe('Blockchain name or chain ID'),
  transactionHash: z.string().min(1).describe('Transaction hash'),
});

export const TokenTradeOutputOpenAPI = z.object({
  id: z.string(),
  operation: z.string(),
  type: z.string(),
  baseTokenAmount: z.number(),
  baseTokenAmountRaw: z.string(),
  baseTokenAmountUSD: z.number(),
  quoteTokenAmount: z.number(),
  quoteTokenAmountRaw: z.string(),
  quoteTokenAmountUSD: z.number(),
  date: z.number(),
  swapSenderAddress: z.string(),
  transactionSenderAddress: z.string(),
  /**
   * The swap recipient is the most important wallet address in a trade transaction.
   * It represents the actual beneficiary of the swap - the wallet that receives the output tokens.
   *
   * This is critical for Account Abstraction (AA) scenarios where:
   * - The transaction sender (tx.from) is often a bundler, relayer, or smart contract wallet
   * - The swap sender may be an intermediate router or aggregator contract
   * - Only the swap recipient represents the real user/beneficiary of the trade
   *
   * For accurate wallet PnL tracking and portfolio analysis, always use swapRecipient
   * instead of transactionSenderAddress when available.
   */
  swapRecipient: z
    .string()
    .nullable()
    .optional()
    .describe(
      'The actual beneficiary wallet of the swap. Most important address for AA wallets and accurate PnL tracking.',
    ),
  blockchain: z.string(),
  transactionHash: z.string(),
  marketAddress: z.string(),
  marketAddresses: z.array(z.string()).optional(),
  baseTokenPriceUSD: z.number(),
  quoteTokenPriceUSD: z.number(),
  // Labels (sniper, bundler, insider, dev, proTrader, smartTrader, freshTrader)
  labels: z.array(z.string()).nullable().optional().default([]),
  // Wallet metadata from scraping_wallets (entity info)
  walletMetadata: WalletMetadataOutput.nullable().optional(),
  baseToken: TokenMetadataMinimal.nullable().optional(),
  quoteToken: TokenMetadataMinimal.nullable().optional(),
  // Platform where the trade was executed (e.g. Photon, BullX, Maestro, etc.)
  platform: PlatformMetadataOutput.nullable().optional(),
  // Fees breakdown
  totalFeesUSD: z.number().nullable().optional(),
  gasFeesUSD: z.number().nullable().optional(),
  platformFeesUSD: z.number().nullable().optional(),
  mevFeesUSD: z.number().nullable().optional(),
});

export const SingleTokenTradeResponseSchemaOpenAPI = z.object({
  data: TokenTradeOutputOpenAPI,
});
