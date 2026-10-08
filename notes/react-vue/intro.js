// 連載「Vue エンジニアが学ぶ React」はじめに
article({
  series: 'react-vue',
  slug: 'intro',
  title: '比べる理由と、Vue.js・React の概要',
  topics: ['react', 'vue', 'typescript'],
  blocks: [
    { type: 'lead', label: 'この連載について', items: [
      '業務で Vue.js を使っている自分が、React を **Vue と比べながら** 学んでいく記録です。',
      '毎回、小さな ToDo アプリを少しずつ育てながら、**同じことを両方で書き比べ** ます。',
    ] },

    { type: 'h', text: 'なぜ比べるのか' },
    { type: 'p', text: 'React と Vue の違いを聞かれて、うまく説明できなかったことがきっかけです。' },
    { type: 'p', text: '理解が深い(はずの)Vue と比べることで、腑に落ちながら学習を深め、アウトプットまでできることを目指します。' },

    { type: 'h', text: 'Vue.js と React って何' },
    { type: 'p', text: 'どちらも、Web の画面を **部品(コンポーネント)の組み合わせ** で作るための JavaScript の道具です。' },
    { type: 'table', head: ['', 'Vue.js', 'React'], rows: [
      ['位置づけ', '段階的に導入できるフレームワーク', 'UI を作るライブラリ'],
      ['生まれ', '2014年。Evan You さんの個人プロジェクト', '2013年。Facebook(現 Meta)'],
      ['運営', 'Evan You さんとコミュニティ(スポンサーの支援)', 'Meta 発。2025年に React Foundation(Linux Foundation のもと)へ移すと発表'],
      ['2026年時点', '3 系(Composition API)', '19 系(関数コンポーネントとフック)'],
      ['公式でそろうもの', 'ルーター(Vue Router)・状態管理(Pinia)・開発ツール', '本体(`react` / `react-dom`)のみ'],
    ] },
    { type: 'pitfall', label: '調べるときの注意', text: 'どちらも数年前に書き方が大きく変わっています(Vue は Options API → Composition API、React はクラス → 関数とフック)。古い記事に注意。' },

    { type: 'h', text: '何ができるか' },
    { type: 'table', head: ['作りたいもの', 'Vue.js', 'React'], rows: [
      ['画面の部品・SPA', '本体', '本体'],
      ['URL で画面を切り替える', 'Vue Router(公式)', 'React Router など'],
      ['アプリ全体の状態管理', 'Pinia(公式)', 'zustand、Redux Toolkit など'],
      ['サーバーで描く・SEO', 'Nuxt', 'Next.js'],
      ['スマホのネイティブアプリ', '公式なし(Capacitor などで Web を包む)', 'React Native'],
    ] },

    { type: 'h', text: '何が違うと言われているか' },
    { type: 'table', head: ['よく言われる違い', 'Vue.js', 'React'], rows: [
      ['画面の更新', '値を書き換えると、自動で追従する(リアクティブ)', '状態を入れ替えると、部品の関数をもう一度実行する'],
      ['書き方', 'HTML に近いテンプレート', 'JavaScript の中に書く JSX'],
      ['道具のそろえ方', '公式の道がそろっている', '自分で選んで組み合わせる'],
      ['学びやすさと自由度', '入りやすい', '自由度が高い'],
      ['使われている数', '—', '利用者・求人・ライブラリの数が多い'],
    ] },
    { type: 'p', text: 'この「言われている違い」が本当にそうなのか、ToDo アプリを作りながら確かめていきます。' },

    { type: 'h', text: '前提' },
    { type: 'list', items: [
      'Vue 3 の Composition API(`<script setup>`)',
      'React 19 の関数コンポーネントとフック',
      'どちらも TypeScript',
    ] },
  ],
});
