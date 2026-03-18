import { z } from 'zod';
import { Tags } from '../../utils/constants/constants.ts';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';
import { stringOrArray } from '../../utils/schemas/StringOrArray.ts';
import { WalletMetadataOutput } from '../../utils/schemas/WalletMetadataOutput.ts';
import { PlatformMetadataSchema } from '../wallet/WalletAnalysisQuerySchema.ts';

export const TokenPositionsParamsSchema = z.object({
  blockchain: z.string().optional(),
  address: z.string().optional(),
  force: z.coerce.boolean().optional().default(false),
  label: z.nativeEnum(Tags).optional(),
  limit: z.coerce.number().optional().default(100),
  offset: z.coerce.number().optional().default(0),
  walletAddresses: stringOrArray.optional(),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z.coerce.boolean().optional().default(true),
  /** Include fees in response (total_fees_paid_usd from wallet_positions_recipients) */
  includeFees: z.coerce.boolean().optional().default(false),
});

export type TokenPositionsParams = z.input<typeof TokenPositionsParamsSchema>;

export const TokenPositionsParamsSchemaOpenAPI = createOpenAPIParams(TokenPositionsParamsSchema, {
  omit: ['force'],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    address: 'Token contract address',
    label: 'Filter by wallet label (e.g. sniper, bundler, insider)',
    limit: 'Maximum number of results (default: 100)',
    offset: 'Offset for pagination',
    walletAddresses: 'Comma-separated wallet addresses to filter',
    useSwapRecipient: 'Use swap recipient mode for accurate Account Abstraction tracking',
    includeFees: 'Include total fees paid (gas + platform + MEV) and deduct from PnL',
  },
});

export const TokenPositionOutput = z.object({
  chainId: z.string(),
  walletAddress: z.string(),
  tokenAddress: z.string(),
  tokenAmount: z.string(),
  tokenAmountRaw: z.string(),
  tokenAmountUSD: z.string(),
  percentageOfTotalSupply: z.string(),
  pnlUSD: z.string(),
  realizedPnlUSD: z.string(),
  unrealizedPnlUSD: z.string(),
  totalPnlUSD: z.string(),
  /** Total fees paid on this position (gas + platform + mev fees) - only present when includeFees is enabled */
  totalFeesPaidUSD: z.string().optional(),
  buys: z.number(),
  sells: z.number(),
  volumeBuyToken: z.string(),
  volumeSellToken: z.string(),
  volumeBuyUSD: z.string(),
  volumeSellUSD: z.string(),
  avgBuyPriceUSD: z.string(),
  avgSellPriceUSD: z.string(),
  walletFundAt: z.coerce.date().nullable(),
  lastActivityAt: z.coerce.date().nullable(),
  firstTradeAt: z.coerce.date().nullable(),
  lastTradeAt: z.coerce.date().nullable(),
  // Labels (sniper, bundler, insider, dev, proTrader, smartTrader, freshTrader)
  labels: z.array(z.string()).nullable().optional().default([]),
  // Wallet metadata from scraping_wallets (entity info)
  walletMetadata: WalletMetadataOutput.nullable().optional(),
  // Platform used by this wallet (e.g., Axiom, Photon) or DEX for LPs (e.g., Raydium, Orca)
  platform: PlatformMetadataSchema.nullable().optional(),
  fundingInfo: z.object({
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
  }),
});

export const TokenPositionsResponseSchema = z.object({
  data: z.array(TokenPositionOutput),
  totalCount: z.number(),
});

export type TokenPositionsResponse = z.infer<typeof TokenPositionsResponseSchema>;

export type TokenPositionsOutputResponse = z.infer<typeof TokenPositionOutput>;
