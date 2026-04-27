import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';

/**
 * Params for `GET /api/2/token/dev-history`.
 *
 * Returns a merged, chronological feed of on-chain activity attributable
 * to a token's deployer (as stored in `Token.deployer`): creator fee
 * claims, swaps the deployer executed on that token, and transfers of
 * the token to/from the deployer.
 *
 * Notes on attribution for `feeClaim`: PumpFun bonding curve and PumpSwap
 * AMM aggregate fees in a per-creator vault shared across all the
 * deployer's coins, so a `feeClaim` row for those protocols may reflect
 * fees from coins OTHER than the queried one — it's still the same
 * deployer's claim event, which is what this endpoint advertises.
 * Meteora DBC (Bags, Moonshot, Believe, etc.) has per-pool vaults so
 * those rows ARE attributable to a specific coin/pool.
 */
export const TokenDevHistoryParamsSchema = z.object({
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  address: z.string().optional(),
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(200).default(50),
  /** Optional filter — keep only entries of one kind. */
  type: z.enum(['feeClaim', 'swap', 'transfer']).optional(),
  /** Optional filter — keep only claims of one protocol. */
  protocol: z.enum(['pumpfun', 'pumpswap', 'meteoradbc', 'clanker']).optional(),
});

export type TokenDevHistoryParams = SDKInput<typeof TokenDevHistoryParamsSchema, 'blockchain'>;
export type TokenDevHistoryInferType = z.infer<typeof TokenDevHistoryParamsSchema>;

export const TokenDevHistoryParamsSchemaOpenAPI = createOpenAPIParams(TokenDevHistoryParamsSchema, {
  omit: ['blockchain'],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "solana:solana")',
    address: 'Token mint address',
    offset: 'Offset for pagination (default: 0)',
    limit: 'Page size, max 200 (default: 50)',
    type: 'Filter to a single entry type: feeClaim, swap, or transfer',
  },
});

export const CreatorFeeClaimProtocol = z.enum(['pumpfun', 'pumpswap', 'meteoradbc', 'clanker']);

// --- Entry variants --------------------------------------------------------

/**
 * A creator fee claim — the deployer drained their accumulated trading
 * fees from a protocol's fee vault.
 */
export const DevHistoryFeeClaimEntry = z.object({
  type: z.literal('feeClaim'),
  blockchain: z.string(),
  date: z.number(),
  transactionHash: z.string(),
  blockHeight: z.number().nullable(),
  instructionIndex: z.number(),
  protocol: CreatorFeeClaimProtocol,
  creatorAddress: z.string(),
  quoteAddress: z.string(),
  tokenAddress: z.string().nullable(),
  poolAddress: z.string().nullable(),
  amountRaw: z.string(),
  amountUSD: z.number(),
});
export type DevHistoryFeeClaimEntryType = z.infer<typeof DevHistoryFeeClaimEntry>;

/**
 * A swap the deployer executed on a pool involving the queried token.
 * `side: 'buy'` means the deployer ended up with MORE of the queried token;
 * `side: 'sell'` means LESS. Base/quote mirror the pool, they're not
 * re-oriented to the queried token — consumers can compare `baseTokenAddress`
 * to `address` to tell which side of the pair is which.
 */
export const DevHistorySwapEntry = z.object({
  type: z.literal('swap'),
  blockchain: z.string(),
  date: z.number(),
  transactionHash: z.string(),
  side: z.enum(['buy', 'sell']),
  poolAddress: z.string(),
  baseTokenAddress: z.string(),
  quoteTokenAddress: z.string(),
  baseTokenAmount: z.number(),
  baseTokenAmountRaw: z.string(),
  quoteTokenAmount: z.number(),
  quoteTokenAmountRaw: z.string(),
  amountUSD: z.number(),
  /**
   * On-chain swap sender — may be a router (Jupiter, a TG bot) rather than
   * the deployer when the trade is routed. `null` if the tx had no
   * recorded swap sender.
   */
  swapSenderAddress: z.string().nullable(),
});
export type DevHistorySwapEntryType = z.infer<typeof DevHistorySwapEntry>;

/**
 * A direct transfer of the queried token to or from the deployer.
 * `direction: 'in'` = deployer received; `'out'` = deployer sent.
 */
export const DevHistoryTransferEntry = z.object({
  type: z.literal('transfer'),
  blockchain: z.string(),
  date: z.number(),
  transactionHash: z.string(),
  direction: z.enum(['in', 'out']),
  counterpartyAddress: z.string(),
  tokenAddress: z.string(),
  amountRaw: z.string(),
  amountUSD: z.number(),
});
export type DevHistoryTransferEntryType = z.infer<typeof DevHistoryTransferEntry>;

