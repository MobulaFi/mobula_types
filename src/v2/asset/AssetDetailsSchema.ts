import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';

// Output schema for a single token in the asset
export const AssetTokenDetailsOutput = TokenDetailsOutput;

// Asset-level data from the assets table
export const AssetDataOutput = z.object({
  id: z.number(),
  name: z.string(),
  symbol: z.string(),
  logo: z.string().nullable(),
  description: z.string().nullable(),
  rank: z.number().nullable(),
  nativeChainId: z.string().nullable(),
  priceUSD: z.number().nullable(),
  totalSupply: z.number().default(0),
  circulatingSupply: z.number().default(0),
  marketCapUSD: z.number().default(0),
  marketCapDilutedUSD: z.number().default(0),
  athPriceDate: z.coerce.date().nullable(),
  athPriceUSD: z.number().nullable(),
  atlPriceDate: z.coerce.date().nullable(),
  atlPriceUSD: z.number().nullable(),
  isStablecoin: z.boolean().default(false),
  createdAt: z.coerce.date(),
  listedAt: z.coerce.date().nullable(),
  socials: z
    .object({
      audit: z.string().nullable(),
      github: z.string().nullable(),
      twitter: z.string().nullable(),
      website: z.string().nullable(),
      kyc: z.string().nullable(),
      chat: z.string().nullable(),
      discord: z.string().nullable(),
    })
    .nullable(),
});

export type AssetDataOutputType = z.infer<typeof AssetDataOutput>;

// Full asset details response including tokens
export const AssetDetailsDataOutput = z.object({
  asset: AssetDataOutput,
  tokens: z.array(TokenDetailsOutput.or(z.object({ error: z.string().optional() })).nullable()),
  tokensCount: z.number(),
});

export type AssetDetailsDataOutputType = z.infer<typeof AssetDetailsDataOutput>;

// Query parameters schema
const AssetDetailsParamsSchema = z
  .object({
    // Option 1: asset ID directly
    id: z.coerce.number().optional(),
    // Option 2: address + chainId
    address: z.string().optional(),
    blockchain: z.string().optional(),
    // Limit for tokens (default 10)
    tokensLimit: z.coerce.number().min(1).max(50).default(10),
    instanceTracking: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional()),
  })
  .refine((data) => data.id !== undefined || (data.address !== undefined && data.blockchain !== undefined), {
    message: 'Either id OR (address AND blockchain) must be provided',
  });

const ASSET_DETAILS_HIDDEN = ['instanceTracking'] as const;
type AssetDetailsHiddenFields = (typeof ASSET_DETAILS_HIDDEN)[number];

export type AssetDetailsParams = SDKInput<typeof AssetDetailsParamsSchema, AssetDetailsHiddenFields>;
export type AssetDetailsParsedParams = z.infer<typeof AssetDetailsParamsSchema> & {
  chainId?: string;
};

export const AssetDetailsParamsSchemaOpenAPI = createOpenAPIParams(AssetDetailsParamsSchema, {
  omit: [...ASSET_DETAILS_HIDDEN],
  describe: {
    id: 'Asset ID',
    address: 'Token contract address',
    blockchain: 'Blockchain name or chain ID',
    tokensLimit: 'Maximum number of tokens to return (1-50, default: 10)',
  },
});

// Response schemas
export const AssetDetailsResponseSchema = z.object({
  data: AssetDetailsDataOutput,
  hostname: z.string().optional(),
});

export type AssetDetailsResponse = z.infer<typeof AssetDetailsResponseSchema>;

// Batch item schema (for POST)
const AssetDetailsItemSchema = z.object({
  id: z.coerce.number().optional(),
  address: z.string().optional(),
  blockchain: z.string().optional(),
  tokensLimit: z.coerce.number().min(1).max(50).default(10),
});

// POST request schema - array of items directly
export const AssetDetailsBatchParamsSchema = z
  .array(AssetDetailsItemSchema)
  .min(1, 'At least one asset is required')
  .max(10, 'Maximum 10 assets per request');

export type AssetDetailsBatchParams = z.input<typeof AssetDetailsBatchParamsSchema>;

// Batch response schema
export const AssetDetailsBatchResponseSchema = z.object({
  payload: z.array(AssetDetailsDataOutput.or(z.object({ error: z.string().optional() })).nullable()),
  hostname: z.string().optional(),
});

export type AssetDetailsBatchResponse = z.infer<typeof AssetDetailsBatchResponseSchema>;

export { AssetDetailsParamsSchema };
