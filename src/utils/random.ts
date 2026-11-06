/** Deterministic pseudo-random number generator (Mulberry32) used to build reproducible mock data. */
export function createRandom(seed: number) {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => Math.floor(next() * (max - min + 1)) + min;
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(next() * items.length)];
  const chance = (probability: number): boolean => next() < probability;
  const sample = <T,>(items: readonly T[], count: number): T[] => {
    const pool = [...items];
    const result: T[] = [];
    while (result.length < count && pool.length > 0) {
      result.push(pool.splice(Math.floor(next() * pool.length), 1)[0]);
    }
    return result;
  };

  return { next, int, pick, chance, sample };
}

export type Random = ReturnType<typeof createRandom>;
