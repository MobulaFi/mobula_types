import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// ---------------------------------------------------------------------------
// Per-chain transaction sub-schemas
// ---------------------------------------------------------------------------

/**
 * Solana transaction returned in `data.solana.transaction`. The wire
 * format is a base64-encoded `VersionedTransaction` (or legacy
 * `Transaction`) — deserialise with `VersionedTransaction.deserialize`
 * on the client, sign, and POST to `/api/2/swap/send`.
 */
const SolanaTransactionSchema = z
  .object({
    serialized: z.string().openapi({
      description: 'Base64-encoded serialized Solana transaction (typically a VersionedTransaction).',
      example: 'AQABAuObQ8Adqk1eqZxRMJg4r6vGtXq9k0...base64...',
    }),
    variant: z.enum(['legacy', 'versioned']).openapi({
      description: 'Transaction variant — almost always `versioned` in production.',
      example: 'versioned',
    }),
  })
  .openapi('SolanaTransaction');

/**
 * EVM transaction shape — fed to MobulaRouter on the target chain. The
 * client may need to execute pre-flight ERC-20 `approve()` calls (see
 * the `approvals[]` field) before sending the swap.
 */
const EVMTransactionSchema = z
  .object({
    to: z.string().openapi({
      description: 'Target contract — always MobulaRouter on the chain.',
      example: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    }),
    from: z.string().openapi({
      description: 'Echo of the input `walletAddress`.',
      example: '0xUSER…',
    }),
    data: z.string().openapi({
      description: 'ABI-encoded calldata for MobulaRouter — pass through verbatim.',
      example: '0x4585e33b…',
    }),
    value: z.string().openapi({
      description: 'Native token to attach, in wei. Equals `amountIn` for native-in swaps, else `0`.',
      example: '100000000000000000',
    }),
    gasLimit: z
      .string()
      .optional()
      .openapi({ description: 'Suggested gas limit (wallet may simulate to refine).', example: '350000' }),
    gasPrice: z
      .string()
      .optional()
      .openapi({ description: 'Legacy gas price in wei (chains without EIP-1559).', example: '5000000000' }),
    maxFeePerGas: z
      .string()
      .optional()
      .openapi({ description: 'EIP-1559 max fee per gas in wei.', example: '20000000000' }),
    maxPriorityFeePerGas: z
      .string()
      .optional()
      .openapi({ description: 'EIP-1559 priority fee in wei.', example: '1500000000' }),
    nonce: z.number().optional().openapi({ description: 'Optional nonce — wallet picks if omitted.' }),
    chainId: z.number().openapi({
      description: 'EIP-155 chain id, matches the integer suffix of the request `chainId` param.',
      example: 8453,
    }),
    /** Address the user must approve the sell token to (defaults to `to` if not set) */
    approvalAddress: z.string().optional().openapi({
      description: 'Address to grant the ERC-20 allowance to. Defaults to `to` (MobulaRouter).',
      example: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    }),
    /** List of token approvals the user must execute before the swap */
    approvals: z
      .array(
        z
          .object({
            token: z.string(),
            spender: z.string(),
          })
          .openapi('EVMApproval'),
      )
      .optional()
      .openapi({
        description: 'Pre-flight ERC-20 approvals to execute before the swap. Empty/absent means no approval needed.',
      }),
  })
  .openapi('EVMTransaction');

/**
 * One TON internal-message slot, ready to be packed into a v4r2 wallet's
 * `external_in_message` envelope. The wallet's `op=0 sendMsg` handler
 * loops through up to 4 such pairs `(sendMode:uint8, ^msgRelaxed)` per
 * signature — TON's atomic "all-or-none" multi-send.
 *
 * `body` and `stateInit` are base64-encoded BoC cells (single-cell BoC
 * each). `value` is in nanoTon as a digit-only string to keep the
 * `bigint` payload safe across JSON.
 */
