import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

export const WalletTransactionsParamsSchema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  page: z.string().optional(),
  order: z.string().optional(),
  cache: z.string().optional(),
  stale: z.string().optional(),
  wallet: z.string().optional(),
  wallets: z.string().optional(),
  recheckContract: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  asset: z.string().optional(),
  trades: z.string().optional(),
  transactions: z.string().optional(),
  blockchains: z.string().optional(),
  unlistedAssets: z.string().optional(),
  onlyAssets: z.string().optional(),
  pagination: z.string().optional(),
  filterSpam: z.string().optional(),
});

export type WalletTransactionsParams = z.input<typeof WalletTransactionsParamsSchema>;

export const WalletTransactionsParamsSchemaOpenAPI = createOpenAPIParams(WalletTransactionsParamsSchema, {
  omit: ['cache', 'stale', 'recheckContract', 'trades', 'transactions', 'onlyAssets'],
  describe: {
    wallet: 'Wallet address',
    wallets: 'Comma-separated wallet addresses',
    blockchains: 'Comma-separated blockchain IDs',
    from: 'Start timestamp',
    to: 'End timestamp',
    asset: 'Filter by asset address',
    limit: 'Number of results per page',
    offset: 'Offset for pagination',
    page: 'Page number',
    order: 'Sort order (asc/desc)',
    unlistedAssets: 'Include unlisted assets',
    pagination: 'Enable pagination details',
    filterSpam: 'Filter spam transactions',
  },
});

export const WalletRawTransactionsParamsSchemaOpenAPI = createOpenAPIParams(
  z.object({
    limit: z.string().optional(),
    offset: z.string().optional(),
    page: z.string().optional(),
    order: z.string().optional(),
    wallet: z.string().optional(),
    wallets: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    blockchains: z.string().optional(),
    pagination: z.string().optional(),
  }),
  {
    describe: {
      wallet: 'Wallet address',
      wallets: 'Comma-separated wallet addresses',
      blockchains: 'Comma-separated blockchain IDs',
      from: 'Start timestamp',
      to: 'End timestamp',
      limit: 'Number of results per page',
      offset: 'Offset for pagination',
      page: 'Page number',
      order: 'Sort order (asc/desc)',
      pagination: 'Enable pagination details',
    },
  },
);

export const WalletRawTransactionsParamsSchema = z
  .object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined)),
    offset: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined)),
    page: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined)),
    order: z.string().optional(), // Remains string
    cache: z
      .string()
      .optional()
      .transform((val) => val === 'true'), // Convert to boolean
    stale: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined)),
    wallet: z.string().optional(), // Remains string
    wallets: z.string().optional(), // Remains string
    from: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined)),
    to: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : undefined)),
    blockchains: z.string().optional(), // Remains string
    pagination: z
      .string()
      .optional()
      .transform((val) => val === 'true'), // Convert to boolean
  })
  .strict();

export type WalletRawTransactionsParams = z.input<typeof WalletRawTransactionsParamsSchema>;

export const WalletTransactionsResponseSchema = z.object({
  data: z.object({
    transactions: z.array(
      z.object({
        id: z.string(),
        timestamp: z.number(),
        from: z.string().nullable(),
        to: z.string().nullable(),
        contract: z.string().nullable(),
        hash: z.string(),
        amount_usd: z.number(),
        amount: z.number(),
        block_number: z.number(),
        type: z.string(),
        blockchain: z.string(),
        tx_cost: z.number(),
        transaction: z.object({
          hash: z.string(),
          chainId: z.string(),
          fees: z.string(),
          feesUSD: z.number(),
          date: z.coerce.date(),
        }),
        asset: z.object({
          id: z.number().nullable(),
          name: z.string(),
          symbol: z.string(),
          decimals: z.number(),
          totalSupply: z.number(),
          circulatingSupply: z.number(),
          price: z.number(),
          liquidity: z.number(),
          priceChange24hPercent: z.number(),
          marketCapUSD: z.number(),
          logo: z.string().nullable(),
          nativeChainId: z.string().nullable(),
          contract: z.string().nullable(),
        }),
      }),
    ),
    wallets: z.array(z.string()),
  }),
  details: z.null(),
  pagination: z
    .object({
      total: z.number(),
      page: z.number(),
      offset: z.number(),
      limit: z.number(),
    })
    .nullable(),
});

