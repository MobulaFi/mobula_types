import { z } from 'zod';

export const FastTradesPayloadSchema = z.object({
  assetMode: z.coerce.boolean().default(false),
  traderMode: z.coerce.boolean().default(false),
  items: z.array(
    z.object({
      address: z.string(),
      blockchain: z.string(),
    }),
  ),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  maxUpdatesPerMinute: z.coerce.number().optional(),
});

export type FastTradesPayloadType = z.input<typeof FastTradesPayloadSchema>;

export interface BaseFastTrade {
  date: number;
  tokenPrice: number;
  tokenPriceVs: number;
  tokenAmount: number;
  tokenAmountVs: number;
  tokenAmountUsd: number;
  tokenNativePrice: number;
  tokenMarketCapUSD: number;
  type: 'buy' | 'sell';
  operation: 'regular' | 'liquidity' | 'arbitrage' | string;
  blockchain: string;
  hash: string;
  sender: string;
  tokenAmountRaw: string;
  tokenAmountRawVs: string;
  preBalanceBaseToken: string | null;
  preBalanceQuoteToken: string | null;
  postBalanceBaseToken: string | null;
  postBalanceQuoteToken: string | null;
  subscriptionId: string;
  timestamp: number;
  labels?: string[];
  platform?: string | null;
  swapRecipient?: string | null;
  // Fees breakdown
  totalFeesUSD?: number | null;
  gasFeesUSD?: number | null;
  platformFeesUSD?: number | null;
  mevFeesUSD?: number | null;
}

export interface PairFastTrade extends BaseFastTrade {
  pair: string;
  token?: never;
}

export interface TokenFastTrade extends BaseFastTrade {
  token: string;
  pair?: never;
}

export interface TraderFastTrade extends BaseFastTrade {
  trader: string;
  pair: string;
  token: string;
}

export type WssFastTradesResponseType = PairFastTrade | TokenFastTrade | TraderFastTrade;
