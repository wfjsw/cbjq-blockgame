<script setup lang="ts">
import { computed, ref, shallowRef, toRaw, watch } from "vue";
import { solve } from "@/lib/calc";
import { find9All, find9Max } from "@/lib/find9";
import { BlockColor, BlockLen, TotalBlockNum } from "./constants/blocks" with {type: 'macro'};
import { filter } from "./lib/filter";

const row = ref(5);
const col = ref(6);
const board = ref<number[][]>([]);

const totalNum = TotalBlockNum;

const num = ref<number[]>(Array.from({ length: totalNum }, () => 0));
// const numBackup = ref(Array.from({ length: totalNum }, () => 0));
const solBackup = ref(Array.from({ length: totalNum }, () => 0));
const recycledNum = ref(Array.from({ length: totalNum }, () => 0));
const recycledComponents = ref<number[][]>([]);
const recycledComponentsBackup = ref<number[][]>([]);
const selected = ref<(number[] | null)[]>(
  Array.from({ length: totalNum }, () => null)
);
const res = shallowRef<number[][][] | null>(null);
const selectResult = shallowRef<number[][][] | null>(null);
const now = ref(0);
// const cache = ref(false);
// const canCloseCacheHelpDialog = ref(true);

const decreaseButtonDisabled = ref(false);
const resetDecreaseButtonDisabled = ref(true);

const resetRecycleButtonDisabled = computed(() => recycledNum.value.some(v => v > 0));

const sol = computed(() => selectResult.value && selectResult.value[now.value]);

const color = BlockColor;

function confirmBoard() {
  board.value = [];
  for (let i = 0; i < row.value; i++) {
    board.value[i] = Array.from({ length: col.value }, () => -1);
  }
}

function tuneBox(i: number, j: number) {
  board.value[i][j] = board.value[i][j] === -1 ? 0 : -1;
}

async function performFilter() {
  const resolution = res.value?.slice();
  const requiredSelection = selected.value?.slice();
  const numList = num.value?.slice();
  
  if (!resolution) {
    return;
  }

  const requiredIds = requiredSelection
    .map((v, i) => (v ? i + 1 : -1))
    .filter((v) => v > -1);

  const preferredIds = Array.from(numList.entries())
    .map(([i, c]) => [i + 1, c]).sort((a, b) => b[1] - a[1])
    .map(([i, _]) => i).filter(i => i !== 9);

  const result = await filter(toRaw(resolution), toRaw(requiredIds), toRaw(preferredIds));

  selectResult.value = result;
}

watch(selected, performFilter, {deep: true});

async function calc() {
  const numCloned = toRaw(num.value);
  numCloned[8] += recycledComponents.value.length;
  res.value = await solve(board.value, numCloned);
  now.value = 0;
  performFilter();
  if (res.value.length > 0) {
    solBackup.value = [];
    recycledComponentsBackup.value = [];
    decreaseButtonDisabled.value = false;
    resetDecreaseButtonDisabled.value = true;
  }
}

async function calcFull() {
  // 一键回收并计算
  // 先尝试不回收，直接计算，如果能出结果就不进行回收
  // 如果不能出结果，计算出所有的9号回收方案，依次尝试，直到出结果为止
  // 如果均尝试过了，但没结果，则认为无解

  // 先尝试不回收，直接计算，若有结果，直接return结束
  await calc();

  if (selectResult.value && selectResult.value.length > 0) {
    return;
  }

  const allPathArr = find9All(num.value);

  for (const onePath of allPathArr) {
    for (const one9 of onePath) {
      for (const index of one9) {
        num.value[index]--;
        recycledNum.value[index]++;
      }

      const one9ForView = one9.map((v) => v + 1);
      recycledComponents.value = [...recycledComponents.value.slice(), one9ForView];
    }

    // 执行calc计算，看看有没有结果
    await calc();

    if (selectResult.value && selectResult.value.length > 0) {
      // 有结果了，return结束
      return;
    }

    // 无结果，恢复num，recycleNum，recycledComponents
    for (const one9 of onePath) {
      for (const index of one9) {
        num.value[index]++;
        recycledNum.value[index]--;
      }

      recycledComponents.value = [];
    }
  }
}

// 撤销所有回收
function resetRecycle() {
  for (const [index, value] of recycledNum.value.entries()) {
    if (value > 0) {
      num.value[index] += value;
      recycledNum.value[index] = 0;
    }
  }

  recycledComponents.value = [];
}


// 对index号方块进行回收
function recycle(index: number) {
  if (num.value[index] > 0) {
    num.value[index]--;
    recycledNum.value[index]++;
  }
  calcAfterRecycle();
}

