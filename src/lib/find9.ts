function find9ChooseSub(
  arr: number[],
  size: number,
  result: number[],
  allResult: number[][]
) {
  const arrLen = arr.length;
  if (size > arrLen) {
    return;
  }

  if (size === arrLen) {
    allResult.push([...result, ...arr]);
    return;
  }

  for (let i = 0; i < arrLen; i++) {
    const newResult = [...result, arr[i]];
    if (size === 1) {
      allResult.push(newResult);
    } else {
      find9ChooseSub(arr.slice(i + 1), size - 1, newResult, allResult);
    }
  }
}

function find9Choose(arr: number[], size: number) {
  const allResult: number[][] = [];
  find9ChooseSub(arr, size, [], allResult);
  return allResult;
}

const MAX_ALL_PATH_ARR = 1000;

/**
 * 进行递归凑数查找9号碎片的函数
 * @param {*} nowRecycleNum 可回收的num数组
 * @param {*} pathArr 记录了回收结果的数组，也相当于是递归路径
 * @param {*} layer 递归层数
 */
function recursionFind(
  nowRecycleNum: number[],
  pathArr: number[][],
  layer: number,
  allPathArr: number[][][],
  chooseResult: number[][]
) {
  // 如果回收方案超过1000种，就停止递归，否则会太容易因计算量过大而卡死崩溃
  if (allPathArr.length > MAX_ALL_PATH_ARR) {
    return;
  }

  layer++;
  const okResultList = chooseResult.filter((result) =>
    result.every((index) => nowRecycleNum[index] > 0)
  );

  console.log("这层的所有方案数量", layer, okResultList.length);

  if (okResultList.length == 0) {
    // 这层已经找不到方案了，因此return结束此层递归
    return;
  }
  
  // 这层仍有方案，则记录在allPathArr里面
  for (const thisPath of okResultList) {
    allPathArr.push([...pathArr, thisPath]);
  }

  for (const okResult of okResultList) { 
    const nRN = [...nowRecycleNum];
    okResult.forEach((index) => {
      nRN[index]--;
    });

    const pa = [...pathArr, okResult];
    recursionFind(nRN, pa, layer, allPathArr, chooseResult);
  }
}

// 返回所有9号断片的回收方案
export function find9All(recycledNum: number[]) {
  const num = [...recycledNum];
  const allPathArr: number[][][] = [];

  // 计算组合数 C(9,5) 结果应该是固定的126种可能
  const chooseResult = find9Choose(
    Array.from({ length: 9 }, (_, k) => k),
    5
  );

  recursionFind(num, [], 0, allPathArr, chooseResult);
  return allPathArr;
}

// 返回能够回收到的最多的9号断片的回收方案
export function find9Max(recycledNum: number[]) {
  const allPathArr = find9All(recycledNum);
  return allPathArr.reduce((max, path) => {
    return path.length > max.length ? path : max;
  }, []);
}
