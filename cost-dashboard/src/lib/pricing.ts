/**
 * Published list prices used where a vendor's API reports usage but not dollars.
 * Checked October 2026 against each vendor's pricing page; update here when they change.
 */
export const PRICES = {
  neon: {
    // Launch plan (pay per use, no minimum)
    cuHour: 0.106,
    storageGbMonth: 0.35,
    restoreGbMonth: 0.2,
    extraBranchMonth: 1.5,
    // Assumption: Neon's public-transfer allowance and overage rate; confirm on the invoice.
    transferIncludedGb: 100,
    transferPerGb: 0.1,
  },
  cloudflare: {
    workersPaidFee: 5,
    workersIncludedRequests: 10_000_000,
    workersPerMillionRequests: 0.3,
    r2StorageGbMonth: 0.015,
    r2IncludedGb: 10,
    r2ClassAPerMillion: 4.5,
    r2IncludedClassA: 1_000_000,
    r2ClassBPerMillion: 0.36,
    r2IncludedClassB: 10_000_000,
    imagesStoragePer100k: 5,
  },
  elevenlabs: {
    // Pay-as-you-go API rates per 1,000 characters
    v4Per1k: 0.08,
    v4TurboPer1k: 0.04,
  },
} as const;
