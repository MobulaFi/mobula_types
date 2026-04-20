import { z } from 'zod';
import { PlatformMetadataOutput } from '../../utils/schemas/PlatformMetadataOutput.ts';
import { TokenTradeType, TradeOperation } from '../../v2/token/TokenTradesSchema.ts';

const allowedFields = ['date', 'amount_usd', 'token_in_amount', 'token_out_amount'] as const;

const allowedFieldsToNewFormat: Record<(typeof allowedFields)[number], (typeof allowedFieldsNewFormat)[number]> = {
  date: 'date',
  amount_usd: 'volumeUSD',
  token_in_amount: 'amount0',
  token_out_amount: 'amount1',
};

const allowedFieldsNewFormat = ['date', 'volumeUSD', 'amount0', 'amount1'] as const;

const allowedFieldsEnum = z.enum(allowedFields);
const allowedFieldsNewFormatEnum = z.enum(allowedFieldsNewFormat);
type AllowedFieldsType = z.infer<typeof allowedFieldsEnum>;
type NewFormatAllowFieldsType = z.infer<typeof allowedFieldsNewFormatEnum>;

const getNewFormatField = (input: AllowedFieldsType): NewFormatAllowFieldsType => {
  return allowedFieldsToNewFormat[input];
};

export const MarketTradesPairParamsSchema = z.object({
  blockchain: z.string().optional(),
  asset: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  address: z.string().optional(),
  symbol: z.string().optional(),
  limit: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  sortBy: z
    .string()
    .optional()
    .transform((val) => {
      if (val) {
        return getNewFormatField(allowedFieldsEnum.parse(val));
      }
      return 'date';
    }),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  offset: z.coerce.number().default(0),
  mode: z
    .enum(['pair', 'pool', 'asset'])
    .default('pair')
    .transform((val) => (val === 'pool' ? 'pair' : val) as 'pair' | 'asset'),
  transactionSenderAddress: z.string().optional(),
});

export type MarketTradesPairParams = z.input<typeof MarketTradesPairParamsSchema>;

export const MarketTradesPairResponseSchema = z.object({
  data: z.array(
    z.object({
      blockchain: z.string(),
      hash: z.string(),
      pair: z.string(),
      date: z.number(),
      token_price_vs: z.number(),
      token_price: z.number(),
      token_amount: z.number(),
      token_amount_vs: z.number(),
      token_amount_usd: z.number(),
      type: TokenTradeType,
      sender: z.string().nullable(),
      transaction_sender_address: z.string().nullable(),
      token_amount_raw: z.string(),
      token_amount_raw_vs: z.string(),
      operation: TradeOperation,
      // Platform where the trade was executed (e.g. Photon, BullX, Maestro, etc.)
      platform: PlatformMetadataOutput.nullable().optional(),
      // Fees breakdown
      totalFeesUSD: z.number().nullable().optional(),
      gasFeesUSD: z.number().nullable().optional(),
      platformFeesUSD: z.number().nullable().optional(),
      mevFeesUSD: z.number().nullable().optional(),
    }),
  ),
});

export type MarketTradesPairResponse = z.infer<typeof MarketTradesPairResponseSchema>;