// 对index号方块取消回收
function cancelRecycle(index: number) {
  if (recycledNum.value[index] > 0) {
    num.value[index]++;
    recycledNum.value[index]--;
  }
  calcAfterRecycle();
}

function calcAfterRecycle() {
  // 算出回收区中能凑出的最大9号数量方案maxPathArr
  const maxPathArr = find9Max(recycledNum.value);
  // 制作this.recycledComponents，目的是将各个9号碎片的回收组成显示出来
  recycledComponents.value = maxPathArr.map(path => path.map(v => v + 1));
}

// function changeCacheHelpDialogVisible(...args: unknown[]) {
//   console.log("changeCacheHelpDialogVisible not implemented");
// }

// function saveData() {
//   console.log("saveData not implemented");
// }

// function changeCacheState(param: boolean) {
//   console.log("changeCacheState not implemented");
// }

// 按照当前方案扣除对应方块
function decreaseBlock() {
  // arr[index] 代表第index号方块占的格子数，这个是固定值
  const arr = BlockLen;
  // arr_num[index] 代表当前方案下，第index号方块的所占的格子的个数
  const arr_num = arr.map(_ => 0);

  if (!sol.value) {
    return;
  }

  for (const element of sol.value) {
    for (const e of element) {
      arr_num[e - 1]++;
    }
  }

  // sol_num[index] 代表当前方案下，第index号方块的个数
  const sol_num = arr_num.map((v, i) => v / arr[i]);

  for (let i = 0; i < totalNum; i++) {
    const solOneNum = sol_num[i];
    let myOneNum = num.value[i];
    if (i + 1 === 9) {
      myOneNum += recycledComponents.value.length;
    }

    if (myOneNum < solOneNum) {
      alert(`目前的方块 ${i+1} 个数为 ${myOneNum}，小于此方案要求的 ${solOneNum} 个，无法执行扣除`)
      return;
    }
  }

  solBackup.value = [...sol_num];

  // 遍历sol_num，得到当前方案下，每个方块的数量，并对num数组执行减去操作
  for (let i = 0; i < totalNum; i++) {
    const oneNum = sol_num[i];
    if (num.value[i] > 0) {
      if (i + 1 === 9 && num.value[i] < oneNum) {
        // 如果是9号方块，而且自己的9号少于需要的9号
        // 说明自己填入的9号数量不够，为了不被减法减为负数，直
        num.value[i] = 0;
        // 也说明此时需要备份 recycledComponents 回收方案数组
        // 当前的recycledComponents数组备份到recycledComponentsBackup里面
        recycledComponentsBackup.value = recycledComponents.value.slice();
        // 按照recycledComponents数组，扣除回收区recycledNum里的内容
        for (const componentArr of recycledComponents.value) {
          for (const component of componentArr) {
            // 数组里面读出来的index是用于显示的，已经加过1了，此处要减1再用
            recycledNum.value[component - 1] > 0 && recycledNum.value[component - 1]--;
          }
        }

        // 清空recycledComponents数组
        recycledComponents.value = [];
      } else {
        num.value[i] -= oneNum;
        recycledComponentsBackup.value = [];
      }
    }
  }

  decreaseButtonDisabled.value = true;
  resetDecreaseButtonDisabled.value = false;
}

// 撤销此次方块扣除
function resetBlock() {
  // 根据solBackup恢复num，用户输入区
  for (let i = 0; i < num.value.length; i++) {
    if (i + 1 === 9 && recycledComponentsBackup.value.length > 0) {
      // 如果是9号方块，而且的备份回收方案数组大于0
      // 说明之前用户填入的9号数量是不够的，不能简单粗暴直接把结果需要的9号数量都加回到num上面
      // 而是先算出用户之前填入的9号数量，这个数量 = 结果中需要的9号数量 - 回收得到的9号数量

      const user9Num = solBackup.value[i] - recycledComponentsBackup.value.length;

      // 之后把用户填入的9号数量加回到num数组上

      num.value[i] += user9Num;

      // 也说明此时需要恢复 recycledComponents 回收方案数组和 recycledNum 回收区
      // 根据this.recycledComponentsBackup恢复回收方案数组recycledComponents

      recycledComponents.value = [...recycledComponents.value.slice(), ...recycledComponentsBackup.value.slice()];

      // 根据this.recycledComponentsBackup恢复回收区recycledNum

      for (const componentArr of recycledComponentsBackup.value) {
        for (const componentIdx of componentArr) {
          recycledNum.value[componentIdx - 1]++;
        }
      }
    } else {
      num.value[i] += solBackup.value[i];
    }
  }

  decreaseButtonDisabled.value = false;
  resetDecreaseButtonDisabled.value = true;
}
</script>

