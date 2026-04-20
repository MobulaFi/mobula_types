import { z } from 'zod';
import { createOpenAPIParams, type SDKInput } from '../../utils/functions/openAPIHelpers.ts';
import normalizePeriod from '../../utils/functions/period.ts';

// Single asset query schema
const AssetPriceHistoryItemSchema = z.object({
  address: z.string().optional(),
  chainId: z.string().optional(),
  blockchain: z.string().optional(),
  id: z.coerce.number().optional(),
  period: z
    .string()
    .optional()
    .transform((val) => {
      if (val) {
        return normalizePeriod(val);
      }
      return undefined;
    }),
  from: z.coerce.number().default(0),
  to: z.coerce.number().default(() => Date.now()),
});

// GET request schema (single asset)
export const AssetPriceHistoryParamsSchema = AssetPriceHistoryItemSchema.refine(
  (data) => {
    return data.id !== undefined || data.address !== undefined;
  },
  {
    message: 'Either id or address must be provided',
  },
).refine(
  (data) => {
    if (data.address !== undefined && data.chainId === undefined && data.blockchain === undefined) {
      return false;
    }
    return true;
  },
  {
    message: 'chainId is required when using address',
  },
);

export type AssetPriceHistoryParams = SDKInput<typeof AssetPriceHistoryParamsSchema, 'blockchain'>;

export const AssetPriceHistoryParamsSchemaOpenAPI = createOpenAPIParams(AssetPriceHistoryItemSchema, {
  omit: ['blockchain'],
  describe: {
    address: 'Token contract address',
    chainId: 'Blockchain chain ID (required when using address)',
    id: 'Asset ID (alternative to address+chainId)',
    period: 'Candle period (e.g., "5m", "1h", "1d")',
    from: 'Start timestamp (unix seconds)',
    to: 'End timestamp (unix seconds)',
  },
});

// Array schema for batch items
const AssetPriceHistoryArraySchema = z
  .array(AssetPriceHistoryItemSchema)
  .min(1, 'At least one asset is required')
  .max(10, 'Maximum 10 assets per request')
  .refine(
    (assets) => {
      return assets.every((asset) => asset.id !== undefined || asset.address !== undefined);
    },
    {
      message: 'Each asset must have either id or address',
    },
  )
  .refine(
    (assets) => {
      return assets.every((asset) => {
        if (asset.address !== undefined && asset.chainId === undefined && asset.blockchain === undefined) {
          return false;
        }
        return true;
      });
    },
    {
      message: 'chainId is required when using address',
    },
  );

// POST request schema - supports both array and object with 'assets' key
export const AssetPriceHistoryBatchParamsSchema = z.union([
  AssetPriceHistoryArraySchema,
  z.object({ assets: AssetPriceHistoryArraySchema }),
]);

export type AssetPriceHistoryBatchParams = z.input<typeof AssetPriceHistoryBatchParamsSchema>;

// Single asset response data schema
const AssetPriceHistoryDataSchema = z.object({
  priceHistory: z.array(z.array(z.number().nullable())),
  id: z.number().optional(),
  name: z.string().optional(),
  symbol: z.string().optional(),
  chainId: z.string().optional(),
  address: z.string().optional(),
  error: z.string().optional(),
});

// GET response schema (single asset)
export const AssetPriceHistoryResponseSchema = z.object({
  data: AssetPriceHistoryDataSchema,
});

export type AssetPriceHistoryResponse = z.infer<typeof AssetPriceHistoryResponseSchema>;

// POST response schema (batch - array of assets)
export const AssetPriceHistoryBatchResponseSchema = z.object({
  data: z.array(AssetPriceHistoryDataSchema),
});

export type AssetPriceHistoryBatchResponse = z.infer<typeof AssetPriceHistoryBatchResponseSchema>;