const TonInternalMessageSchema = z
  .object({
    to: z.string().openapi({
      description: 'Recipient. Friendly `EQ…`/`UQ…` form preferred, raw `0:hex` accepted.',
      example: 'EQBL58cH_GfHhfdopPfcAW59dJmQPiZG-qokeJmL3V4cioTX',
    }),
    value: z.string().openapi({
      description: 'Amount to attach in nanoTon (digit-only string, bigint-safe). 1 TON = 10^9 nanoTon.',
      example: '299700000',
    }),
    body: z.string().openapi({
      description: 'Inner message body BoC, base64. Empty string for plain transfers.',
      example: 'te6cckECBQEAAS4AAUWIAY9DQE...base64...',
    }),
    bounce: z.boolean().openapi({
      description: '`true` for jetton transfers (refund on failure). `false` only for trusted receive-only wallets.',
      example: true,
    }),
    stateInit: z.string().optional().openapi({
      description: 'Optional StateInit BoC base64 — set on first deploy of a recipient jetton wallet.',
    }),
    validUntilSeconds: z.number().int().positive().optional().openapi({
      description: 'Optional TonConnect-style ttl hint (seconds). Backend does not enforce.',
      example: 600,
    }),
  })
  .openapi('TonInternalMessage');

/**
 * TON's calldata block. Mirrors the `solana` / `evm` slots — `transaction`
 * stays for back-compat with clients that only ship a single
 * outgoing-message; modern clients should iterate `transactions[]` to
 * include the Mobula 0.1% protocol fee + optional caller referral fee
 * (max 4 messages per v4r2 wallet signature).
 *
 * `fees` is a pre-computed receipt block — same role as `fee` on the
 * base data, but split per Mobula vs referral so receipts can show
 * "X TON in → Y to Mobula → Z to your wallet → swap with the rest"
 * without re-running the math.
 */
const TonCalldataSchema = z
  .object({
    transaction: TonInternalMessageSchema.openapi({
      description: 'Primary swap message (back-compat). Always equal to `transactions[0]`.',
    }),
    transactions: z.array(TonInternalMessageSchema).min(1).max(4).openapi({
      description:
        'Full message envelope. `[0]` = swap, `[1]` = Mobula 0.1% protocol fee, `[2]` = caller referral fee. v4r2 wallet contract supports up to 4 per signature. TonConnect wallets accept this verbatim as `messages: []`.',
    }),
    fees: z
      .object({
        mobulaFeeAmount: z.string().openapi({
          description: "Mobula's slice (always-on protocol fee + 20% cut of the referral). nanoTon string.",
          example: '30000',
        }),
        referralFeeAmount: z.string().openapi({
          description: "Caller's net fee (referral total − Mobula's cut). 0 when no referral. nanoTon string.",
          example: '200000',
        }),
        swapAmount: z.string().openapi({
          description:
            'What enters the swap after both fees are deducted. `mobulaFeeAmount + referralFeeAmount + swapAmount = amountIn`. nanoTon string.',
          example: '49770000',
        }),
        mobulaFeeBps: z.number().int().nonnegative().openapi({
          description: 'Mobula protocol fee in basis points. Always 10 (= 0.1%) in production.',
          example: 10,
        }),
        userFeeBps: z.number().int().nonnegative().openapi({
          description: 'Caller-set referral fee in bps (`feePercentage × 100`). 0 when unset.',
          example: 50,
        }),
        platformCutBps: z.number().int().nonnegative().openapi({
          description: "Mobula's percentage cut of the referral, in bps. Always 2000 (= 20%) in production.",
          example: 2000,
        }),
      })
      .openapi('TonFeeBreakdown'),
  })
  .openapi('TonCalldata');

// ---------------------------------------------------------------------------
// Common sub-schemas
// ---------------------------------------------------------------------------

