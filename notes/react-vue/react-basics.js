// 連載「Vueエンジニアが学ぶReact」第2回(Vue とは比べず、React だけを整理する回)
article({
  series: 'react-vue',
  slug: 'react-basics',
  title: 'React の基礎：最低限の構成と、必要に応じて足すもの',
  topics: ['react', 'typescript', 'vite'],
  blocks: [
    { type: 'lead', items: [
      '最低限必要なのは **`react` と `react-dom`** の2つと、ビルドツール(Vite)だけ。',
      '覚える基本は **部品(関数)・JSX・props・state・イベント・リスト・副作用** の7つ。',
      'ルーター・状態管理・データ取得などは、**必要になってから** 足す。最初から全部入れない。',
    ] },

    { type: 'h', text: '最低限の構成' },
    { type: 'p', text: 'Vite で、React と TypeScript のひな形を作ります。' },
    { type: 'code', lang: 'sh', file: 'ターミナル', code: `
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev` },
    { type: 'p', text: 'できあがるファイルのうち、大事なのは次の4つです。' },
    { type: 'table', head: ['ファイル', '役割'], rows: [
      ['`index.html`', '入口の HTML。`<div id="root">` が1つあるだけ'],
      ['`src/main.tsx`', '`#root` に React のアプリを描き始める'],
      ['`src/App.tsx`', 'いちばん外側の部品。ここから画面を組み立てる'],
      ['`package.json`', '本体は `react` と `react-dom`。開発用に `vite`・`typescript`・`@vitejs/plugin-react` など'],
    ] },
    { type: 'code', lang: 'tsx', file: 'src/main.tsx', code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`, caption: '`StrictMode` は開発中だけ、問題のある書き方を見つけやすくする仕組み(本番の動きは変わらない)。' },

    { type: 'h', text: '覚える基本は7つ' },
    { type: 'h3', text: '1. 部品は「JSX を返す関数」' },
    { type: 'p', text: '部品(コンポーネント)は、大文字で始まる関数です。返した JSX が画面になります。' },
    { type: 'h3', text: '2. JSX：JavaScript の中に、HTML のように書く' },
    { type: 'list', items: [
      '`{ }` の中には JavaScript の式を書ける(`{count}`、`{user.name}` など)。',
      '`class` ではなく `className`、イベントは `onClick` のようにキャメルケース。',
      '返せるのは1つの要素だけ。複数並べたいときは `<>…</>`(フラグメント)で囲む。',
    ] },
    { type: 'h3', text: '3. props：親から受け取る値' },
    { type: 'h3', text: '4. state：部品が覚えておく値(`useState`)' },
    { type: 'h3', text: '5. イベント：関数を渡す' },
    { type: 'p', text: 'ここまでの5つを、1つのコードで見てみます。' },
    { type: 'code', lang: 'tsx', file: 'src/App.tsx', code: `
import { useState } from 'react'

// 3. props は関数の引数として受け取る(型も書ける)
function Greeting({ name }: { name: string }) {
  return <p>こんにちは、{name} さん</p>
}

export default function App() {
  // 4. state。値と、値を入れ替える関数の組
  const [count, setCount] = useState(0)

  return (
    <>
      <Greeting name="よしだ" />
      {/* 5. イベントには関数を渡す */}
      <button onClick={() => setCount(count + 1)}>
        {count} 回押した
      </button>
    </>
  )
}` },

    { type: 'h3', text: '6. 条件とリスト：ふつうの JavaScript で書く' },
    { type: 'p', text: '専用の書き方はなく、`&&`・三項演算子・`map` を使います。リストの各要素には、何番目かではなく **その要素を表す `key`** を付けます。' },
    { type: 'code', lang: 'tsx', file: 'TodoList.tsx', code: `
type Todo = { id: number; title: string; done: boolean }

export function TodoList({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) return <p>やることはありません</p>

  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.title}
          {todo.done && ' ✓'}
        </li>
      ))}
    </ul>
  )
}` },

    { type: 'h3', text: '7. 副作用：React の外とやりとりする(`useEffect`)' },
    { type: 'p', text: 'タイトルの書き換え、タイマー、外部のライブラリとの接続など、**画面を作ること以外の処理** は `useEffect` に書きます。後片付けの関数を返すと、部品が消えるときや次に実行される前に呼ばれます。' },
    { type: 'code', lang: 'tsx', file: 'Timer.tsx', code: `
