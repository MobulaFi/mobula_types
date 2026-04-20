import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { TokenTradeOutput } from '../token/TokenTradesSchema.ts';

export const WalletTradesV2ParamsSchema = z.object({
  wallet: z.string(),
  wallets: z.string().optional(),
  tokenAddress: z.string().optional(),
  chainIds: z
    .string()
    .optional()
    .transform((val) => {
      if (val) {
        return val
          .split(',')
          .map((b) => b.trim())
          .filter((b) => b.length > 0);
      }
      return [];
    }),
  blockchains: z
    .string()
    .optional()
    .transform((val) => {
      if (val) {
        return val
          .split(',')
          .map((b) => b.trim())
          .filter((b) => b.length > 0);
      }
      return [];
    }),

  // Pagination (offset-based, same as activity/positions)
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),

  // Sorting
  order: z.enum(['asc', 'desc']).optional().default('desc'),

  // Date filters (timestamps in milliseconds)
  from: z.coerce.number().optional(),
  to: z.coerce.number().optional(),
});

export type WalletTradesV2Params = SDKInput<typeof WalletTradesV2ParamsSchema, 'wallets' | 'blockchains'>;
export type WalletTradesV2InferType = z.infer<typeof WalletTradesV2ParamsSchema>;

export const WalletTradesV2ParamsSchemaOpenAPI = createOpenAPIParams(WalletTradesV2ParamsSchema, {
  omit: ['wallets', 'blockchains'],
  describe: {
    wallet: 'Wallet address',
    tokenAddress: 'Filter trades involving this token contract address',
    chainIds: 'Comma-separated list of chain IDs (e.g., "evm:1,evm:8453,solana:solana"). If omitted, all chains.',
    limit: 'Number of trades per page (1-100, default: 50)',
    offset: 'Offset for pagination (default: 0)',
    order: 'Sort order: asc or desc (default: desc)',
    from: 'Start timestamp in milliseconds',
    to: 'End timestamp in milliseconds',
  },
});

export const WalletTradesV2PaginationSchema = z.object({
  page: z.number(),
  offset: z.number(),
  limit: z.number(),
  pageEntries: z.number(),
});

export const WalletTradesV2ResponseSchema = z.object({
  data: z.array(TokenTradeOutput),
  pagination: WalletTradesV2PaginationSchema,
});

export type WalletTradesV2Response = z.infer<typeof WalletTradesV2ResponseSchema>;