export const DevHistoryEntry = z.discriminatedUnion('type', [
  DevHistoryFeeClaimEntry,
  DevHistorySwapEntry,
  DevHistoryTransferEntry,
]);
export type DevHistoryEntryType = z.infer<typeof DevHistoryEntry>;

export const TokenDevHistoryPagination = z.object({
  offset: z.number(),
  limit: z.number(),
  count: z.number(),
  hasMore: z.boolean(),
});

export const TokenDevHistoryResponseSchema = z.object({
  data: z.array(DevHistoryEntry),
  deployer: z.string().nullable(),
  pagination: TokenDevHistoryPagination,
});

export type TokenDevHistoryResponse = z.infer<typeof TokenDevHistoryResponseSchema>;

// --- OpenAPI-annotated variants ------------------------------------------
// Same shape as above but with `.describe()` on each field so the generated
// OpenAPI docs are readable. `discriminatedUnion` is replaced by a plain
// `union` because several OpenAPI renderers don't collapse discriminators
// cleanly when every variant has `.describe()` per field.

const DevHistoryFeeClaimEntryOpenAPI = z.object({
  type: z.literal('feeClaim'),
  blockchain: z.string().describe('Friendly blockchain name, e.g. "solana".'),
  date: z.number().describe('Event timestamp (ms since epoch).'),
  transactionHash: z.string().describe('On-chain transaction signature / hash.'),
  blockHeight: z.number().nullable().describe('Block height / slot, null if unknown.'),
  instructionIndex: z.number().describe('Stable index of the claim instruction within the tx.'),
  protocol: CreatorFeeClaimProtocol.describe('Source protocol: pumpfun, pumpswap, meteoradbc.'),
  creatorAddress: z.string().describe('Address that received the claimed fees (the deployer).'),
  quoteAddress: z.string().describe('Mint address the claim is denominated in (wSOL, USDC, …).'),
  tokenAddress: z
    .string()
    .nullable()
    .describe('Source coin mint if the protocol has per-pool vaults (meteoradbc). Null for per-creator vaults.'),
  poolAddress: z.string().nullable().describe('Source pool address if available; null for per-creator vaults.'),
  amountRaw: z.string().describe('Amount claimed in base units of `quoteAddress`.'),
  amountUSD: z.number().describe('USD value at claim time (0 until enrichment lands).'),
});

const DevHistorySwapEntryOpenAPI = z.object({
  type: z.literal('swap'),
  blockchain: z.string().describe('Friendly blockchain name.'),
  date: z.number().describe('Swap timestamp (ms since epoch).'),
  transactionHash: z.string(),
  side: z
    .enum(['buy', 'sell'])
    .describe('From the deployer\'s perspective on the queried token — "buy" means they ended up with more.'),
  poolAddress: z.string(),
  baseTokenAddress: z.string().describe('token0 of the pool (not re-oriented to the queried token).'),
  quoteTokenAddress: z.string().describe('token1 of the pool.'),
  baseTokenAmount: z.number(),
  baseTokenAmountRaw: z.string(),
  quoteTokenAmount: z.number(),
  quoteTokenAmountRaw: z.string(),
  amountUSD: z.number(),
  swapSenderAddress: z
    .string()
    .nullable()
    .describe('On-chain swap sender. Often the router (Jupiter / TG bot) rather than the deployer.'),
});

const DevHistoryTransferEntryOpenAPI = z.object({
  type: z.literal('transfer'),
  blockchain: z.string(),
  date: z.number(),
  transactionHash: z.string(),
  direction: z.enum(['in', 'out']).describe('"in" = deployer received, "out" = deployer sent.'),
  counterpartyAddress: z.string().describe('The other side of the transfer.'),
  tokenAddress: z.string().describe('Mint of the transferred token (= the queried token).'),
  amountRaw: z.string(),
  amountUSD: z.number(),
});

export const DevHistoryEntryOpenAPI = z.union([
  DevHistoryFeeClaimEntryOpenAPI,
  DevHistorySwapEntryOpenAPI,
  DevHistoryTransferEntryOpenAPI,
]);

export const TokenDevHistoryResponseSchemaOpenAPI = z.object({
  data: z.array(DevHistoryEntryOpenAPI),
  deployer: z.string().nullable().describe("Queried token's recorded deployer address, if any."),
  pagination: TokenDevHistoryPagination,
});
