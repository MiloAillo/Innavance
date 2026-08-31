import { randomInt } from 'crypto';

export const generateAccountId = (): string => {
  // Generates a cryptographically secure random 12 digit integer
  return randomInt(100_000_000_000, 1_000_000_000_000).toString();
};
