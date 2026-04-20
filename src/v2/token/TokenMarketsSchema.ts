import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { MarketDetailsOutput } from '../../utils/schemas/MarketDetailsOutput.ts';

const DEFAULT_MARKETS_RES_LIMIT = 10;
const MARKETS_MAX__RES_LIMIT = 25;

export const TokenMarketsParamsSchema = z.object({
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  address: z.string(),
  limit: z.coerce.number().min(1).max(MARKETS_MAX__RES_LIMIT).default(DEFAULT_MARKETS_RES_LIMIT),
});

export type TokenMarketsParams = SDKInput<typeof TokenMarketsParamsSchema, 'blockchain'>;

export const TokenMarketsParamsSchemaOpenAPI = createOpenAPIParams(TokenMarketsParamsSchema, {
  omit: ['blockchain'],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    address: 'Token contract address',
    limit: 'Maximum number of markets (1-25, default: 10)',
  },
});

/**
 * The resolved data for TokenMarkets is an array of what MarketDetails resolve, so we
 * use the same schema as a base.
 */
export const TokenMarketsOutput = z.array(MarketDetailsOutput);

export const TokenMarketsResponseSchema = z.object({
  data: TokenMarketsOutput,
  totalCount: z.number(),
});

export type TokenMarketsResponse = z.infer<typeof TokenMarketsResponseSchema>;