<template>
  <div class="p-5 flex flex-col gap-4 items-center">
    <div class="flex flex-row flex-wrap gap-4">
      <div>
        原作者：
        <a
          href="https://space.bilibili.com/277401945"
          target="_blank"
          rel="noopener"
          >Bilibili 方形的块状代码</a
        >,
        <a
          href="https://github.com/CmdBlockZQG/cbjq"
          target="_blank"
          rel="noopener"
          >CmdBlockZQG/cbjq</a
        >
      </div>
      <div>
        修改：
        <a
          href="https://space.bilibili.com/3461574379441117"
          target="_blank"
          rel="noopener"
          >Bilibili 届不到的光晕</a
        >,
        <a href="https://github.com/halozhy/cbjq" target="_blank" rel="noopener"
          >halozhy/cbjq</a
        >
      </div>
      <div>
        此分支：
        <a
          href="https://github.com/wfjsw/cbjq-blockgame"
          target="_blank"
          rel="noopener"
          >wfjsw/cbjq-blockgame</a
        >
      </div>
    </div>
    <div>
      <!-- <input type="button" value="更新日志" @click="confirmBoard"> -->
      <!-- <button v-if="cache" @click="changeCacheState(false)">缓存状态：开</button>
    <button v-else @click="changeCacheState(true)">缓存状态：关</button>
    <button
      style="margin-left: 5px"
      @click="changeCacheHelpDialogVisible(true)"
    >
      ❓
    </button> -->

      <!-- <dialog id="cacheHelpDialog" ref="cacheHelpDialog">
      <div id="cacheHelpDialogDiv" style="padding: -20px">
        <p>【测试性功能】</p>
        <p>
          遇到 bug 可以带上出错的情况于
          <a href="https://github.com/halozhy/cbjq" target="_blank"
            >GitHub 分支仓库</a
          >
          或
          <a href="https://www.bilibili.com/video/BV1hp4y1j75k/" target="_blank"
            >BV1hp4y1j75k</a
          >
          反馈
        </p>
        <hr />
        <p>（点击缓存状态按钮即可改变缓存状态）</p>
        <p>
          缓存状态为“开”时，当页面刷新，关闭或可见性被改变后，程序会将<b>页面数据</b>保存在浏览器的
          LocalStorage 中
        </p>
        <p>
          <b
            >页面数据主要包含：格子行列数据，各个方块个数，回收个数，但不包含计算得到的方案</b
          >（因为方案种类可能很多，以至于 LocalStorage 存不下）
        </p>
        <p>如果需要清除缓存数据，请将缓存状态改为“关”，即可清除</p>
      </div>
      <div style="text-align: center">
        <button @click="changeCacheHelpDialogVisible(false)">确认</button>
      </div>
    </dialog> -->
    </div>
    <div class="flex flex-row flex-wrap justify-center gap-6">
      <div>
        行数：<input
          type="number"
          pattern="\d*"
          v-model="row"
          class="border-2 p-2 max-md:max-w-16"
        />
      </div>
      <div>
        列数：<input
          type="number"
          pattern="\d*"
          v-model="col"
          class="border-2 p-2 max-md:max-w-16"
        />
      </div>
    </div>
    <button
      @click="confirmBoard"
      class="bg-slate-200 px-12 py-3 rounded-md shadow-md"
    >
      确定
    </button>
    <p>红色表示需要摆放的格子，白色表示这里没有格子，点击切换</p>
    <div class="flex flex-col">
      <div v-for="(r, i) in board" class="flex flex-row">
        <div
          class="box"
          v-for="(c, j) in r"
          @click="tuneBox(i, j)"
          :style="{ 'background-color': c === 0 ? 'white' : '#ff8888' }"
        ></div>
      </div>
    </div>

    <div v-if="board.length" class="flex flex-col gap-4 max-md:text-md">
      <div class="input-table">
        <table>
          <tr>
            <th></th>
            <th>
              <div>必选</div>
            </th>
            <th>
              <div>回收</div>
            </th>
            <th>
              <div>回收个数</div>
            </th>
            <th>
              <div>取消回收</div>
            </th>
          </tr>
          <tr v-for="(_, i) in num">
            <td>
              <div class="flex w-full">
                <div class="w-24 max-md:w-16">方块 {{ i + 1 }}: </div>
                <div v-if="i + 1 === 9">
                  {{ num[i] + recycledComponents.length }} =
                  <input
                    type="number"
                    pattern="\d*"
                    v-model.number="num[i]"
                    class="border-2 px-2 max-w-32 max-md:max-w-10"
                  />
                  + {{ recycledComponents.length }}
                </div>
                <div v-else>
                  <input
                    type="number"
                    pattern="\d*"
                    v-model.number="num[i]"
                    class="border-2 px-2 w-full max-w-32 max-md:max-w-14"
                  />
                </div>
              </div>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                v-model="selected[i]"
                :title="'信源 ' + (i + 1) + ' 必选'"
                class="mx-2"
              />
            </td>
            <td class="text-center">
              <button type="button" @click="recycle(i)">🗑️+1</button>
            </td>
            <td class="text-center">
              {{ recycledNum[i] }}
            </td>
            <td class="text-center">
              <button type="button" @click="cancelRecycle(i)">🗑️-1</button>
            </td>
          </tr>
        </table>
      </div>
      <div
        style="
          margin-top: 5px;
          margin-bottom: 5px;
          margin-right: 10px;
          border: dashed 2px;
          border-radius: 10px;
          padding: 5px;
        "
      >
        <div style="font-size: medium">
          方块9个数 = 用户输入 {{ num[8] }} + 回收得到
          {{ recycledComponents.length }} <br />
        </div>
        <div style="margin-top: 7px; margin-bottom: 5px">回收的方块9构成：</div>
        <div v-for="(_, i) in recycledComponents">
          <div
            style="display: inline-block"
            v-for="(v2, _) in recycledComponents[i]"
          >
            方块 {{ v2 }},&nbsp;
          </div>
          <br />
          <hr />
        </div>
      </div>

      <!-- <div
          style="margin-top: 5px; 
          margin-bottom: 5px; 
          margin-right: 10px; 
          border: dashed 2px; 
          border-radius: 10px; 
          padding: 5px;
          ">
            <p>【2023-09-24注】目前对于方块 10 和 11 的支持仅经过了简单测试</p>
            <p>如果遇到关于方块 10 和 11 的 bug 可以带上出错的情况给我的 <a href="https://github.com/halozhy/cbjq">GitHub 分支仓库</a> 提 Issue</p>
            <p>（或者在 <a href="https://www.bilibili.com/video/BV1hp4y1j75k/">BV1hp4y1j75k</a> 这个视频下面评论区带上出错的情况留言）</p>
          </div> -->

      <div class="flex flex-row justify-between max-md:text-md">
        <div class="flex flex-row gap-4">
          <button
            class="bg-blue-200 px-4 py-1 rounded-md shadow-md"
            @click="calc"
          >
            计算完美方案
          </button>
          <!-- <input type="button" value="按照此结果扣除对应方块" @click="calcFull" style="margin-left: 10px;" > -->
          <button
            class="bg-slate-200 px-4 py-1 rounded-md shadow-md"
            @click="calcFull"
          >
            一键回收并计算
          </button>
        </div>

        <div>
          <button
            class="bg-red-200 px-4 py-1 rounded-md shadow-md"
            :disabled="resetRecycleButtonDisabled"
            @click="resetRecycle"
          >
            撤销所有回收
          </button>
        </div>
      </div>
    </div>
    <div v-if="res !== null" class="flex flex-col gap-2 justify-center">
      <p>方案数：{{ res.length }}</p>
      <p>方案数(过滤后)：{{ selectResult?.length ?? 0 }} / {{ res.length }}</p>
    </div>
    <div
      v-if="res && res.length > 0"
      class="flex flex-col gap-4 justify-center"
    >
      <p>当前展示方案：{{ now + 1 }} / {{ res.length }}</p>
      <p>
        当前展示方案(过滤后)：
        <input type="number" :value="now + 1" :min="1" :max="selectResult?.length ?? 0" @change="now = parseInt(($event?.target as HTMLInputElement)?.value) - 1" class="border-2 p-2 w-16" />
        / {{ selectResult?.length ?? 0 }}
      </p>
      <div class="flex flex-row justify-between">
        <button
          class="bg-slate-200 px-12 py-3 rounded-md shadow-md"
          @click="now > 0 && now--"
        >
          &lt;-
        </button>
        <button
          class="bg-slate-200 px-12 py-3 rounded-md shadow-md"
          @click="now < (selectResult?.length ?? 0) - 1 && now++"
        >
          -&gt;
        </button>
      </div>

      <div class="flex justify-center">
        <div class="flex flex-col">
          <div v-for="(r, i) in sol" class="flex flex-row">
            <div
              :key="i"
              class="box flex justify-center items-center"
              v-for="c in r"
              :style="{ 'background-color': color[c] }"
            >
              <div v-if="c > 0">{{ c }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-row gap-6">
        <button
          :disabled="decreaseButtonDisabled"
          @click="decreaseBlock"
          class="bg-blue-200 px-4 py-1 rounded-md shadow-md"
        >
          按照此结果扣除对应方块
        </button>
        <button
          :disabled="resetDecreaseButtonDisabled"
          @click="resetBlock"
          class="bg-red-200 px-4 py-1 rounded-md shadow-md"
        >
          撤销此次扣除
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
