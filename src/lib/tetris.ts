function parseMatrix(matrix: string[][], fill: number): number[][] {
  return matrix.map((row) => row.map((col) => (col === "x" ? fill : 0)));
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("parseMatrix", () => {
    expect(
      parseMatrix(
        [
          ["x", "x", "x"],
          ["x", "x", " "],
        ],
        2
      )
    ).toEqual([
      [2, 2, 2],
      [2, 2, 0],
    ]);
  });
}

function rotateMatrix(matrix: number[][]): number[][] {
  const rowLen = matrix.length;
  const colLen = matrix[0].length;
  const rotatedMatrix: number[][] = Array.from({ length: colLen }, () =>
    Array(rowLen).fill(0)
  );

  for (let i = 0; i < rowLen; i++) {
    for (let j = 0; j < colLen; j++) {
      rotatedMatrix[j][rowLen - 1 - i] = matrix[i][j];
    }
  }

  return rotatedMatrix;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("rotateMatrix", () => {
    expect(
      rotateMatrix([
        [1, 2],
        [3, 4],
      ])
    ).toEqual([
      [3, 1],
      [4, 2],
    ]);

    expect(
      rotateMatrix([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual([
      [4, 1],
      [5, 2],
      [6, 3],
    ]);

    expect(
      rotateMatrix([
        [4, 1],
        [5, 2],
        [6, 3],
      ])
    ).toEqual([
      [6, 5, 4],
      [3, 2, 1],
    ]);
  });
}

function hashMatrix(matrix: number[][]): string {
  return matrix.map((row) => row.join("")).join("n");
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("hashMatrix", () => {
    expect(
      hashMatrix([
        [1, 2],
        [3, 4],
      ])
    ).toBe("12n34");

    expect(
      hashMatrix([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toBe("123n456");

    expect(
      hashMatrix([
        [0, 3],
        [3, 3],
        [3, 0],
      ])
    ).toBe("03n33n30");
  });
}

export function parseAndCalculatePermutions(
  block: string,
  fill: number
): number[][][] {
  const matrix = block.split("\n").map((line) => line.split(""));
  const allPermution = [];
  const allHash = new Set<string>();
  let orig = parseMatrix(matrix, fill);
  allPermution.push(orig);
  const origHash = hashMatrix(orig);
  allHash.add(origHash);

  for (let i = 0; i < 3; i++) {
    const rotated = rotateMatrix(orig);
    const hash = hashMatrix(rotated);
    if (!allHash.has(hash)) {
      allPermution.push(rotated);
      allHash.add(hash);
    }
    orig = rotated;
  }

  return allPermution;
}


if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("parseAndCalculatePermutions", () => {
    expect(parseAndCalculatePermutions(" x \nxxx\n x ", 2)).toEqual([
      [
        [0, 2, 0],
        [2, 2, 2],
        [0, 2, 0],
      ],
    ]);

    expect(parseAndCalculatePermutions("xx \n xx", 3)).toEqual([
      [
        [3, 3, 0],
        [0, 3, 3],
      ],
      [
        [0, 3],
        [3, 3],
        [3, 0],
      ],
    ]);
  });
}
