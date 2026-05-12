import { z } from 'zod';

/**
 * Swap Quoting Query Schema
 *
 * Amount specification:
 * - Either `amount` OR `amountRaw` must be provided (but not both)
 * - `amount`: Human-readable amount (e.g., "1.5" for 1.5 tokens)
 *   This will be converted to raw amount by multiplying by 10^decimals
 *   Example: For USDC (6 decimals), amount="1.5" becomes 1500000 raw units
 * - `amountRaw`: Raw amount as a string (e.g., "1500000" for 1.5 USDC with 6 decimals)
 *   This is the exact amount that will be used in the swap without conversion
 *   Useful when you already have the raw amount and want to avoid precision loss
 *
 * Decimals explanation:
 * Tokens have a decimals property (typically 18 for ETH, 6 for USDC, 8 for BTC)
 * Raw amount = human-readable amount × 10^decimals
 * Example: 1.5 USDC (6 decimals) = 1.5 × 10^6 = 1500000 raw units
 */
export const SwapQuotingQuerySchema = z
  .object({
    chainId: z.string().optional(),
    blockchain: z.string().optional(),
    tokenIn: z.string().min(1, 'tokenIn is required'),
    tokenOut: z.string().min(1, 'tokenOut is required'),
    /**
     * Human-readable amount (e.g., "1.5" for 1.5 tokens)
     * Will be converted to raw amount by multiplying by 10^decimals
     */
    amount: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const parsed = Number.parseFloat(val);
        if (Number.isNaN(parsed) || parsed <= 0) {
          throw new Error('Amount must be a positive number');
        }
        return parsed;
      }),
    /**
     * Raw amount as a string (e.g., "1500000" for 1.5 USDC with 6 decimals)
     * This is the exact amount that will be used in the swap without conversion
     * Must be a positive integer string
     */
    amountRaw: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        // Validate it's a valid positive integer string
        if (!/^\d+$/.test(val)) {
          throw new Error('amountRaw must be a positive integer string');
        }
        const parsed = BigInt(val);
        if (parsed <= 0n) {
          throw new Error('amountRaw must be a positive integer');
        }
        return parsed;
      }),
    slippage: z
      .string()
      .optional()
      .default('1')
      .transform((val) => {
        const parsed = Number.parseFloat(val);
        if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
          throw new Error('Slippage must be between 0 and 100');
        }
        return parsed;
      }),
    walletAddress: z.string().min(1, 'walletAddress is required'),
    excludedProtocols: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return undefined;

        const values = Array.isArray(val) ? val : val.split(',');
        return values.map((f) => f.trim()).filter((f) => f.length > 0);
      }),
    onlyProtocols: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return undefined;

        // Return raw string values - no mapping, pass directly to aggregator
        const values = Array.isArray(val) ? val : val.split(',');
        return values.map((t) => t.trim()).filter((t) => t.length > 0);
      }),
    poolAddress: z.string().optional(),
    onlyRouters: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const supportedRouters = ['jupiter', 'naos', 'kyberswap', 'lifi'] as const;

        // Handle comma-separated values for array support
        const routers = val
          .split(',')
          .map((r) => r.trim().toLowerCase())
          .filter((r) => r.length > 0);

        // Validate all routers
        for (const router of routers) {
          if (!supportedRouters.includes(router as (typeof supportedRouters)[number])) {
            throw new Error(`Invalid router "${router}". Supported routers: ${supportedRouters.join(', ')}`);
          }
        }

        // Always return array (or undefined if empty)
        if (routers.length === 0) return undefined;
        return routers as Array<(typeof supportedRouters)[number]>;
      }),
    /**
     * Priority fee configuration for Solana transactions.
     * Can be:
     * - 'auto': Automatically estimate priority fee based on network conditions
     * - A number: Exact priority fee in microLamports per compute unit
     * - A preset name: 'low', 'medium', 'high', 'veryHigh'
     *
     * Presets (microLamports per CU):
     * - low: 10,000 (0.01 lamports/CU)
     * - medium: 100,000 (0.1 lamports/CU)
     * - high: 500,000 (0.5 lamports/CU)
     * - veryHigh: 1,000,000 (1 lamport/CU)
     */
    priorityFee: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (val === 'auto') return 'auto' as const;

        const presets = ['low', 'medium', 'high', 'veryHigh'] as const;
        if (presets.includes(val as (typeof presets)[number])) {
          return { preset: val as (typeof presets)[number] };
        }

        const numValue = Number.parseInt(val, 10);
        if (!Number.isNaN(numValue) && numValue > 0) {
          return numValue;
        }

        throw new Error(
          `Invalid priorityFee "${val}". Must be 'auto', a preset (low, medium, high, veryHigh), or a positive number`,
        );
      }),
    /**
     * Compute unit limit for Solana transactions.
     * Can be 'true' for dynamic limit or a specific number.
     * Default: 400,000
     */
    computeUnitLimit: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (val === 'true') return true as const;

        const numValue = Number.parseInt(val, 10);
        if (!Number.isNaN(numValue) && numValue > 0) {
          return numValue;
        }

        throw new Error(`Invalid computeUnitLimit "${val}". Must be 'true' or a positive number`);
      }),
    /**
     * Jito tip amount in lamports for Solana transactions.
     * This adds a SOL transfer instruction to a Jito tip account to prioritize
     * the transaction via Jito's block engine.
     *
     * The tip is sent to one of Jito's official tip accounts and helps ensure
     * faster transaction inclusion.
     *
     * Example: 10000 = 0.00001 SOL tip
     *
     * Note: This is separate from priorityFee (compute unit price).
     * For best results, use both jitoTipLamports and priorityFee together.
     */
    jitoTipLamports: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;

        const numValue = Number.parseInt(val, 10);
        if (!Number.isNaN(numValue) && numValue > 0) {
          return numValue;
        }

        throw new Error(`Invalid jitoTipLamports "${val}". Must be a positive number`);
      }),
    /**
     * Fee percentage to charge on the swap (0 to 99).
     * This is the percentage of the input token amount that will be charged as a fee.
     *
     * On Solana: Fee is always taken from SOL/WSOL (native token).
     * - If tokenIn is SOL/WSOL → fee is deducted from input before swap
     * - If tokenOut is SOL/WSOL → fee is deducted from output after swap
     *
     * Must be used together with feeWallet on Solana.
     */
    feePercentage: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null || val === '') return undefined;

        const numValue = typeof val === 'number' ? val : Number.parseFloat(val);
        if (Number.isNaN(numValue) || numValue < 0 || numValue > 99) {
          throw new Error('feePercentage must be between 0 and 99');
        }

        return numValue;
      }),
    /**
     * Wallet address to receive fees (Solana only).
     * Must be a valid Solana wallet address.
     * Required when feePercentage is set on Solana chains.
     */
    feeWallet: z.string().optional(),
    /**
     * Payer wallet address for Solana transactions (fee abstraction).
     * This wallet will be the fee payer and signer of the transaction.
     * The swap itself uses `walletAddress` for token transfers.
     * If not provided, `walletAddress` is used as the payer.
     * Only supported for Solana chains.
     */
    payerAddress: z.string().optional(),
    /**
     * Enable multi-lander mode (Solana only).
     * When 'true', returns N candidate transactions (one per active lander)
     * using a durable nonce. Only one candidate can land on-chain.
     *
     * Requires the server to have durable nonce accounts provisioned.
     * Ignores jitoTipLamports (tips are auto-generated per lander).
     */
    multiLander: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        if (val === 'true') return true as const;
        if (val === 'false') return undefined;
        throw new Error(`Invalid multiLander "${val}". Must be 'true' or 'false'`);
      }),
    /**
     * Tip amount in lamports for multi-lander mode.
     * Each candidate will tip this amount to its respective lander.
     * Default: use the lander's minimum tip.
     */
    landerTipLamports: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        const numValue = Number.parseInt(val, 10);
        if (!Number.isNaN(numValue) && numValue > 0) {
          return numValue;
        }
        throw new Error(`Invalid landerTipLamports "${val}". Must be a positive number`);
      }),
  })
  .refine(
    (data) => {
      return data.chainId || data.blockchain;
    },
    {
      message: 'chainId is required',
      path: ['chainId'],
    },
  )
  .refine(
    (data) => {
      const hasAmount = data.amount !== undefined;
      const hasAmountRaw = data.amountRaw !== undefined;
      return hasAmount !== hasAmountRaw; // XOR: exactly one must be provided
    },
    {
      message: 'Either amount or amountRaw must be provided (but not both)',
      path: ['amount'],
    },
  );

