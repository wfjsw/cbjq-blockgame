import { expect, expectTypeOf, test } from 'vitest'
import { BlockLen, Blocks } from './blocks';



test('blockLen matches blocks', () => {
  // test case from https://github.com/halozhy/cbjq/blob/b297de3bd3abfdcfb1a2d4366b3ee94f438069aa/index.html#L604
  const expectedStart = [4, 4, 4, 4, 4, 4, 4, 5, 1, 2, 3]
  expectTypeOf(BlockLen).toEqualTypeOf<number[]>();
  expect(BlockLen).toHaveLength(Blocks.length);
  expect(BlockLen).toSatisfy((calc: number[]) => {
    return calc.slice(0, 11).every((v, i) => v === expectedStart[i]);
  });
});
