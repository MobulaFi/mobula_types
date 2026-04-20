import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import { CurrenciesParamSchema } from '../../utils/schemas/CurrencySchema.ts';
import { MarketDetailsOutput } from '../../utils/schemas/MarketDetailsOutput.ts';

const MarketDetailsItemParams = z
  .object({
    chainId: z.string().optional(),
    blockchain: z.string().optional(),
    address: z.string().optional(),
    baseToken: z.string().optional(),
    currencies: z.string().optional(),
  })
  .transform(({ chainId, blockchain, address, baseToken, currencies }) => ({
    chainId,
    blockchain,
    address,
    baseToken,
    currencies: CurrenciesParamSchema.parse(currencies),
    asset: address ? address : undefined,
  }));

const MarketDetailsParamsSchema = MarketDetailsItemParams;

const MarketDetailsBatchParamsSchema = z.union([
  z.array(MarketDetailsItemParams),
  z.object({
    items: z.array(MarketDetailsItemParams),
  }),
]);

export type MarketDetailsParams = SDKInput<typeof MarketDetailsParamsSchema, 'blockchain'>;
export type MarketDetailsInferType = z.infer<typeof MarketDetailsParamsSchema>;

export const MarketDetailsParamsSchemaOpenAPI = createOpenAPIParams(MarketDetailsItemParams, {
  omit: ['blockchain'],
  describe: {
    chainId: 'Blockchain chain ID (e.g., "evm:56", "solana:solana")',
    address: 'Pool/pair contract address',
    baseToken: 'Base token address',
    currencies: 'Comma-separated currencies for price conversion',
  },
});

export type MarketDetailsBatchParams = z.input<typeof MarketDetailsBatchParamsSchema>;

export const MarketDetailsResponseSchema = z.object({
  data: MarketDetailsOutput,
  hostname: z.string().optional(),
});
export type MarketDetailsResponse = z.infer<typeof MarketDetailsResponseSchema>;

export const MarketDetailsBatchResponseSchema = z.object({
  payload: z.array(MarketDetailsOutput.or(z.object({ error: z.string().optional() })).nullable()),
  hostname: z.string().optional(),
});
export type MarketDetailsBatchResponse = z.infer<typeof MarketDetailsBatchResponseSchema>;

export { MarketDetailsParamsSchema, MarketDetailsBatchParamsSchema };