const TokenInfoSchema = z
  .object({
    address: z.string().openapi({
      description: 'Token contract address (chain-specific format).',
      example: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    }),
    name: z.string().optional().openapi({ example: 'USD Coin' }),
    symbol: z.string().optional().openapi({ example: 'USDC' }),
    decimals: z.number().openapi({ example: 6 }),
    logo: z.string().nullable().optional().openapi({
      description: 'Logo URL (null when unavailable).',
      example: 'https://metadata.mobula.io/assets/logos/evm_8453_0x8335…',
    }),
  })
  .openapi('TokenInfo');

const RouteHopSchema = z
  .object({
    poolAddress: z.string().openapi({ description: 'Pool / pair address used for this hop.' }),
    tokenIn: TokenInfoSchema,
    tokenOut: TokenInfoSchema,
    amountInTokens: z.string().openapi({ description: 'Hop input amount, human-readable.', example: '1.0' }),
    amountOutTokens: z.string().openapi({ description: 'Hop output amount, human-readable.', example: '245.1' }),
    exchange: z
      .string()
      .optional()
      .openapi({ description: 'DEX name (e.g. `Uniswap V3`, `Raydium`, `DeDust`).', example: 'Raydium' }),
    poolType: z
      .string()
      .optional()
      .openapi({ description: 'Pool type within the DEX (e.g. `CLMM`, `v3`, `VOLATILE`).', example: 'CLMM' }),
    feePercentage: z.number().optional().openapi({ description: 'Hop LP fee in %.', example: 0.25 }),
    feeBps: z.number().optional().openapi({ description: 'Hop LP fee in basis points.', example: 25 }),
  })
  .openapi('RouteHop');

const RouteDetailsSchema = z
  .object({
    hops: z.array(RouteHopSchema).openapi({ description: 'Ordered list of pools used (multi-hop).' }),
    totalFeePercentage: z
      .number()
      .optional()
      .openapi({ description: 'Sum of LP fees across the route, in %.', example: 0.25 }),
    aggregator: z.string().optional().openapi({ description: 'Aggregator that picked the route.', example: 'jupiter' }),
  })
  .openapi('RouteDetails');

/**
 * Integration fee schema — represents a fee charged by the integrator.
 * Fee is taken from the chain's native token (input side for buys,
 * output side for sells — the API picks per chain).
 */
const IntegrationFeeSchema = z
  .object({
    amount: z.string().openapi({ description: 'Fee amount in human-readable format.', example: '0.001' }),
    percentage: z.number().openapi({ description: 'Fee percentage applied (0.01 to 99).', example: 0.5 }),
    wallet: z.string().openapi({ description: 'Wallet address receiving the fee.', example: '0xCALLER…' }),
    deductedFrom: z.enum(['input', 'output']).openapi({
      description: '`input` for native-in swaps, `output` for native-out swaps.',
      example: 'input',
    }),
  })
  .openapi('IntegrationFee');

const BaseDataSchema = z.object({
  amountOutTokens: z
    .string()
    .optional()
    .openapi({ description: 'Estimated output, human-readable.', example: '245.123' }),
  slippagePercentage: z
    .number()
    .optional()
    .openapi({ description: 'Echo of the request `slippage` param.', example: 1 }),
  amountInUSD: z.number().optional().openapi({ description: 'Input value in USD at quote time.', example: 200.45 }),
  amountOutUSD: z.number().optional().openapi({ description: 'Output value in USD at quote time.', example: 199.87 }),
  marketImpactPercentage: z
    .number()
    .optional()
    .openapi({ description: 'Estimated price impact at this trade size.', example: 0.04 }),
  poolFeesPercentage: z
    .number()
    .optional()
    .openapi({ description: 'Sum of LP fees paid across the route, in %.', example: 0.25 }),
  tokenIn: TokenInfoSchema.optional(),
  tokenOut: TokenInfoSchema.optional(),
  requestId: z.string().openapi({ description: 'Unique per quote — pass to support / analytics.' }),
  details: z
    .object({
      route: RouteDetailsSchema.optional(),
      aggregator: z.string().optional(),
      raw: z.record(z.unknown()).optional().openapi({
        description: 'Aggregator-specific raw payload (provided for debugging — schema may vary).',
      }),
    })
    .optional()
    .openapi('SwapDetails'),
  fee: IntegrationFeeSchema.optional().openapi({
    description: 'Echoed when `feePercentage` and `feeWallet` were provided in the request.',
  }),
});

