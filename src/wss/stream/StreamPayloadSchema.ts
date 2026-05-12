import { z } from 'zod';
import FilterWithLimit from '../../utils/schemas/Filter.ts';

export const StreamPayloadSchema = z.object({
  filters: FilterWithLimit.optional(),
  chainIds: z.array(z.string()).nonempty(),
  name: z.string().optional(),
  events: z.array(z.enum(['swap', 'transfer', 'swap-enriched', 'block', 'order'])).nonempty(),
  authorization: z.string(),
  subscriptionId: z.string().optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  debugSubscriptionId: z.string().optional(),
  tag: z.string().max(50).optional(),
  // Opt in to gzip compression of every outbound frame (sent as binary,
  // `level: 3` for fast/small balance). Mirrors the Pulse API flag — clients
  // already shipped with `pako` decoding flip this on for ~5-10x byte
  // reduction on swap-enriched payloads, which directly reduces the Node ws
  // bufferedAmount + kernel TCP buffer pressure that drives our storm cycle.
  compressed: z.boolean().optional(),
});

export type StreamPayloadType = z.infer<typeof StreamPayloadSchema>;

export const UnsubscribeStreamPayloadSchema = z
  .object({
    type: z.enum(['stream']).optional(),
    subscriptionId: z.string().optional(),
    personalizedId: z.string().optional(),
    viewName: z.string().optional(),
  })
  .transform((data) => {
    // Transform personalizedId to subscriptionId if provided
    if (data.personalizedId && !data.subscriptionId) {
      return {
        ...data,
        subscriptionId: data.personalizedId,
      };
    }
    return data;
  })
  .optional();

export type UnsubscribeStreamPayloadType = z.input<typeof UnsubscribeStreamPayloadSchema>;

export const UpdateStreamPayloadSchema = z.object({
  subscriptionId: z.string(),
  authorization: z.string(),
  mode: z.enum(['merge', 'replace']).default('replace'),
  filters: FilterWithLimit.optional(),
  chainIds: z.array(z.string()).optional(),
  events: z.array(z.string()).optional(),
  subscriptionTracking: z
    .union([z.boolean(), z.string()])
    .default(false)
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  tag: z.string().max(50).optional(),
});

export type UpdateStreamPayloadType = z.input<typeof UpdateStreamPayloadSchema>;
