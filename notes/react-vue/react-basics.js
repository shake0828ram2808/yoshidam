// 連載「Vueエンジニアが学ぶReact」第2回(Vue とは比べず、React だけで ToDo アプリの土台を作る)
article({
  series: 'react-vue',
  slug: 'react-basics',
  title: 'React の基礎：最低限の構成と、必要に応じて足すもの',
  topics: ['react', 'typescript', 'vite'],
  blocks: [
    { type: 'lead', items: [
      '最低限は **`react`・`react-dom` と Vite** だけ。',
      '基本は **部品・JSX・props・state・イベント・条件とリスト・副作用** の7つ。',
      'ルーターや状態管理は、**必要になってから** 足す。',
    ] },

    { type: 'h', text: '最低限の構成' },
    { type: 'code', lang: 'sh', file: 'ターミナル', code: `
npm create vite@latest todo -- --template react-ts
cd todo
npm install
npm run dev` },
    { type: 'table', head: ['ファイル', '役割'], rows: [
      ['`index.html`', '入口。`<div id="root">` があるだけ'],
      ['`src/main.tsx`', '`#root` に React のアプリを描き始める'],
      ['`src/App.tsx`', 'いちばん外側の部品'],
    ] },
    { type: 'code', lang: 'tsx', file: 'src/main.tsx', code: `
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`, caption: '`StrictMode` は開発中だけ、問題のある書き方を見つけやすくする。' },

    { type: 'h', text: 'ToDo アプリの土台' },
    { type: 'p', text: '追加・完了・空のときの表示・残りの件数をタブに出す、だけの ToDo です。この1つに、基本の7つが全部入っています。' },
    { type: 'code', lang: 'tsx', file: 'src/App.tsx', code: `
import { useEffect, useState } from 'react'

type Todo = { id: number; title: string; done: boolean }

// 部品：JSX を返す関数。props は引数で受け取る
function TodoItem({ todo, onToggle }: { todo: Todo; onToggle: (id: number) => void }) {
  return (
    <li>
      <label>
        <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
        {todo.title}
      </label>
    </li>
  )
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const remaining = todos.filter(t => !t.done).length

  function addTodo() {
    if (!title.trim()) return
    setTodos([...todos, { id: Date.now(), title, done: false }])
    setTitle('')
  }

  function toggle(id: number) {
    setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  // 副作用：React の外(タブのタイトル)を、残りの件数に合わせる
  useEffect(() => {
    document.title = \`残り \${remaining} 件\`
  }, [remaining])

  return (
    <>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button onClick={addTodo}>追加</button>
      {todos.length === 0 ? (
        <p>やることはありません</p>
      ) : (
        <ul>
          {todos.map(todo => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggle} />
          ))}
        </ul>
      )}
    </>
  )
}` },

    { type: 'h', text: '基本の7つ' },
    { type: 'table', head: ['基本', '上のコードでは', 'ひとこと'], rows: [
      ['部品', '`TodoItem`・`App`', '大文字で始まる、JSX を返す関数'],
      ['JSX', '`return ( … )` の中', '`{ }` に式を書く。`className`・`onClick` のように書く'],
      ['props', '`{ todo, onToggle }`', '親から受け取る値。関数の引数'],
      ['state', '`useState`', '覚えておく値と、入れ替える関数の組'],
      ['イベント', '`onClick={addTodo}`', '関数を渡す'],
      ['条件とリスト', '三項演算子と `map`', 'ふつうの JavaScript。リストには `key`'],
      ['副作用', '`useEffect`', 'React の外とやりとりするときだけ使う'],
    ] },
    { type: 'pitfall', text: '`remaining` のように、ほかの state から計算できる値は `useEffect` で state にコピーしない。ふつうの式で計算する。' },

    { type: 'h', text: 'フックのルール' },
    { type: 'list', ordered: true, items: [
      '部品のいちばん上で呼ぶ(`if` や `for` の中で呼ばない)',
      '部品かカスタムフックの中でだけ呼ぶ',
    ] },
    { type: 'p', text: 'React は「何番目に呼ばれたフックか」で値を覚えているためです。' },

    { type: 'h', text: '必要に応じて足すもの' },
    { type: 'table', head: ['困りごと', 'まず標準で', '足す候補'], rows: [
      ['URL で画面を切り替えたい', '—', 'React Router、TanStack Router'],
      ['離れた部品で値を共有したい', 'props → Context', 'zustand、Redux Toolkit、Jotai'],
      ['サーバーのデータを取得・キャッシュしたい', '`useEffect` + `fetch`', 'TanStack Query、SWR'],
      ['フォームの入力と検証', '`useState`', 'React Hook Form + Zod'],
      ['見た目', 'CSS、CSS Modules', 'Tailwind CSS、UI 部品集'],
      ['アニメーション', 'CSS の transition', 'Motion'],
      ['テスト', '—', 'Vitest + Testing Library、Playwright'],
      ['SEO・初回表示', '—', 'Next.js、React Router'],
      ['スマホアプリ', '—', 'React Native / Expo、Capacitor'],
    ] },
    { type: 'point', text: '値の共有は **props → Context → ストア** の順に検討すると、入れすぎを防げます。' },
    { type: 'p', text: '次回から、この ToDo を Vue と書き比べます。' },
  ],
});
