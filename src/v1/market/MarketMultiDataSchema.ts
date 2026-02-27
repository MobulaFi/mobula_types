import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import { stringOrArray } from '../../utils/schemas/StringOrArray.ts';

// Schema for assets (addresses or names)
const assetEntry = z.object({
  type: z.enum(['address', 'name']),
  value: z.string(),
});

export const MarketMultiDataAssetParamsSchema = z.object({
  // IDs of assets (string or array, transformed into an array of strings)
  ids: stringOrArray.optional(),

  // Symbols of assets (string or array, transformed into an array of strings)
  symbols: stringOrArray.optional(),

  // Blockchains (string or array, transformed into an array of chain IDs)
  blockchains: stringOrArray.optional(),

  // Assets (addresses or names, string or array of objects)
  assets: z
    .union([
      z.string(), // Ex. "0x123,bitcoin"
      z.array(assetEntry), // Or an array of objects { type, value }
    ])
    .optional(),

  // Option to fetch price changes (string "24h" or boolean)
  shouldFetchPriceChange: z
    .union([z.literal('24h'), z.coerce.boolean()])
    .optional()
    .default(false),
});

export type MarketMultiDataAssetParams = z.input<typeof MarketMultiDataAssetParamsSchema>;

export const MarketMultiDataAssetParamsSchemaOpenAPI = createOpenAPIParams(MarketMultiDataAssetParamsSchema, {
  omit: ['shouldFetchPriceChange'],
  describe: {
    ids: 'Comma-separated asset IDs',
    symbols: 'Comma-separated token symbols',
    blockchains: 'Comma-separated blockchain IDs',
    assets: 'Comma-separated token addresses or names',
  },
});

const Asset = z.object({
  key: z.string(),
  id: z.number().nullable(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().nullable(),
  logo: z.string().nullable(),
  rank: z.number().nullable(),
  price: z.number().nullable(),
  market_cap: z.number(),
  market_cap_diluted: z.number(),
  volume: z.number(),
  volume_change_24h: z.number(),
  volume_7d: z.number(),
  liquidity: z.number(),
  ath: z.number().nullable(),
  atl: z.number().nullable(),
  off_chain_volume: z.number(),
  is_listed: z.boolean(),
  price_change_1h: z.number(),
  price_change_24h: z.number(),
  price_change_7d: z.number(),
  price_change_1m: z.number(),
  price_change_1y: z.number(),
  total_supply: z.number(),
  circulating_supply: z.number(),
  contracts: z.array(
    z.object({
      address: z.string(),
      blockchainId: z.string(),
      blockchain: z.string(),
      decimals: z.number(),
    }),
  ),
});

export const MarketMultiDataResponseSchema = z.object({
  data: z.record(z.string(), Asset),
  dataArray: z.array(Asset.nullable()),
});

export type MarketMultiDataResponse = z.infer<typeof MarketMultiDataResponseSchema>;
