import { z } from 'zod';
import { SwapType, Tags } from '../../utils/constants/constants.ts';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import DateQuery from '../../utils/schemas/DateQuery.ts';
import { MarketDetailsOutput } from '../../utils/schemas/MarketDetailsOutput.ts';
import { PlatformMetadataOutput } from '../../utils/schemas/PlatformMetadataOutput.ts';
import { stringOrArray } from '../../utils/schemas/StringOrArray.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';
import { WalletMetadataOutput } from '../../utils/schemas/WalletMetadataOutput.ts';

/**
 * EnrichedTradesParams - Query parameters for the token/trades-enriched endpoint
 *
 * Same access pattern as token/trades (pool-focused, offset/limit pagination)
 * but returns swaps in BaseMessageType format (same as WebSocket streams),
 * including full pairData (MarketDetailsOutput) and tokenData (TokenDetailsOutput).
 */
export const EnrichedTradesParamsSchema = z.object({
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
  useSwapRecipient: z.coerce.boolean().optional().default(true),
  maxAmountUSD: z.coerce.number().optional(),
  minAmountUSD: z.coerce.number().optional(),
  fromDate: DateQuery.transform((val) => val ?? undefined),
  toDate: DateQuery.transform((val) => val ?? undefined),
});

export type EnrichedTradesParams = z.input<typeof EnrichedTradesParamsSchema>;
export type EnrichedTradesInferType = z.infer<typeof EnrichedTradesParamsSchema>;

/**
 * OpenAPI-safe params schema (stripped of transforms/effects, with descriptions)
 */
export const EnrichedTradesParamsSchemaOpenAPI = createOpenAPIParams(EnrichedTradesParamsSchema, {
  omit: ['useSwapRecipient'],
  describe: {
    blockchain: 'Blockchain name or chain ID',
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
 * Enriched trade output - BaseMessageType as Zod schema
 * Same format as WebSocket stream enriched swaps
 */
export const EnrichedTradeOutput = z.object({
  pair: z.string(),
  date: z.number(),
  token_price: z.number(),
  token_price_vs: z.number(),
  token_amount: z.number(),
  token_amount_vs: z.number(),
  token_amount_usd: z.number().optional(),
  type: z.string(),
  operation: z.string(),
  blockchain: z.string(),
  hash: z.string(),
  sender: z.string(),
  token_amount_raw: z.string(),
  token_amount_raw_vs: z.string(),
  labels: z.array(z.string()).optional(),
  walletMetadata: WalletMetadataOutput.nullable().optional(),
  pairData: MarketDetailsOutput.optional(),
  tokenData: TokenDetailsOutput.optional(),
  preBalanceBaseToken: z.string().nullable(),
  preBalanceQuoteToken: z.string().nullable(),
  postBalanceBaseToken: z.string().nullable(),
  postBalanceQuoteToken: z.string().nullable(),
  platform: z.string().nullable().optional(),
  platformMetadata: PlatformMetadataOutput.nullable().optional(),
  swapRecipient: z.string().nullable().optional(),
});

export type EnrichedTradeOutputType = z.infer<typeof EnrichedTradeOutput>;

/**
 * Response schema for token/trades-enriched endpoint
 */
export const EnrichedTradesResponseSchema = z.object({
  data: z.array(EnrichedTradeOutput),
});

export type EnrichedTradesResponse = z.infer<typeof EnrichedTradesResponseSchema>;
