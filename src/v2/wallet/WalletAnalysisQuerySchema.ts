import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { WalletMetadataOutput } from '../../utils/schemas/WalletMetadataOutput.ts';

// Platform metadata schema (similar to factories_metadata)
export const PlatformMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
});

export type PlatformMetadata = z.infer<typeof PlatformMetadataSchema>;

// Zod schema for wallet analysis query parameters
export const WalletAnalysisParamsSchema = z
  .object({
    wallet: z.string().min(1, 'Wallet address is required'),
    blockchain: z.string().optional(),
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
    period: z
      .string()
      .optional()
      .transform((val) => val?.toLowerCase())
      .refine((val) => !val || ['1d', '7d', '30d', '90d'].includes(val), {
        message: 'Period must be one of: 1d, 7d, 30d, 90d',
      }),
    // Custom timeframe parameters (alternative to period)
    from: z.coerce.number().optional(), // Unix timestamp in milliseconds
    to: z.coerce.number().optional(), // Unix timestamp in milliseconds
  })
  .transform((data) => {
    // Default to '7d' period if neither period nor from/to is provided
    if (!data.period && (data.from === undefined || data.to === undefined)) {
      return { ...data, period: '7d' };
    }
    return data;
  })
  .refine(
    (data) => {
      // If from/to provided, validate the range
      if (data.from !== undefined && data.to !== undefined) {
        return data.to > data.from;
      }
      return true;
    },
    {
      message: 'to must be greater than from',
    },
  );

/** Fields accepted at runtime but hidden from SDK types and OpenAPI spec */
const WALLET_ANALYSIS_HIDDEN = ['blockchain'] as const;
type WalletAnalysisHiddenFields = (typeof WALLET_ANALYSIS_HIDDEN)[number];

export type WalletAnalysisParams = SDKInput<typeof WalletAnalysisParamsSchema, WalletAnalysisHiddenFields>;

export const WalletAnalysisParamsSchemaOpenAPI = createOpenAPIParams(WalletAnalysisParamsSchema, {
  omit: [...WALLET_ANALYSIS_HIDDEN],
  describe: {
    wallet: 'Wallet address to analyze',
    blockchains:
      'Comma-separated list of blockchain IDs (e.g., "ethereum,base,solana:solana"). If omitted, all chains.',
    period: 'Analysis period: 1d, 7d, 30d, or 90d (default: 7d)',
    from: 'Start timestamp in milliseconds (alternative to period)',
    to: 'End timestamp in milliseconds (alternative to period)',
  },
});

// Calendar breakdown entry schema (day-by-day breakdown)
export const CalendarDayBreakdownSchema = z.object({
  date: z.coerce.date(),
  // Volume metrics
  volumeBuy: z.number(),
  volumeSell: z.number(),
  totalVolume: z.number(),
  // Trade counts
  buys: z.number(),
  sells: z.number(),
  // PnL metrics
  realizedPnlUSD: z.number(),
});

export type CalendarDayBreakdown = z.infer<typeof CalendarDayBreakdownSchema>;

// Zod schema for wallet analysis response
export const WalletAnalysisResponseSchema = z.object({
  data: z.object({
    winRateDistribution: z.object({
      '>500%': z.number(),
      '200%-500%': z.number(),
      '50%-200%': z.number(),
      '0%-50%': z.number(),
      '-50%-0%': z.number(),
      '<-50%': z.number(),
    }),
    marketCapDistribution: z.object({
      '>1000M': z.number(),
      '>100M': z.number(),
      '10M-100M': z.number(),
      '1M-10M': z.number(),
      '100k-1M': z.number(),
      '<100k': z.number(),
    }),
    periodTimeframes: z.array(
      z.object({
        date: z.coerce.date(),
        realized: z.number(),
      }),
    ),
    // Calendar breakdown: day-by-day volume and PnL
    calendarBreakdown: z.array(CalendarDayBreakdownSchema),
    stat: z.object({
      totalValue: z.number(),
      periodTotalPnlUSD: z.number(),
      periodRealizedPnlUSD: z.number(),
      periodRealizedRate: z.number(),
      periodActiveTokensCount: z.number(),
      periodWinCount: z.number(),
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
        fromWalletMetadata: WalletMetadataOutput.nullable().optional(),
      }),
      periodVolumeBuy: z.number(),
      periodVolumeSell: z.number(),
      periodBuys: z.number(),
      periodSells: z.number(),
      nativeBalance: z
        .object({
          rawBalance: z.string(),
          formattedBalance: z.number(),
          assetId: z.number().nullable(),
          chainId: z.string(),
          address: z.string(),
          decimals: z.number(),
          name: z.string(),
          symbol: z.string(),
          logo: z.string().nullable(),
          price: z.number(),
          balanceUSD: z.number(),
        })
        .nullable(),
      periodBuyTokens: z.number(),
      periodSellTokens: z.number(),
      periodTradingTokens: z.number(),
      holdingTokensCount: z.number(),
      holdingDuration: z.number(),
      tradingTimeFrames: z.number(),
      winRealizedPnl: z.number(),
      winRealizedPnlRate: z.number(),
      winToken: z
        .object({
          address: z.string(),
          chainId: z.string(),
          name: z.string(),
          symbol: z.string(),
          logo: z.string().nullable(),
          decimals: z.number(),
        })
        .nullable(),
    }),
    labels: z.array(z.string()),
    // Wallet metadata from scraping_wallets (entity info)
    walletMetadata: WalletMetadataOutput.nullable(),
    // Platform used by the wallet with full metadata (logo, name)
    platform: PlatformMetadataSchema.nullable(),
  }),
});

