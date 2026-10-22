/**
 * Official Server-Verified Credit Packages & Rules
 * This configuration acts as the single source of truth for credit pricing,
 * verified checkout bundles, and compute usage costs.
 */

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUsd: number;
  description: string;
  badge?: string;
  popular?: boolean;
}

export const CREDIT_PACKAGES: Record<string, CreditPackage> = {
  starter: {
    id: "starter",
    name: "Starter Bundle",
    credits: 1000,
    priceUsd: 10,
    badge: "Popular",
    description: "Ideal for light inference & testing",
  },
  growth: {
    id: "growth",
    name: "Growth Bundle",
    credits: 5000,
    priceUsd: 45,
    badge: "Best Value",
    popular: true,
    description: "Best for active teams & enrichment",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Pack",
    credits: 25000,
    priceUsd: 190,
    badge: "Scale",
    description: "High-volume pipelines & batch jobs",
  },
};

export const CREDIT_COSTS = {
  INFERENCE_BASE: 25,
  ENRICHMENT_LIVE: 100,
  ENRICHMENT_PREVIEW: 0,
} as const;

/**
 * Validates a client purchase request against official server packages.
 * Returns the verified package or null if invalid.
 */
export function verifyCreditPackage(packageId: string): CreditPackage | null {
  return CREDIT_PACKAGES[packageId] || null;
}
