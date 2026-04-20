import type { MarketDetailsOutputType } from './MarketDetailsOutput.ts';
import type { TokenDetailsOutputType } from './TokenDetailsOutput.ts';
import type { WalletMetadataOutput } from './WalletMetadataOutput.ts';

// Platform metadata structure (id, name, logo)
export interface PlatformMetadataType {
  id: string;
  name: string;
  logo: string;
}

export interface BaseMessageType {
  pair: string;
  date: number;
  token_price: number;
  token_price_vs: number;
  token_amount: number;
  token_amount_vs: number;
  token_amount_usd: number | undefined;
  type: string;
  operation: string;
  blockchain: string;
  hash: string;
  sender: string;

  token_amount_raw: string;
  token_amount_raw_vs: string;
  labels?: string[];
  walletMetadata?: WalletMetadataOutput | null;
  pairData?: MarketDetailsOutputType;
  tokenData?: TokenDetailsOutputType;
  preBalanceBaseToken: string | null;
  preBalanceQuoteToken: string | null;
  postBalanceBaseToken: string | null;
  postBalanceQuoteToken: string | null;
  postBalanceRecipientBaseToken?: string | null;
  platform?: string | null;
  // Full platform metadata (id, name, logo)
  platformMetadata?: PlatformMetadataType | null;
  swapRecipient?: string | null;
}
