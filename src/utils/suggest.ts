function normalize(input: string): string {
  return (input || "").toLowerCase().trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return dp[n];
}

export function getSuggestions(
  query: string,
  candidates: string[],
  limit: number = 5,
): string[] {
  const q = normalize(query);
  const list = candidates.map((name) => {
    const nl = normalize(name);
    const distance = levenshtein(q, nl);
    const starts = nl.startsWith(q) ? 1 : 0;
    const includes = nl.includes(q) ? 1 : 0;
    const score = distance - starts - includes * 0.5;
    return { name, score, distance, nl };
  });

  const threshold = q.length <= 3 ? 1 : q.length <= 6 ? 2 : 3;
  return list
    .filter((x) => x.nl.includes(q) || x.distance <= threshold)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.name);
}
