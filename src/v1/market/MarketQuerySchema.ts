import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import type { GenericWhere } from '../../utils/functions/queryFilters.ts';

const allowedFields = [
  'price',
  'price_change_1h',
  'price_change_7d',
  'liquidity',
  'market_cap',
  'volume',
  'price_change_24h',
  'off_chain_volume',
] as const;

const allowedFieldsToNewFormat: Record<(typeof allowedFields)[number], (typeof allowedFieldsNewFormat)[number]> = {
  price: 'priceUSD',
  price_change_1h: 'priceChange1hPercent',
  price_change_7d: 'priceChange7dPercent',
  liquidity: 'liquidityUSD',
  market_cap: 'marketCapUSD',
  volume: 'volume24hUSD',
  price_change_24h: 'priceChange24hPercent',
  off_chain_volume: 'offChainVolumeUSD',
};

const allowedFieldsNewFormat = [
  'priceUSD',
  'priceChange1hPercent',
  'priceChange7dPercent',
  'liquidityUSD',
  'marketCapUSD',
  'volume24hUSD',
  'priceChange24hPercent',
  'offChainVolumeUSD',
] as const;

const allowedFieldsEnum = z.enum(allowedFields);
const allowedFieldsNewFormatEnum = z.enum(allowedFieldsNewFormat);
type AllowedFieldsType = z.infer<typeof allowedFieldsEnum>;
type NewFormatAllowFieldsType = z.infer<typeof allowedFieldsNewFormatEnum>;

const getNewFormatField = (input: AllowedFieldsType): NewFormatAllowFieldsType => {
  return allowedFieldsToNewFormat[input];
};

export const MarketQueryParamsSchema = z
  .object({
    sortBy: z
      .string()
      .optional()
      .transform((val) => {
        if (val) {
          return getNewFormatField(allowedFieldsEnum.parse(val));
        }
        return null;
      }),
    sortOrder: z.string().default('desc'),
    filters: z
      .string()
      .optional()
      .transform((values) => {
        const filters = values ? values.split(',') : [];

        if (filters.length > 0) {
          const tmpSubQuery: GenericWhere = {};

          for (const filter of filters) {
            if (filter.includes(':')) {
              const orStatements = filter.split('||');

              for (const statement of orStatements) {
                const filterPart = statement.split(':');

                if (filterPart.length === 2) {
                  filterPart.push('');
                }

                const [field, min, max] = z
                  .tuple([
                    allowedFieldsEnum,
                    z.coerce.string().default('0'),
                    z.coerce.string().default('100000000000000000'),
                  ])
                  .parse(filterPart);

                if (allowedFields.includes(field)) {
                  tmpSubQuery[getNewFormatField(field)] = {
                    gte: min ? z.coerce.number().parse(min) : undefined,
                    lte: max ? z.coerce.number().parse(max) : undefined,
                  };
                }
              }
            }
          }

          return { AND: [tmpSubQuery] };
        }

        return {};
      }),
    blockchain: z.string().optional(),
    blockchains: z
      .string()
      .optional()
      .transform((blockchainsString) => {
        if (!blockchainsString) {
          return [];
        }
        return blockchainsString
          .split(',')
          .map((blockchain) => blockchain.trim())
          .filter((b) => b.length > 0);
      }),
    categories: z
      .string()
      .optional()
      .transform((val) => {
        if (val) {
          return val.split(',');
        }
        return [];
      }),
    limit: z.coerce.number().default(20),
    offset: z.coerce.number().default(0),
  })
  .transform(({ filters, sortOrder, sortBy, ...data }) => ({
    where: filters,
    orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
    ...data,
  }));

export type MarketQueryParams = z.input<typeof MarketQueryParamsSchema>;

export type MarketQueryInferType = z.infer<typeof MarketQueryParamsSchema>;

export const MarketQueryParamsSchemaOpenAPI = createOpenAPIParams(MarketQueryParamsSchema, {
  omit: ['blockchain'],
  describe: {
    sortBy: 'Sort field (e.g. price, liquidity, market_cap, volume)',
    sortOrder: 'Sort order: asc or desc (default: desc)',
    filters: 'Comma-separated filters in format field:min:max (e.g. liquidity:1000:,market_cap:100000:1000000)',
    blockchains: 'Comma-separated blockchain IDs',
    categories: 'Comma-separated category names',
    limit: 'Maximum number of results (default: 20)',
    offset: 'Offset for pagination',
  },
});

export const MarketQueryResponseSchema = z.array(
  z.object({
    name: z.string(),
    logo: z.string().nullable(),
    symbol: z.string(),
    liquidity: z.number(),
    market_cap: z.number(),
    volume: z.number(),
    off_chain_volume: z.number(),
    price: z.number(),
    price_change_1h: z.number(),
    price_change_24h: z.number(),
    price_change_7d: z.number(),
    categories: z.array(z.string().optional()),
    contracts: z.array(
      z.object({
        address: z.string(),
        blockchain: z.string(),
        blockchainId: z.string(),
        decimals: z.number(),
      }),
    ),
    id: z.number(),
    rank: z.number().nullable(),
  }),
);

export type MarketQueryResponse = z.infer<typeof MarketQueryResponseSchema>;
