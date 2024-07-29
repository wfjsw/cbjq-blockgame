import { parseAndCalculatePermutions } from "@/lib/tetris";

const rawBlocks = [
    "xx\nxx",
    "xxxx",
    "xx \n xx",
    " xx\nxx ",
    "x  \nxxx",
    "xxx\nx  ",
    " x \nxxx",
    " x \nxxx\n x ",
    "x",
    "xx",
    "xx\nx ",
]

export const BlockColor = [
  "white",
  "#75C0FF",
  "#3B66CF",
  "#78ACC5",
  "#C8FAFD",
  "#FDFF00",
  "#4BFF00",
  "#FF9800",
  "#B9B24B",
  "#FF00AE",
  "#8A2BE2",
  "#FF00FF",
];


export const Blocks = rawBlocks.map((b, i) => parseAndCalculatePermutions(b, i + 1));
export const BlockLen = rawBlocks.map(b => b.split('').filter(c => c === 'x').length);
export const TotalBlockNum = rawBlocks.length;
