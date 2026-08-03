import { randomInt } from 'crypto';

export const generateRoomPin = (): number => {
  // Generates a cryptographically secure random 6 digit integer
  return randomInt(100_000, 1_000_000)
}