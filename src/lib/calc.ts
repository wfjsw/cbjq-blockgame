export function solve(arr: number[][], num: number[]): Promise<number[][][]> {
  const worker = new Worker(new URL('./calc.worker.ts', import.meta.url), { type: 'module' });

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      worker.terminate();
      resolve(JSON.parse(e.data));
    };
    worker.postMessage(JSON.stringify({ arr, num }));
  });
}
