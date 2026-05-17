import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { SWAP_EXECUTION_TIME_RANGES, SWAP_EXECUTION_TIMESERIES_GRANULARITIES } from './SwapExecutionsSchema.ts';

extendZodWithOpenApi(z);

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

const WindowSchema = z
  .object({
    from: z.string().openapi({ description: 'Window start, ISO 8601.', example: '2026-04-12T10:15:30.000Z' }),
    to: z.string().openapi({ description: 'Window end (now), ISO 8601.', example: '2026-05-12T10:15:30.000Z' }),
  })
  .openapi('SwapExecutionsWindow');

const TokenSummarySchema = z
  .object({
    address: z.string().openapi({ description: 'Token contract address (chain-specific format).' }),
    name: z.string().nullable().openapi({ description: 'Token full name. Null if unknown.' }),
    symbol: z.string().nullable().openapi({ description: 'Token ticker. Null if unknown.' }),
    logo: z.string().nullable().openapi({ description: 'Logo URL. Null when unavailable.' }),
  })
  .openapi('SwapExecutionsToken');

const TransactionCountsSchema = z
  .object({
    total: z.number().int().nonnegative().openapi({ description: 'All recorded executions in the window.' }),
    success: z.number().int().nonnegative().openapi({ description: 'Executions where the broadcast succeeded.' }),
    failed: z.number().int().nonnegative().openapi({ description: 'Executions that returned an error.' }),
  })
  .openapi('SwapExecutionsTransactionCounts');

const LatencyMsSchema = z
  .object({
    avgProcessing: z
      .number()
      .nullable()
      .openapi({ description: 'Average API-side processing time, in ms. Null when no samples.' }),
    avgOnchainLanding: z
      .number()
      .nullable()
      .openapi({ description: 'Average broadcast → on-chain confirmation time, in ms. Null when no samples.' }),
  })
  .openapi('SwapExecutionsLatencyMs');

const QuoteCallsSchema = z.number().int().nonnegative().openapi({
  description:
    'Quote endpoint calls in `window` (sum of `/api/2/swap/quoting` and `/api/2/swap/quoting-instructions` from misc.api_history.metrics).',
});

const CurrentTotalsSchema = z
  .object({
    transactions: TransactionCountsSchema,
    volumeUsd: z.number().nonnegative().openapi({ description: 'Notional USD volume from joined `public.swaps`.' }),
    activeWallets: z.number().int().nonnegative().openapi({ description: 'Distinct sender wallets in the window.' }),
  })
  .openapi('SwapExecutionsCurrentTotals');

const PreviousTotalsSchema = z
  .object({
    transactions: z
      .object({ total: z.number().int().nonnegative() })
      .openapi({ description: 'Total transactions in the equal-length window immediately preceding `window`.' }),
    volumeUsd: z.number().nonnegative(),
    activeWallets: z.number().int().nonnegative(),
  })
  .openapi('SwapExecutionsPreviousTotals');

const TotalsSchema = z
  .object({
    current: CurrentTotalsSchema,
    previous: PreviousTotalsSchema,
  })
  .openapi('SwapExecutionsTotals');

const ChainEntrySchema = z
  .object({
    chainId: z.string().openapi({ description: 'Namespaced chain id (e.g. `evm:8453`, `solana:solana`).' }),
    transactions: z.object({
      total: z.number().int().nonnegative(),
      failed: z.number().int().nonnegative(),
    }),
  })
  .openapi('SwapExecutionsChainEntry');

const PeriodSchema = z.string().openapi({
  description:
    'Bucket start (UTC). ISO date `YYYY-MM-DD` for `day`/`week`, ISO datetime `YYYY-MM-DDTHH:00:00.000Z` for `hour`.',
});

const TransactionsPointSchema = z
  .object({
    period: PeriodSchema,
    total: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
  })
  .openapi('SwapExecutionsTransactionsPoint');

const VolumePointSchema = z
  .object({
    period: PeriodSchema,
    volumeUsd: z.number().nonnegative(),
  })
  .openapi('SwapExecutionsVolumePoint');

const WalletsPointSchema = z
  .object({
    period: PeriodSchema,
    activeWallets: z.number().int().nonnegative(),
  })
  .openapi('SwapExecutionsWalletsPoint');

