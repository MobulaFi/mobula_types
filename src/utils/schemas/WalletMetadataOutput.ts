import { z } from 'zod';

/**
 * Wallet metadata from scraping_wallets table
 * Contains entity information about the wallet (e.g., CEX, LP, known project)
 */
export const WalletMetadataOutput = z.object({
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
});

export type WalletMetadataOutput = z.infer<typeof WalletMetadataOutput>;
