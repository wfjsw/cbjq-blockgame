function filter(
  result: number[][][],
  requiredIds: number[],
  preferredIds: number[]
) {
  const requiredIdsSet = new Set(requiredIds);

  const filtered =
    requiredIds.length > 0
      ? result.filter((solution) =>
          solution.some((r) => r.some((v) => requiredIdsSet.has(v)))
        )
      : result;

  if (preferredIds.length === 0) {
    return filtered;
  }

  const preferredIdsMap = new Map(
    preferredIds.map((id, index) => [id, preferredIds.length - index])
  );

  const sorted = filtered.sort((a, b) => {
    const aPreferred = a.reduce(
      (acc, row) =>
        acc + row.reduce((s, v) => s + (preferredIdsMap.get(v) || 0), 0),
      0
    );
    const bPreferred = b.reduce(
      (acc, row) =>
        acc + row.reduce((s, v) => s + (preferredIdsMap.get(v) || 0), 0),
      0
    );
    return bPreferred - aPreferred;
  });

  return sorted;
}

onmessage = (e) => {
    const { result, requiredIds, preferredIds } = e.data;
    postMessage(filter(result, requiredIds, preferredIds));
}
