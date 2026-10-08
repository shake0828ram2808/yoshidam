// 連載「Vue エンジニアが学ぶ React」第1回(Vue で作るアプリの設計)
article({
  series: 'react-vue',
  slug: 'checklist-design',
  title: 'Vue で作る「おかえりチェック」：設計',
  topics: ['vue', 'typescript', 'design'],
  blocks: [
    { type: 'lead', items: [
      '小学生の子どもが、帰ってからの「やること」を **自分でチェックできる** アプリを作る。',
      'まずは Vue で作る。今回は、作る前の **設計**(要件・画面・データ・部品・状態)。',
      '次回 Vue で実装し、そのあと同じものを React で作って比べる。',
    ] },

    { type: 'h', text: '作るもの' },
    { type: 'p', text: '子どもが学校から帰ったあと、手洗いや宿題がなかなか始まらず、毎日の声かけがしんどい。' },
    { type: 'p', text: '声をかける代わりに、子どもが **自分で見て、自分でチェックできる** リストを作ります。' },

    { type: 'h', text: '要件' },
    { type: 'table', head: ['フェーズ', '内容'], rows: [
      ['1(必須)', 'きょうのやることを一覧で見られる'],
      ['1(必須)', 'タップでチェック。もう一度タップで外す'],
      ['1(必須)', '日付が変わったら、チェックが外れる'],
      ['1(必須)', 'やることを親が追加・削除・並べ替えできる'],
      ['2(必須・あとで)', '全部できたら、ほめる表示'],
      ['2(必須・あとで)', '再読み込みしても消えない(端末に保存)'],
      ['3(あったら便利)', '複数の子ども・ごほうびポイント・履歴・時間の通知'],
    ] },
    { type: 'point', text: 'まずフェーズ1を作り、2、3と育てていく。フェーズ3の機能は、Vue と React の違い(状態管理など)を比べる題材にする。' },

    { type: 'h', text: '画面' },
    { type: 'table', head: ['画面', '使う人', '内容'], rows: [
      ['きょうのやること', '子ども', 'やることの一覧・チェック・進み具合・全部できたらほめる'],
      ['やることの編集', '親', '追加・削除・並べ替え'],
    ] },
    { type: 'p', text: '子どもが使う画面は、次のようにします。' },
    { type: 'list', items: [
      '文字はひらがな。絵文字で、何のことか一目で分かるように(🧼 てを あらう)',
      'ボタンは、指で押しやすい大きさ',
      '進み具合は「3 / 5」とバーで見せる',
    ] },

    { type: 'h', text: 'データ' },
    { type: 'code', lang: 'ts', file: 'src/types.ts', code: `
// やること(親が編集する。毎日同じ)
export type Task = {
  id: string
  title: string // 'てを あらう'
  icon: string  // '🧼'
}

// その日の記録(日付が変わったら作り直す)
export type DailyRecord = {
  date: string      // '2026-10-08'
  doneIds: string[] // チェックした Task の id
}` },
    { type: 'point', text: '「やること」と「その日の記録」を分ける。チェックを `Task` の中に持たせないので、日付が変わっても `Task` はそのまま、記録だけ作り直せばよい。' },
    { type: 'table', head: ['保存するもの', 'localStorage のキー'], rows: [
      ['やることの一覧(`Task[]`)', '`okaeri:tasks`'],
      ['きょうの記録(`DailyRecord`)', '`okaeri:record`'],
    ] },

    { type: 'h', text: 'フォルダと部品の分け方' },
    { type: 'p', text: '画面(`views/`)と部品(`components/`)を分け、部品はさらに「どこでも使える小さな UI 部品」と「この機能の部品」の2つに分けます。' },
    { type: 'code', lang: 'text', file: 'src', code: `
src/
├─ App.vue                … 画面の切り替え(きょう / へんしゅう)
├─ views/                 … 画面
│  ├─ TodayView.vue       … きょうのやること(子ども)
│  └─ EditView.vue        … やることの編集(親)
├─ components/
│  ├─ ui/                 … どこでも使える小さな部品(見た目だけ)
│  │  ├─ BaseButton.vue
│  │  ├─ BaseCheck.vue    … 大きなチェック
│  │  └─ ProgressBar.vue  … バーと「3 / 5」
│  └─ checklist/          … この機能の部品
│     ├─ TaskList.vue
│     ├─ TaskItem.vue     … 1件(絵文字・名前・チェック)
│     ├─ TaskEditRow.vue  … 1件の編集(名前・絵文字・削除・並べ替え)
│     └─ DoneMessage.vue  … 全部できたら
├─ composables/
│  └─ useChecklist.ts     … 状態と操作
└─ types.ts` },
    { type: 'table', head: ['フォルダ', '入れるもの', '決まりごと'], rows: [
      ['`views/`', '画面', '状態を受け取り、部品を並べる。あとでルーターを入れても、そのまま使える'],
      ['`components/ui/`', '小さな UI 部品', '見た目だけ。ToDo のことは知らない。名前は `Base` で始める(Vue 公式スタイルガイド)'],
      ['`components/checklist/`', '機能の部品', 'やること(`Task`)を扱う。`ui/` の部品を組み合わせて作る'],
      ['`composables/`', '状態と操作', 'App で1回だけ呼び、画面には props とイベントでつなぐ'],
    ] },
    { type: 'point', text: 'アトミックデザイン(atoms → molecules → organisms → templates → pages)の考え方を、軽くしたものです。小さなアプリで5層に分けると「どの層か」で迷いやすいので、`ui/`(atoms に近い)と機能の部品の2層にしています。' },

    { type: 'h', text: '状態の置き場所' },
    { type: 'p', text: '状態と操作は、コンポーザブル `useChecklist()` に1つにまとめます。**App で1回だけ呼び**、各画面には props で渡し、操作はイベントで受け取ります。' },
    { type: 'code', lang: 'ts', file: 'src/composables/useChecklist.ts(形だけ。中身は次回)', code: `
export function useChecklist() {
  const tasks = ref<Task[]>(load('okaeri:tasks', DEFAULT_TASKS))
  const record = ref<DailyRecord>(load('okaeri:record', newRecord()))

  // 今あるやることだけで数える(消したやることの id が残っていてもずれない)
  const doneCount = computed(() =>
    tasks.value.filter(t => record.value.doneIds.includes(t.id)).length)
  const allDone = computed(() =>
    tasks.value.length > 0 && doneCount.value === tasks.value.length)

  function toggle(id: string) { /* チェックを付ける・外す */ }
  function resetIfNewDay() { /* 日付が変わっていたら記録を作り直す */ }
  function addTask(title: string, icon: string) { /* 追加 */ }
  function removeTask(id: string) { /* 削除 */ }
  function moveTask(id: string, dir: -1 | 1) { /* 並べ替え */ }

  watch([tasks, record], save, { deep: true }) // 変わったら保存

  return { tasks, record, doneCount, allDone, toggle, resetIfNewDay, addTask, removeTask, moveTask }
}` },
    { type: 'p', text: '日付のリセットは、アプリを開いたときと、画面に戻ってきたとき(`visibilitychange`)に、記録の日付と今日を比べて行います。' },

    { type: 'h', text: '技術の構成' },
    { type: 'table', head: ['', '使うもの', '理由'], rows: [
      ['土台', 'Vue 3 + Vite + TypeScript', '—'],
      ['保存', 'localStorage', '端末の中だけで足りる'],
      ['ルーター', '使わない', '画面が2つだけ。`ref` で切り替える'],
      ['Pinia', '使わない', '状態は `useChecklist()` の1か所で足りる'],
    ] },

    { type: 'h', text: '注意点' },
    { type: 'pitfall', items: [
      '`useChecklist()` を画面ごとに呼ぶと、呼んだ数だけ状態が別々にできてしまう。App で1回だけ呼ぶ。',
      '消したやることの id が記録に残ると、数がずれる。数えるときは、今あるやることで絞る。',
      '今日の日付を `toISOString()` で作ると UTC になり、日本では朝9時前が前日扱いになる。ローカルの日付で作る。',
    ] },

    { type: 'p', text: '次回は、この設計どおりに Vue で実装します。' },
  ],
});
