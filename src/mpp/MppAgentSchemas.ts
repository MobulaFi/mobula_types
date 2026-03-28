import { z } from 'zod';

/** Allowed plan values for Machine Payments Protocol (MPP) agent subscribe. Accepts any case; stored in DB as Startup, Growth, Enterprise. */
export const MPP_AGENT_PLAN = z
  .string()
  .transform((s) => s?.trim().toLowerCase() ?? '')
  .pipe(z.enum(['startup', 'growth', 'enterprise']));

/** Payment frequency for subscription. Accepts any case (e.g. Yearly, MONTHLY). */
export const MPP_AGENT_PAYMENT_FREQUENCY = z
  .string()
  .transform((s) => s?.trim().toLowerCase() ?? '')
  .pipe(z.enum(['monthly', 'yearly']));

/** Query params for GET /agent/mpp/subscribe */
export const MppAgentSubscribeQuerySchema = z.object({
  plan: MPP_AGENT_PLAN,
  payment_frequency: MPP_AGENT_PAYMENT_FREQUENCY,
  upgrade: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  api_key: z.string().optional(),
  user_id: z.string().optional(),
});

export type MppAgentSubscribeQuery = z.infer<typeof MppAgentSubscribeQuerySchema>;

/** Response for subscribe: api_key + user_id (agent id). */
export const MppAgentCredentialsResponseSchema = z.object({
  api_key: z.string(),
  user_id: z.string(),
});

export type MppAgentCredentialsResponse = z.infer<typeof MppAgentCredentialsResponseSchema>;

/** Query params for GET /agent/mpp/top-up */
export const MppAgentTopUpQuerySchema = z.object({
  agent_id: z.string().min(1),
  amount_usd: z.coerce.number().positive(),
});

export type MppAgentTopUpQuery = z.infer<typeof MppAgentTopUpQuerySchema>;

/** Response for top-up. */
export const MppAgentTopUpResponseSchema = z.object({
  credits_added: z.number().int().nonnegative(),
  new_credits_limit: z.number().int().nonnegative(),
});

export type MppAgentTopUpResponse = z.infer<typeof MppAgentTopUpResponseSchema>;
