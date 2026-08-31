interface BooleanWeights {
  true: number;
  false: number;
}

export function booleanRandomizer(weights: BooleanWeights): boolean {
  const totalWeight = weights.true + weights.false;

  if (totalWeight <= 0) {
    throw new Error('Total weight must be greater than 0');
  }

  // Pick a random float between 0 and totalWeight
  return Math.random() * totalWeight < weights.true;
}