import { useEffect, useState } from 'react'

export function Timer() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id) // 後片付け
  }, []) // [] = 最初に1回だけ

  return <p>{seconds} 秒</p>
}` },
    { type: 'pitfall', text: '`useEffect` は「値が変わったら何かする」ための万能の道具ではありません。ほかの state から計算できる値は、`useEffect` で state にコピーせず、そのまま式で計算します。`useEffect` を使うのは、React の外の世界と同期するときだけ、と覚えておくと迷いません。' },

    { type: 'h', text: 'フックのルール' },
    { type: 'p', text: '`use` で始まる関数(フック)には、守るルールが2つあります。' },
    { type: 'list', ordered: true, items: [
      '**部品のいちばん上で呼ぶ**。`if` や `for` の中、途中の `return` のあとでは呼ばない。',
      '**部品か、カスタムフックの中でだけ呼ぶ**。ふつうの関数の中では呼ばない。',
    ] },
    { type: 'p', text: 'React は「何番目に呼ばれたフックか」で state を覚えているので、呼ぶ順番が描画のたびに変わると、値が取り違えられてしまいます。' },

    { type: 'h', text: '必要に応じて足すもの' },
    { type: 'p', text: 'React の本体には、画面を作る機能しかありません。次のものは、困ったときに足します。' },
    { type: 'table', head: ['困りごと', 'まず標準でできること', '足す候補'], rows: [
      ['画面を URL で切り替えたい', '—', 'React Router、TanStack Router'],
      ['離れた部品で値を共有したい', 'props で渡す → Context', 'zustand、Redux Toolkit、Jotai'],
      ['サーバーのデータを取得・キャッシュしたい', '`useEffect` + `fetch`', 'TanStack Query、SWR'],
      ['入力フォームが多く、検証もしたい', '`useState` で1つずつ', 'React Hook Form + Zod'],
      ['見た目を整えたい', 'ふつうの CSS、CSS Modules', 'Tailwind CSS、UI 部品集(MUI、shadcn/ui など)'],
      ['アニメーションをつけたい', 'CSS の transition / animation', 'Motion'],
      ['テストを書きたい', '—', 'Vitest + Testing Library、Playwright'],
      ['SEO・初回表示を速くしたい', '—', 'Next.js、React Router(フレームワークとして使う形)'],
      ['スマホアプリにしたい', '—', 'React Native / Expo、Capacitor(Web をそのまま包む)'],
    ] },
    { type: 'point', text: '共有したい値が出てきたら、まずは **props で渡す → 深くなったら Context → 頻繁に変わるならストア(zustand など)** の順に検討すると、入れすぎを防げます。' },

    { type: 'h', text: '自分のアプリでは' },
    { type: 'mine', items: [
      '**ひつじの頭痛手帳**：React 19 + Vite + TypeScript。足したのは、Tailwind CSS(見た目)、Motion(アニメーション)、Vitest + Testing Library(テスト)、Capacitor(iOS アプリ化)。共有は Context。',
      '**AWS学習カレンダー**：React 19 + Vite + TypeScript。足したのは、Tailwind CSS、zustand(状態管理と保存)、date-fns(日付)、Recharts(グラフ)。',
      'どちらも画面の切り替えは少ないので、ルーターは入れていません。',
    ] },

    { type: 'h', text: 'まとめ' },
    { type: 'list', items: [
      '最低限は `react`・`react-dom` と Vite。部品は「JSX を返す関数」。',
      '基本は、部品・JSX・props・state・イベント・リスト・副作用の7つ。',
      'それ以外は、困ったときに足す。標準でできることから試す。',
    ] },
    { type: 'p', text: '次回から、いよいよ Vue と書き比べます。最初は、いちばん大事な「画面の更新の仕組み」です。' },
  ],
});
