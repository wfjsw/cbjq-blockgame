export function filter(
  result: number[][][],
  requiredIds: number[],
  preferredIds: number[]
): Promise<number[][][]> {
  const worker = new Worker(new URL("./filter.worker.ts", import.meta.url), {
    type: "module",
  });

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      worker.terminate();
      resolve(JSON.parse(e.data));
    };
    worker.postMessage(JSON.stringify({ result, requiredIds, preferredIds }));
  });
}
