

// let m: number, n: number, a: any[], l: any[], res: any[][];

import { Blocks } from "@/constants/blocks" with {type: 'macro'};

function solve(arr: number[][], num: number[]): { res: number[][][], incomplete: boolean } {
  const res: number[][][] = [];
  const m = arr.length;
  const n = arr[0].length;
  const a = arr.map((row) => [...row]);
  const l = [...num];
  const incomplete = dfs(0, m, n, a, l, res);
  return {
    res,
    incomplete,
  }
}

function canPlaceBlock(x: number, y: number, b: number, d: number, m: number, n: number, a: number[][]) {
  const pat = Blocks[b][d];
  let offset = 0;
  while (!pat[0][offset]) ++offset;
  y -= offset;
  if (y < 0) return false;
  for (let i = 0; i < pat.length; ++i) {
    for (let j = 0; j < pat[0].length; ++j) {
      if (pat[i][j] && (x + i >= m || y + j >= n || a[x + i][y + j] !== -1))
        return false;
    }
  }
  return true;
}

function placeBlock(x: number, y: number, b: number, d: number, v: number, a: number[][]) {
  const pat = Blocks[b][d];
  let offset = 0;
  while (!pat[0][offset]) ++offset;
  y -= offset;
  for (let i = 0; i < pat.length; ++i) {
    for (let j = 0; j < pat[0].length; ++j) {
      if (pat[i][j]) a[x + i][y + j] = v;
    }
  }
}

const MAX_DFS = 1e5;

function dfs(p: number, m: number, n: number, a: number[][], l: number[], res: number[][][]) {
  if (p === m * n) {
    const x = a.slice(0, m).map(x => x.slice());
    res.push(x);
    if (res.length >= MAX_DFS) {
      // alert("方案数太多，仅计算前一万种。减少一些方块吧~");
      return true;
    }
    return false;
  }
  const x = Math.floor(p / n),
    y = p % n;
  if (a[x][y] !== -1) {
    if (dfs(p + 1, m, n, a, l, res)) return true;
    return false;
  }
  for (let b = 0; b < Blocks.length; ++b) {
    if (!l[b]) continue;
    for (let d = 0; d < Blocks[b].length; ++d) {
      if (!canPlaceBlock(x, y, b, d, m, n, a)) continue;
      placeBlock(x, y, b, d, b + 1, a);
      --l[b];
      if (dfs(p + 1, m, n, a, l, res)) return true;
      ++l[b];
      placeBlock(x, y, b, d, -1, a);
    }
  }
  return false;
}

onmessage = function (e) {
    const { arr, num } = e.data;
    const res = solve(arr, num);
    postMessage(res);
}
