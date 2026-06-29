/**
 * Fuzzy matching utility for command palette and search.
 * Scores items by character-sequence match quality.
 */

/** Returns a match score (higher is better), or 0 if no match */
export function fuzzyMatch(query: string, target: string): number {
  if (!query.trim()) return 1;

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  if (t.includes(q)) return 100 + (100 - t.indexOf(q));

  let score = 0;
  let queryIndex = 0;
  let consecutive = 0;

  for (let i = 0; i < t.length && queryIndex < q.length; i++) {
    if (t[i] === q[queryIndex]) {
      score += 1 + consecutive * 2;
      consecutive += 1;
      queryIndex += 1;
    } else {
      consecutive = 0;
    }
  }

  return queryIndex === q.length ? score : 0;
}

/** Sorts items by fuzzy match score against a query */
export function fuzzySort<T>(
  items: T[],
  query: string,
  getLabel: (item: T) => string
): T[] {
  if (!query.trim()) return items;

  return [...items]
    .map((item) => ({ item, score: fuzzyMatch(query, getLabel(item)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
