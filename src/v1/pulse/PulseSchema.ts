import { z } from 'zod';
import {
  type EnrichedPoolData,
  EnrichedPoolDataSchema,
  type EnrichedTokenData,
  EnrichedTokenDataSchema,
} from '../../utils/schemas/EnrichedMarketData.ts';

// Pulse V2 model - current version
export const PulsePayloadParamsSchema = z.object({
  model: z.enum(['default']).optional(),
  subscriptionId: z.string().optional(),
  compressed: z.coerce.boolean().optional().default(false),
  assetMode: z.coerce.boolean().optional().default(false),
  chainId: z.union([z.string(), z.array(z.string())]).optional(),
  poolTypes: z.union([z.string(), z.array(z.string())]).optional(),
  excludeDuplicates: z.coerce.boolean().optional().default(true),
  instanceTracking: z.coerce.boolean().optional().default(false),
  pagination: z.coerce.boolean().optional(),
  views: z
    .array(
      z.object({
        name: z.string(),
        model: z.enum(['new', 'bonding', 'bonded']).optional(),
        chainId: z.union([z.string(), z.array(z.string())]).optional(),
        poolTypes: z.union([z.string(), z.array(z.string())]).optional(),
        token: z
          .union([z.string(), z.record(z.unknown())])
          .optional()
          .transform((val) => {
            if (typeof val === 'object' && val !== null) {
              return val;
            }

            if (typeof val === 'string') {
              try {
                const parsed = JSON.parse(val);
                if (typeof parsed === 'object' && parsed !== null) {
                  return parsed;
                }
              } catch {
                // If parsing fails, treat as address filter
                return { address: val };
              }
            }

            return undefined;
          }),
        assets: z.union([z.string(), z.array(z.string())]).optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        limit: z.coerce.number().max(100).optional().default(30),
        offset: z.coerce.number().optional().default(0),
        addressToExclude: z.union([z.string(), z.array(z.string())]).optional(),
        baseTokenToExclude: z.union([z.string(), z.array(z.string())]).optional(),
        filters: z
          .union([z.string(), z.record(z.unknown())])
          .optional()
          .transform((val) => {
            if (typeof val === 'object' && val !== null) {
              return val;
            }

            if (typeof val === 'string') {
              try {
                const parsed = JSON.parse(val);
                if (typeof parsed === 'object' && parsed !== null) {
                  return parsed;
                }
              } catch {
                const filters = val.split(',');
                const whereClause: Record<string, unknown> = {};

                for (const filter of filters) {
                  if (filter.includes(':')) {
                    const [field, filterMinValue, filterMaxValue] = filter.split(':');

                    if (field && ['source', 'deployer'].includes(field)) {
                      whereClause[field] = {
                        equals: filterMinValue,
                      };
                    } else if (field && ['latest_trade_date', 'created_at'].includes(field)) {
                      const getDateValue = (value: string | undefined) => {
                        if (!value || value === 'null' || value === 'undefined') return undefined;
                        const numValue = Number(value);
                        const date = Number.isNaN(numValue) ? new Date(value) : new Date(numValue);
                        return Number.isNaN(date.getTime()) ? undefined : date;
                      };

                      const gteDate = getDateValue(filterMinValue);
                      const lteDate = getDateValue(filterMaxValue);

                      if (gteDate || lteDate) {
                        whereClause[field] = {
                          ...(gteDate && { gte: gteDate }),
                          ...(lteDate && { lte: lteDate }),
                        };
                      }
                    } else if (field === 'market_cap') {
                      whereClause[field] = {
                        not: filterMinValue === 'null' ? null : undefined,
                        gte: filterMinValue && filterMinValue !== 'null' ? Number(filterMinValue) : undefined,
                        lte: filterMaxValue ? Number(filterMaxValue) : undefined,
                      };
                    } else if (field) {
                      whereClause[field] = {
                        gte: filterMinValue ? Number(filterMinValue) : undefined,
                        lte: filterMaxValue ? Number(filterMaxValue) : undefined,
                      };
                    }
                  }
                }
                return whereClause;
              }
            }

            return {};
          }),

        min_socials: z
          .union([
            z.number().int().min(1).max(3),
            z
              .string()
              .transform((val) => {
                const num = Number(val);
                if (Number.isNaN(num)) throw new Error('Invalid number');
                return num;
              })
              .pipe(z.number().int().min(1).max(3)),
          ])
          .optional(),
        assetListed: z.coerce.boolean().optional(),
        pagination: z.coerce.boolean().optional(),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});

export type PulsePayloadParams = z.input<typeof PulsePayloadParamsSchema>;

export const PausePulsePayloadParamsSchema = z.object({
  action: z.enum(['pause', 'unpause']),
  views: z.array(z.string()).min(1),
});

export type PausePayloadParams = z.input<typeof PausePulsePayloadParamsSchema>;
export type PausePayloadInferType = z.infer<typeof PausePulsePayloadParamsSchema>;

export type PulseViewData = {
  data: EnrichedPoolData[] | EnrichedTokenData[];
  pagination?: number;
};

export interface PulseResponseData {
  [key: string]: PulseViewData | string;
}

export type PulseResponse = PulseResponseData | Buffer;

const ViewPaginationSchema = z.object({
  pagination: z.number(),
});

// The entire response is a record with string keys and pagination objects
export const PulsePaginationResponseSchema = z.record(ViewPaginationSchema);
export type PulsePaginationResponse = z.infer<typeof PulsePaginationResponseSchema>;

export const DebugPulseViewsResponseSchema = z.object({
  success: z.boolean(),
  hostname: z.string(),
  viewKeys: z.record(z.array(z.string())).optional(),
  error: z.string().optional(),
  redirectTo: z.string().optional(),
  hint: z.string().optional(),
});

export type DebugPulseViewsResponse = z.infer<typeof DebugPulseViewsResponseSchema>;

export const PulseQuerySchema = z.object({
  blockchains: z.string().optional(),
  //factory: z.string().optional(),
  factories: z.string().optional(),
});

export type PulseQuery = z.infer<typeof PulseQuerySchema>;
export const poolDataSchema = EnrichedPoolDataSchema;
export type PoolDataSchema = z.infer<typeof poolDataSchema>;
export const tokenDataSchema = EnrichedTokenDataSchema;
export type TokenDataSchema = z.infer<typeof tokenDataSchema>;

export const syncMessageSchema = z.object({
  type: z.literal('sync'),
  payload: z.record(
    z.string(),
    z.object({
      data: z.array(poolDataSchema),
    }),
  ),
});

export const newPoolMessageSchema = z.object({
  type: z.literal('new-pool'),
  payload: z.object({
    viewName: z.string(),
    pool: poolDataSchema,
  }),
});

export const updatePoolMessageSchema = z.object({
  type: z.literal('update-pool'),
  payload: z.object({
    viewName: z.string(),
    pool: poolDataSchema,
  }),
});

export const removePoolMessageSchema = z.object({
  type: z.literal('remove-pool'),
  payload: z.object({
    viewName: z.string(),
    poolAddress: z.string(),
  }),
});

export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  syncMessageSchema,
  newPoolMessageSchema,
  updatePoolMessageSchema,
  removePoolMessageSchema,
]);

export const PulseOutputSchema = WebSocketMessageSchema;

export type PulseOutput = z.infer<typeof PulseOutputSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
export type SyncMessage = z.infer<typeof syncMessageSchema>;
export type NewPoolMessage = z.infer<typeof newPoolMessageSchema>;
export type UpdatePoolMessage = z.infer<typeof updatePoolMessageSchema>;
export type RemovePoolMessage = z.infer<typeof removePoolMessageSchema>;
