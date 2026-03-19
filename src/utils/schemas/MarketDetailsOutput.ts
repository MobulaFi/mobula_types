import { z } from 'zod';
import { PerpDataMarketDetailsOutputSchema } from '../../v2/perp/PerpModels.ts';
import { HoldersStatsSchema } from './EnrichedHoldersData.ts';

import { SecurityFlagsSchema } from './SecuritySchemas.ts';

const TokenDetailsSchema = z
  .object({
    address: z.string(),
    chainId: z.string(),
    symbol: z.string().nullable(),
    name: z.string().nullable(),
    decimals: z.coerce.number().default(0),
    id: z.number().nullable().optional().default(null),

    priceUSD: z.coerce.number().default(0),
    priceToken: z.coerce.number().default(0),
    priceTokenString: z.string(),
    approximateReserveUSD: z.coerce.number().default(0),
    approximateReserveTokenRaw: z.string(),
    approximateReserveToken: z.coerce.number().default(0),
    totalSupply: z.coerce.number().default(0),
    circulatingSupply: z.coerce.number().default(0),
    marketCapUSD: z.coerce.number().optional().default(0),
    marketCapDilutedUSD: z.coerce.number().optional().default(0),
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
    sourceMetadata: z
      .object({
        name: z.string(),
        logo: z.string(),
      })
      .nullable()
      .optional(),

    liquidityUSD: z.coerce.number().optional(),
    liquidityMaxUSD: z.coerce.number().optional(),
    bonded: z.boolean().optional(),
    bondingPercentage: z.coerce.number().optional(),
    bondingCurveAddress: z.string().nullable().optional(),
    preBondingFactory: z.string().optional(),
    poolAddress: z.string().optional(),

    blockchain: z.string().optional(),
    type: z.string().optional(),

    isMayhemMode: z.boolean().nullable().optional().default(null),
    isCashbackCoin: z.boolean().nullable().optional().default(null),
    isAgentMode: z.boolean().nullable().optional().default(null),

    deployer: z.string().nullable().optional(),
    createdAt: z.coerce.string().optional(),
    bondedAt: z.coerce.date().nullable(),
    athUSD: z.coerce.number().optional(),
    atlUSD: z.coerce.number().optional(),
    athDate: z.coerce.date().optional(),
    atlDate: z.coerce.date().optional(),
  })
  .merge(HoldersStatsSchema);

