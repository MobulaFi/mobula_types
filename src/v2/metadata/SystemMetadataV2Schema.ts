import { z } from 'zod';

const booleanPreprocess = z.preprocess((val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}, z.boolean().optional());

export const SystemMetadataV2ParamsSchema = z.object({
  // Selection
  factories: booleanPreprocess,
  poolTypes: booleanPreprocess,
  chains: booleanPreprocess,

  // Factory filters
  hasMetadata: booleanPreprocess,
  status: z.enum(['APPROVED', 'WAITING_APPROVAL', 'NOT_APPROVED']).optional(),
  chainId: z.string().optional(),
  name: z.string().optional(),

  // Chain filters
  indexed: booleanPreprocess,
  type: z.string().optional(),
});

export type SystemMetadataV2Params = z.input<typeof SystemMetadataV2ParamsSchema>;

const ChainOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  chainId: z.union([z.number(), z.string()]),
  testnet: z.boolean(),
  indexing: z.boolean(),
  averageBlockTimeInSeconds: z.number().nullable(),
  native: z.object({
    name: z.string(),
    symbol: z.string(),
    decimals: z.number(),
    address: z.string(),
  }),
  branding: z.object({
    logo: z.string(),
    color: z.string(),
  }),
  blockExplorers: z
    .object({
      default: z.object({
        name: z.string(),
        url: z.string(),
        apiUrl: z.string().optional(),
      }),
    })
    .optional(),
  integrations: z
    .object({
      geckoterminal: z.string().optional(),
      dexscreener: z.string().optional(),
      coingecko: z.string().optional(),
    })
    .optional(),
});

const FactoryOutputSchema = z.object({
  chainId: z.string(),
  address: z.string(),
  status: z.string(),
  name: z.string().optional(),
  metadata: z
    .object({
      ui_name: z.string().optional(),
      logo: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

export const SystemMetadataV2ResponseSchema = z.object({
  data: z.object({
    poolTypes: z.array(z.string()).optional(),
    chains: z.array(ChainOutputSchema).optional(),
    factories: z.array(FactoryOutputSchema).optional(),
  }),
});

export type SystemMetadataV2Response = z.infer<typeof SystemMetadataV2ResponseSchema>;

// OpenAPI-compatible params schema (no z.preprocess, plain booleans for spec generation)
export const SystemMetadataV2ParamsSchemaOpenAPI = z.object({
  factories: z.boolean().optional().describe('Include the list of registered factories.'),
  poolTypes: z.boolean().optional().describe('Include the list of supported pool types.'),
  chains: z.boolean().optional().describe('Include the list of supported chains.'),
  hasMetadata: z.boolean().optional().describe('Filter factories by metadata presence.'),
  status: z
    .enum(['APPROVED', 'WAITING_APPROVAL', 'NOT_APPROVED'])
    .optional()
    .describe('Filter factories by approval status.'),
  chainId: z.string().optional().describe('Filter factories by chain ID.'),
  name: z.string().optional().describe('Case-insensitive partial match on factory name.'),
  indexed: z.boolean().optional().describe('Filter chains by indexing status.'),
  type: z.string().optional().describe('Filter chains by type (e.g. "evm", "solana").'),
});
