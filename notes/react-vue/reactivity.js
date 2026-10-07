// 連載「Vueエンジニアが学ぶReact」第3回
article({
  series: 'react-vue',
  slug: 'reactivity',
  title: '画面の更新の仕組み：リアクティブと再実行',
  topics: ['react', 'vue', 'typescript'],
  blocks: [
    { type: 'lead', items: [
      'Vue の `<script setup>` は **最初に1回だけ** 実行され、`ref` の値を書き換えると、その値を使っている描画が自動でやり直される。',
      'React の部品は **描画のたびに関数ごともう一度実行** される。`setCount` で状態を入れ替えると、関数が呼び直されて新しい画面ができる。',
      'だから React では、関数の中の値はその回の **スナップショット**。Vue の感覚で書くと、ここでつまずく。',
    ] },

    { type: 'h', text: '同じカウンターを書き比べる' },
    { type: 'p', text: 'ボタンを押すと数が増え、その2倍も表示する、小さなカウンターです。' },
    { type: 'compare',
      vue: { file: 'Counter.vue', code: `
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

function increment() {
  count.value++ // 値を直接書き換える
}
</script>

<template>
  <button @click="increment">{{ count }} 回押した</button>
  <p>2倍: {{ double }}</p>
</template>` },
      react: { file: 'Counter.tsx', code: `
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  const double = count * 2 // 毎回計算し直すので、ふつうの式でよい

  function increment() {
    setCount(count + 1) // 新しい値に入れ替える
  }

  return (
    <>
      <button onClick={increment}>{count} 回押した</button>
      <p>2倍: {double}</p>
    </>
  )
}` },
      note: '見た目はよく似ていますが、「どこが何回実行されるか」がまったく違います。',
    },

    { type: 'h', text: '違いのポイント：どこが、何回実行されるか' },
    { type: 'h3', text: 'Vue：準備は1回、変わった所だけやり直す' },
    { type: 'list', ordered: true, items: [
      '部品ができたときに、`<script setup>` が **1回だけ** 実行される。',
      '`count.value++` で値を書き換えると、Vue は「`count` を読んでいた描画」を覚えているので、それだけをやり直す。',
      '`computed` も、`count` が変わったときだけ計算し直される。',
    ] },
    { type: 'h3', text: 'React：描画のたびに、関数を丸ごと実行し直す' },
    { type: 'list', ordered: true, items: [
      '描画のたびに、`Counter` という関数が **最初から最後まで** 実行される。',
      '`setCount(count + 1)` は「次の描画では、この値にして」という予約。予約されると、React が `Counter` をもう一度呼ぶ。',
      'できあがった画面と前回の画面を比べて、変わった所だけを実際の画面に反映する。',
    ] },
    { type: 'p', text: 'React で `double` に `computed` のようなものが要らないのは、関数が毎回実行されるので、ふつうの式でも常に最新の値になるからです。重い計算だけは `useMemo` で結果を使い回しますが、それは第6回で扱います。' },

    { type: 'table', head: ['', 'Vue', 'React'], rows: [
      ['部品のコードが実行される回数', '最初の1回(`<script setup>`)', '描画のたびに毎回'],
      ['値の変え方', '`count.value++`(書き換える)', '`setCount(count + 1)`(入れ替える)'],
      ['何が更新を起こすか', '値の書き換えを Vue が検知する', 'set 関数の呼び出し'],
      ['計算した値', '`computed`', 'ふつうの式(重いときは `useMemo`)'],
      ['値を読むとき', 'script では `.value`、テンプレートではそのまま', 'そのまま'],
    ] },

    { type: 'h', text: 'ハマりどころ' },
    { type: 'pitfall', label: 'ハマりどころ①：3回足しても1しか増えない', text: '`count` はその回の描画のときの値(スナップショット)です。同じ関数の中で何度 `setCount(count + 1)` を呼んでも、`count` は変わらないので、3回呼んでも結果は「0 + 1」が3回予約されるだけです。',
      code: { lang: 'tsx', file: 'React', code: `
function addThree() {
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1) // 3ではなく、1しか増えない
}

// 前の値をもとに計算するときは、関数で渡す
function addThreeFixed() {
  setCount(c => c + 1)
  setCount(c => c + 1)
  setCount(c => c + 1) // ちゃんと3増える
}` } },
    { type: 'p', text: 'Vue では `count.value++` を3回書けば、そのまま3増えます。値そのものを書き換えているからです(画面の更新は、Vue がまとめて1回にしてくれます)。' },

    { type: 'pitfall', label: 'ハマりどころ②：ふつうの変数は、描画のたびに戻る', text: 'React の部品の中で `let` を使って数を数えても、関数が呼び直されるたびに初期値に戻ります。画面に出さない値を覚えておきたいときは `useRef` を使います。',
      code: { lang: 'tsx', file: 'React', code: `
export function Counter() {
  let clicks = 0 // 描画のたびに 0 に戻ってしまう
  const clicksRef = useRef(0) // 描画をまたいで値が残る(変えても再描画はしない)
  // …
}` } },
    { type: 'p', text: 'Vue の `<script setup>` は1回しか実行されないので、`let` で書いた変数は部品がある間ずっと残ります(ただし、リアクティブではないので画面は更新されません)。同じ `let` でも、意味が逆になるのが面白いところです。' },

    { type: 'h', text: '自分のアプリでは' },
    { type: 'mine', text: '「ひつじの頭痛手帳」では、設定画面の開閉行(`ExpandRow`)で、ハマりどころ①の「関数で渡す」書き方をしています。今の値をもとに反転させるので、`!open` ではなく `v => !v` と書いています。',
      code: { lang: 'tsx', file: 'src/components/ExpandRow.tsx(抜粋)', code: `
const [open, setOpen] = useState(false)

<button
  aria-expanded={open}
  onClick={() => setOpen((v) => !v)}
>` } },

    { type: 'h', text: 'まとめ' },
    { type: 'list', items: [
      'Vue は「準備は1回、変わった所だけやり直す」。React は「描画のたびに関数を丸ごと実行し直す」。',
      'React の関数の中の値は、その回のスナップショット。前の値から計算するときは `setCount(c => c + 1)`。',
      '面接で聞かれたら：「Vue は値の変化を検知して更新し、React は状態を入れ替えると部品の関数を再実行して画面を作り直します」。',
    ] },
    { type: 'p', text: '次回は、テンプレートと JSX の違い(条件分岐とリスト)を、ToDo の一覧で比べます。' },
  ],
});
