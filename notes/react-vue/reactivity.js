// 連載「Vueエンジニアが学ぶReact」第3回
article({
  series: 'react-vue',
  slug: 'reactivity',
  title: '画面の更新の仕組み：リアクティブと再実行',
  topics: ['react', 'vue', 'typescript'],
  blocks: [
    { type: 'lead', items: [
      'Vue の `<script setup>` は **最初に1回だけ** 実行され、値を書き換えると、それを使う描画がやり直される。',
      'React の部品は **描画のたびに関数ごと実行** される。state を入れ替えると、関数が呼び直される。',
      'React の関数の中の値は、その回の **スナップショット**。',
    ] },

    { type: 'h', text: 'ToDo を追加する' },
    { type: 'p', text: '入力して追加し、件数を出すところまでを書き比べます。' },
    { type: 'compare',
      vue: { file: 'TodoApp.vue', code: `
<script setup lang="ts">
import { ref, computed } from 'vue'

type Todo = { id: number; title: string; done: boolean }

const todos = ref<Todo[]>([])
const title = ref('')
const remaining = computed(() => todos.value.filter(t => !t.done).length)

function addTodo() {
  if (!title.value.trim()) return
  todos.value.push({ id: Date.now(), title: title.value, done: false })
  title.value = ''
}
</script>

<template>
  <input v-model="title" />
  <button @click="addTodo">追加</button>
  <p>残り {{ remaining }} 件</p>
</template>` },
      react: { file: 'TodoApp.tsx', code: `
import { useState } from 'react'

type Todo = { id: number; title: string; done: boolean }

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const remaining = todos.filter(t => !t.done).length

  function addTodo() {
    if (!title.trim()) return
    setTodos([...todos, { id: Date.now(), title, done: false }])
    setTitle('')
  }

  return (
    <>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={addTodo}>追加</button>
      <p>残り {remaining} 件</p>
    </>
  )
}` },
    },

    { type: 'h', text: '違いのポイント' },
    { type: 'table', head: ['', 'Vue', 'React'], rows: [
      ['部品のコードが動く回数', '最初の1回', '描画のたびに毎回'],
      ['値の変え方', '`todos.value.push(…)`(書き換える)', '`setTodos([...todos, …])`(入れ替える)'],
      ['更新のきっかけ', '書き換えを Vue が検知', 'set 関数の呼び出し'],
      ['計算した値', '`computed`', 'ふつうの式'],
    ] },
    { type: 'p', text: 'React で `remaining` に `computed` が要らないのは、関数が毎回実行されるので、ふつうの式でも常に最新になるからです。配列を入れ替える書き方は第5回で詳しく扱います。' },

    { type: 'h', text: 'ハマりどころ' },
    { type: 'pitfall', label: '① 2件続けて足すと、1件しか増えない', text: '`todos` はその回のスナップショットなので、2回目も追加前の配列から作り直してしまいます。前の値をもとにするときは、関数で渡します。',
      code: { lang: 'tsx', file: 'React', code: `
function addSamples() {
  setTodos([...todos, a])
  setTodos([...todos, b]) // a が消えて、b だけになる
}

function addSamplesFixed() {
  setTodos(prev => [...prev, a])
  setTodos(prev => [...prev, b]) // a も b も入る
}` } },
    { type: 'p', text: 'Vue では `todos.value.push(a)` と `push(b)` を続けて書けば、そのまま2件入ります。' },

    { type: 'pitfall', label: '② 連番の id が、描画のたびに 1 に戻る', text: '部品の中の `let` は、関数が呼び直されるたびに初期値に戻ります。描画をまたいで覚えておく値は `useRef` に入れます。',
      code: { lang: 'tsx', file: 'React', code: `
export function TodoApp() {
  let nextId = 1 // 描画のたびに 1 に戻り、id がかぶる
  const nextIdRef = useRef(1) // 描画をまたいで残る(変えても再描画しない)

  function addTodo() {
    const id = nextIdRef.current++
    // …
  }
}` } },
    { type: 'p', text: 'Vue の `<script setup>` は1回しか動かないので、`let nextId = 1` のままで大丈夫です。' },

    { type: 'h', text: 'まとめ' },
    { type: 'list', items: [
      'Vue は「準備は1回、変わった所だけやり直す」。React は「描画のたびに関数を丸ごと実行」。',
      '前の値から計算するときは `setTodos(prev => …)`。',
      '描画をまたいで覚えておく値(画面に出さないもの)は `useRef`。',
    ] },
    { type: 'p', text: '次回は、ToDo の一覧を表示しながら、テンプレートと JSX を比べます。' },
  ],
});
