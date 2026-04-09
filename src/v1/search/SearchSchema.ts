import { z } from 'zod';
import { PoolData } from '../../utils/schemas/EnrichedMarketData.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';

/**
 * Internal snake_case sort field values (used in SQL queries)
 */
export type SearchSortByInternal =
  | 'volume_24h'
  | 'market_cap'
  | 'created_at'
  | 'volume_1h'
  | 'fees_paid_5min'
  | 'fees_paid_1h'
  | 'fees_paid_24h'
  | 'volume_5min'
  | 'holders_count'
  | 'organic_volume_1h'
  | 'total_fees_paid_usd'
  | 'search_score'
  | 'trending_score_24h';

export const SearchParamsSchema = z.object({
  input: z.string(),
  type: z.enum(['tokens', 'assets', 'pairs']).optional(),
  filters: z
    .string()
    .optional()
    .transform((filtersString) => {
      if (!filtersString) return {};
      try {
        // Replace unquoted keys with quoted keys, but only match keys (not values)
        // Match pattern: (start of string, comma, or opening brace) + optional whitespace + unquoted key + optional whitespace + colon
        const parsed = JSON.parse(filtersString.replace(/(^|[,{]\s*)([a-zA-Z0-9_]+)(\s*):/g, '$1"$2"$3:')) as Record<
          string,
          unknown
        >;
        return {
          blockchains: parsed['blockchains'] || undefined,
          factory: parsed['factory'] || undefined,
          poolTypes: parsed['poolTypes'] || undefined,
          factoriesAddresses: parsed['factoriesAddresses'] || undefined,
          excludeBonded: parsed['excludeBonded'] || undefined,
          bondedOnly: parsed['bondedOnly'] || undefined,
          bundlers_holdings_percentage: parsed['bundlers_holdings_percentage'] || undefined,
        };
      } catch {
        return {};
      }
    })
    .pipe(
      z.object({
        blockchains: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((blockchainsInput) => {
            if (!blockchainsInput) {
              return [];
            }

            // Handle array input (from JSON parse)
            const blockchainsString = Array.isArray(blockchainsInput) ? blockchainsInput.join(',') : blockchainsInput;

            return blockchainsString
              .split(',')
              .map((chain) => chain.trim())
              .filter((chain) => chain.length > 0);
          }),
        type: z.enum(['tokens', 'assets', 'pairs']).optional(),
        factory: z.string().optional(),
        poolTypes: z
          .string()
          .optional()
          .transform((poolTypesString) => {
            if (poolTypesString) {
              return poolTypesString?.split(',').map((poolType) => poolType.trim());
            }
            return [];
          }),
        factoriesAddresses: z
          .string()
          .optional()
          .transform((factoriesAddressesString) => {
            return factoriesAddressesString?.split(',').map((factoryAddress) => factoryAddress.trim());
          }),
        excludeBonded: z.coerce.boolean().optional().default(false),
        bondedOnly: z.coerce.boolean().optional().default(false),
        bundlers_holdings_percentage: z
          .object({
            lte: z.coerce.number().optional(),
            gte: z.coerce.number().optional(),
          })
          .optional(),
      }),
    ),
  mode: z.enum(['trendings', 'og']).optional().default('trendings'),
  /**
   * Sort field for search results.
   * Accepts both camelCase (preferred) and snake_case (legacy) values.
   * All values are internally converted to snake_case for SQL queries.
   *
   * camelCase values (preferred):
   * - volume24h, marketCap, createdAt, volume1h, feesPaid5min, feesPaid1h,
   * - feesPaid24h, volume5min, holdersCount, organicVolume1h, totalFeesPaidUsd,
   * - searchScore, trendingScore24h
   *
   * snake_case values (legacy, for backwards compatibility):
   * - volume_24h, market_cap, created_at, etc.
   */
  sortBy: z
    .enum([
      // camelCase (preferred)
      'volume24h',
      'marketCap',
      'createdAt',
      'volume1h',
      'feesPaid5min',
      'feesPaid1h',
      'feesPaid24h',
      'volume5min',
      'holdersCount',
      'organicVolume1h',
      'totalFeesPaidUsd',
      'searchScore',
      'trendingScore24h',
      // snake_case (legacy, for backwards compatibility)
      'volume_24h',
      'market_cap',
      'created_at',
      'volume_1h',
      'fees_paid_5min',
      'fees_paid_1h',
      'fees_paid_24h',
      'volume_5min',
      'holders_count',
      'organic_volume_1h',
      'total_fees_paid_usd',
      'search_score',
      'trending_score_24h',
    ])
    .optional()
    .default('searchScore')
    .transform((val): SearchSortByInternal => {
      // Map camelCase to snake_case for SQL queries
      const mapping: Record<string, SearchSortByInternal> = {
        volume24h: 'volume_24h',
        marketCap: 'market_cap',
        createdAt: 'created_at',
        volume1h: 'volume_1h',
        feesPaid5min: 'fees_paid_5min',
        feesPaid1h: 'fees_paid_1h',
        feesPaid24h: 'fees_paid_24h',
        volume5min: 'volume_5min',
        holdersCount: 'holders_count',
        organicVolume1h: 'organic_volume_1h',
        totalFeesPaidUsd: 'total_fees_paid_usd',
        searchScore: 'search_score',
        trendingScore24h: 'trending_score_24h',
      };
      return mapping[val] ?? (val as SearchSortByInternal);
    }),
  excludeBonded: z.coerce.boolean().optional(),
  limit: z.coerce.number().min(1).max(20).optional().default(5),
});

export type SearchParams = z.input<typeof SearchParamsSchema>;
export type SearchInferType = z.infer<typeof SearchParamsSchema>;

// OpenAPI variant: only expose camelCase sortBy values, hide 'og' mode
export const SearchParamsSchemaOpenAPI = z.object({
  input: z.string().describe('Search query string'),
  type: z.enum(['tokens', 'assets', 'pairs']).optional().describe('Type of results to return'),
  filters: z
    .string()
    .optional()
    .describe('JSON string with filter options: blockchains, poolTypes, excludeBonded, bondedOnly'),
  sortBy: z
    .enum([
      'volume24h',
      'marketCap',
      'createdAt',
      'volume1h',
      'feesPaid5min',
      'feesPaid1h',
      'feesPaid24h',
      'volume5min',
      'holdersCount',
      'organicVolume1h',
      'totalFeesPaidUsd',
      'searchScore',
      'trendingScore24h',
    ])
    .optional()
    .describe('Sort field for search results'),
  excludeBonded: z.boolean().optional().describe('Exclude bonded tokens from results'),
  limit: z.number().optional().describe('Maximum number of results (1-20, default: 5)'),
});

const TokenSchema = z.object({
  address: z.string(),
  price: z.number().nullable(),
  priceToken: z.number(),
  priceTokenString: z.string(),
  approximateReserveUSD: z.number(),
  approximateReserveTokenRaw: z.string(),
  approximateReserveToken: z.number(),
  symbol: z.string(),
  name: z.string(),
  id: z.number().nullable().optional(),
  decimals: z.number(),
  totalSupply: z.number(),
  circulatingSupply: z.number(),
  chainId: z.string(),
  logo: z.string().nullable(),
});

const PairSchema = z
  .object({
    token0: TokenSchema,
    token1: TokenSchema,
    volume24h: z.number(),
    liquidity: z.number(),
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
    price: z.number().nullable(),
    priceToken: z.number(),
    priceTokenString: z.string(),
    extraData: z.record(z.any()).nullable(),
  })
  .optional();

const TokenDataSchema = z.object({
  logo: z.string().nullable(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.array(z.number().optional()),
  volume_24h: z.number().optional(),
  price_change_24h: z.number().optional(),
  price_change_1h: z.number().optional(),
  blockchains: z.array(z.string().optional()),
  contracts: z.array(z.string().optional()),
  price: z.number().nullable(),
  total_supply: z.number(),
  market_cap: z.number(),
  pairs: z.array(PairSchema),
  type: z.literal('token'),
});

const AssetDataSchema = z.object({
  id: z.number(),
  name: z.string(),
  symbol: z.string(),
  contracts: z.array(z.string().optional()),
  blockchains: z.array(z.string().optional()),
  decimals: z.array(z.number().optional()),
  twitter: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  logo: z.string().nullable(),
  price: z.number().nullable(),
  market_cap: z.number(),
  total_supply: z.number(),
  liquidity: z.number(),
  volume: z.number(),
  pairs: z.array(PairSchema),
  type: z.literal('asset'),
  price_change_24h: z.number().nullable(),
  price_change_1h: z.number().nullable(),
});

export const SearchResponseSchema = z.object({
  data: z.array(z.union([TokenDataSchema, AssetDataSchema, PoolData])),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const SearchFastResponseSchema = z.object({
  data: z.array(TokenDetailsOutput),
});

export type SearchFastResponse = z.infer<typeof SearchFastResponseSchema>;