export type WalletTransactionsResponse = z.infer<typeof WalletTransactionsResponseSchema>;

const RawTransactionSchema = z.object({
  id: z.bigint(),
  timestamp: z.number(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  contract: z.string().nullable(),
  hash: z.string(),
  amount_usd: z.number(),
  amount: z.number(),
  block_number: z.number(),
  type: z.string(),
  blockchain: z.string(),
  tx_cost: z.number(),
  transaction: z.object({
    hash: z.string(),
    chainId: z.string(),
    fees: z.string(),
    feesUSD: z.number(),
    date: z.coerce.date(),
  }),
  asset: z.object({
    id: z.number().nullable(),
    name: z.string(),
    symbol: z.string(),
    totalSupply: z.number(),
    circulatingSupply: z.number(),
    price: z.number(),
    liquidity: z.number(),
    priceChange24hPercent: z.number(),
    marketCapUSD: z.number(),
    logo: z.string().nullable(),
    nativeChainId: z.string().nullable(),
    contract: z.string().nullable(),
  }),
});

const UnifiedTransactionSchema = z.object({
  chain_id: z.string(),
  hash: z.string().default(''),
  method: z.string().optional(),
  from: z.string().default(''),
  to: z.string().default(''),
  native_amount: z.string().default('0'),
  name: z.string().default('Unknown'),
  logo: z.string().optional(),
  amount: z.string().default('0'),
  token: z.string().default(''),
  symbol: z.string().optional(),
  timestamp: z.string().default(''),
  block_number: z.number().optional(),
  txn_fees: z.string().default('0'),
  status: z.boolean(),
});

export const WalletRawTransactionsResponseSchema = z.object({
  raw: z.array(RawTransactionSchema),
  unified: z.array(UnifiedTransactionSchema),
  wallets: z.string().array(),
  pagination: z
    .object({
      total: z.number(),
      page: z.number(),
      offset: z.number(),
      limit: z.number(),
    })
    .nullable(),
});

export type WalletRawTransactionsResponse = z.infer<typeof WalletRawTransactionsResponseSchema>;
export type RawTransactionOutputType = z.infer<typeof RawTransactionSchema>;

const RawNFTTransactionSchema = z.object({
  combined_id: z.string(),
  combined_date: z.coerce.date().transform((d) => d.toISOString()),
  contract_address: z.string().nullable(),
  from_address: z.string().nullable(),
  to_address: z.string().nullable(),
  chain_id: z.string(),
  token_id: z.string().nullable(),
  fees: z.string().nullable(),
  fees_usd: z.number().nullable(), // Add from raw data, number type
  block_height: z.number().nullable(),
  transaction_hash: z.string(),
  raw_type: z.enum(['sell', 'buy']),
});

const UnifiedNFTTransactionSchema = z.object({
  chain_id: z.string(),
  hash: z.string(),
  method: z.string().optional(),
  from: z.string(),
  to: z.string(),
  amount: z.string().optional(),
  token: z.string(),
  symbol: z.string().optional(),
  tokenId: z.string().nullable(),
  timestamp: z.coerce.date().transform((d) => d.toISOString()),
  block_number: z.number().nullable(),
  txn_fees: z.string().nullable(),
  status: z.boolean(),
});

export const WalletNFTTransactionsResponseSchema = z
  .object({
    raw: z.array(RawNFTTransactionSchema),
    unified: z.array(UnifiedNFTTransactionSchema),
    wallets: z.string().array(),
    pagination: z
      .object({
        total: z.number(),
        page: z.number(),
        offset: z.number(),
        limit: z.number(),
      })
      .nullable(),
  })
  .strict();

export type WalletNFTTransactionsResponse = z.infer<typeof WalletNFTTransactionsResponseSchema>;
