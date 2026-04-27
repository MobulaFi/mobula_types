import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';

/** One buy→sell cycle — closed or still open. */
export const PositionCycleSchema = z.object({
  /** True when the last cycle has not yet returned to dust balance. */
  isOpen: z.boolean(),
  entryDate: z.coerce.date(),
  /** Null when the cycle is still open. */
  exitDate: z.coerce.date().nullable(),

  buys: z.number(),
  sells: z.number(),
  /** Total target-token amount received during the cycle. */
  volumeBuyToken: z.number(),
  /** Total target-token amount sent during the cycle. */
  volumeSellToken: z.number(),
  /** Total USD paid to buy during the cycle. */
  volumeBuyUSD: z.number(),
  /** Total USD received from sells during the cycle. */
  volumeSellUSD: z.number(),

  avgBuyPriceUSD: z.number(),
  avgSellPriceUSD: z.number(),

  /**
   * Realized PnL on sold tokens only: (avgSell − avgBuy) × min(sellToken, buyToken).
   * For a cleanly closed cycle this equals volumeSellUSD − volumeBuyUSD.
   */
  realizedPnlUSD: z.number(),
  /**
   * Open cycles only: remainingBalance × (currentPriceUSD − avgBuyPriceUSD). 0 for closed.
   */
  unrealizedPnlUSD: z.number(),
  /** Realized + unrealized. */
  totalPnlUSD: z.number(),

  /** Tokens still held at cycle end (0 for closed cycles, ± dust). */
  remainingBalance: z.number(),
  /** Current USD price used to compute unrealized PnL (null for closed cycles). */
  currentPriceUSD: z.number().nullable(),

  feesUSD: z.number(),
  swapCount: z.number(),
});

export type PositionCycleOutput = z.infer<typeof PositionCycleSchema>;

// ── Single-token endpoint ───────────────────────────────────────────────────

export const WalletPositionHistoryQuery = z.object({
  wallet: z.string(),
  asset: z.string(),
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((v) => (typeof v === 'string' ? v === 'true' : v)),
});

const POSITION_HISTORY_HIDDEN = ['blockchain', 'useSwapRecipient'] as const;
type PositionHistoryHiddenFields = (typeof POSITION_HISTORY_HIDDEN)[number];

export const WalletPositionHistoryQueryOpenAPI = createOpenAPIParams(WalletPositionHistoryQuery, {
  omit: [...POSITION_HISTORY_HIDDEN],
  describe: {
    wallet: 'Wallet address',
    asset: 'Token contract address',
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
  },
});

export const WalletPositionHistoryResponseSchema = z.object({
  token: TokenDetailsOutput,
  cycles: z.array(PositionCycleSchema),
});

export type WalletPositionHistoryResponse = z.infer<typeof WalletPositionHistoryResponseSchema>;
export type WalletPositionHistoryParams = SDKInput<typeof WalletPositionHistoryQuery, PositionHistoryHiddenFields>;

// ── Multi-token (paginated closed positions) endpoint ───────────────────────

export const WalletPositionsHistoryQuery = z.object({
  wallet: z.string(),
  chainIds: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((b) => b.trim())
            .filter((b) => b.length > 0)
        : [],
    ),
  blockchains: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((b) => b.trim())
            .filter((b) => b.length > 0)
        : [],
    ),
  limit: z.coerce.number().min(1).max(200).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
  /** Field used to sort the closed-cycle list. */
  sortBy: z.enum(['exitDate', 'realizedPnl', 'entryDate']).optional().default('exitDate'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((v) => (typeof v === 'string' ? v === 'true' : v)),
});

const POSITIONS_HISTORY_HIDDEN = ['blockchains', 'useSwapRecipient'] as const;
type PositionsHistoryHiddenFields = (typeof POSITIONS_HISTORY_HIDDEN)[number];

export const WalletPositionsHistoryQueryOpenAPI = createOpenAPIParams(WalletPositionsHistoryQuery, {
  omit: [...POSITIONS_HISTORY_HIDDEN],
  describe: {
    wallet: 'Wallet address',
    chainIds: 'Comma-separated list of chain IDs (e.g., "evm:1,solana:solana"). If omitted, all chains.',
    limit: 'Number of closed positions per page (1-200, default 50)',
    offset: 'Offset for pagination (default 0)',
    sortBy: 'Sort field (default exitDate)',
    order: 'Sort order (default desc)',
  },
});

export const ClosedPositionHistoryItemSchema = z.object({
  token: TokenDetailsOutput,
  cycle: PositionCycleSchema,
});

export type ClosedPositionHistoryItem = z.infer<typeof ClosedPositionHistoryItemSchema>;

export const WalletPositionsHistoryResponseSchema = z.object({
  data: z.array(ClosedPositionHistoryItemSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    offset: z.number(),
    limit: z.number(),
    pageEntries: z.number(),
  }),
});

export type WalletPositionsHistoryResponse = z.infer<typeof WalletPositionsHistoryResponseSchema>;
export type WalletPositionsHistoryParams = SDKInput<typeof WalletPositionsHistoryQuery, PositionsHistoryHiddenFields>;
