import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

extendZodWithOpenApi(z);

export const MetadataParamsSchema = z
  .object({
    symbol: z.string().optional(),
    id: z.string().optional(),
    asset: z.string().optional(),
    blockchain: z.string().optional(),
    force: z.coerce.boolean().optional().default(false),
    full: z.coerce.boolean().optional().default(true),
  })
  .strict();

export type MetadataParams = z.input<typeof MetadataParamsSchema>;

export const MetadataParamsSchemaOpenAPI = createOpenAPIParams(MetadataParamsSchema, {
  omit: ['force', 'full'],
  describe: {
    symbol: 'Token symbol',
    id: 'Asset ID',
    asset: 'Token contract address',
    blockchain: 'Blockchain name or chain ID',
  },
});

export const MultiMetadataParamsSchema = z
  .object({
    ids: z.string().optional(),
    assets: z.string().optional(),
    blockchains: z.string().optional(),
    symbols: z.string().optional(),
  })
  .strict()
  .transform((data) => {
    return {
      ids: data.ids ? data.ids.split(',') : undefined,
      assets: data.assets ? data.assets.split(',') : undefined,
      blockchains: data.blockchains ? data.blockchains.split(',') : undefined,
      symbols: data.symbols ? data.symbols.split(',') : undefined,
    };
  });

export type MultiMetadataParams = z.input<typeof MultiMetadataParamsSchema>;

export const MultiMetadataParamsSchemaOpenAPI = createOpenAPIParams(MultiMetadataParamsSchema, {
  describe: {
    ids: 'Comma-separated asset IDs',
    assets: 'Comma-separated token contract addresses',
    blockchains: 'Comma-separated blockchain IDs',
    symbols: 'Comma-separated token symbols',
  },
});

export const MetadataResponseSchema = z.object({
  data: z.object({
    id: z.number().nullable(),
    name: z.string(),
    symbol: z.string(),
    rank: z.number().nullable().optional(),
    contracts: z.array(z.string()),
    blockchains: z.array(z.string()),
    decimals: z.array(z.number()),
    twitter: z.string().nullable(),
    website: z.string().nullable(),
    logo: z.string().nullable(),
    price: z.number().nullable(),
    market_cap: z.number(),
    liquidity: z.number(),
    volume: z.number(),
    description: z.string().nullable(),
    kyc: z.string().nullable(),
    audit: z.string().nullable(),
    total_supply_contracts: z.array(z.string()),
    circulating_supply_addresses: z.array(z.string()),
    total_supply: z.number(),
    circulating_supply: z.number(),
    discord: z.string().nullable(),
    max_supply: z.number().nullable(),
    chat: z.string().nullable(),
    tags: z.array(z.string()),
    investors: z.array(
      z.object({
        lead: z.boolean(),
        name: z.string(),
        type: z.string(),
        image: z.string(),
        country_name: z.string(),
        description: z.string(),
      }),
    ),
    distribution: z.array(
      z.object({
        percentage: z.number(),
        name: z.string(),
      }),
    ),
    release_schedule: z.array(
      z.object({
        allocation_details: z.record(z.string(), z.number()),
        tokens_to_unlock: z.number(),
        unlock_date: z.number(),
      }),
    ),
    cexs: z.array(
      z.object({
        logo: z.string().nullable(),
        name: z.string().nullable(),
        id: z.string(),
      }),
    ),
    listed_at: z.coerce.date().nullable(),
    deployer: z.string().nullable(),
    source: z.string().nullable(),
    others: z.record(z.string(), z.unknown()).nullable().optional(),
    dexscreener_listed: z.boolean().nullable().optional(),
    dexscreener_header: z.string().nullable().optional(),
    dexscreener_ad_paid: z.boolean().nullable().optional(),
    live_status: z.string().nullable().optional(),
    live_thumbnail: z.string().nullable().optional(),
    livestream_title: z.string().nullable().optional(),
    live_reply_count: z.number().nullable().optional(),
    telegram: z.string().nullable().optional(),
    twitterRenameCount: z.number().nullable().optional(),
    twitterRenameHistory: z
      .array(
        z.object({
          username: z.string(),
          last_checked: z.string(),
        }),
      )
      .nullable()
      .optional(),
  }),
});

export type MetadataResponse = z.infer<typeof MetadataResponseSchema>;

export const MultiMetadataResponseSchema = z.object({
  data: z.array(MetadataResponseSchema.optional()),
});

export type MultiMetadataResponse = z.infer<typeof MultiMetadataResponseSchema>;
