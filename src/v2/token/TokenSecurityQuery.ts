import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';

export const TokenSecurityQuery = z.object({
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  address: z.string(),
  instanceTracking: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
  // Secret flag to force LLM static analysis (undocumented, you, reading this
  // open source code, pls don't use it ok? we will hunt you down and kill you)
  _forceAnalysis: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
  // Secret flag to force honeypot simulation (same deal as above)
  _forceHoneypotAnalysis: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
});

const TOKEN_SECURITY_HIDDEN = ['instanceTracking', '_forceAnalysis', '_forceHoneypotAnalysis', 'blockchain'] as const;
type TokenSecurityHiddenFields = (typeof TOKEN_SECURITY_HIDDEN)[number];

export type TokenSecurityQueryType = SDKInput<typeof TokenSecurityQuery, TokenSecurityHiddenFields>;

export const TokenSecurityQueryOpenAPI = createOpenAPIParams(TokenSecurityQuery, {
  omit: [...TOKEN_SECURITY_HIDDEN],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    address: 'Token contract address',
  },
});
