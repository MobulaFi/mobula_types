import { z } from 'zod';
import { extractAllZodKeys } from '../functions/zodUtils.ts';
import { HolderSchema, HoldersStatsSchema } from './EnrichedHoldersData.ts';
import { SecurityFlagsSchema } from './SecuritySchemas.ts';

/**
 * Token type schema representing the ERC token standard version
 * - "2020": ERC-20 standard token
 * - "2022": ERC-2022 (Token Extensions) standard token
 */
export const TokenTypeValues = ['2020', '2022'] as const;
export type TokenType = (typeof TokenTypeValues)[number];
export const TokenTypeSchema = z.enum(TokenTypeValues).nullable().optional();

export const keysToRemovePoolToPulse: Partial<Record<keyof PoolData, true>> = {
  token0: true as const,
  token1: true as const,
  volume24h: true as const,
  blockchain: true as const,
  address: true as const,
  createdAt: true as const,
  type: true as const,
  baseToken: true as const,
  exchange: true as const,
  factory: true as const,
  quoteToken: true as const,
  // 'price', // Keep price at root level for service compatibility
  priceToken: true as const,
  priceTokenString: true as const,
  athToken0: true as const,
  athToken1: true as const,
  atlToken0: true as const,
  atlToken1: true as const,
  athDateToken0: true as const,
  athDateToken1: true as const,
  atlDateToken0: true as const,
  atlDateToken1: true as const,
};

/**
 * Metadata keys that can be used as fallback from Token table when TokensStatsRealTime is empty
 * These are the social and security fields that are shared between Token and TokensStatsRealTime tables
 */
export const TOKEN_METADATA_KEYS = [
  'twitter',
  'telegram',
  'website',
  'others',
  'security',
  'logo',
  'twitterRenameCount',
  'twitterRenameHistory',
  'dexscreenerListed',
  'dexscreenerHeader',
  'dexscreenerAdPaid',
  'liveStatus',
  'liveThumbnail',
  'livestreamTitle',
  'liveReplyCount',
  'deployer',
  'bonded_at',
  'description',
  'is_mayhem_mode',
  'is_cashback_coin',
  'is_agent_mode',
] as const;

export type TokenMetadataKey = (typeof TOKEN_METADATA_KEYS)[number];

export const TokenData = z
  .object({
    address: z.string(),
    chainId: z.string(),
    symbol: z.string().nullable(),
    name: z.string().nullable(),
    decimals: z.coerce.number().default(0),
    id: z.number().nullable().optional().default(null),

    price: z.coerce.number().default(0),
    priceToken: z.coerce.number().default(0),
    priceTokenString: z.string(),
    approximateReserveUSD: z.coerce.number().default(0),
    approximateReserveTokenRaw: z.string(),
    approximateReserveToken: z.coerce.number().default(0),
    totalSupply: z.coerce.number().default(0),
    circulatingSupply: z.coerce.number().default(0),
    marketCap: z.coerce.number().optional().default(0),
    marketCapDiluted: z.coerce.number().optional().default(0),
    logo: z.string().nullable(),

    exchange: z
      .object({
        name: z.string(),
        logo: z.string(),
      })
      .optional(),

    factory: z.string().nullable().optional(),
    source: z.string().nullable().optional(),
    sourceFactory: z.string().nullable().optional(),

    liquidity: z.coerce.number().optional(),
    liquidityMax: z.coerce.number().optional(),
    bonded: z.boolean().optional(),
    bondingPercentage: z.coerce.number().optional(),
    bondingCurveAddress: z.string().nullable().optional(),
    preBondingFactory: z.string().optional(),
    poolAddress: z.string().optional(),

    blockchain: z.string().optional(),
    type: z.string().optional(),
    tokenType: TokenTypeSchema,

    is_mayhem_mode: z.boolean().nullable().optional().default(null),
    is_cashback_coin: z.boolean().nullable().optional().default(null),
    is_agent_mode: z.boolean().nullable().optional().default(null),

    deployer: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    bonded_at: z.coerce.date().nullable(),
    ath: z.coerce.number().optional(),
    atl: z.coerce.number().optional(),
    athDate: z.coerce.date().optional(),
    atlDate: z.coerce.date().optional(),
  })
  .merge(HoldersStatsSchema);

