import { z } from 'zod';

/** Allowed plan values for x402 agent subscribe. Accepts any case; stored in DB as Startup, Growth, Enterprise. */
export const X402_AGENT_PLAN = z
  .string()
  .transform((s) => s?.trim().toLowerCase() ?? '')
  .pipe(z.enum(['startup', 'growth', 'enterprise']));

/** Payment frequency for subscription. Accepts any case (e.g. Yearly, MONTHLY). */
export const X402_AGENT_PAYMENT_FREQUENCY = z
  .string()
  .transform((s) => s?.trim().toLowerCase() ?? '')
  .pipe(z.enum(['monthly', 'yearly']));

/** Query params for GET /x402/agent/subscribe */
export const X402AgentSubscribeQuerySchema = z.object({
  plan: X402_AGENT_PLAN,
  payment_frequency: X402_AGENT_PAYMENT_FREQUENCY,
  upgrade: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  api_key: z.string().optional(),
  user_id: z.string().optional(),
});

export type X402AgentSubscribeQuery = z.infer<typeof X402AgentSubscribeQuerySchema>;

/** Response for subscribe: api_key + user_id (agent id). */
export const X402AgentCredentialsResponseSchema = z.object({
  api_key: z.string(),
  user_id: z.string(),
});

export type X402AgentCredentialsResponse = z.infer<typeof X402AgentCredentialsResponseSchema>;

/** Query params for GET /x402/agent/top-up */
export const X402AgentTopUpQuerySchema = z.object({
  agent_id: z.string().min(1),
  amount_usd: z.coerce.number().positive(),
});

export type X402AgentTopUpQuery = z.infer<typeof X402AgentTopUpQuerySchema>;

/** Response for top-up. */
export const X402AgentTopUpResponseSchema = z.object({
  credits_added: z.number().int().nonnegative(),
  new_credits_limit: z.number().int().nonnegative(),
});

export type X402AgentTopUpResponse = z.infer<typeof X402AgentTopUpResponseSchema>;
