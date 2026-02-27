import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import { type SecurityFlags, SecurityFlagsSchema } from '../../utils/schemas/SecuritySchemas.ts';

// Token type values defined locally to avoid circular dependency with @mobula/protocol
// Solana: 2020 (SPL Token), 2022 (SPL Token 2022)
// EVM: erc20
// Tron: trc10, trc20
const WalletTokenTypeValues = ['2020', '2022', 'erc20', 'trc10', 'trc20'] as const;
export type WalletTokenType = (typeof WalletTokenTypeValues)[number];
const WalletTokenTypeSchema = z.enum(WalletTokenTypeValues).nullable().optional();

export type CrossChainBalances = Record<
  string,
  {
    balance: number;
    balanceRaw: string;
    chainId?: string;
    address?: string;
  }
>;

export type CrossChainBalanceValues = {
  balance: number;
  balanceRaw: string;
  chainId?: string;
  address?: string;
};

// Security flags for contract balances: extend SecurityFlags with frozen flag
const ContractBalanceSecuritySchema = SecurityFlagsSchema.extend({
  frozen: z.boolean().optional(),
})
  .nullable()
  .optional();

export type ContractBalanceSecurity = (SecurityFlags & { frozen?: boolean }) | null | undefined;

export type ContractBalance = {
  balance: number;
  balanceRaw: string;
  decimals: number;
  address: string;
  chainId: string;
  tokenType?: WalletTokenType;
  security?: ContractBalanceSecurity;
  /** Rent lamports for Solana token accounts (returned when account is closed). Only present for Solana SPL tokens. */
  lamports?: string | null;
  /** SPL token account pubkey (needed for closing token accounts). Only present for Solana SPL tokens. */
  tokenAccount?: string | null;
};

export interface FormattedHolding {
  asset: {
    id: number | null;
    name: string;
    symbol: string;
    logo?: string;
    decimals: bigint[];
    contracts: string[];
    blockchains: string[];
  };
  price: number;
  liquidity: number;
  market_cap: number;
  price_change_24h: number;
  // price_change_1h: number;
  token_balance: number;
  estimated_balance: number;
  cross_chain_balances: CrossChainBalances;
  contracts_balances: ContractBalance[];
  allocation: number;
  wallets: string[];
}

export type FormattedHoldingWithPNL = FormattedHolding & {
  realized_pnl: number;
  unrealized_pnl: number;
  price_bought: number;
  total_invested: number;
  min_buy_price: number;
  max_buy_price: number;
};

export type PortfolioOutput = {
  total_wallet_balance: number;
  wallets: string[];
  total_realized_pnl?: number;
  total_unrealized_pnl?: number;
  total_pnl_history?: {
    '24h': {
      realized: number;
      unrealized: number;
    };
    '7d': {
      realized: number;
      unrealized: number;
    };
    '30d': {
      realized: number;
      unrealized: number;
    };
    '1y': {
      realized: number;
      unrealized: number;
    };
  };
  assets: FormattedHoldingWithPNL[] | FormattedHolding[];
};

export const PortfolioResponseSchema = z.object({
  data: z.object({
    total_wallet_balance: z.number(),
    wallets: z.array(z.string()),
    assets: z.array(
      z.object({
        contracts_balances: z.array(
          z.object({
            address: z.string(),
            balance: z.number(),
            balanceRaw: z.string(),
            chainId: z.string(),
            decimals: z.number(),
            tokenType: WalletTokenTypeSchema,
            security: ContractBalanceSecuritySchema,
            lamports: z.string().nullable().optional(),
            tokenAccount: z.string().nullable().optional(),
          }),
        ),
        cross_chain_balances: z.record(
          z.string(),
          z.object({
            balance: z.number(),
            balanceRaw: z.string(),
            chainId: z.string(),
            address: z.string(),
          }),
        ),
        price_change_24h: z.number(),
        estimated_balance: z.number(),
        price: z.number(),
        liquidity: z.number(),
        token_balance: z.number(),
        allocation: z.number(),
        asset: z.object({
          id: z.number().nullable(),
          name: z.string(),
          symbol: z.string(),
          logo: z.string().nullable().optional(),
          decimals: z.array(z.bigint()),
          contracts: z.array(z.string()),
          blockchains: z.array(z.string()),
        }),
        wallets: z.array(z.string()),
        realized_pnl: z.number().optional(),
        unrealized_pnl: z.number().optional(),
        price_bought: z.number().optional(),
        total_invested: z.number().optional(),
        min_buy_price: z.number().optional(),
        max_buy_price: z.number().optional(),
      }),
    ),
    win_rate: z.number().optional(),
    tokens_distribution: z
      .object({
        '10x+': z.number(),
        '4x - 10x': z.number(),
        '2x - 4x': z.number(),
        '10% - 2x': z.number(),
        '-10% - 10%': z.number(),
        '-50% - -10%': z.number(),
        '-100% - -50%': z.number(),
      })
      .optional(),
    pnl_history: z
      .object({
        '1y': z.array(
          z.tuple([
            z.coerce.date(),
            z.object({
              realized: z.number(),
              unrealized: z.number(),
            }),
          ]),
        ),
        '7d': z.array(
          z.tuple([
            z.coerce.date(),
            z.object({
              realized: z.number(),
              unrealized: z.number(),
            }),
          ]),
        ),
        '24h': z.array(
          z.tuple([
            z.coerce.date(),
            z.object({
              realized: z.number(),
              unrealized: z.number(),
            }),
          ]),
        ),
        '30d': z.array(
          z.tuple([
            z.coerce.date(),
            z.object({
              realized: z.number(),
              unrealized: z.number(),
            }),
          ]),
        ),
      })
      .optional(),
    total_realized_pnl: z.number().optional(),
    total_unrealized_pnl: z.number().optional(),
    total_pnl_history: z
      .object({
        '24h': z.object({
          realized: z.number(),
          unrealized: z.number(),
        }),
        '7d': z.object({
          realized: z.number(),
          unrealized: z.number(),
        }),
        '30d': z.object({
          realized: z.number(),
          unrealized: z.number(),
        }),
        '1y': z.object({
          realized: z.number(),
          unrealized: z.number(),
        }),
      })
      .optional(),
    balances_length: z.number(),
  }),
  backfill_status: z.enum(['processed', 'processing', 'pending']).optional(),
});

