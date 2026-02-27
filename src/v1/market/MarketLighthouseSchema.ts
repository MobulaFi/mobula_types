import { z } from 'zod';

const TimeframeMetricsSchema = z.object({
  '15min': z.number(),
  '1h': z.number(),
  '6h': z.number(),
  '24h': z.number(),
});

const TimeframeChangeSchema = z.object({
  '15min': z.number().nullable(),
  '1h': z.number().nullable(),
  '6h': z.number().nullable(),
  '24h': z.number().nullable(),
});

const MetricsSchema = z.object({
  volumeUSD: TimeframeMetricsSchema,
  volumeUSDChange: TimeframeChangeSchema,
  trades: TimeframeMetricsSchema,
  tradesChange: TimeframeChangeSchema,
  buys: TimeframeMetricsSchema,
  buysChange: TimeframeChangeSchema,
  sells: TimeframeMetricsSchema,
  sellsChange: TimeframeChangeSchema,
  feesPaidUSD: TimeframeMetricsSchema,
  feesPaidUSDChange: TimeframeChangeSchema,
});

const ChainEntrySchema = MetricsSchema.extend({
  name: z.string(),
  logo: z.string(),
});

const DexEntrySchema = MetricsSchema.extend({
  name: z.string(),
  logo: z.string().nullable(),
});

const PlatformEntrySchema = MetricsSchema.extend({
  name: z.string(),
  logo: z.string().nullable(),
});

export const MarketLighthouseResponseSchema = z.object({
  data: z.object({
    total: MetricsSchema,
    byChain: z.array(ChainEntrySchema),
    byDex: z.array(DexEntrySchema),
    byLaunchpad: z.array(DexEntrySchema),
    byPlatform: z.array(PlatformEntrySchema),
  }),
});

export type MarketLighthouseResponse = z.infer<typeof MarketLighthouseResponseSchema>;
