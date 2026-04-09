import { z } from 'zod';

export const PositionPayloadSchema = z.object({
  wallet: z.string(),
  token: z.string(),
  blockchain: z.string(),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Include fees in PnL calculation (deduct total_fees_paid_usd from PnL) */
  includeFees: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  tag: z.string().max(50).optional(),
});

export type PositionPayloadType = z.infer<typeof PositionPayloadSchema>;

export const PositionsPayloadSchema = z.object({
  wallet: z.string(),
  blockchain: z.string(),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Include fees in PnL calculation (deduct total_fees_paid_usd from PnL) */
  includeFees: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  /** Use swap recipient mode (query wallet_positions_recipients table instead of wallet_positions) */
  useSwapRecipient: z
    .union([z.boolean(), z.string()])
    .default(true)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  tag: z.string().max(50).optional(),
});

export type PositionsPayload = z.infer<typeof PositionsPayloadSchema>;
export type PositionsPayloadType = z.input<typeof PositionsPayloadSchema>;

export interface WalletPositionData {
  wallet: string;
  token: string;
  chainId: string;
  balance: number;
  rawBalance: string;
  amountUSD: number;
  buys: number;
  sells: number;
  volumeBuyToken: number;
  volumeSellToken: number;
  volumeBuy: number;
  volumeSell: number;
  avgBuyPriceUSD: number;
  avgSellPriceUSD: number;
  realizedPnlUSD: number;
  unrealizedPnlUSD: number;
  totalPnlUSD: number;
  /** Total fees paid on this position (gas + platform + mev fees) */
  totalFeesPaidUSD: number;
  /** Fees paid on buy trades only */
  buyFeesPaidUSD: number;
  /** Fees paid on sell trades only */
  sellFeesPaidUSD: number;
  firstDate: Date | null;
  lastDate: Date | null;
  tokenDetails?: {
    address: string;
    chainId: string;
    name: string;
    symbol: string;
    decimals: number;
    logo: string | null;
    price: number;
    priceChange24h: number | null;
    liquidity: number | null;
    marketCap: number | null;
  };
}

export interface WalletPositionsData {
  wallet: string;
  chainId: string;
  positions: WalletPositionData[];
}
