// 連載「Vue エンジニアが学ぶ React」はじめに
article({
  series: 'react-vue',
  slug: 'intro',
  title: '比べる理由、8個の観点',
  topics: ['react', 'vue', 'typescript'],
  blocks: [
    { type: 'lead', label: 'この連載について', items: [
      '業務で Vue.js を使っている自分が、React を **Vue と比べながら** 学んでいく記録です。',
      '毎回、小さな ToDo アプリを少しずつ育てながら、**同じことを両方で書き比べ** ます。',
    ] },

    { type: 'h', text: 'なぜ比べるのか' },
    { type: 'p', text: 'React と Vue の違いを聞かれて、うまく説明できなかったことがきっかけです。' },
    { type: 'p', text: '理解が深い(はずの)Vue と比べることで、腑に落ちながら学習を深め、アウトプットまでできることを目指します。' },

    { type: 'h', text: '前提' },
    { type: 'list', items: [
      'Vue 3 の Composition API(`<script setup>`)',
      'React 19 の関数コンポーネントとフック',
      'どちらも TypeScript',
    ] },

    { type: 'h', text: '比べる8個の観点' },
    { type: 'table', head: ['観点', 'Vue', 'React'], rows: [
      ['1. 画面の更新', '値の書き換えを検知して更新', '部品の関数をもう一度実行'],
      ['2. 部品の書き方', 'テンプレート(`v-if` / `v-for`)', 'JSX(`&&` / `map`)'],
      ['3. 状態', '`ref`(書き換える)', '`useState`(入れ替える)'],
      ['4. 計算した値と副作用', '`computed` / `watch`', '`useMemo` / `useEffect`'],
      ['5. 親子のやりとり', 'props / emit / `v-model`', 'props / コールバック'],
      ['6. 共有とストア', '`provide` / `inject`、Pinia', 'Context、zustand など'],
      ['7. ロジックの再利用', 'コンポーザブル', 'カスタムフック'],
      ['8. 周辺の道具', 'Vue Router、Nuxt', 'React Router、Next.js'],
    ] },
    { type: 'point', text: '土台は1つ目の「画面の更新」です。ここが分かると、残りの違いはそこから説明できます。' },

    { type: 'h', text: '進め方' },
    { type: 'list', items: [
      '**第1回**：Vue と React の概要(生まれ・バージョン・使われ方)',
      '**第2回**：React だけの基礎。ToDo アプリの土台を作る',
      '**第3回から**：観点ごとに、ToDo アプリを Vue と React で書き比べる。「結論 → コード(Vue / React) → 違いのポイント → 注意点」の流れにする',
    ] },

    { type: 'h', text: '連載の目次' },
    { type: 'toc' },
  ],
});
