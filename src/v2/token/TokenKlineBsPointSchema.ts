import { z } from 'zod';
import { type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import normalizePeriod from '../../utils/functions/period.ts';
import DateQuery from '../../utils/schemas/DateQuery.ts';
import { stringOrArray } from '../../utils/schemas/StringOrArray.ts';

export const TokenKlineBsPointParamsSchema = z.object({
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  address: z.string(),
  bar: z.string().transform((val) => normalizePeriod(val ?? '5m', '5m')),
  fromDate: DateQuery.transform((val) => val ?? undefined),
  toDate: DateQuery.transform((val) => val ?? undefined),
  transactionSenderAddresses: stringOrArray.default([]),
  labels: stringOrArray
    .optional()
    .transform((val) => val?.map((label) => String(label).trim()).filter((label) => label.length > 0) ?? []),
});

export type TokenKlineBsPointParams = SDKInput<typeof TokenKlineBsPointParamsSchema, 'blockchain'>;
export type TokenKlineBsPointInferType = z.infer<typeof TokenKlineBsPointParamsSchema>;

export const TokenKlineBsBubblePoint = z.object({
  volumeBuyToken: z.string(), // total base token bought in the bucket
  buys: z.string(), // number of buy trades
  avgBuyPriceUSD: z.string(), // average buy price (buyValue / buyAmount), "0" if no buys
  volumeBuy: z.string(), // total USD value of buys

  volumeSellToken: z.string(), // total base token sold in the bucket
  sells: z.string(), // number of sell trades
  avgSellPriceUSD: z.string(), // average sell price (sellValue / sellAmount), "0" if no sells
  volumeSell: z.string(), // total USD value of sells

  fromAddress: z.string(), // address-level bubble => wallet address; tag-only bubble => empty string
  fromAddressTag: z.string(), // main tag for this bubble, e.g. "following", "dev"

  time: z.string(), // bucket start time in ms (string)
});

export const TokenKlineBsPointResponseSchema = z.object({
  data: z.array(TokenKlineBsBubblePoint),
});

export type TokenKlineBsPointResponse = z.infer<typeof TokenKlineBsPointResponseSchema>;
