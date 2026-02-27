import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { CurrenciesParamSchema } from '../../utils/schemas/CurrencySchema.ts';
import { TokenDetailsOutput } from '../../utils/schemas/TokenDetailsOutput.ts';

const TokenDetailsItemParams = z.object({
  blockchain: z.string().optional(),
  address: z.string().optional(),
  currencies: CurrenciesParamSchema,
  instanceTracking: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean().optional()),
});

const TokenDetailsParamsSchema = TokenDetailsItemParams;

const TokenDetailsBatchParamsSchema = z.union([
  z.array(TokenDetailsItemParams),
  z.object({
    items: z.array(TokenDetailsItemParams),
    instanceTracking: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean().optional()),
  }),
]);

const TOKEN_DETAILS_HIDDEN = ['instanceTracking'] as const;
type TokenDetailsHiddenFields = (typeof TOKEN_DETAILS_HIDDEN)[number];

export type TokenDetailsParams = SDKInput<typeof TokenDetailsParamsSchema, TokenDetailsHiddenFields>;

export const TokenDetailsParamsSchemaOpenAPI = createOpenAPIParams(TokenDetailsParamsSchema, {
  omit: [...TOKEN_DETAILS_HIDDEN],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    address: 'Token contract address',
    currencies: 'Comma-separated list of currencies for price conversion',
  },
});

const TokenDetailsItemParamsOpenAPI = createOpenAPIParams(TokenDetailsItemParams, {
  omit: [...TOKEN_DETAILS_HIDDEN],
  describe: {
    blockchain: 'Blockchain name or chain ID',
    address: 'Token contract address',
    currencies: 'Comma-separated list of currencies for price conversion',
  },
});

export const TokenDetailsBatchParamsSchemaOpenAPI = z.union([
  z.array(TokenDetailsItemParamsOpenAPI),
  z.object({
    items: z.array(TokenDetailsItemParamsOpenAPI),
  }),
]);

export const TokenDetailsResponseSchema = z.object({
  data: TokenDetailsOutput,
  hostname: z.string().optional(),
});
export type TokenDetailsResponse = z.infer<typeof TokenDetailsResponseSchema>;

export const TokenDetailsBatchResponseSchema = z.object({
  payload: z.array(TokenDetailsOutput.or(z.object({ error: z.string().optional() })).nullable()),
  hostname: z.string().optional(),
});
export type TokenDetailsBatchResponse = z.infer<typeof TokenDetailsBatchResponseSchema>;

export type TokenDetailsBatchParams = z.input<typeof TokenDetailsBatchParamsSchema>;

export { TokenDetailsParamsSchema, TokenDetailsBatchParamsSchema };
