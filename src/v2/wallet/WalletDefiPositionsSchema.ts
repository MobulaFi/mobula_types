import { z } from 'zod';
import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

// ===========================================
// Input Schema
// ===========================================

// Validates both EVM (0x + 40 hex chars = 42) and Solana (32-44 base58 chars) addresses
const walletAddressSchema = z
  .string()
  .min(32, 'Invalid wallet address')
  .max(44, 'Invalid wallet address')
  .or(z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address'));

export const WalletDefiPositionsParamsSchema = z.object({
  wallet: walletAddressSchema.describe('Wallet address (EVM or Solana)'),
  chainIds: z.string().optional().describe('Chain ID to fetch positions from (e.g., "solana:solana", "evm:1")'),
  blockchains: z.string().optional().describe('Blockchain to fetch positions from (e.g., "solana", "ethereum")'),
});

export type WalletDefiPositionsParams = Omit<z.infer<typeof WalletDefiPositionsParamsSchema>, 'blockchains'>;

export const WalletDefiPositionsParamsSchemaOpenAPI = createOpenAPIParams(WalletDefiPositionsParamsSchema, {
  omit: ['blockchains'],
  describe: {
    wallet: 'Wallet address (EVM or Solana)',
    chainIds: 'Chain ID to fetch positions from (e.g., "solana:solana", "evm:1")',
  },
});

// ===========================================
// Output Types
// ===========================================

export type ProtocolCategory =
  | 'lending'
  | 'lp'
  | 'liquid-staking'
  | 'native-staking'
  | 'restaking'
  | 'perps'
  | 'yield'
  | 'cdp'
  | 'streaming';

export type PositionType =
  | 'deposit'
  | 'borrow'
  | 'liquidity'
  | 'stake'
  | 'leverage'
  | 'collateral'
  | 'debt'
  | 'vesting'
  | 'streaming'
  | 'order';

// ===========================================
// Token
// ===========================================

export interface TokenAmount {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  amountRaw: string; // Raw amount
  amountFormatted: number; // Human readable
  priceUSD: number;
  valueUSD: number;
  logoUri?: string;
}

// ===========================================
// Metadata by position type
// ===========================================

export interface LendingMetadata {
  type: 'lending';
  market?: string; // Market name (e.g., "Main Market", "JLP Market")
  healthFactor?: string;
  liquidationThreshold?: string;
  ltv?: string;
  supplyAPY?: string; // Total APY (base + token APY for LSTs)
  baseSupplyAPY?: string; // Base lending APY from protocol
  tokenAPY?: string; // Native staking/yield APY for yield-bearing tokens (LST, JLP, etc.)
  borrowAPY?: string; // Base borrow APY from protocol
  baseBorrowAPY?: string; // Base borrow APY (same as borrowAPY, for consistency with supply)
  utilizationRate?: string;
}

export interface LiquidityMetadata {
  type: 'liquidity';
  poolAddress: string;
  poolName: string;
  poolType: 'amm' | 'clmm' | 'dlmm';
  shareOfPool?: string;
  fee24h?: string;
  apy?: string;
  tickLower?: number;
  tickUpper?: number;
  inRange?: boolean;
}

export interface LiquidStakingMetadata {
  type: 'liquid-staking';
  lstMint: string;
  lstSymbol: string;
  exchangeRate: string;
  apy?: string;
  unstakePending?: string;
}

export interface PerpMetadata {
  type: 'perp';
  // Identification
  id: string;
  marketId: string;
  exchange: 'drift' | 'gains' | 'hyperliquid' | 'gte' | 'lighter';

  // Position
  side: 'BUY' | 'SELL';
  entryPriceQuote: number;
  currentPriceQuote: number;
  currentLeverage: number;
  liquidationPriceQuote: number;

  // Size
  amountUSD: number;
  amountRaw: string; // bigint -> string for JSON serialization

  // PnL
  realizedPnlUSD: number;
  unrealizedPnlUSD: number;
  realizedPnlPercent: number;
  unrealizedPnlPercent: number;

  // Fees
  feesOpeningUSD: number;
  feesClosingUSD: number;
  feesFundingUSD: number;

  // TP/SL
  tp: Array<{ size: string; price: number; id: number }>;
  sl: Array<{ size: string; price: number; id: number }>;

  // Timestamps
  openDate?: string;
  lastUpdate?: string;

  // Chain info
  address: string;
  chainId: string;
  collateralAsset: string;
}

export interface StreamingMetadata {
  type: 'streaming';
  streamType: 'vesting' | 'payment';
  sender?: string;
  recipient?: string;
  startTime: string;
  endTime: string;
  amountPerSecond: string;
  amountClaimed: string;
  amountRemaining: string;
  cliffDate?: string;
}

export interface NativeStakingMetadata {
  type: 'native-staking';
  stakeAccountAddress: string;
  validatorVoteAccount: string;
  validatorName?: string;
  validatorCommission?: number;
  activationState: 'activating' | 'active' | 'deactivating' | 'inactive';
  activationEpoch?: number;
  deactivationEpoch?: number;
  currentEpoch: number;
  apy?: string;
}

export interface RestakingMetadata {
  type: 'restaking';
  strategyAddress: string;
  strategyName: string;
  underlyingToken: string;
  underlyingSymbol: string;
  operatorAddress?: string;
  isDelegated: boolean;
  sharesRaw: string;
}

export type PositionMetadata =
  | LendingMetadata
  | LiquidityMetadata
  | LiquidStakingMetadata
  | NativeStakingMetadata
  | RestakingMetadata
  | PerpMetadata
  | StreamingMetadata;

// ===========================================
// Position
// ===========================================

export interface Position {
  id: string;
  type: PositionType;
  name: string;
  valueUSD: number;
  tokens: TokenAmount[];
  rewards?: TokenAmount[];
  metadata?: PositionMetadata;
  createdAt?: string;
  updatedAt?: string;
}

// ===========================================
// Protocol
// ===========================================

export interface Protocol {
  id: string;
  name: string;
  url: string;
  logo: string;
  category: ProtocolCategory;
}

export interface ProtocolPosition {
  protocol: Protocol;
  totalValueUSD: string;
  positions: Position[];
}

// ===========================================
// API Response
// ===========================================

export interface WalletDefiPositionsData {
  wallet: string;
  fetchedAt: string;
  totalValueUSD: string;
  totalDepositedUSD: string;
  totalBorrowedUSD: string;
  totalRewardsUSD: string;
  protocols: ProtocolPosition[];
}

export interface WalletDefiPositionsResponse {
  data: WalletDefiPositionsData;
}

export interface WalletDefiPositionsErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