const LatencyPointSchema = z
  .object({
    period: PeriodSchema,
    avgProcessing: z
      .number()
      .nullable()
      .openapi({ description: 'Average API-side processing time in the bucket, in ms. Null when no samples.' }),
    avgOnchainLanding: z.number().nullable().openapi({
      description: 'Average broadcast → on-chain confirmation time in the bucket, in ms. Null when no samples.',
    }),
  })
  .openapi('SwapExecutionsLatencyPoint');

const TimeseriesSchema = z
  .object({
    transactions: z
      .array(TransactionsPointSchema)
      .optional()
      .openapi({ description: 'Present when `data` includes `transactions`.' }),
    volume: z.array(VolumePointSchema).optional().openapi({ description: 'Present when `data` includes `volume`.' }),
    wallets: z.array(WalletsPointSchema).optional().openapi({ description: 'Present when `data` includes `wallets`.' }),
    latency: z.array(LatencyPointSchema).optional().openapi({ description: 'Present when `data` includes `latency`.' }),
  })
  .openapi('SwapExecutionsTimeseries');

const TradeSizeBucketSchema = z
  .object({
    period: PeriodSchema,
    counts: z
      .record(z.string(), z.number().int().nonnegative())
      .openapi({ description: 'Count per trade-size bucket. Keys come from `bucketLabels`.' }),
  })
  .openapi('SwapExecutionsTradeSizeBucket');

const TradeSizeSchema = z
  .object({
    bucketLabels: z.array(z.string()).openapi({
      description:
        'Active bucket labels (a subset of `<$50`, `$50-$100`, `$100-$1k`, `$1k-$10k`, `$10k-$100k`, `$100k+`).',
    }),
    buckets: z.array(TradeSizeBucketSchema),
  })
  .openapi('SwapExecutionsTradeSize');

const TopPairSchema = z
  .object({
    chainId: z.string().openapi({ description: 'Namespaced chain id (e.g. `evm:8453`, `solana:solana`).' }),
    token0: TokenSummarySchema,
    token1: TokenSummarySchema,
    transactions: z.object({ total: z.number().int().nonnegative() }),
    volumeUsd: z.number().nonnegative(),
  })
  .openapi('SwapExecutionsTopPair');

// ---------------------------------------------------------------------------
// Summary response — GET /api/2/swap/executions/summary
// ---------------------------------------------------------------------------

export const SwapExecutionsSummaryResponseSchema = z
  .object({
    data: z
      .object({
        timeRange: z.enum(SWAP_EXECUTION_TIME_RANGES),
        granularity: z
          .enum(SWAP_EXECUTION_TIMESERIES_GRANULARITIES)
          .openapi({ description: 'Bucket size used for `timeseries` and `tradeSize.buckets`.' }),
        window: WindowSchema,
        previousWindow: WindowSchema.openapi({
          description: 'Equal-length window immediately preceding `window`, used for `totals.previous`.',
        }),
        totals: TotalsSchema,
        latencyMs: LatencyMsSchema,
        quoteCalls: QuoteCallsSchema,
        chains: z.array(ChainEntrySchema),
        timeseries: TimeseriesSchema,
        tradeSize: TradeSizeSchema,
        topPairs: z.array(TopPairSchema),
      })
      .openapi('SwapExecutionsSummaryData'),
  })
  .openapi('SwapExecutionsSummaryResponse');
export type SwapExecutionsSummaryResponse = z.infer<typeof SwapExecutionsSummaryResponseSchema>;

// ---------------------------------------------------------------------------
// List response — GET /api/2/swap/executions
// ---------------------------------------------------------------------------

const SwapExecutionRowSchema = z
  .object({
    id: z.number().int(),
    chainId: z.string(),
    transactionHash: z.string().nullable(),
    error: z.string().nullable(),
    processingTimeMs: z.number().nullable(),
    onchainLandingTimeMs: z.number().nullable(),
    executedAt: z.string().openapi({ description: 'ISO 8601 timestamp.', example: '2026-05-12T10:15:30.000Z' }),
  })
  .openapi('SwapExecutionRow');
export type SwapExecutionRow = z.infer<typeof SwapExecutionRowSchema>;

export const SwapExecutionsListResponseSchema = z
  .object({
    data: z
      .object({
        rows: z.array(SwapExecutionRowSchema),
        nextCursor: z
          .string()
          .nullable()
          .openapi({ description: 'Pass back as `cursor` to fetch the next page. Null when no more rows.' }),
      })
      .openapi('SwapExecutionsListData'),
  })
  .openapi('SwapExecutionsListResponse');
export type SwapExecutionsListResponse = z.infer<typeof SwapExecutionsListResponseSchema>;
