export function solve(arr: number[][], num: number[]): Promise<{ res: number[][][], incomplete: boolean }> {
  const worker = new Worker(new URL('./calc.worker.ts', import.meta.url), { type: 'module' });

  return new Promise((resolve) => {
    worker.onmessage = (e) => {
      worker.terminate();
      resolve(e.data);
    };
    worker.postMessage({ arr, num });
  });
}
