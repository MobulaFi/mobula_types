import { z } from 'zod';

const BaseFilter = z.object({
  eq: z.tuple([z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])]).optional(),
  neq: z.tuple([z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])]).optional(),
  lt: z.tuple([z.string(), z.coerce.number()]).optional(),
  lte: z.tuple([z.string(), z.coerce.number()]).optional(),
  gt: z.tuple([z.string(), z.coerce.number()]).optional(),
  gte: z.tuple([z.string(), z.coerce.number()]).optional(),
  in: z.tuple([z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])]).optional(),
});

type BaseFilter = z.infer<typeof BaseFilter>;
export type Filter = BaseFilter & ({ and?: Filter[] } | { or?: Filter[] });

const Filter: z.ZodType<Filter> = BaseFilter.and(
  z.union([
    BaseFilter.extend({ and: z.undefined(), or: z.undefined() }),
    BaseFilter.extend({ and: z.array(z.lazy(() => Filter)), or: z.undefined() }),
    BaseFilter.extend({ and: z.undefined(), or: z.array(z.lazy(() => Filter)) }),
  ]),
);

export type FilterType = z.infer<typeof Filter>;

export function countOperations(filter: Filter | undefined): number {
  if (!filter) return 0;

  let count = 0;

  for (const key of ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'] as const) {
    if (filter[key]) count += 1;
  }

  if ('and' in filter && Array.isArray(filter.and)) {
    for (const child of filter.and) {
      count += countOperations(child);
    }
  }

  if ('or' in filter && Array.isArray(filter.or)) {
    for (const child of filter.or) {
      count += countOperations(child);
    }
  }

  return count;
}

const FilterWithLimit = Filter.superRefine((val, ctx) => {
  const total = countOperations(val);
  const max = 1000;
  if (total > max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Your filter contains ${total} leaf operations, exceeding the maximum of ${max}. Only leaf conditions like "eq", "neq", "lt", "lte", "gt", "gte", "in" are counted; logical operators ("and", "or") are ignored.`,
    });
  }
});

export default FilterWithLimit;

const UpdateWebhook = z.object({
  streamId: z.string(),
  apiKey: z.string(),
  mode: z.enum(['replace', 'merge']).default('replace'),
  filters: FilterWithLimit.optional(),
});
type UpdateWebhookDto = z.infer<typeof UpdateWebhook>;
export { UpdateWebhook };
export type { UpdateWebhookDto };
export type UpdateWebhookParams = UpdateWebhookDto;

export const CreateWebhook = z
  .object({
    name: z.string(),
    chainIds: z.array(z.string()),
    events: z.array(z.string()),
    apiKey: z.string(),
    filters: FilterWithLimit.optional(),
    url: z.string().url(),
  })
  .strict();
export type CreateWebhookDto = z.infer<typeof CreateWebhook>;
export type CreateWebhookParams = CreateWebhookDto;

export const listWebhooksQueryParams = z.object({
  apiKey: z.string().trim().min(1, { message: 'API key is required' }),
});

export type ListWebhooksQuery = z.infer<typeof listWebhooksQueryParams>;
export type ListWebhooksParams = ListWebhooksQuery;

export const deleteWebhookParams = z.object({
  id: z.string().trim().min(1, { message: 'Webhook ID is required' }),
});

export type DeleteWebhookType = z.infer<typeof deleteWebhookParams>;
export type DeleteWebhookParams = DeleteWebhookType;

export const WebhookResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  chainIds: z.array(z.string()),
  events: z.array(z.string()),
  filters: z.any().nullable().optional(),
  webhookUrl: z.string().url(),
  apiKey: z.string(),
  createdAt: z.union([z.string(), z.coerce.date()]).transform((val) => (val instanceof Date ? val.toISOString() : val)),
});

export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;

export const CreateWebhookResponseSchema = WebhookResponseSchema.extend({
  webhookSecret: z.string(),
});
export type CreateWebhookResponse = z.infer<typeof CreateWebhookResponseSchema>;

export const listWebhookResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  data: z.array(WebhookResponseSchema),
});

export type listWebhookResponse = z.infer<typeof listWebhookResponseSchema>;
export type ListWebhooksResponse = listWebhookResponse;

export const updateWebhookResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: WebhookResponseSchema,
});

export type updateWebhookResponse = z.infer<typeof updateWebhookResponseSchema>;
export type UpdateWebhookResponse = updateWebhookResponse;

export const deleteWebhookResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  id: z.string(),
});

export type DeleteWebhookResponse = z.infer<typeof deleteWebhookResponseSchema>;