export type TokenData = z.infer<typeof TokenData>;

// Keys to keep at root level in PulseEnrichedTokenData (these won't be removed)
const keysToKeepInPulseToken = new Set<string>([
  // Add keys here that should remain at root level in PulseEnrichedTokenData
  // All other TokenData keys will be automatically removed
  'bonded_at',
]);

const allTokenDataKeys = extractAllZodKeys(TokenData);
export const keysToRemoveTokenToPulse: Partial<Record<keyof TokenData, true>> = allTokenDataKeys
  .filter((key) => !keysToKeepInPulseToken.has(key as string))
  .reduce(
    (acc, key) => {
      acc[key as keyof TokenData] = true as const;
      return acc;
    },
    {} as Partial<Record<keyof TokenData, true>>,
  );

export const PoolData = z.object({
  token0: TokenData,
  token1: TokenData,
  volume24h: z.coerce.number().default(0),
  liquidity: z.coerce.number().default(0),
  blockchain: z.string(),
  address: z.string(),
  createdAt: z.coerce.date().nullable(),
  type: z.string(),
  baseToken: z.string(),
  exchange: z.object({
    name: z.string(),
    logo: z.string(),
  }),
  factory: z.string().nullable(),
  quoteToken: z.string(),
  price: z.coerce.number().optional(),
  priceToken: z.coerce.number().optional(),
  priceTokenString: z.string().optional(),

  athToken0: z.coerce.number().default(0),
  athToken1: z.coerce.number().default(0),
  atlToken0: z.coerce.number().default(0),
  atlToken1: z.coerce.number().default(0),
  athDateToken0: z.coerce.date().optional(),
  athDateToken1: z.coerce.date().optional(),
  atlDateToken0: z.coerce.date().optional(),
  atlDateToken1: z.coerce.date().optional(),

  bonded: z.coerce.boolean(),
  bondingPercentage: z.coerce.number().nullable(),
  bondingCurveAddress: z.string().nullable(),
  sourceFactory: z.string().nullable().optional(),
  totalFeesPaidUSD: z.coerce.number().optional(),
  totalFeesPaidNativeRaw: z.coerce.bigint().default(0n),

  extraData: z.record(z.any()).optional(),
});
export type PoolData = z.infer<typeof PoolData>;

export const poolDataKeys = extractAllZodKeys(PoolData);
export const tokenDataKeys = extractAllZodKeys(TokenData);

