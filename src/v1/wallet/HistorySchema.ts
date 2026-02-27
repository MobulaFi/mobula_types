import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

export const WalletHistoryParamsSchema = z.object({
  wallet: z.string().optional(),
  wallets: z.string().optional(),
  blockchains: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  unlistedAssets: z.string().optional(),
  period: z.string().optional(),
  accuracy: z.string().optional(),
  testnet: z.string().optional(),
  minliq: z.string().optional(),
  filterSpam: z.string().optional(),
  fetchUntrackedHistory: z.string().optional(),
  fetchAllChains: z.string().optional(),
  shouldFetchPriceChange: z.string().optional(),
  backfillTransfers: z.string().optional(),
});

export type WalletHistoryParams = z.input<typeof WalletHistoryParamsSchema>;

export const WalletHistoryParamsSchemaOpenAPI = createOpenAPIParams(WalletHistoryParamsSchema, {
  omit: ['backfillTransfers', 'fetchUntrackedHistory', 'fetchAllChains', 'shouldFetchPriceChange'],
  describe: {
    wallet: 'Wallet address',
    wallets: 'Comma-separated wallet addresses',
    blockchains: 'Comma-separated blockchain IDs',
    from: 'Start date',
    to: 'End date',
    unlistedAssets: 'Include unlisted assets',
    period: 'Time period for history',
    accuracy: 'Data accuracy level',
    testnet: 'Include testnet data',
    minliq: 'Minimum liquidity threshold',
    filterSpam: 'Filter spam tokens',
  },
});

export const WalletHistoryResponseSchema = z.object({
  data: z.object({
    wallets: z.array(z.string()),
    balance_usd: z.number(),
    balance_history: z.array(z.tuple([z.number(), z.number()])),
    backfill_status: z.enum(['processed', 'processing', 'pending']).optional(),
  }),
});

export type WalletHistoryResponse = z.infer<typeof WalletHistoryResponseSchema>;
