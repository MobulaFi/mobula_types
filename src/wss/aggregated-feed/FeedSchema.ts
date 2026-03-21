import { z } from 'zod';

export const FeedPayloadSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('asset_ids'),
    asset_ids: z.array(z.number()).optional(),
    quote_id: z.number().optional().nullable(),
    tag: z.string().max(50).optional(),
  }),
  z.object({
    kind: z.literal('address'),
    tokens: z.array(
      z.object({
        blockchain: z.string(),
        address: z.string(),
      }),
    ),
    quote: z
      .object({
        address: z.string(),
        blockchain: z.string(),
      })
      .optional(),
    tag: z.string().max(50).optional(),
  }),
  z.object({
    kind: z.literal('all'),
    tag: z.string().max(50).optional(),
  }),
]);

export type FeedPayloadType = z.input<typeof FeedPayloadSchema>;

export const FeedAssetIdSchema = z.object({
  asset_ids: z.array(z.number()).optional(),
  quote_id: z.number().optional().nullable(),
});

export const FeedTokenSchema = z.object({
  tokens: z.array(
    z.object({
      blockchain: z.string(),
      address: z.string(),
    }),
  ),
  quote: z
    .object({
      address: z.string(),
      blockchain: z.string(),
    })
    .optional(),
});