export const PoolStatsSchema = z.object({
  price_change_1min: z.coerce.number().default(0),
  price_change_5min: z.coerce.number().default(0),
  price_change_1h: z.coerce.number().default(0),
  price_change_4h: z.coerce.number().default(0),
  price_change_6h: z.coerce.number().default(0),
  price_change_12h: z.coerce.number().default(0),
  price_change_24h: z.coerce.number().default(0),

  price_1min_ago: z.coerce.number().default(0),
  price_5min_ago: z.coerce.number().default(0),
  price_1h_ago: z.coerce.number().default(0),
  price_4h_ago: z.coerce.number().default(0),
  price_6h_ago: z.coerce.number().default(0),
  price_12h_ago: z.coerce.number().default(0),
  price_24h_ago: z.coerce.number().default(0),

  volume_1min: z.coerce.number().default(0),
  volume_5min: z.coerce.number().default(0),
  volume_15min: z.coerce.number().default(0),
  volume_1h: z.coerce.number().default(0),
  volume_4h: z.coerce.number().default(0),
  volume_6h: z.coerce.number().default(0),
  volume_12h: z.coerce.number().default(0),
  volume_24h: z.coerce.number().default(0),

  volume_buy_1min: z.coerce.number().default(0),
  volume_buy_5min: z.coerce.number().default(0),
  volume_buy_15min: z.coerce.number().default(0),
  volume_buy_1h: z.coerce.number().default(0),
  volume_buy_4h: z.coerce.number().default(0),
  volume_buy_6h: z.coerce.number().default(0),
  volume_buy_12h: z.coerce.number().default(0),
  volume_buy_24h: z.coerce.number().default(0),

  volume_sell_1min: z.coerce.number().default(0),
  volume_sell_5min: z.coerce.number().default(0),
  volume_sell_15min: z.coerce.number().default(0),
  volume_sell_1h: z.coerce.number().default(0),
  volume_sell_4h: z.coerce.number().default(0),
  volume_sell_6h: z.coerce.number().default(0),
  volume_sell_12h: z.coerce.number().default(0),
  volume_sell_24h: z.coerce.number().default(0),

  trades_1min: z.coerce.number().default(0),
  trades_5min: z.coerce.number().default(0),
  trades_15min: z.coerce.number().default(0),
  trades_1h: z.coerce.number().default(0),
  trades_4h: z.coerce.number().default(0),
  trades_6h: z.coerce.number().default(0),
  trades_12h: z.coerce.number().default(0),
  trades_24h: z.coerce.number().default(0),

  buys_1min: z.coerce.number().default(0),
  buys_5min: z.coerce.number().default(0),
  buys_15min: z.coerce.number().default(0),
  buys_1h: z.coerce.number().default(0),
  buys_4h: z.coerce.number().default(0),
  buys_6h: z.coerce.number().default(0),
  buys_12h: z.coerce.number().default(0),
  buys_24h: z.coerce.number().default(0),

  sells_1min: z.coerce.number().default(0),
  sells_5min: z.coerce.number().default(0),
  sells_15min: z.coerce.number().default(0),
  sells_1h: z.coerce.number().default(0),
  sells_4h: z.coerce.number().default(0),
  sells_6h: z.coerce.number().default(0),
  sells_12h: z.coerce.number().default(0),
  sells_24h: z.coerce.number().default(0),

  buyers_1min: z.coerce.number().default(0),
  buyers_5min: z.coerce.number().default(0),
  buyers_15min: z.coerce.number().default(0),
  buyers_1h: z.coerce.number().default(0),
  buyers_4h: z.coerce.number().default(0),
  buyers_6h: z.coerce.number().default(0),
  buyers_12h: z.coerce.number().default(0),
  buyers_24h: z.coerce.number().default(0),

  sellers_1min: z.coerce.number().default(0),
  sellers_5min: z.coerce.number().default(0),
  sellers_15min: z.coerce.number().default(0),
  sellers_1h: z.coerce.number().default(0),
  sellers_4h: z.coerce.number().default(0),
  sellers_6h: z.coerce.number().default(0),
  sellers_12h: z.coerce.number().default(0),
  sellers_24h: z.coerce.number().default(0),

  traders_1min: z.coerce.number().default(0),
  traders_5min: z.coerce.number().default(0),
  traders_15min: z.coerce.number().default(0),
  traders_1h: z.coerce.number().default(0),
  traders_4h: z.coerce.number().default(0),
  traders_6h: z.coerce.number().default(0),
  traders_12h: z.coerce.number().default(0),
  traders_24h: z.coerce.number().default(0),

  fees_paid_1min: z.coerce.number().default(0),
  fees_paid_5min: z.coerce.number().default(0),
  fees_paid_15min: z.coerce.number().default(0),
  fees_paid_1h: z.coerce.number().default(0),
  fees_paid_4h: z.coerce.number().default(0),
  fees_paid_6h: z.coerce.number().default(0),
  fees_paid_12h: z.coerce.number().default(0),
  fees_paid_24h: z.coerce.number().default(0),
});

export type PoolStats = z.infer<typeof PoolStatsSchema>;

export const EnrichedPoolDataSchema = PoolData.merge(
  PoolStatsSchema.merge(
    z.object({
      price: z.coerce.number().default(0),

      market_cap: z.coerce.number().default(0),
      created_at: z.coerce.date().nullable(),
      holders_count: z.coerce.number().default(0),
      latest_trade_date: z.coerce.date().nullable().default(null),
      latest_price: z.coerce.number().default(0),

      source: z.string().nullable(),
      deployer: z.string().nullable(),
      tokenSymbol: z.string().nullable(),
      tokenName: z.string().nullable(),
      dexscreenerListed: z.coerce.boolean().nullable(),
      deployerMigrations: z.coerce.number().default(0),
      socials: z.object({
        twitter: z.string().nullable(),
        website: z.string().nullable(),
        telegram: z.string().nullable(),
        others: z.record(z.unknown()).nullable(),
        uri: z.string().optional(),
      }),
      description: z.string().nullable(),
      security: SecurityFlagsSchema.nullable(),
      twitterReusesCount: z.coerce.number().default(0),
      twitterRenameCount: z.coerce.number().default(0),
      twitterRenameHistory: z
        .array(
          z.object({
            username: z.string(),
            last_checked: z.string(),
          }),
        )
        .optional(),
      holders_list: z.array(HolderSchema),
      totalFeesPaidUSD: z.coerce.number().default(0),
      totalFeesPaidNativeRaw: z.coerce.bigint().default(0n),
    }),
  ).merge(HoldersStatsSchema),
);

