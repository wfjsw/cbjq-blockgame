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

  const sorted =
    preferredIds.length > 0
      ? filtered.sort((a, b) => {
          const aPreferred = a.reduce(
            (acc, row) =>
              acc +
              row
                .map((v) => preferredIds.length - preferredIds.indexOf(v))
                .reduce((s, c) => s + c, 0),
            0
          );
          const bPreferred = b.reduce(
            (acc, row) =>
              acc +
              row
                .map((v) => preferredIds.length - preferredIds.indexOf(v))
                .reduce((s, c) => s + c, 0),
            0
          );
          return bPreferred - aPreferred;
        })
      : filtered;
  return sorted;
}

onmessage = (e) => {
    const { result, requiredIds, preferredIds } = JSON.parse(e.data);
    postMessage(JSON.stringify(filter(result, requiredIds, preferredIds)));
}
