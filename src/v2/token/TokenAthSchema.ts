import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { CurrenciesParamSchema } from '../../utils/schemas/CurrencySchema.ts';

const TokenAthItemParams = z.object({
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  address: z.string().optional(),
  currencies: CurrenciesParamSchema,
  instanceTracking: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
});

export const TokenAthParamsSchema = TokenAthItemParams;

export const TokenAthBatchParamsSchema = z.union([
  z.array(TokenAthItemParams),
  z.object({
    items: z.array(TokenAthItemParams),
    instanceTracking: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional()),
  }),
]);

const TOKEN_ATH_HIDDEN = ['instanceTracking', 'blockchain'] as const;
type TokenAthHiddenFields = (typeof TOKEN_ATH_HIDDEN)[number];

export type TokenAthParams = SDKInput<typeof TokenAthParamsSchema, TokenAthHiddenFields>;
export type TokenAthBatchParams = z.input<typeof TokenAthBatchParamsSchema>;

export const TokenAthParamsSchemaOpenAPI = createOpenAPIParams(TokenAthParamsSchema, {
  omit: [...TOKEN_ATH_HIDDEN],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    address: 'Token contract address',
    currencies: 'Comma-separated list of currencies for price conversion',
  },
});

const TokenAthItemParamsOpenAPI = createOpenAPIParams(TokenAthItemParams, {
  omit: [...TOKEN_ATH_HIDDEN],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    address: 'Token contract address',
    currencies: 'Comma-separated list of currencies for price conversion',
  },
});

export const TokenAthBatchParamsSchemaOpenAPI = z.union([
  z.array(TokenAthItemParamsOpenAPI),
  z.object({
    items: z.array(TokenAthItemParamsOpenAPI),
  }),
]);

export const TokenAthOutput = z.object({
  address: z.string(),
  chainId: z.string(),
  symbol: z.string().nullable(),
  name: z.string().nullable(),
  athUSD: z.coerce.number().optional(),
  atlUSD: z.coerce.number().optional(),
  athDate: z.coerce.date().optional(),
  atlDate: z.coerce.date().optional(),
  priceUSD: z.coerce.number().default(0),
});

export type TokenAthOutputType = z.infer<typeof TokenAthOutput>;

export const TokenAthResponseSchema = z.object({
  data: TokenAthOutput,
  hostname: z.string().optional(),
});
export type TokenAthResponse = z.infer<typeof TokenAthResponseSchema>;

export const TokenAthBatchResponseSchema = z.object({
  payload: z.array(TokenAthOutput.or(z.object({ error: z.string().optional() })).nullable()),
  hostname: z.string().optional(),
});
export type TokenAthBatchResponse = z.infer<typeof TokenAthBatchResponseSchema>;
