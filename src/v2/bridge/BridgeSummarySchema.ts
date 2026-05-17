import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Mirrors SWAP_EXECUTION_TIME_RANGES — bridge & swap summaries share the same
// lookback windows so the dashboard can pivot between them without reshaping.
export const BRIDGE_SUMMARY_TIME_RANGES = ['24h', '7d', '30d', '60d'] as const;
export type BridgeSummaryTimeRange = (typeof BRIDGE_SUMMARY_TIME_RANGES)[number];

export const BRIDGE_SUMMARY_TIMESERIES_GRANULARITIES = ['hour', 'day', 'week'] as const;
export type BridgeSummaryTimeseriesGranularity = (typeof BRIDGE_SUMMARY_TIMESERIES_GRANULARITIES)[number];

export function granularityForBridgeTimeRange(timeRange: BridgeSummaryTimeRange): BridgeSummaryTimeseriesGranularity {
  if (timeRange === '24h') return 'hour';
  if (timeRange === '60d') return 'week';
  return 'day';
}

export const BridgeSummaryQuerySchema = z
  .object({
    customerId: z.string().min(1).optional().openapi({
      description:
        'Optional customer id to scope the query to. Mutually exclusive with `orgId` and `apiKey`. When all three are omitted, the response covers all bridge activity in the window.',
    }),
    orgId: z.string().min(1).optional().openapi({
      description:
        'Optional organization id to scope the query to. Aggregates across every API key belonging to the organization. Mutually exclusive with `customerId` and `apiKey`.',
    }),
    apiKey: z.string().min(1).optional().openapi({
      description:
        'Optional API key to scope the query to a single key. Mutually exclusive with `customerId` and `orgId`.',
    }),
    timeRange: z.enum(BRIDGE_SUMMARY_TIME_RANGES).default('30d').openapi({
      description:
        'Lookback window relative to now. Defaults to `30d`. Max is `60d` — wider windows are not supported.',
      example: '30d',
    }),
  })
  .refine((d) => [d.customerId, d.orgId, d.apiKey].filter((v) => v != null).length <= 1, {
    message: 'customerId, orgId, and apiKey are mutually exclusive — provide at most one',
  });
export type BridgeSummaryQuery = z.infer<typeof BridgeSummaryQuerySchema>;

const BridgeSummaryRouteSchema = z.object({
  originChainId: z.string(),
  destinationChainId: z.string(),
  transactions: z.number().int(),
  volumeUsd: z.number(),
  avgLatencyMs: z.number().nullable(),
  // Share of total bridge volume in the selected window, 0–100. All
  // returned routes' percentages sum to 100 (within rounding) when the
  // limit isn't truncating the list.
  flowDominancePct: z.number(),
});
export type BridgeSummaryRoute = z.infer<typeof BridgeSummaryRouteSchema>;

const BridgeSummaryVolumePointSchema = z.object({
  period: z.string(),
  volumeUsd: z.number(),
});
export type BridgeSummaryVolumePoint = z.infer<typeof BridgeSummaryVolumePointSchema>;

export const BridgeSummaryResponseSchema = z.object({
  data: z.object({
    timeRange: z.enum(BRIDGE_SUMMARY_TIME_RANGES),
    granularity: z.enum(BRIDGE_SUMMARY_TIMESERIES_GRANULARITIES),
    window: z.object({
      from: z.string(),
      to: z.string(),
    }),
    totals: z.object({
      transactions: z.number().int(),
      uniqueAddresses: z.number().int(),
      volumeUsd: z.number(),
      avgLatencyMs: z.number().nullable(),
    }),
    timeseries: z.object({
      // Settled-volume USD bucketed by `granularity`. Same status='settled'
      // filter as `totals.volumeUsd` so chart and total reconcile.
      volume: z.array(BridgeSummaryVolumePointSchema),
    }),
    topRoutes: z.array(BridgeSummaryRouteSchema),
  }),
});
export type BridgeSummaryResponse = z.infer<typeof BridgeSummaryResponseSchema>;
