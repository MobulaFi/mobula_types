import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const SWAP_EXECUTION_TIME_RANGES = ['24h', '7d', '30d', '60d'] as const;
export type SwapExecutionTimeRange = (typeof SWAP_EXECUTION_TIME_RANGES)[number];

export const SWAP_EXECUTION_TIMESERIES_DIMENSIONS = ['transactions', 'volume', 'wallets', 'latency'] as const;
export type SwapExecutionTimeseriesDimension = (typeof SWAP_EXECUTION_TIMESERIES_DIMENSIONS)[number];

export const SWAP_EXECUTION_TIMESERIES_GRANULARITIES = ['hour', 'day', 'week'] as const;
export type SwapExecutionTimeseriesGranularity = (typeof SWAP_EXECUTION_TIMESERIES_GRANULARITIES)[number];

export function granularityForTimeRange(timeRange: SwapExecutionTimeRange): SwapExecutionTimeseriesGranularity {
  if (timeRange === '24h') return 'hour';
  if (timeRange === '60d') return 'week';
  return 'day';
}

export const SWAP_EXECUTION_ALLOWED_GRANULARITIES: Record<
  SwapExecutionTimeRange,
  readonly SwapExecutionTimeseriesGranularity[]
> = {
  '24h': ['hour'],
  '7d': ['day'],
  '30d': ['day', 'week'],
  '60d': ['week', 'day'],
};

const ScopeFilterSchema = z.object({
  customerId: z.string().min(1).optional().openapi({
    description:
      'Customer id to scope the query to. Required if `apiKey` is omitted. When both are provided, the apiKey must belong to this customer.',
  }),
  apiKey: z.string().min(1).optional().openapi({
    description:
      'Restrict the query to a single API key. When `customerId` is also provided, the key must belong to that customer.',
  }),
  timeRange: z.enum(SWAP_EXECUTION_TIME_RANGES).default('30d').openapi({
    description: 'Lookback window relative to now. Defaults to `30d`. Max is `60d` — wider windows are not supported.',
    example: '30d',
  }),
});

const TimeseriesDataParam = z
  .preprocess((v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string')
      return v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return v;
  }, z.array(z.enum(SWAP_EXECUTION_TIMESERIES_DIMENSIONS)).nonempty())
  .default([...SWAP_EXECUTION_TIMESERIES_DIMENSIONS])
  .openapi({
    description:
      'Which timeseries to compute. Pass as CSV (`data=transactions,volume`) or repeated (`data=transactions&data=volume`). Defaults to all four.',
    example: 'transactions,volume,wallets,latency',
  });

export const SwapExecutionsSummaryQuerySchema = ScopeFilterSchema.extend({
  data: TimeseriesDataParam,
  granularity: z.enum(SWAP_EXECUTION_TIMESERIES_GRANULARITIES).optional().openapi({
    description:
      'Override the default bucket size for the timeseries. Allowed per `timeRange`: `24h`→`hour`; `7d`→`day`; `30d`→`day` (default) or `week`; `60d`→`week` (default) or `day`. Invalid combinations return 400.',
    example: 'week',
  }),
  blockchain: z.string().min(1).optional().openapi({
    description:
      'Restrict the summary to a single blockchain (e.g. `evm:1`, `ethereum`, `solana:solana`). Pass `all` or omit for an aggregate across every chain.',
    example: 'evm:1',
  }),
})
  .refine((d) => d.customerId || d.apiKey, {
    message: 'Either customerId or apiKey is required',
  })
  .refine(
    (d) => !d.granularity || SWAP_EXECUTION_ALLOWED_GRANULARITIES[d.timeRange].includes(d.granularity),
    (d) => ({
      message: `granularity '${d.granularity}' is not allowed for timeRange '${d.timeRange}' (allowed: ${SWAP_EXECUTION_ALLOWED_GRANULARITIES[d.timeRange].join(', ')})`,
      path: ['granularity'],
    }),
  );
export type SwapExecutionsSummaryQuery = z.infer<typeof SwapExecutionsSummaryQuerySchema>;

export const SwapExecutionsListQuerySchema = ScopeFilterSchema.extend({
  status: z
    .enum(['success', 'failed'])
    .default('success')
    .openapi({ description: 'Filter rows by execution outcome.', example: 'success' }),
  blockchain: z.string().min(1).optional().openapi({
    description:
      'Restrict results to a single blockchain (e.g. `evm:1`, `ethereum`, `solana:solana`). Pass `all` or omit to return executions across every chain.',
    example: 'evm:1',
  }),
  cursor: z
    .string()
    .regex(/^\d+$/u, 'cursor must be a numeric id')
    .optional()
    .openapi({ description: 'Keyset pagination cursor (the `nextCursor` value returned by a previous page).' }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .openapi({ description: 'Page size (1–100). Defaults to 20.', example: 20 }),
}).refine((d) => d.customerId || d.apiKey, {
  message: 'Either customerId or apiKey is required',
});
export type SwapExecutionsListQuery = z.infer<typeof SwapExecutionsListQuerySchema>;
