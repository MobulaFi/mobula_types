import { z } from 'zod';
import { TokenDetailsOutput } from './TokenDetailsOutput.ts';
import { WalletMetadataOutput } from './WalletMetadataOutput.ts';

export const FundingInfoSchema = z.object({
  from: z.string().nullable(),
  date: z.coerce.date().nullable(),
  chainId: z.string().nullable(),
  txHash: z.string().nullable(),
  amount: z.string().nullable(),
  formattedAmount: z.number().nullable(),
  currency: z
    .object({
      name: z.string(),
      symbol: z.string(),
      logo: z.string().nullable(),
      decimals: z.number(),
      address: z.string(),
    })
    .nullable(),
  fromWalletLogo: z.string().nullable(),
  fromWalletTag: z.string().nullable(),
  fromWalletMetadata: WalletMetadataOutput.nullable().optional(),
});

export type FundingInfo = z.infer<typeof FundingInfoSchema>;

// Wallet-level metadata (funding info, global labels from scraping_wallets)
export const WalletMetadataSchema = z.object({
  fundingInfo: FundingInfoSchema.nullable().default(null),
  // Entity from scraping_wallets (e.g., "binance", "raydium")
  entity: z.string().nullable().default(null),
  // Multiple labels possible per wallet (e.g., ["LP", "CEX"])
  labels: z.array(z.string()).default([]),
});

export type WalletMetadata = z.infer<typeof WalletMetadataSchema>;

export const tokenPositionSchema = z.object({
  token: TokenDetailsOutput,
  balance: z.number(),
  rawBalance: z.string(),
  amountUSD: z.number(),
  buys: z.number(),
  sells: z.number(),
  volumeBuyToken: z.number(),
  volumeSellToken: z.number(),
  volumeBuy: z.number(),
  volumeSell: z.number(),
  avgBuyPriceUSD: z.number(),
  avgSellPriceUSD: z.number(),
  realizedPnlUSD: z.number(),
  unrealizedPnlUSD: z.number(),
  totalPnlUSD: z.number(),
  /** Total fees paid on this position (gas + platform + mev fees) */
  totalFeesPaidUSD: z.number().default(0),
  /** Fees paid on buy trades only */
  buyFeesPaidUSD: z.number().default(0),
  /** Fees paid on sell trades only */
  sellFeesPaidUSD: z.number().default(0),
  firstDate: z.coerce.date().nullable(),
  lastDate: z.coerce.date().nullable(),
  // Token-specific labels (bundler, sniper, insider, etc.)
  labels: z.array(z.string()).nullable().default([]),
});

export const walletDeployerOutputSchema = z.object({
  data: z.array(tokenPositionSchema),
  pagination: z
    .object({
      total: z.number(),
      page: z.number(),
      offset: z.number(),
      limit: z.number(),
    })
    .nullable(),
  // Wallet-level metadata (funding info, global labels)
  wallet: WalletMetadataSchema.optional(),
});

export const WalletDeployerQuery = z.object({
  wallet: z.string(),
  blockchain: z.string(),
  page: z
    .string()
    .default('1')
    .transform((val) => {
      const parsed = Number.parseInt(val, 10);
      return parsed > 0 ? parsed : 1;
    }),

  limit: z
    .string()
    .default('20')
    .transform((val) => {
      const parsed = Number.parseInt(val, 10);
      return parsed > 0 ? parsed : 20;
    }),
});