export type WalletAnalysisResponse = z.infer<typeof WalletAnalysisResponseSchema>;

// OpenAPI-compatible calendar breakdown schema
export const CalendarDayBreakdownSchemaOpenAPI = z.object({
  date: z.string(),
  volumeBuy: z.number(),
  volumeSell: z.number(),
  totalVolume: z.number(),
  buys: z.number(),
  sells: z.number(),
  realizedPnlUSD: z.number(),
});

// OpenAPI-compatible schema (dates as strings for OpenAPI spec generation)
export const WalletAnalysisResponseSchemaOpenAPI = z.object({
  data: z.object({
    winRateDistribution: z.object({
      '>500%': z.number(),
      '200%-500%': z.number(),
      '50%-200%': z.number(),
      '0%-50%': z.number(),
      '-50%-0%': z.number(),
      '<-50%': z.number(),
    }),
    marketCapDistribution: z.object({
      '>1000M': z.number(),
      '>100M': z.number(),
      '10M-100M': z.number(),
      '1M-10M': z.number(),
      '100k-1M': z.number(),
      '<100k': z.number(),
    }),
    periodTimeframes: z.array(
      z.object({
        date: z.string(),
        realized: z.number(),
      }),
    ),
    calendarBreakdown: z.array(CalendarDayBreakdownSchemaOpenAPI),
    stat: z.object({
      totalValue: z.number(),
      periodTotalPnlUSD: z.number(),
      periodRealizedPnlUSD: z.number(),
      periodRealizedRate: z.number(),
      periodActiveTokensCount: z.number(),
      periodWinCount: z.number(),
      fundingInfo: z.object({
        from: z.string().nullable(),
        date: z.string().nullable(),
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
      }),
      periodVolumeBuy: z.number(),
      periodVolumeSell: z.number(),
      periodBuys: z.number(),
      periodSells: z.number(),
      nativeBalance: z
        .object({
          rawBalance: z.string(),
          formattedBalance: z.number(),
          assetId: z.number().nullable(),
          chainId: z.string(),
          address: z.string(),
          decimals: z.number(),
          name: z.string(),
          symbol: z.string(),
          logo: z.string().nullable(),
          price: z.number(),
          balanceUSD: z.number(),
        })
        .nullable(),
      periodBuyTokens: z.number(),
      periodSellTokens: z.number(),
      periodTradingTokens: z.number(),
      holdingTokensCount: z.number(),
      holdingDuration: z.number(),
      tradingTimeFrames: z.number(),
      winRealizedPnl: z.number(),
      winRealizedPnlRate: z.number(),
      winToken: z
        .object({
          address: z.string(),
          chainId: z.string(),
          name: z.string(),
          symbol: z.string(),
          logo: z.string().nullable(),
          decimals: z.number(),
        })
        .nullable(),
    }),
    labels: z.array(z.string()),
    // Wallet metadata from scraping_wallets (entity info)
    walletMetadata: WalletMetadataOutput.nullable(),
    // Platform used by the wallet with full metadata
    platform: z
      .object({
        id: z.string(),
        name: z.string(),
        logo: z.string().nullable(),
      })
      .nullable(),
  }),
});
