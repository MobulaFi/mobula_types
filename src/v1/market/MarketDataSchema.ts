import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

// Main AssetQuery schema
export const AssetQuery = z
  .object({
    blockchain: z.string().optional(), // Optional blockchain/chainId
    asset: z.string().optional(), // Could be address or name
    symbol: z.string().optional(), // Symbol if provided
    id: z.coerce.number().optional(), // ID if provided
    shouldFetchPriceChange: z
      .union([z.literal('24h'), z.coerce.boolean()])
      .optional()
      .default('24h'),
  })
  .refine(
    (data) => {
      // Ensure at least one of id, asset, or symbol is provided
      return !!(data.id || data.asset || data.symbol);
    },
    {
      message: 'At least one of id, asset, or symbol must be provided.',
    },
  );

export type AssetQuery = z.infer<typeof AssetQuery>;
export type AssetQueryParams = z.input<typeof AssetQuery>;

export const AssetQueryOpenAPI = createOpenAPIParams(AssetQuery, {
  omit: ['shouldFetchPriceChange'],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    asset: 'Token contract address or name',
    symbol: 'Token symbol',
    id: 'Asset ID',
  },
});

const Asset = z.object({
  id: z.number().nullable(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number().nullable(),
  logo: z.string().nullable(),
  rank: z.number().nullable(),
  price: z.number().nullable(),
  market_cap: z.number(),
  market_cap_diluted: z.number(),
  volume: z.number().nullable(),
  volume_change_24h: z.number().nullable(),
  volume_7d: z.number().nullable(),
  liquidity: z.number(),
  liquidityMax: z.number(),
  ath: z.number().nullable(),
  atl: z.number().nullable(),
  off_chain_volume: z.number().nullable(),
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
  native: z
    .object({
      name: z.string(),
      symbol: z.string(),
      address: z.string(),
      type: z.string(),
      decimals: z.number(),
      logo: z.string(),
    })
    .optional(),
  priceNative: z.number().optional(),
});

export const MarketDataResponseSchema = z.object({
  data: Asset,
});

export type MarketDataResponse = z.infer<typeof MarketDataResponseSchema>;

export interface AssetMarketDataOutput {
  id: number | null;
  name: string;
  symbol: string;
  decimals: number | null;
  logo: string | null;
  rank: number | null;
  price: number | null;
  market_cap: number;
  market_cap_diluted: number;
  volume: number;
  volume_change_24h: number | null;
  volume_7d: number | null;
  liquidity: number;
  liquidity_change_24h?: number;
  ath: number | null;
  atl: number | null;
  off_chain_volume: number | null;
  is_listed?: boolean;
  price_change_1h: number;
  price_change_24h: number;
  price_change_7d: number;
  price_change_1m: number;
  price_change_1y: number;
  total_supply: number;
  circulating_supply: number;
  priceNative?: number;
  native?: {
    name: string;
    symbol: string;
    address: string;
    type: 'eth' | 'stable' | 'other' | 'native';
    decimals: number;
    denom?: string;
    logo: string | null;
    id?: number;
  };
  contracts: {
    address: string;
    blockchainId: string;
    blockchain: string;
    decimals: number;
  }[];
}
