import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

const SolanaTransactionSchema = z.object({
  serialized: z.string(),
  variant: z.enum(['legacy', 'versioned']),
});

const EVMTransactionSchema = z.object({
  to: z.string(),
  from: z.string(),
  data: z.string(),
  value: z.string(),
  gasLimit: z.string().optional(),
  gasPrice: z.string().optional(),
  maxFeePerGas: z.string().optional(),
  maxPriorityFeePerGas: z.string().optional(),
  nonce: z.number().optional(),
  chainId: z.number(),
  /** Address the user must approve the sell token to (defaults to `to` if not set) */
  approvalAddress: z.string().optional(),
  /** List of token approvals the user must execute before the swap */
  approvals: z.array(z.object({ token: z.string(), spender: z.string() })).optional(),
});

const TokenInfoSchema = z.object({
  address: z.string(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  decimals: z.number(),
  logo: z.string().nullable().optional(),
});

const RouteHopSchema = z.object({
  poolAddress: z.string(),
  tokenIn: TokenInfoSchema,
  tokenOut: TokenInfoSchema,
  amountInTokens: z.string(),
  amountOutTokens: z.string(),
  exchange: z.string().optional(),
  poolType: z.string().optional(),
  feePercentage: z.number().optional(),
  feeBps: z.number().optional(),
});

const RouteDetailsSchema = z.object({
  hops: z.array(RouteHopSchema),
  totalFeePercentage: z.number().optional(),
  aggregator: z.string().optional(),
});

/**
 * Integration fee schema - represents a fee charged by the integrator
 * Fee is taken from native SOL (input or output depending on swap direction)
 */
const IntegrationFeeSchema = z.object({
  /** Fee amount in human-readable format (e.g., "0.01" for 0.01 SOL) */
  amount: z.string(),
  /** Fee percentage applied (0.01 to 99) */
  percentage: z.number(),
  /** Wallet address receiving the fee */
  wallet: z.string(),
  /** Whether fee is deducted from input (SOL→token) or output (token→SOL) */
  deductedFrom: z.enum(['input', 'output']),
});

const BaseDataSchema = z.object({
  amountOutTokens: z.string().optional(),
  slippagePercentage: z.number().optional(),
  amountInUSD: z.number().optional(),
  amountOutUSD: z.number().optional(),
  marketImpactPercentage: z.number().optional(),
  poolFeesPercentage: z.number().optional(),
  tokenIn: TokenInfoSchema.optional(),
  tokenOut: TokenInfoSchema.optional(),
  requestId: z.string(),
  details: z
    .object({
      route: RouteDetailsSchema.optional(),
      aggregator: z.string().optional(),
      raw: z.record(z.unknown()).optional(),
    })
    .optional(),
  /** Integration fee details (if feePercentage and feeWallet were provided) */
  fee: IntegrationFeeSchema.optional(),
});

const DataWithSolanaSchema = BaseDataSchema.extend({
  solana: z.object({
    transaction: SolanaTransactionSchema,
    /** The last block height at which the blockhash used in this transaction is valid */
    lastValidBlockHeight: z.number(),
  }),
  evm: z.null().optional(),
});

const DataWithEVMSchema = BaseDataSchema.extend({
  evm: z.object({
    transaction: EVMTransactionSchema,
  }),
  solana: z.null().optional(),
});

const CandidateSchema = z.object({
  /** Lander ID (e.g., 'jito', 'nozomi', 'zeroslot') */
  lander: z.string(),
  /** Base64-encoded serialized VersionedTransaction (unsigned) */
  serialized: z.string(),
  /** Tip account used for this candidate */
  tipAccount: z.string(),
  /** Tip amount in lamports */
  tipLamports: z.number(),
});

const DataWithCandidatesSchema = BaseDataSchema.extend({
  /** Multi-lander candidate transactions (Solana only) */
  candidates: z.array(CandidateSchema).min(1),
  /** Durable nonce account public key */
  nonceAccount: z.string(),
  /** Nonce authority public key (must co-sign) */
  nonceAuthority: z.string(),
  solana: z.null().optional(),
  evm: z.null().optional(),
});

const DataWithErrorSchema = BaseDataSchema.extend({
  solana: z.null().optional(),
  evm: z.null().optional(),
});

export const SwapQuotingDataSchema = z.union([
  DataWithSolanaSchema,
  DataWithEVMSchema,
  DataWithCandidatesSchema,
  DataWithErrorSchema,
]);

export const SwapQuotingOutputSchema = z.object({
  data: SwapQuotingDataSchema,
  error: z.string().optional(),
});

export type SwapQuotingData = z.infer<typeof SwapQuotingDataSchema>;
export type SwapQuotingResponse = z.infer<typeof SwapQuotingOutputSchema>;
