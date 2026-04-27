import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { tokenPositionSchema, WalletMetadataSchema } from '../../utils/schemas/WalletDeployerSchema.ts';

/**
 * Sort options for wallet positions (camelCase API values)
 * - lastActivity: Sort by last trade date (default)
 * - realizedPnl: Sort by realized PnL USD
 *
 * Internally mapped to snake_case for SQL queries:
 * - lastActivity → last_activity
 * - realizedPnl → realized_pnl
 */
export const PositionSortBySchema = z.enum(['lastActivity', 'realizedPnl']).default('lastActivity');
export type PositionSortBy = z.infer<typeof PositionSortBySchema>;

/**
 * Map camelCase sortBy values to internal snake_case values for SQL queries
 */
export const positionSortByToInternal = (sortBy: PositionSortBy): 'last_activity' | 'realized_pnl' => {
  const mapping: Record<PositionSortBy, 'last_activity' | 'realized_pnl'> = {
    lastActivity: 'last_activity',
    realizedPnl: 'realized_pnl',
  };
  return mapping[sortBy];
};

export const WalletPositionsParamsSchema = z.object({
  wallet: z.string(),
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  chainIds: z
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

  // Pagination
  limit: z.coerce.number().min(1).max(500).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),

  // Cursor-based pagination (takes precedence over offset)
  cursor: z.string().optional(),
  cursorDirection: z.enum(['before', 'after']).optional().default('after'),

  // Sorting
  sortBy: PositionSortBySchema.optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),

  // Internal backfill options (not documented)
  _backfillPositions: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  _backfillSwapsAndPositions: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Include fees in PnL calculation (deduct total_fees_paid_usd from PnL) */
  includeFees: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Include all RPC balances, not just tokens with trading positions in DB */
  includeAllBalances: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
});

/** Fields accepted at runtime but hidden from SDK types and OpenAPI spec */
const WALLET_POSITIONS_HIDDEN = [
  'chainId',
  'blockchain',
  'blockchains',
  '_backfillPositions',
  '_backfillSwapsAndPositions',
] as const;
type WalletPositionsHiddenFields = (typeof WALLET_POSITIONS_HIDDEN)[number];

export type WalletPositionsParams = SDKInput<typeof WalletPositionsParamsSchema, WalletPositionsHiddenFields>;

export const WalletPositionsParamsSchemaOpenAPI = createOpenAPIParams(WalletPositionsParamsSchema, {
  omit: [...WALLET_POSITIONS_HIDDEN],
  describe: {
    wallet: 'Wallet address',
    chainIds: 'Comma-separated list of chain IDs (e.g., "evm:1,evm:8453,solana:solana"). If omitted, all chains.',
    limit: 'Number of positions per page (1-500, default: 100)',
    offset: 'Offset for pagination (default: 0)',
    cursor: 'Cursor for cursor-based pagination (takes precedence over offset)',
    cursorDirection: 'Cursor direction (default: after)',
    sortBy: 'Sort field (default: lastActivity)',
    order: 'Sort order (default: desc)',
    includeFees: 'Include fees in PnL calculation (deduct total_fees_paid_usd from PnL)',
    useSwapRecipient: 'Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions)',
    includeAllBalances: 'Include all tokens the wallet holds, not just tokens with trading history',
  },
});

export const SinglePositionQuery = z.object({
  wallet: z.string(),
  asset: z.string(),
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  /** Include fees in PnL calculation (deduct total_fees_paid_usd from PnL) */
  includeFees: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
});

const SINGLE_POSITION_HIDDEN = ['includeFees', 'useSwapRecipient', 'blockchain'] as const;
type SinglePositionHiddenFields = (typeof SINGLE_POSITION_HIDDEN)[number];

export const SinglePositionQueryOpenAPI = createOpenAPIParams(SinglePositionQuery, {
  omit: [...SINGLE_POSITION_HIDDEN],
  describe: {
    wallet: 'Wallet address',
    asset: 'Token contract address',
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
  },
});

// Batch position query - single item schema
const SinglePositionItemSchema = z.object({
  wallet: z.string(),
  asset: z.string(),
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  /** Include fees in PnL calculation (deduct total_fees_paid_usd from PnL) */
  includeFees: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
});

// Batch position params - supports array or object with items
export const SinglePositionBatchParamsSchema = z.union([
  z.array(SinglePositionItemSchema),
  z.object({
    items: z.array(SinglePositionItemSchema),
    instanceTracking: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional()),
  }),
]);

// OpenAPI-compatible batch params (hides internal fields per item)
const SinglePositionItemSchemaOpenAPI = createOpenAPIParams(SinglePositionItemSchema, {
  omit: [...SINGLE_POSITION_HIDDEN],
  describe: {
    wallet: 'Wallet address',
    asset: 'Token contract address',
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
  },
});

export const SinglePositionBatchParamsSchemaOpenAPI = z.union([
  z.array(SinglePositionItemSchemaOpenAPI),
  z.object({
    items: z.array(SinglePositionItemSchemaOpenAPI),
  }),
]);

export type SinglePositionBatchParams = z.input<typeof SinglePositionBatchParamsSchema>;

