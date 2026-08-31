interface WeightedRange {
  range: [number, number];
  weight: number;
}

export function floatRandomizer(ranges: WeightedRange[]): number {
  if (!ranges || ranges.length === 0) {
    throw new Error('Ranges array cannot be empty');
  }

  // 1. Calculate total weight sum across all ranges
  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);

  if (totalWeight <= 0) {
    throw new Error('Total weight must be greater than 0');
  }

  // 2. Pick a random threshold between 0 and totalWeight
  let randomWeight = Math.random() * totalWeight;

  // 3. Find which range was selected
  let selectedRange: [number, number] = ranges[0].range;

  for (const item of ranges) {
    if (randomWeight < item.weight) {
      selectedRange = item.range;
      break;
    }
    randomWeight -= item.weight;
  }

  // 4. Generate random float inside the selected range [min, max]
  const [min, max] = selectedRange;
  return Math.random() * (max - min) + min;
}