export type PortfolioResponse = z.infer<typeof PortfolioResponseSchema>;

export const MultiPortfolioResponseSchema = z.object({
  data: z.array(
    z.object({
      total_wallet_balance: z.number(),
      wallets: z.array(z.string()),
      assets: z.array(
        z.object({
          contracts_balances: z.array(
            z.object({
              address: z.string(),
              balance: z.number(),
              balanceRaw: z.string(),
              chainId: z.string(),
              decimals: z.number(),
              tokenType: WalletTokenTypeSchema,
              security: ContractBalanceSecuritySchema,
              lamports: z.string().nullable().optional(),
              tokenAccount: z.string().nullable().optional(),
            }),
          ),
          cross_chain_balances: z.record(
            z.string(),
            z.object({
              balance: z.number(),
              balanceRaw: z.string(),
              chainId: z.string(),
              address: z.string(),
            }),
          ),
          price_change_24h: z.number(),
          estimated_balance: z.number(),
          price: z.number(),
          liquidity: z.number(),
          token_balance: z.number(),
          allocation: z.number(),
          asset: z.object({
            id: z.number().nullable(),
            name: z.string(),
            symbol: z.string(),
            logo: z.string().nullable().optional(),
            decimals: z.array(z.bigint()),
            contracts: z.array(z.string()),
            blockchains: z.array(z.string()),
          }),
          wallets: z.array(z.string()),
          realized_pnl: z.number().optional(),
          unrealized_pnl: z.number().optional(),
          price_bought: z.number().optional(),
          total_invested: z.number().optional(),
          min_buy_price: z.number().optional(),
          max_buy_price: z.number().optional(),
        }),
      ),
      win_rate: z.number().optional(),
      tokens_distribution: z
        .object({
          '10x+': z.number(),
          '4x - 10x': z.number(),
          '2x - 4x': z.number(),
          '10% - 2x': z.number(),
          '-10% - 10%': z.number(),
          '-50% - -10%': z.number(),
          '-100% - -50%': z.number(),
        })
        .optional(),
      pnl_history: z
        .object({
          '1y': z.array(
            z.tuple([
              z.coerce.date(),
              z.object({
                realized: z.number(),
                unrealized: z.number(),
              }),
            ]),
          ),
          '7d': z.array(
            z.tuple([
              z.coerce.date(),
              z.object({
                realized: z.number(),
                unrealized: z.number(),
              }),
            ]),
          ),
          '24h': z.array(
            z.tuple([
              z.coerce.date(),
              z.object({
                realized: z.number(),
                unrealized: z.number(),
              }),
            ]),
          ),
          '30d': z.array(
            z.tuple([
              z.coerce.date(),
              z.object({
                realized: z.number(),
                unrealized: z.number(),
              }),
            ]),
          ),
        })
        .optional(),
      total_realized_pnl: z.number().optional(),
      total_unrealized_pnl: z.number().optional(),
      total_pnl_history: z
        .object({
          '24h': z.object({
            realized: z.number(),
            unrealized: z.number(),
          }),
          '7d': z.object({
            realized: z.number(),
            unrealized: z.number(),
          }),
          '30d': z.object({
            realized: z.number(),
            unrealized: z.number(),
          }),
          '1y': z.object({
            realized: z.number(),
            unrealized: z.number(),
          }),
        })
        .optional(),
      balances_length: z.number(),
    }),
  ),
  backfill_status: z.enum(['processed', 'processing', 'pending']).optional(),
});

export type MultiPortfolioResponse = z.infer<typeof MultiPortfolioResponseSchema>;

