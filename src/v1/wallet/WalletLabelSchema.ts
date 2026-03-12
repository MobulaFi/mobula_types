import { z } from 'zod';

export const WalletLabelsParamsSchema = z.object({
  walletAddresses: z.union([z.string(), z.array(z.string()).max(100)]).optional(),
  tokenAddress: z.string().optional(),
});

export type WalletLabelsParams = z.input<typeof WalletLabelsParamsSchema>;

export const WalletLabelsResponseSchema = z.object({
  data: z.array(
    z.object({
      walletAddress: z.string(),
      labels: z.array(z.string()),
      walletMetadata: z
        .object({
          entityName: z.string().nullable(),
          entityLogo: z.string().nullable(),
          entityLabels: z.array(z.string()),
          entityType: z.string().nullable(),
          entityDescription: z.string().nullable(),
          entityTwitter: z.string().nullable(),
          entityWebsite: z.string().nullable(),
          entityGithub: z.string().nullable(),
          entityDiscord: z.string().nullable(),
          entityTelegram: z.string().nullable(),
        })
        .nullable()
        .optional(),
      platform: z
        .object({
          id: z.string(),
          name: z.string(),
          logo: z.string(),
        })
        .nullable()
        .optional(),
      fundingInfo: z
        .object({
          from: z.string().nullable(),
          date: z.coerce.date().nullable(),
          chainId: z.string().nullable(),
          txHash: z.string().nullable(),
          formattedAmount: z.number().nullable(),
          currency: z
            .object({
              name: z.string(),
              symbol: z.string(),
              logo: z.string().nullable(),
              decimals: z.number(),
              address: z.string(),
            })
            .nullable(),
          fromWalletTag: z.string().nullable(),
          fromWalletLogo: z.string().nullable(),
        })
        .nullable()
        .optional(),
    }),
  ),
});

export type WalletLabelsResponse = z.infer<typeof WalletLabelsResponseSchema>;

// V2 GET query params schema (query string: walletAddresses as comma-separated string)
export const WalletLabelsV2ParamsSchema = z.object({
  walletAddresses: z.string().optional(),
  tokenAddress: z.string().optional(),
});