export type TokenPositionType = z.infer<typeof tokenPositionSchema>;

// Pagination schema aligned with WalletActivityV2
export const WalletPositionsPaginationSchema = z.object({
  page: z.number(),
  offset: z.number(),
  limit: z.number(),
  pageEntries: z.number(), // Number of items actually returned
});

export const WalletPositionsResponseSchema = z.object({
  data: z.array(tokenPositionSchema),
  // Wallet-level metadata (funding info, global labels)
  wallet: WalletMetadataSchema.optional(),
  // Pagination info
  pagination: WalletPositionsPaginationSchema.optional(),
});

export type WalletPositionsResponse = z.infer<typeof WalletPositionsResponseSchema>;

export const singlePositionOutputSchema = z.object({
  data: tokenPositionSchema,
  // Wallet-level metadata (funding info, global labels)
  wallet: WalletMetadataSchema.optional(),
});

// Batch position item schema - includes wallet for identification
export const batchPositionItemSchema = tokenPositionSchema.extend({
  wallet: z.string(),
});

// Batch response schema
export const SinglePositionBatchResponseSchema = z.object({
  payload: z.array(
    batchPositionItemSchema.or(z.object({ error: z.string().optional(), wallet: z.string().optional() })).nullable(),
  ),
  hostname: z.string().optional(),
});

export type SinglePositionBatchResponse = z.infer<typeof SinglePositionBatchResponseSchema>;
export type BatchPositionItem = z.infer<typeof batchPositionItemSchema>;

// Type aliases for SDK consistency
export type WalletPositionParams = SDKInput<typeof SinglePositionQuery, SinglePositionHiddenFields>;
export type WalletPositionResponse = z.infer<typeof singlePositionOutputSchema>;

type CleanBatchItem = Omit<z.input<typeof SinglePositionItemSchema>, SinglePositionHiddenFields>;
export type WalletPositionBatchParams = CleanBatchItem[] | { items: CleanBatchItem[]; instanceTracking?: boolean };
export type WalletPositionBatchResponse = z.infer<typeof SinglePositionBatchResponseSchema>;

// ── Batch Positions (multi-wallet) ──────────────────────────────────────────

// Per-wallet item in a batch positions request
const WalletPositionsBatchItemSchema = z.object({
  wallet: z.string(),
  chainIds: z.array(z.string()).optional(),
  blockchains: z.array(z.string()).optional(),
  limit: z.number().min(1).max(500).optional().default(100),
  offset: z.number().min(0).optional().default(0),
  sortBy: PositionSortBySchema.optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  useSwapRecipient: z.boolean().optional().default(true),
  includeAllBalances: z.boolean().optional().default(false),
  _backfillPositions: z.boolean().optional().default(false),
  _backfillSwapsAndPositions: z.boolean().optional().default(false),
});

// Batch positions params - supports array or object with items (max 10 wallets)
export const WalletPositionsBatchParamsSchema = z.union([
  z.array(WalletPositionsBatchItemSchema).max(10),
  z.object({
    items: z.array(WalletPositionsBatchItemSchema).max(10),
  }),
]);

export type WalletPositionsBatchItemInput = z.infer<typeof WalletPositionsBatchItemSchema>;

// Response for a single wallet within the batch
const WalletPositionsBatchResultSchema = z.object({
  wallet: z.string(),
  data: z.array(tokenPositionSchema),
  walletMetadata: WalletMetadataSchema.optional(),
  pagination: WalletPositionsPaginationSchema.optional(),
});

// Full batch response
export const WalletPositionsBatchResponseSchema = z.object({
  payload: z.array(WalletPositionsBatchResultSchema.or(z.object({ wallet: z.string(), error: z.string() })).nullable()),
  hostname: z.string().optional(),
});

export type WalletPositionsBatchResult = z.infer<typeof WalletPositionsBatchResultSchema>;
export type WalletPositionsBatchResponse = z.infer<typeof WalletPositionsBatchResponseSchema>;

// OpenAPI-compatible batch positions schemas
const WalletPositionsBatchItemSchemaOpenAPI = createOpenAPIParams(WalletPositionsBatchItemSchema, {
  omit: ['_backfillPositions', 'blockchains'],
  describe: {
    wallet: 'Wallet address',
    chainIds: 'Array of chain IDs (e.g., ["evm:1","evm:8453"]). If omitted, all chains.',
    limit: 'Number of positions per page (1-500, default: 100)',
    offset: 'Offset for pagination (default: 0)',
    sortBy: 'Sort field (default: lastActivity)',
    order: 'Sort order (default: desc)',
    useSwapRecipient: 'Use swap recipient mode',
    includeAllBalances: 'Include all tokens the wallet holds',
  },
});

export const WalletPositionsBatchParamsSchemaOpenAPI = z.union([
  z.array(WalletPositionsBatchItemSchemaOpenAPI),
  z.object({
    items: z.array(WalletPositionsBatchItemSchemaOpenAPI),
  }),
]);

// SDK type aliases for batch positions
export type WalletPositionsBatchParams =
  | z.input<typeof WalletPositionsBatchItemSchema>[]
  | { items: z.input<typeof WalletPositionsBatchItemSchema>[] };