export const PositionSchema = z.array(
  z.object({
    type: z.string(),
    name: z.string(),
    chain_id: z.string(),
    contract: z.string(),
    created_at: z.string().nullable(),
    tokens: z.array(
      z.object({
        name: z.string(),
        symbol: z.string(),
        contract: z.string(),
        amount: z.string(),
        amountRaw: z.string(),
        decimals: z.string(),
        amount_usd: z.string(),
        logo: z.string().nullable(),
        price_usd: z.string().nullable(),
      }),
    ),
    rewards: z
      .array(
        z.object({
          name: z.string(),
          symbol: z.string(),
          contract: z.string(),
          amount: z.string(),
          amountRaw: z.string(),
          decimals: z.string(),
          amount_usd: z.string(),
          price_usd: z.string(),
        }),
      )
      .optional(),
    extra: z
      .object({
        lp_token_amount: z.string().optional(),
        position_staked_amount: z.string().optional(),
        factory: z.string().optional(),
        share_of_pool: z.string().optional(),
        type: z.enum(['supply', 'borrow']).optional(),
        health_factor: z.number().optional(),
        reserve0: z.string().optional(),
        reserve1: z.string().optional(),
        reserve_usd: z.number().optional(),
      })
      .optional(),
  }),
);

export type PositionOutputType = z.infer<typeof PositionSchema>;

export const DefiPositionsResponseSchema = z.object({
  data: z.array(
    z.object({
      protocol: z.object({
        name: z.string(),
        id: z.string(),
        logo: z.string(),
        url: z.string(),
      }),
      positions: PositionSchema,
    }),
  ),
  wallets: z.array(z.string()),
});
// Export TypeScript type from the schema
export type DefiPositionsResponse = z.infer<typeof DefiPositionsResponseSchema>;

export interface DefiRewardFormat {
  name: string;
  symbol: string;
  decimals: string;
  contract: string;
  logo: string | null;
  amountRaw: string;
  amount: string;
  priceUSD: string | null;
  amountUSD: string;
}

export interface LPToken {
  rawBalance: string;
  formattedBalance: number;
  assetId: number | null;
  chainId: string;
  address: string;
  decimals: number;
  name: string;
  symbol: string; // Add more symbols as needed
}

export interface ProtocolMetadata {
  name: string;
  id: string;
  url: string;
  logo: string;
}

export const PortfolioParamsSchema = z.object({
  wallet: z.string().optional(),
  wallets: z.string().optional(),
  portfolio: z.string().optional(),
  blockchains: z.string().optional(),
  asset: z.string().optional(),
  cache: z.string().optional(),
  stale: z.string().optional(),
  recheck_contract: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  portfolio_settings: z.string().optional(),
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
  fetchEmptyBalances: z.string().optional(),
  pnl: z.string().optional(),
});

export type PortfolioParams = z.input<typeof PortfolioParamsSchema>;

export const PortfolioParamsSchemaOpenAPI = createOpenAPIParams(PortfolioParamsSchema, {
  omit: [
    'cache',
    'stale',
    'recheck_contract',
    'backfillTransfers',
    'fetchUntrackedHistory',
    'fetchAllChains',
    'shouldFetchPriceChange',
    'fetchEmptyBalances',
  ],
  describe: {
    wallet: 'Wallet address',
    wallets: 'Comma-separated wallet addresses',
    portfolio: 'Portfolio ID',
    blockchains: 'Comma-separated blockchain IDs',
    asset: 'Filter by specific asset',
    from: 'Start date',
    to: 'End date',
    portfolio_settings: 'Portfolio display settings',
    unlistedAssets: 'Include unlisted assets',
    period: 'Time period',
    accuracy: 'Data accuracy level',
    testnet: 'Include testnet data',
    minliq: 'Minimum liquidity threshold',
    filterSpam: 'Filter spam tokens',
    pnl: 'Include PnL data',
  },
});

export const PortfolioDefiParamsSchema = z.object({
  wallet: z.string().optional(),
  wallets: z.string().optional(),
  blockchains: z.string().optional(),
  testnet: z.string().optional(),
  unlistedAssets: z.string().optional(),
});

export type PortfolioDefiParams = z.input<typeof PortfolioDefiParamsSchema>;

export const PortfolioDefiParamsSchemaOpenAPI = createOpenAPIParams(PortfolioDefiParamsSchema, {
  omit: ['testnet'],
  describe: {
    wallet: 'Wallet address',
    wallets: 'Comma-separated wallet addresses',
    blockchains: 'Comma-separated blockchain IDs',
    unlistedAssets: 'Include unlisted assets',
  },
});

export type WalletUnsafeParams = {
  wallet?: string;
  wallets?: string;
  portfolio?: string;
  blockchains?: string;
  asset?: string;
  pnl?: boolean | string;
  cache?: boolean | string;
  stale?: number | string;
  recheck_contract?: boolean | string;
  from?: string;
  to?: string;
  portfolio_settings?: string;
  unlistedAssets?: boolean | string;
  period?: string;
  accuracy?: string;
  testnet?: boolean | string;
  minliq?: number | string;
  filterSpam?: boolean | string;
  shouldFetchPriceChange?: boolean | string;
  fetchUntrackedHistory?: boolean | string;
  fetchAllChains?: boolean | string;
  backfillTransfers?: boolean | string;
  fetchEmptyBalances?: boolean | string;
};
