import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import type { PoolsStatsFilter } from '../../utils/functions/queryFilters.ts';
import { PoolData } from '../../utils/schemas/EnrichedMarketData.ts';

export const dateFields = ['latest_trade_date', 'created_at'] as const;
export const nonNumericPoolValues = ['type', 'explicit'] as const;
export const nonNumericValues = ['source', 'deployer'] as const;

export const MarketBlockchainPairsParamsSchema = z.object({
  blockchain: z.string().optional(),
  blockchains: z.string().optional(),
  sortBy: z.string().optional().default('latest_trade_date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  factory: z.string().optional(),
  limit: z.coerce.number().max(100).optional().default(100),
  offset: z.coerce.number().optional().default(0),
  advancedFilters: z
    .string()
    .optional()
    .transform((val) => {
      return JSON.parse(val ?? '{}');
    }),
  filters: z
    .string()
    .optional()
    .transform((val) => {
      return val ? val.split(',') : [];
    })
    .transform((filters) => {
      const whereClause: PoolsStatsFilter = {};
      for (const filter of filters) {
        if (filter.includes(':')) {
          const [field, filterMinValue, filterMaxValue] = filter.split(':');

          if (field && nonNumericPoolValues.includes(field as (typeof nonNumericPoolValues)[number])) {
            if (!whereClause.pools) {
              whereClause.pools = {};
            }
            (whereClause.pools as any)[field] = {
              equals: filterMinValue === 'false' ? false : filterMinValue === 'true' ? true : filterMinValue,
            };
          } else if (field && nonNumericValues.includes(field as (typeof nonNumericValues)[number])) {
            (whereClause as any)[field] = {
              equals: filterMinValue,
            };
          } else if (field && dateFields.includes(field as (typeof dateFields)[number])) {
            (whereClause as any)[field] = {
              gte: filterMinValue
                ? new Date(Number.isNaN(Number(filterMinValue)) ? filterMinValue : Number(filterMinValue))
                : undefined,
              lte: filterMaxValue
                ? new Date(Number.isNaN(Number(filterMaxValue)) ? filterMaxValue : Number(filterMaxValue))
                : undefined,
            };
          } else if (field) {
            (whereClause as any)[field] = {
              gte: filterMinValue ? Number(filterMinValue) : undefined,
              lte: filterMaxValue ? Number(filterMaxValue) : undefined,
            };
          }
        }
      }
      return whereClause;
    }),
  excludeBonded: z.coerce.boolean().optional().default(false),
});

export type MarketBlockchainPairsParams = z.input<typeof MarketBlockchainPairsParamsSchema>;

export const MarketBlockchainPairsParamsSchemaOpenAPI = createOpenAPIParams(MarketBlockchainPairsParamsSchema, {
  omit: ['advancedFilters', 'filters'],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    blockchains: 'Comma-separated blockchain IDs',
    sortBy: 'Sort field (default: latest_trade_date)',
    sortOrder: 'Sort order: asc or desc (default: desc)',
    factory: 'Filter by DEX factory address',
    limit: 'Number of pairs per page (max 100, default: 100)',
    offset: 'Offset for pagination (default: 0)',
    excludeBonded: 'Exclude bonded pairs (default: false)',
  },
});

export const MarketBlockchainPairsResponseSchema = z.object({
  data: z.array(
    z.object({
      price: z.number(),
      price_change_5min: z.number(),
      price_change_1h: z.number(),
      price_change_4h: z.number(),
      price_change_6h: z.number(),
      price_change_12h: z.number(),
      price_change_24h: z.number(),
      last_trade: z.coerce.date().nullable(),
      created_at: z.coerce.date().nullable(),
      holders_count: z.number(),
      volume_1min: z.number(),
      volume_5min: z.number(),
      volume_15min: z.number(),
      volume_1h: z.number(),
      volume_4h: z.number(),
      volume_6h: z.number(),
      volume_12h: z.number(),
      volume_24h: z.number(),
      trades_1min: z.number(),
      trades_5min: z.number(),
      trades_15min: z.number(),
      trades_1h: z.number(),
      trades_4h: z.number(),
      trades_6h: z.number(),
      trades_12h: z.number(),
      trades_24h: z.number(),
      liquidity: z.number(),
      pair: PoolData,
      source: z.string().nullable(),
      deployer: z.string().nullable(),
    }),
  ),
  factories: z.record(z.string(), z.any()),
});

export type MarketBlockchainPairsResponse = z.infer<typeof MarketBlockchainPairsResponseSchema>;