export type EnrichedPoolData = z.infer<typeof EnrichedPoolDataSchema>;

// Pulse types are now identical to enriched types
export const PulseEnrichedPoolDataSchema = EnrichedPoolDataSchema;
export type PulseEnrichedPoolData = EnrichedPoolData;

export const TokenStatsSchema = z.object({
  latest_trade_date: z.coerce.date().nullable(),

  price_change_1min: z.coerce.number().default(0),
  price_change_5min: z.coerce.number().default(0),
  price_change_1h: z.coerce.number().default(0),
  price_change_4h: z.coerce.number().default(0),
  price_change_6h: z.coerce.number().default(0),
  price_change_12h: z.coerce.number().default(0),
  price_change_24h: z.coerce.number().default(0),

  price_1min_ago: z.coerce.number().default(0),
  price_5min_ago: z.coerce.number().default(0),
  price_1h_ago: z.coerce.number().default(0),
  price_4h_ago: z.coerce.number().default(0),
  price_6h_ago: z.coerce.number().default(0),
  price_12h_ago: z.coerce.number().default(0),
  price_24h_ago: z.coerce.number().default(0),

  volume_1min: z.coerce.number().default(0),
  volume_5min: z.coerce.number().default(0),
  volume_15min: z.coerce.number().default(0),
  volume_1h: z.coerce.number().default(0),
  volume_4h: z.coerce.number().default(0),
  volume_6h: z.coerce.number().default(0),
  volume_12h: z.coerce.number().default(0),
  volume_24h: z.coerce.number().default(0),

  volume_buy_1min: z.coerce.number().default(0),
  volume_buy_5min: z.coerce.number().default(0),
  volume_buy_15min: z.coerce.number().default(0),
  volume_buy_1h: z.coerce.number().default(0),
  volume_buy_4h: z.coerce.number().default(0),
  volume_buy_6h: z.coerce.number().default(0),
  volume_buy_12h: z.coerce.number().default(0),
  volume_buy_24h: z.coerce.number().default(0),

  volume_sell_1min: z.coerce.number().default(0),
  volume_sell_5min: z.coerce.number().default(0),
  volume_sell_15min: z.coerce.number().default(0),
  volume_sell_1h: z.coerce.number().default(0),
  volume_sell_4h: z.coerce.number().default(0),
  volume_sell_6h: z.coerce.number().default(0),
  volume_sell_12h: z.coerce.number().default(0),
  volume_sell_24h: z.coerce.number().default(0),

  trades_1min: z.coerce.number().default(0),
  trades_5min: z.coerce.number().default(0),
  trades_15min: z.coerce.number().default(0),
  trades_1h: z.coerce.number().default(0),
  trades_4h: z.coerce.number().default(0),
  trades_6h: z.coerce.number().default(0),
  trades_12h: z.coerce.number().default(0),
  trades_24h: z.coerce.number().default(0),

  buys_1min: z.coerce.number().default(0),
  buys_5min: z.coerce.number().default(0),
  buys_15min: z.coerce.number().default(0),
  buys_1h: z.coerce.number().default(0),
  buys_4h: z.coerce.number().default(0),
  buys_6h: z.coerce.number().default(0),
  buys_12h: z.coerce.number().default(0),
  buys_24h: z.coerce.number().default(0),

  sells_1min: z.coerce.number().default(0),
  sells_5min: z.coerce.number().default(0),
  sells_15min: z.coerce.number().default(0),
  sells_1h: z.coerce.number().default(0),
  sells_4h: z.coerce.number().default(0),
  sells_6h: z.coerce.number().default(0),
  sells_12h: z.coerce.number().default(0),
  sells_24h: z.coerce.number().default(0),

  buyers_1min: z.coerce.number().default(0),
  buyers_5min: z.coerce.number().default(0),
  buyers_15min: z.coerce.number().default(0),
  buyers_1h: z.coerce.number().default(0),
  buyers_4h: z.coerce.number().default(0),
  buyers_6h: z.coerce.number().default(0),
  buyers_12h: z.coerce.number().default(0),
  buyers_24h: z.coerce.number().default(0),

  sellers_1min: z.coerce.number().default(0),
  sellers_5min: z.coerce.number().default(0),
  sellers_15min: z.coerce.number().default(0),
  sellers_1h: z.coerce.number().default(0),
  sellers_4h: z.coerce.number().default(0),
  sellers_6h: z.coerce.number().default(0),
  sellers_12h: z.coerce.number().default(0),
  sellers_24h: z.coerce.number().default(0),

  traders_1min: z.coerce.number().default(0),
  traders_5min: z.coerce.number().default(0),
  traders_15min: z.coerce.number().default(0),
  traders_1h: z.coerce.number().default(0),
  traders_4h: z.coerce.number().default(0),
  traders_6h: z.coerce.number().default(0),
  traders_12h: z.coerce.number().default(0),
  traders_24h: z.coerce.number().default(0),

  fees_paid_1min: z.coerce.number().default(0),
  fees_paid_5min: z.coerce.number().default(0),
  fees_paid_15min: z.coerce.number().default(0),
  fees_paid_1h: z.coerce.number().default(0),
  fees_paid_4h: z.coerce.number().default(0),
  fees_paid_6h: z.coerce.number().default(0),
  fees_paid_12h: z.coerce.number().default(0),
  fees_paid_24h: z.coerce.number().default(0),
  totalFeesPaidUSD: z.coerce.number().default(0),
  totalFeesPaidNativeRaw: z.coerce.bigint().default(0n),

  organic_trades_1min: z.coerce.number().default(0),
  organic_trades_5min: z.coerce.number().default(0),
  organic_trades_15min: z.coerce.number().default(0),
  organic_trades_1h: z.coerce.number().default(0),
  organic_trades_4h: z.coerce.number().default(0),
  organic_trades_6h: z.coerce.number().default(0),
  organic_trades_12h: z.coerce.number().default(0),
  organic_trades_24h: z.coerce.number().default(0),

  organic_traders_1min: z.coerce.number().default(0),
  organic_traders_5min: z.coerce.number().default(0),
  organic_traders_15min: z.coerce.number().default(0),
  organic_traders_1h: z.coerce.number().default(0),
  organic_traders_4h: z.coerce.number().default(0),
  organic_traders_6h: z.coerce.number().default(0),
  organic_traders_12h: z.coerce.number().default(0),
  organic_traders_24h: z.coerce.number().default(0),

  organic_volume_1min: z.coerce.number().default(0),
  organic_volume_5min: z.coerce.number().default(0),
  organic_volume_15min: z.coerce.number().default(0),
  organic_volume_1h: z.coerce.number().default(0),
  organic_volume_4h: z.coerce.number().default(0),
  organic_volume_6h: z.coerce.number().default(0),
  organic_volume_12h: z.coerce.number().default(0),
  organic_volume_24h: z.coerce.number().default(0),

  organic_volume_buy_1min: z.coerce.number().default(0),
  organic_volume_buy_5min: z.coerce.number().default(0),
  organic_volume_buy_15min: z.coerce.number().default(0),
  organic_volume_buy_1h: z.coerce.number().default(0),
  organic_volume_buy_4h: z.coerce.number().default(0),
  organic_volume_buy_6h: z.coerce.number().default(0),
  organic_volume_buy_12h: z.coerce.number().default(0),
  organic_volume_buy_24h: z.coerce.number().default(0),

  organic_volume_sell_1min: z.coerce.number().default(0),
  organic_volume_sell_5min: z.coerce.number().default(0),
  organic_volume_sell_15min: z.coerce.number().default(0),
  organic_volume_sell_1h: z.coerce.number().default(0),
  organic_volume_sell_4h: z.coerce.number().default(0),
  organic_volume_sell_6h: z.coerce.number().default(0),
  organic_volume_sell_12h: z.coerce.number().default(0),
  organic_volume_sell_24h: z.coerce.number().default(0),

  organic_buys_1min: z.coerce.number().default(0),
  organic_buys_5min: z.coerce.number().default(0),
  organic_buys_15min: z.coerce.number().default(0),
  organic_buys_1h: z.coerce.number().default(0),
  organic_buys_4h: z.coerce.number().default(0),
  organic_buys_6h: z.coerce.number().default(0),
  organic_buys_12h: z.coerce.number().default(0),
  organic_buys_24h: z.coerce.number().default(0),

  organic_sells_1min: z.coerce.number().default(0),
  organic_sells_5min: z.coerce.number().default(0),
  organic_sells_15min: z.coerce.number().default(0),
  organic_sells_1h: z.coerce.number().default(0),
  organic_sells_4h: z.coerce.number().default(0),
  organic_sells_6h: z.coerce.number().default(0),
  organic_sells_12h: z.coerce.number().default(0),
  organic_sells_24h: z.coerce.number().default(0),

  organic_buyers_1min: z.coerce.number().default(0),
  organic_buyers_5min: z.coerce.number().default(0),
  organic_buyers_15min: z.coerce.number().default(0),
  organic_buyers_1h: z.coerce.number().default(0),
  organic_buyers_4h: z.coerce.number().default(0),
  organic_buyers_6h: z.coerce.number().default(0),
  organic_buyers_12h: z.coerce.number().default(0),
  organic_buyers_24h: z.coerce.number().default(0),

  organic_sellers_1min: z.coerce.number().default(0),
  organic_sellers_5min: z.coerce.number().default(0),
  organic_sellers_15min: z.coerce.number().default(0),
  organic_sellers_1h: z.coerce.number().default(0),
  organic_sellers_4h: z.coerce.number().default(0),
  organic_sellers_6h: z.coerce.number().default(0),
  organic_sellers_12h: z.coerce.number().default(0),
  organic_sellers_24h: z.coerce.number().default(0),
});
export type TokenStats = z.infer<typeof TokenStatsSchema>;

