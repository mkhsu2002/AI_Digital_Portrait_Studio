export const fetchGenerationQuota = async (_uid: string) => ({
  generationCredits: Number.POSITIVE_INFINITY,
  totalGenerated: 0,
  totalShares: 0,
});

export const consumeGenerationCredit = async (_uid: string) => Number.POSITIVE_INFINITY;

export const rewardCreditForShare = async (_uid: string) => Number.POSITIVE_INFINITY;