// ---------------------------------------------------------------------------
// Discriminated `data` variants
// ---------------------------------------------------------------------------

const DataWithSolanaSchema = BaseDataSchema.extend({
  solana: z
    .object({
      transaction: SolanaTransactionSchema,
      lastValidBlockHeight: z.number().openapi({
        description: 'Blockhash expiry — broadcast before the chain ticks past this slot.',
        example: 269450123,
      }),
    })
    .openapi('SolanaCalldata'),
  evm: z.null().optional(),
  ton: z.null().optional(),
}).openapi('SwapQuoteSolana');

const DataWithEVMSchema = BaseDataSchema.extend({
  evm: z
    .object({
      transaction: EVMTransactionSchema,
    })
    .openapi('EVMCalldata'),
  solana: z.null().optional(),
  ton: z.null().optional(),
}).openapi('SwapQuoteEVM');

/**
 * TON variant — same envelope shape as Solana / EVM. Carries every
 * field `BaseDataSchema` exposes (`amountOutTokens`, `details.route`,
 * `tokenIn`/`tokenOut`, `fee`, …) so receipts and analytics work
 * uniformly across chains. See the `/spot/execution/ton-quoting` doc
 * page for the end-to-end flow.
 */
const DataWithTonSchema = BaseDataSchema.extend({
  ton: TonCalldataSchema,
  solana: z.null().optional(),
  evm: z.null().optional(),
}).openapi('SwapQuoteTON');

const CandidateSchema = z
  .object({
    lander: z.string().openapi({
      description: 'Lander id — `jito`, `nozomi`, `zeroslot`, …',
      example: 'jito',
    }),
    serialized: z.string().openapi({
      description: 'Base64-encoded serialized VersionedTransaction (unsigned).',
    }),
    tipAccount: z.string().openapi({
      description: 'Tip account used for this candidate.',
      example: 'Cw8C…',
    }),
    tipLamports: z.number().openapi({
      description: 'Tip amount in lamports.',
      example: 1000,
    }),
  })
  .openapi('SwapQuoteCandidate');

const DataWithCandidatesSchema = BaseDataSchema.extend({
  candidates: z.array(CandidateSchema).min(1).openapi({
    description:
      'Multi-lander candidate transactions (Solana only). Sign every candidate, broadcast all of them in batch — only one will land.',
  }),
  nonceAccount: z.string().openapi({ description: 'Durable nonce account public key.' }),
  nonceAuthority: z.string().openapi({ description: 'Nonce authority public key (must co-sign).' }),
  solana: z.null().optional(),
  evm: z.null().optional(),
  ton: z.null().optional(),
}).openapi('SwapQuoteSolanaMultiLander');

const DataWithErrorSchema = BaseDataSchema.extend({
  solana: z.null().optional(),
  evm: z.null().optional(),
  ton: z.null().optional(),
}).openapi('SwapQuoteError');

export const SwapQuotingDataSchema = z
  .union([DataWithSolanaSchema, DataWithEVMSchema, DataWithTonSchema, DataWithCandidatesSchema, DataWithErrorSchema])
  .openapi('SwapQuotingData');

export const SwapQuotingOutputSchema = z
  .object({
    data: SwapQuotingDataSchema,
    error: z.string().optional().openapi({
      description:
        'Set on routing failures (no route, slippage too tight, upstream timeout). The `data` block still carries `requestId` for support.',
    }),
  })
  .openapi('SwapQuotingResponse');

export type SwapQuotingData = z.infer<typeof SwapQuotingDataSchema>;
export type SwapQuotingResponse = z.infer<typeof SwapQuotingOutputSchema>;
