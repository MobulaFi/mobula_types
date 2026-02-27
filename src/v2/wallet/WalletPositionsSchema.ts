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
  blockchain: z.string().optional(),
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
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
});

/** Fields accepted at runtime but hidden from SDK types and OpenAPI spec */
const WALLET_POSITIONS_HIDDEN = [
  'blockchain',
  '_backfillPositions',
  '_backfillSwapsAndPositions',
  'includeFees',
  'useSwapRecipient',
] as const;
type WalletPositionsHiddenFields = (typeof WALLET_POSITIONS_HIDDEN)[number];

export type WalletPositionsParams = SDKInput<typeof WalletPositionsParamsSchema, WalletPositionsHiddenFields>;

export const WalletPositionsParamsSchemaOpenAPI = createOpenAPIParams(WalletPositionsParamsSchema, {
  omit: [...WALLET_POSITIONS_HIDDEN],
  describe: {
    wallet: 'Wallet address',
    blockchains:
      'Comma-separated list of blockchain IDs (e.g., "ethereum,base,solana:solana"). If omitted, all chains.',
    limit: 'Number of positions per page (1-500, default: 100)',
    offset: 'Offset for pagination (default: 0)',
    cursor: 'Cursor for cursor-based pagination (takes precedence over offset)',
    cursorDirection: 'Cursor direction (default: after)',
    sortBy: 'Sort field (default: lastActivity)',
    order: 'Sort order (default: desc)',
  },
});

export const SinglePositionQuery = z.object({
  wallet: z.string(),
  asset: z.string(),
  blockchain: z.string().optional(),
  /** Include fees in PnL calculation (deduct total_fees_paid_usd from PnL) */
  includeFees: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
});

const SINGLE_POSITION_HIDDEN = ['includeFees', 'useSwapRecipient'] as const;
type SinglePositionHiddenFields = (typeof SINGLE_POSITION_HIDDEN)[number];

export const SinglePositionQueryOpenAPI = createOpenAPIParams(SinglePositionQuery, {
  omit: [...SINGLE_POSITION_HIDDEN],
  describe: {
    wallet: 'Wallet address',
    asset: 'Token contract address',
    blockchain: 'Blockchain ID (e.g., "ethereum", "solana:solana")',
  },
});

// Batch position query - single item schema
const SinglePositionItemSchema = z.object({
  wallet: z.string(),
  asset: z.string(),
  blockchain: z.string(),
  /** Include fees in PnL calculation (deduct total_fees_paid_usd from PnL) */
  includeFees: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(false)
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
    blockchain: 'Blockchain ID (e.g., "ethereum", "solana:solana")',
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
