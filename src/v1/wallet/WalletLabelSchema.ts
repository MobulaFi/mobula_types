import { z } from 'zod';
import { WalletMetadataOutput } from '../../utils/schemas/WalletMetadataOutput.ts';

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
          fromWalletMetadata: WalletMetadataOutput.nullable().optional(),
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

// Reverse search: find wallets by entity name / type / label
export const WalletLabelsSearchParamsSchema = z.object({
  entityName: z.string().optional(),
  entityType: z.string().optional(),
  label: z.string().optional(),
  offset: z.coerce.number().min(0).optional().default(0),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export type WalletLabelsSearchParams = z.input<typeof WalletLabelsSearchParamsSchema>;

export const WalletLabelsSearchResponseSchema = z.object({
  data: WalletLabelsResponseSchema.shape.data,
  pagination: z.object({
    total: z.number(),
    offset: z.number(),
    limit: z.number(),
  }),
});

export type WalletLabelsSearchResponse = z.infer<typeof WalletLabelsSearchResponseSchema>;
