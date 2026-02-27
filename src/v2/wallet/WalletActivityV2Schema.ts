import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import { PlatformMetadataOutput } from '../../utils/schemas/PlatformMetadataOutput.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';

export type WalletActivityV2ControllerUnsafeParams = {
  wallet: string;
  blockchains?: string;
  blacklist?: string;
  offset?: number | string;
  limit?: number | string;
  order?: string;
  pagination_details?: boolean | string;
  unlistedAssets?: boolean | string;
  filterSpam?: boolean | string;
  backfillTransfers?: boolean | string;
  backfillBalances?: boolean | string;
  // camelCase (preferred)
  cursorHash?: string;
  cursorDirection?: 'before' | 'after';
  // snake_case (legacy, for backwards compatibility)
  cursor_hash?: string;
  cursor_direction?: 'before' | 'after';
  enrichSwaps?: boolean | string;
  from?: number | string;
  to?: number | string;
};

export const WalletActivityV2ParamsSchema = z
  .object({
    wallet: z.string(),
    blockchains: z
      .string()
      .optional()
      .transform((val) => {
        if (val) {
          return val
            .split(',')
            .map((b) => b.trim())
            .filter((b) => b.length > 0);
        }
        return [];
      }),
    blacklist: z
      .string()
      .optional()
      .transform((val) => (val ? val.split(',').map((addr) => addr.trim().toLowerCase()) : [])),
    offset: z.coerce.number().optional().default(0),
    limit: z.coerce.number().optional().default(100),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    pagination: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true')
      .default(false),
    unlistedAssets: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true')
      .default(true),
    filterSpam: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true')
      .default(true),
    backfillTransfers: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true')
      .default(false),
    backfillBalances: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true')
      .default(false),
    // Cursor params: support both camelCase (preferred) and snake_case (legacy)
    cursorHash: z.string().optional(),
    cursorDirection: z.enum(['before', 'after']).optional(),
    // Legacy snake_case params (for backwards compatibility)
    cursor_hash: z.string().optional(),
    cursor_direction: z.enum(['before', 'after']).optional(),
    withTokens: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true')
      .default(false),
    // When true, enriches swap actions with platform and fee data from the swaps table.
    // Adds ~300-400ms overhead due to TimescaleDB partition scanning.
    enrichSwaps: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true')
      .default(false),
    // Optional date filters (timestamps in milliseconds)
    from: z.coerce.number().optional(),
    to: z.coerce.number().optional(),
  })
  .transform((data) => ({
    ...data,
    // Merge cursor params: prefer camelCase, fallback to snake_case
    cursorHash: data.cursorHash ?? data.cursor_hash,
    cursorDirection: data.cursorDirection ?? data.cursor_direction ?? 'before',
  }));

export type WalletActivityV2Params = z.input<typeof WalletActivityV2ParamsSchema>;

export const WalletActivityV2ParamsSchemaOpenAPI = createOpenAPIParams(WalletActivityV2ParamsSchema, {
  omit: [
    'blacklist',
    'pagination',
    'backfillTransfers',
    'backfillBalances',
    'cursor_hash',
    'cursor_direction',
    'withTokens',
    'enrichSwaps',
  ],
  describe: {
    wallet: 'Wallet address',
    blockchains: 'Comma-separated list of blockchain IDs (e.g., "ethereum,base,solana:solana")',
    offset: 'Offset for pagination (default: 0)',
    limit: 'Number of transactions per page (default: 100)',
    order: 'Sort order: asc or desc (default: desc)',
    unlistedAssets: 'Include unlisted assets (default: true)',
    filterSpam: 'Filter spam transactions (default: true)',
    cursorHash: 'Cursor hash for cursor-based pagination',
    cursorDirection: 'Cursor direction: before or after',
    from: 'Start timestamp in milliseconds',
    to: 'End timestamp in milliseconds',
  },
});

// Reusable asset schema used in nested activity items
const ActivityAssetSchema = z.object({
  id: z.number().nullable(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  totalSupply: z.number(),
  circulatingSupply: z.number(),
  price: z.number(),
  liquidity: z.number(),
  priceChange24hPercent: z.number(),
  marketCapUsd: z.number(),
  logo: z.string().nullable(),
  contract: z.string(),
});

// Activities that occurred within a single transaction
export const WalletActivityV2TransactionActivitySchema = z.object({
  model: z.enum(['swap', 'transfer']),

  // Swap-specific fields
  swapType: z.enum(['REGULAR', 'MEV', 'SANDWICHED_MEV', 'DEPOSIT', 'WITHDRAW']).optional(),
  swapRawAmountOut: z.number().optional(),
  swapRawAmountIn: z.number().optional(),
  swapAmountOut: z.number().optional(),
  swapAmountIn: z.number().optional(),
  swapPriceUsdTokenOut: z.number().optional(),
  swapPriceUsdTokenIn: z.number().optional(),
  swapAmountUsd: z.number().optional(),
  swapTransactionSenderAddress: z.string().optional(),
  swapBaseAddress: z.string().optional(),
  swapQuoteAddress: z.string().optional(),
  swapAmountQuote: z.number().optional(),
  swapAmountBase: z.number().optional(),
  swapAssetIn: ActivityAssetSchema.optional(),
  swapAssetOut: ActivityAssetSchema.optional(),
  // Platform where the swap was executed (e.g. Photon, BullX, Maestro, etc.)
  swapPlatform: PlatformMetadataOutput.nullable().optional(),
  // Fees breakdown from actual swap data
  swapTotalFeesUsd: z.number().nullable().optional(),
  swapGasFeesUsd: z.number().nullable().optional(),
  swapPlatformFeesUsd: z.number().nullable().optional(),
  swapMevFeesUsd: z.number().nullable().optional(),

  // Transfer-specific fields
  transferRawAmount: z.string().optional(),
  transferAmount: z.number().optional(),
  transferAmountUsd: z.number().optional(),
  transferType: z
    .enum(['VAULT_DEPOSIT', 'VAULT_WITHDRAW', 'VAULT_UNSTAKE', 'TOKEN_IN', 'TOKEN_OUT', 'NATIVE_IN', 'NATIVE_OUT'])
    .optional(),
  transferFromAddress: z.string().optional().nullable(),
  transferToAddress: z.string().optional().nullable(),
  transferAsset: ActivityAssetSchema.optional(),
});

// Grouped by transaction hash
export const WalletActivityV2TransactionSchema = z.object({
  chainId: z.string(),
  txDateMs: z.number(),
  txDateIso: z.string(),
  txHash: z.string(),
  txRawFeesNative: z.string(),
  txFeesNativeUsd: z.number(),
  txBlockNumber: z.number(),
  txIndex: z.number(),
  txAction: z.string().optional().nullable(),

  actions: z.array(WalletActivityV2TransactionActivitySchema),
});

export const WalletActivityV2OutputDataSchema = z.array(WalletActivityV2TransactionSchema);

export const WalletActivityV2OutputPaginationSchema = z.object({
  page: z.number(),
  offset: z.number(),
  limit: z.number(),
  pageEntries: z.number(),
});

export const WalletActivityV2ResponseSchema = z.object({
  data: WalletActivityV2OutputDataSchema,
  pagination: WalletActivityV2OutputPaginationSchema,
  backfillStatus: z.enum(['processed', 'processing', 'pending']).optional(),
  tokens: z.array(TokenDetailsOutput).optional(),
});

export type WalletActivityV2Response = z.input<typeof WalletActivityV2ResponseSchema>;