export const MarketDetailsOutput = z
  .object({
    token0: TokenDetailsSchema.optional(),
    token1: TokenDetailsSchema.optional(),

    base: TokenDetailsSchema,
    quote: TokenDetailsSchema,

    liquidityUSD: z.coerce.number().default(0),
    latestTradeDate: z.coerce.date().nullable(),
    blockchain: z.string(),
    address: z.string(),
    createdAt: z.coerce.date().nullable(),
    type: z.string(),
    exchange: z.object({
      name: z.string(),
      logo: z.string(),
    }),
    factory: z.string().nullable(),
    priceUSD: z.coerce.number().optional(),
    priceToken: z.coerce.number().optional(),
    priceTokenString: z.string().optional(),

    baseToken: z.string(),
    quoteToken: z.string(),

    bonded: z.coerce.boolean(),
    bondingPercentage: z.coerce.number().nullable(),
    preBondingPoolAddress: z.string().nullable(),
    sourceFactory: z.string().nullable().optional(),

    totalFeesPaidUSD: z.coerce.number().nullable(),
    totalFeesPaidNativeRaw: z.coerce.string().default('0'),

    priceChange1minPercentage: z.coerce.number().default(0),
    priceChange5minPercentage: z.coerce.number().default(0),
    priceChange1hPercentage: z.coerce.number().default(0),
    priceChange4hPercentage: z.coerce.number().default(0),
    priceChange6hPercentage: z.coerce.number().default(0),
    priceChange12hPercentage: z.coerce.number().default(0),
    priceChange24hPercentage: z.coerce.number().default(0),

    volume1minUSD: z.coerce.number().default(0),
    volume5minUSD: z.coerce.number().default(0),
    volume15minUSD: z.coerce.number().default(0),
    volume1hUSD: z.coerce.number().default(0),
    volume4hUSD: z.coerce.number().default(0),
    volume6hUSD: z.coerce.number().default(0),
    volume12hUSD: z.coerce.number().default(0),
    volume24hUSD: z.coerce.number().default(0),

    volumeBuy1minUSD: z.coerce.number().default(0),
    volumeBuy5minUSD: z.coerce.number().default(0),
    volumeBuy15minUSD: z.coerce.number().default(0),
    volumeBuy1hUSD: z.coerce.number().default(0),
    volumeBuy4hUSD: z.coerce.number().default(0),
    volumeBuy6hUSD: z.coerce.number().default(0),
    volumeBuy12hUSD: z.coerce.number().default(0),
    volumeBuy24hUSD: z.coerce.number().default(0),

    volumeSell1minUSD: z.coerce.number().default(0),
    volumeSell5minUSD: z.coerce.number().default(0),
    volumeSell15minUSD: z.coerce.number().default(0),
    volumeSell1hUSD: z.coerce.number().default(0),
    volumeSell4hUSD: z.coerce.number().default(0),
    volumeSell6hUSD: z.coerce.number().default(0),
    volumeSell12hUSD: z.coerce.number().default(0),
    volumeSell24hUSD: z.coerce.number().default(0),

    trades1min: z.coerce.number().default(0),
    trades5min: z.coerce.number().default(0),
    trades15min: z.coerce.number().default(0),
    trades1h: z.coerce.number().default(0),
    trades4h: z.coerce.number().default(0),
    trades6h: z.coerce.number().default(0),
    trades12h: z.coerce.number().default(0),
    trades24h: z.coerce.number().default(0),

    buys1min: z.coerce.number().default(0),
    buys5min: z.coerce.number().default(0),
    buys15min: z.coerce.number().default(0),
    buys1h: z.coerce.number().default(0),
    buys4h: z.coerce.number().default(0),
    buys6h: z.coerce.number().default(0),
    buys12h: z.coerce.number().default(0),
    buys24h: z.coerce.number().default(0),

    sells1min: z.coerce.number().default(0),
    sells5min: z.coerce.number().default(0),
    sells15min: z.coerce.number().default(0),
    sells1h: z.coerce.number().default(0),
    sells4h: z.coerce.number().default(0),
    sells6h: z.coerce.number().default(0),
    sells12h: z.coerce.number().default(0),
    sells24h: z.coerce.number().default(0),

    buyers1min: z.coerce.number().default(0),
    buyers5min: z.coerce.number().default(0),
    buyers15min: z.coerce.number().default(0),
    buyers1h: z.coerce.number().default(0),
    buyers4h: z.coerce.number().default(0),
    buyers6h: z.coerce.number().default(0),
    buyers12h: z.coerce.number().default(0),
    buyers24h: z.coerce.number().default(0),

    sellers1min: z.coerce.number().default(0),
    sellers5min: z.coerce.number().default(0),
    sellers15min: z.coerce.number().default(0),
    sellers1h: z.coerce.number().default(0),
    sellers4h: z.coerce.number().default(0),
    sellers6h: z.coerce.number().default(0),
    sellers12h: z.coerce.number().default(0),
    sellers24h: z.coerce.number().default(0),

    traders1min: z.coerce.number().default(0),
    traders5min: z.coerce.number().default(0),
    traders15min: z.coerce.number().default(0),
    traders1h: z.coerce.number().default(0),
    traders4h: z.coerce.number().default(0),
    traders6h: z.coerce.number().default(0),
    traders12h: z.coerce.number().default(0),
    traders24h: z.coerce.number().default(0),

    feesPaid1minUSD: z.coerce.number().default(0),
    feesPaid5minUSD: z.coerce.number().default(0),
    feesPaid15minUSD: z.coerce.number().default(0),
    feesPaid1hUSD: z.coerce.number().default(0),
    feesPaid4hUSD: z.coerce.number().default(0),
    feesPaid6hUSD: z.coerce.number().default(0),
    feesPaid12hUSD: z.coerce.number().default(0),
    feesPaid24hUSD: z.coerce.number().default(0),

    holdersCount: z.coerce.number().default(0),

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
          lastChecked: z.string(),
        }),
      )
      .default([]),
    perpetuals: PerpDataMarketDetailsOutputSchema.optional(),
    extraData: z.record(z.unknown()).optional(),
  })
  .merge(HoldersStatsSchema);

export type MarketDetailsOutputType = z.infer<typeof MarketDetailsOutput>;
