import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

export const WalletNFTParamsSchema = z.object({
  wallet: z.string().min(1),
  blockchains: z.string().optional(),
  page: z.string().optional().default('1'),
  offset: z.string().optional().default('0'),
  limit: z.string().optional().default('100'),
  pagination: z.string().optional().default('false'),
});

export type WalletNFTParams = z.input<typeof WalletNFTParamsSchema>;

export const WalletNFTParamsSchemaOpenAPI = createOpenAPIParams(WalletNFTParamsSchema, {
  omit: ['pagination'],
  describe: {
    wallet: 'Wallet address',
    blockchains: 'Comma-separated blockchain IDs',
    page: 'Page number (default: 1)',
    offset: 'Offset for pagination',
    limit: 'Maximum number of results (default: 100)',
  },
});
export const WalletNFTResponseSchema = z.object({
  data: z.array(
    z.object({
      token_address: z.string(),
      token_id: z.string(),
      token_uri: z.string(),
      amount: z.string(),
      owner_of: z.string(),
      name: z.string(),
      symbol: z.string(),
      blockchain: z.string(),
      chain_id: z.string(),
    }),
  ),
  pagination: z
    .object({
      total: z.number(),
      page: z.number(),
      offset: z.number(),
      limit: z.number(),
    })
    .nullable(),
});

export type WalletNFTResponse = z.infer<typeof WalletNFTResponseSchema>;

export const NFTMetadataParamsSchema = z.object({
  address: z.string(),
  blockchain: z.string(),
});

export type NFTMetadataParams = z.input<typeof NFTMetadataParamsSchema>;

export const NFTMetadataResponseSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  address: z.string(),
  chain_id: z.string(),
  logo: z.string(),
  website: z.string(),
  telegram: z.string(),
  twitter: z.string(),
  discord: z.string(),
  totalSupply: z.bigint(),
  URI: z.string(),
});

export type NFTMetadataResponse = z.infer<typeof NFTMetadataResponseSchema>;
