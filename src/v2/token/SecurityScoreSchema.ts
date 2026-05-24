import { z } from 'zod';

// =============================================================================
// Tier (shared across versions)
// =============================================================================

export const SecurityScoreTierSchema = z.enum(['Very Low', 'Low', 'Moderate', 'High', 'Critical']);
export type SecurityScoreTier = z.infer<typeof SecurityScoreTierSchema>;

// =============================================================================
// v3 — Byrrgis-style 15 checks + hard kills + hard floors + CEX adjustment
// =============================================================================

/**
 * Each numbered check from the Byrrgis v2 model. The numeric `id` matches the
 * spec so it's stable across rebrands. `kind` is 'bonus' only for check 14
 * (smart money) which adds to the score; every other check subtracts.
 */
export const SecurityScoreCheckSchema = z.object({
  id: z.number().int().min(1).max(15),
  name: z.string(),
  kind: z.enum(['penalty', 'bonus']),
  /** Effective delta after CEX adjustment. Positive number. For penalty: subtracted from base. For bonus: added. */
  delta: z.number(),
  /** Pre-CEX-adjustment delta. Equals `delta` when the check isn't CEX-eligible. */
  rawDelta: z.number(),
  /** Max magnitude of `delta` (configured per-check, e.g. 25 for LP/MC). */
  cap: z.number(),
  /** True iff a CEX listing reduced this check's penalty. */
  cexAdjusted: z.boolean(),
  /** Raw inputs the check evaluated against — full audit trail. */
  meta: z.record(z.unknown()),
});

export const SecurityScoreHardKillSchema = z.object({
  /** Stable id, e.g. 'HONEYPOT', 'SERIAL_DEPLOYER'. */
  id: z.string(),
  /** Spec-style reason string, e.g. 'HARD_KILL:HONEYPOT'. */
  reason: z.string(),
  description: z.string(),
  meta: z.record(z.unknown()),
});

export const SecurityScoreHardFloorSchema = z.object({
  id: z.string(),
  description: z.string(),
  /** The score will be clamped to at most this value. */
  maxScore: z.number(),
  meta: z.record(z.unknown()),
});

export const SecurityScoreInputSnapshotSchema = z.object({
  chainId: z.string(),
  address: z.string(),

  liquidityUSD: z.number(),
  // Total pool liquidity (both sides) — what check 1 uses for LP/MC ratio.
  // Optional for backward compatibility with rows persisted before this field landed.
  liquidityMaxUSD: z.number().optional(),
  marketCapUSD: z.number(),
  volume24hUSD: z.number(),
  organicVolume24hUSD: z.number(),
  organicRatio: z.number().nullable(),
  priceChange24hPct: z.number(),

  holdersCount: z.number(),
  top10HoldingsPct: z.number(),
  lpHoldingsPct: z.number(),

  bundlersCount: z.number(),
  bundlersHoldingsPct: z.number(),
  insidersCount: z.number(),
  insidersHoldingsPct: z.number(),
  snipersCount: z.number(),
  snipersHoldingsPct: z.number(),
  devHoldingsPct: z.number(),
  proTradersCount: z.number(),
  proTradersHoldingsPct: z.number(),

  deployerTokensCount: z.number(),
  deployerMigrationsCount: z.number(),
  migrationRate: z.number().nullable(),

  tier1Cexes: z.array(z.string()),
  cexMultiplier: z.number(),

  ageDays: z.number().nullable(),
  bondedAgeDays: z.number().nullable(),

  securityFlags: z.record(z.unknown()).nullable(),
  securitySourcesAvailable: z.array(z.string()),
});

export const SecurityScoreDetailsSchemaV3 = z.object({
  version: z.literal(3),
  base: z.number(),

  /** Set when a hard kill fires — `checks` and `hardFloors` may still be empty. */
  killed: z.boolean(),
  killReason: z.string().nullable(),
  hardKill: SecurityScoreHardKillSchema.nullable(),

  checks: z.array(SecurityScoreCheckSchema),
  hardFloors: z.array(SecurityScoreHardFloorSchema),

  cexMultiplier: z.number(),
  tier1Cexes: z.array(z.string()),

  inputs: SecurityScoreInputSnapshotSchema,

  /** Score after summing checks and adjustments, before any hard floor cap. */
  rawScore: z.number(),
  /** rawScore clamped by the lowest applicable hardFloor (or 0 if killed). */
  finalScore: z.number(),
  tier: SecurityScoreTierSchema,

  computedAt: z.string(),
});

// =============================================================================
// v2 — legacy schema kept for backward compat (rows persisted before v3 rollout)
// =============================================================================

const LegacyRuleSchemaV2 = z.object({
  id: z.string(),
  label: z.string(),
  bucket: z.enum(['market', 'decentralization', 'aiCode', 'spl']),
  delta: z.number(),
  meta: z.record(z.unknown()),
});

const LegacyCapStateSchemaV2 = z.object({
  raw: z.number(),
  applied: z.number(),
  max: z.number(),
});

const LegacyInputsSchemaV2 = z.object({
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

export const SecurityScoreDetailsSchemaV2 = z.object({
  version: z.literal(2),
  base: z.number(),
  rules: z.array(LegacyRuleSchemaV2),
  caps: z.object({
    market: LegacyCapStateSchemaV2,
    decentralization: LegacyCapStateSchemaV2,
    aiCode: LegacyCapStateSchemaV2,
    spl: LegacyCapStateSchemaV2,
  }),
  inputs: LegacyInputsSchemaV2,
  finalScore: z.number(),
  tier: SecurityScoreTierSchema,
  computedAt: z.string(),
});

// =============================================================================
// Discriminated union — accepts both v2 (legacy) and v3 (current).
// New persists are v3; v2 rows remain readable until token-handler rescores them.
// =============================================================================

export const SecurityScoreDetailsSchema = z.discriminatedUnion('version', [
  SecurityScoreDetailsSchemaV3,
  SecurityScoreDetailsSchemaV2,
]);

export type SecurityScoreCheck = z.infer<typeof SecurityScoreCheckSchema>;
export type SecurityScoreHardKill = z.infer<typeof SecurityScoreHardKillSchema>;
export type SecurityScoreHardFloor = z.infer<typeof SecurityScoreHardFloorSchema>;
export type SecurityScoreInputSnapshot = z.infer<typeof SecurityScoreInputSnapshotSchema>;
export type SecurityScoreDetailsV3 = z.infer<typeof SecurityScoreDetailsSchemaV3>;
export type SecurityScoreDetailsV2 = z.infer<typeof SecurityScoreDetailsSchemaV2>;
export type SecurityScoreDetails = z.infer<typeof SecurityScoreDetailsSchema>;
