import { z } from 'zod';

export const EVMSecurityFlagsSchema = z.object({
  buyTax: z.coerce.string().optional(),
  sellTax: z.coerce.string().optional(),
  transferPausable: z.boolean().optional(),
  top10Holders: z.string().optional(),
  isBlacklisted: z.boolean().optional(),
  isHoneypot: z.boolean().optional(),
  isNotOpenSource: z.boolean().optional(),
  renounced: z.boolean().optional(),
  locked: z.string().optional(),
  isWhitelisted: z.boolean().optional(),
  balanceMutable: z.boolean().optional(),
  lowLiquidity: z.string().optional(),
  burnRate: z.string().optional(),
  isMintable: z.boolean().optional(),
  modifyableTax: z.boolean().optional(),
  selfDestruct: z.boolean().optional(),
  liquidityBurnPercentage: z.number().optional(),
});

export type EVMSecurityFlags = z.infer<typeof EVMSecurityFlagsSchema>;

export const SolanaSecurityFlagsSchema = z.object({
  buyTax: z.coerce.string().optional(),
  sellTax: z.coerce.string().optional(),
  transferPausable: z.boolean().optional(),
  top10Holders: z.string().optional(),
  isBlacklisted: z.boolean().optional(),
  noMintAuthority: z.boolean().optional(),
  balanceMutable: z.boolean().optional(),
  lowLiquidity: z.string().optional(),
  burnRate: z.string().optional(),
  liquidityBurnPercentage: z.number().optional(),
});

export type SolanaSecurityFlags = z.infer<typeof SolanaSecurityFlagsSchema>;

export const SecurityFlagsSchema = SolanaSecurityFlagsSchema.merge(EVMSecurityFlagsSchema);
export type SecurityFlags = z.infer<typeof SecurityFlagsSchema>;
