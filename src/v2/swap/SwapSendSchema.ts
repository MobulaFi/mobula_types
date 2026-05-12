import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

/**
 * Base64 → Buffer transform for any signed-transaction wire payload.
 * Accepts the same shape across chains:
 *   - Solana: signed `VersionedTransaction` / `Transaction` bytes,
 *     base64-encoded.
 *   - EVM: raw signed RLP, base64-encoded.
 *   - TON: signed `external_in_message` BoC, base64-encoded. The
 *     server pipes it to toncenter `/message` verbatim — there's no
 *     re-encoding step. Built client-side by hashing the v4r2 signing
 *     cell, signing the 32-byte hash with Ed25519 (Privy
 *     `signMessage` / TonConnect / mnemonic), prepending the 64-byte
 *     signature to the body, and BoC-encoding the whole external.
 *
 * The chainId field is what discriminates dispatch on the server side:
 *   - `solana:solana`        → Solana RPC `sendTransaction`
 *   - `evm:1`, `evm:8453`, … → ethers `provider.broadcastTransaction`
 *   - `ton:mainnet`          → toncenter `/message`
 */
const base64ToBuffer = z
  .string()
  .min(1, 'signedTransaction is required')
  .transform((val) => {
    try {
      return Buffer.from(val, 'base64');
    } catch {
      throw new Error('signedTransaction must be a valid base64 string');
    }
  })
  .openapi({
    description:
      'Base64 of the signed payload. Solana: signed `VersionedTransaction`/`Transaction` bytes. EVM: raw signed RLP. TON: signed `external_in_message` BoC.',
    example: 'AQABAuObQ8Adqk1eqZxRMJg4r6vGtXq9k0...base64...',
  });

/** A candidate transaction targeting a specific lander (block engine). */
const SwapSendCandidateSchema = z
  .object({
    lander: z.string().min(1, 'lander is required').openapi({
      description: 'Lander id — `jito`, `nozomi`, `zeroslot`, …',
      example: 'jito',
    }),
    signedTransaction: base64ToBuffer,
  })
  .openapi('SwapSendCandidate');

export type SwapSendCandidate = z.infer<typeof SwapSendCandidateSchema>;

/**
 * Swap send schema — backward-compatible across chains.
 *
 * **Single mode** (Solana / EVM / TON):
 *   `{ chainId, signedTransaction }`
 *   The base64 payload is whatever the chain expects:
 *     - Solana → signed transaction bytes
 *     - EVM    → raw signed RLP
 *     - TON    → signed external_in_message BoC
 *
 * **Batch mode** (Solana multi-lander only):
 *   `{ chainId, candidates: [{ lander, signedTransaction }, ...] }`
 *   Used by Jito / Nozomi / 0slot multi-lander racing — N candidates
 *   share a durable nonce, only one lands. NOT applicable to TON
 *   (the v4r2 wallet's seqno is monotonic; double-broadcasting a BoC
 *   is harmless but only one will commit anyway).
 */
export const SwapSendSchema = z
  .object({
    chainId: z.string().openapi({
      description:
        'Chain dispatcher. Solana: `solana:solana`. EVM: `evm:<chainId>` (e.g. `evm:8453` for Base). TON: `ton:mainnet` or `ton:testnet`.',
      example: 'solana:solana',
    }),
    signedTransaction: base64ToBuffer.optional(),
    candidates: z
      .array(SwapSendCandidateSchema)
      .min(1)
      .optional()
      .openapi({
        description:
          'Multi-lander batch (Solana only). One signed candidate per lander, sharing a durable nonce — only one will commit. Mutually exclusive with `signedTransaction`.',
      }),
    awaitLanding: z.boolean().optional().openapi({
      description: 'When `true`, the endpoint blocks until on-chain confirmation and returns swap data.',
      example: false,
    }),
  })
  .refine((data) => data.signedTransaction || data.candidates, {
    message: 'Either signedTransaction or candidates must be provided',
  })
  .refine((data) => !(data.signedTransaction && data.candidates), {
    message: 'Provide signedTransaction or candidates, not both',
  });

export type SwapSendParams = z.infer<typeof SwapSendSchema>;
