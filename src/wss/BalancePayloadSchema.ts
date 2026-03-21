import { z } from 'zod';

const BalanceItemSchema = z.object({
  wallet: z.string(),
  token: z.string(),
  blockchain: z.string(),
});

export const BalancePayloadSchema = z.object({
  items: z.array(BalanceItemSchema),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  tag: z.string().max(50).optional(),
});

export type BalancePayload = z.infer<typeof BalancePayloadSchema>;
export type BalancePayloadType = z.input<typeof BalancePayloadSchema>;
export type BalanceItem = z.infer<typeof BalanceItemSchema>;

export interface WalletBalanceData {
  wallet: string;
  token: string; // Token address or "native"
  chainId: string;
  balance: number; // Decimal-adjusted balance
  rawBalance: string; // Raw balance (no decimal adjustment)
  decimals: number;
  symbol: string;
  name: string;
  logo: string | null;
}

export interface WalletBalanceUpdate extends WalletBalanceData {
  previousBalance?: number; // Previous balance (for delta updates)
  previousRawBalance?: string; // Previous raw balance (for delta updates)
}
