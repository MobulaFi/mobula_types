import { z } from 'zod';

export const SecurityScoreRuleSchema = z.object({
  id: z.string(),
  label: z.string(),
  bucket: z.enum(['market', 'decentralization', 'aiCode', 'spl']),
  delta: z.number(),
  meta: z.record(z.unknown()),
});

export const SecurityScoreCapStateSchema = z.object({
  raw: z.number(),
  applied: z.number(),
  max: z.number(),
});

export const SecurityScoreTierSchema = z.enum(['Very Low', 'Low', 'Moderate', 'High']);

export const SecurityScoreInputSnapshotSchema = z.object({
  chainId: z.string(),
  address: z.string(),
  liquidityUSD: z.number(),
  marketCapUSD: z.number(),
  volume24hUSD: z.number(),
  organicVolume24hUSD: z.number(),
  organicRatio: z.number().nullable(),
  priceChange24hPct: z.number(),
  hl24Pct: z.number().nullable(),
  holdersCount: z.number(),
  deployerTokensCount: z.number(),
  top10HoldingsPct: z.number(),
  lpHoldingsPct: z.number(),
  capBand: z.enum(['MICROCAP', 'SMALL_CAP', 'MID_LARGE_CAP']).nullable(),
  securityFlags: z.record(z.unknown()).nullable(),
  securitySourcesAvailable: z.array(z.string()),
});

export const SecurityScoreDetailsSchema = z.object({
  base: z.number(),
  rules: z.array(SecurityScoreRuleSchema),
  caps: z.object({
    market: SecurityScoreCapStateSchema,
    decentralization: SecurityScoreCapStateSchema,
    aiCode: SecurityScoreCapStateSchema,
    spl: SecurityScoreCapStateSchema,
  }),
  inputs: SecurityScoreInputSnapshotSchema,
  finalScore: z.number(),
  tier: SecurityScoreTierSchema,
  computedAt: z.string(),
  version: z.number(),
});

export type SecurityScoreRule = z.infer<typeof SecurityScoreRuleSchema>;
export type SecurityScoreCapState = z.infer<typeof SecurityScoreCapStateSchema>;
export type SecurityScoreTier = z.infer<typeof SecurityScoreTierSchema>;
export type SecurityScoreInputSnapshot = z.infer<typeof SecurityScoreInputSnapshotSchema>;
export type SecurityScoreDetails = z.infer<typeof SecurityScoreDetailsSchema>;
