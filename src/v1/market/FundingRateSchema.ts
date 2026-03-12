import { z } from 'zod';

export const FundingRateParamsSchema = z.object({
  symbol: z.string(),
  quote: z.string().optional(),
  exchange: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9,-]+$/.test(val),
      'Exchange must be a comma-separated string (e.g., "binance,bybit")',
    ),
  protocol: z.enum(['xyz', 'flx', 'vntl', 'hyna', 'km', 'cash']).optional(),
});

export type FundingRateParams = z.input<typeof FundingRateParamsSchema>;

export const FundingRateResponseSchema = z.object({
  binanceFundingRate: z
    .object({
      symbol: z.string(),
      fundingTime: z.number(),
      fundingRate: z.number(),
      marketPrice: z.string(),
      epochDurationMs: z.number(),
    })
    .optional(),
  deribitFundingRate: z
    .object({
      symbol: z.string(),
      fundingTime: z.number(),
      fundingRate: z.number(),
      marketPrice: z.number(),
      epochDurationMs: z.number(),
    })
    .optional(),
  bybitFundingRate: z
    .object({
      symbol: z.string(),
      fundingTime: z.number(),
      fundingRate: z.number(),
      epochDurationMs: z.number(),
    })
    .optional(),
  okxFundingRate: z
    .object({
      symbol: z.string(),
      fundingTime: z.number(),
      fundingRate: z.number(),
      epochDurationMs: z.number(),
    })
    .optional(),
  hyperliquidFundingRate: z
    .union([
      // Single funding rate object
      z.object({
        symbol: z.string(),
        fundingTime: z.number(),
        fundingRate: z.number(),
        epochDurationMs: z.number(),
      }),

      // Or an array of them
      z.array(
        z.object({
          symbol: z.string(),
          fundingTime: z.number(),
          fundingRate: z.number(),
          marketPrice: z.number().nullable().optional(),
          epochDurationMs: z.number(),
        }),
      ),
    ])
    .optional(),
  gateFundingRate: z
    .object({
      symbol: z.string(),
      fundingTime: z.number(),
      fundingRate: z.number(),
      epochDurationMs: z.number(),
    })
    .optional(),
  /**
   * Lighter funding rate.
   * Sign convention: positive = longs pay shorts, negative = shorts pay longs.
   * Epoch duration: 1 hour (3600000ms).
   */
  lighterFundingRate: z
    .object({
      symbol: z.string(),
      fundingTime: z.number(),
      fundingRate: z.number(),
      epochDurationMs: z.number(),
    })
    .optional(),
  queryDetails: z.object({
    base: z.string(),
    quote: z.string().nullable(),
  }),
});

export type FundingRateResponse = z.infer<typeof FundingRateResponseSchema>;