/** Inferred type from SwapQuotingQuerySchema - includes payerAddress for fee abstraction */
export type SwapQuotingQueryParams = Omit<z.infer<typeof SwapQuotingQuerySchema>, 'blockchain'>;

import { createOpenAPIParams } from '../../utils/functions/openAPIHelpers.ts';

export const SwapQuotingQuerySchemaOpenAPI = createOpenAPIParams(SwapQuotingQuerySchema, {
  omit: ['blockchain'],
  describe: {
    chainId:
      'Mobula chain id. EVM: `evm:<integer>` (e.g. `evm:1`, `evm:8453`, `evm:42161`). Solana: `solana:solana`. TON: `ton:mainnet` or `ton:testnet`.',
    tokenIn:
      'Sell token address. Native sentinels — EVM: `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE` (EIP-7528). Solana: `So11111111111111111111111111111111111111112` (wSOL). TON: `EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c`.',
    tokenOut: 'Buy token address. Same sentinel rules as `tokenIn`.',
    amount:
      'Human-readable amount (e.g. `"1.5"` for 1.5 tokens). Converted server-side: raw = amount × 10^decimals. Mutually exclusive with `amountRaw`.',
    amountRaw:
      'Raw amount as a digit-only string (e.g. `"1500000"` for 1.5 USDC at 6 decimals). Use this when you already have the bigint to avoid float precision loss. Mutually exclusive with `amount`.',
    slippage: 'Slippage tolerance in % (0-100, default 1). Quote rejects if expected output drops below this threshold.',
    walletAddress: 'User wallet address — recipient of `tokenOut`, signer for the broadcast tx, fee context.',
    excludedProtocols: 'DEX-level deny list (CSV). Example: `pump-amm,raydium`.',
    onlyProtocols: 'DEX-level allow list (CSV). Example: `uniswap-v3,uniswap-v4`.',
    poolAddress: 'Pin routing to a single pool (e.g. when you want a specific Uniswap V3 fee tier).',
    onlyRouters:
      'Aggregator filter (CSV) — `jupiter`, `kyberswap`, `lifi`, `naos`. Omit to let the API pick.',
    priorityFee:
      'Solana only. `auto`, `low`, `medium`, `high`, `veryHigh`, or microLamports per CU as a number string.',
    computeUnitLimit: 'Solana only. `true` for dynamic CU limit, or a fixed integer (default 400 000).',
    jitoTipLamports:
      'Solana only. Jito tip in lamports — adds a transfer to one of the Jito tip accounts for fast landing.',
    feePercentage:
      'Caller referral fee in % (0-99). Mobula skims a 20% platform cut off the top. Requires `feeWallet`.',
    feeWallet: 'Wallet that receives the caller referral fee. Required when `feePercentage > 0`.',
    payerAddress:
      'Solana only. Fee abstraction — wallet that signs/pays for the tx (separate from `walletAddress`).',
    multiLander:
      'Solana only. `true` returns N candidate transactions over a durable nonce — race them across landers (Jito, Nozomi, 0slot). Only one commits.',
    landerTipLamports: 'Per-lander tip when `multiLander=true`. Defaults to each lander\'s minimum.',
  },
});