export const EnrichedTokenDataSchema = TokenData.merge(
  TokenStatsSchema.merge(
    z.object({
      created_at: z.coerce.date().nullable(),
      latest_price: z.coerce.number().default(0),

      holders_count: z.coerce.number().default(0),
      market_cap: z.coerce.number().default(0),
      latest_market_cap: z.coerce.number().default(0),

      description: z.string().nullable(),
      socials: z.object({
        twitter: z.string().nullable(),
        website: z.string().nullable(),
        telegram: z.string().nullable(),
        others: z.record(z.unknown()).nullable(),
        uri: z.string().optional(),
      }),

      security: SecurityFlagsSchema.nullable(),

      twitterReusesCount: z.coerce.number().nullable().default(0),
      twitterRenameCount: z.coerce.number().default(0),
      twitterRenameHistory: z
        .array(
          z.object({
            username: z.string(),
            last_checked: z.string(),
          }),
        )
        .optional(),

      deployerMigrationsCount: z.coerce.number().default(0),
      dexscreenerListed: z.boolean().nullable().default(false),
      dexscreenerHeader: z.string().nullable().default(null),
      dexscreenerAdPaid: z.boolean().nullable().default(false),

      liveStatus: z.string().nullable(),
      liveThumbnail: z.string().nullable(),
      livestreamTitle: z.string().nullable(),
      liveReplyCount: z.number().nullable(),

      holders_list: z.array(HolderSchema),
    }),
  ),
).merge(HoldersStatsSchema);

export type EnrichedTokenData = z.infer<typeof EnrichedTokenDataSchema>;

// Pulse types are now identical to enriched types
export const PulseEnrichedTokenDataSchema = EnrichedTokenDataSchema;
export type PulseEnrichedTokenData = EnrichedTokenData;

type MakeNullableExcept<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] : T[P] | null;
};

export type NullableEnrichedPoolData = MakeNullableExcept<Omit<EnrichedPoolData, 'token0' | 'token1'>, 'address'> & {
  address_id: string;
  chain_id: string;
};
export type NullableEnrichedTokenData = MakeNullableExcept<EnrichedTokenData, 'address'> & {
  address_id: string;
  chain_id: string;
};
