// 連載「Vue エンジニアが学ぶ React」第1回
article({
  series: 'react-vue',
  slug: 'overview',
  title: 'Vue と React の概要：生まれ・バージョン・使われ方',
  topics: ['react', 'vue', 'frontend'],
  blocks: [
    { type: 'lead', items: [
      'React は **UI を作るライブラリ**。本体は小さく、周りの道具は自分で選ぶ。',
      'Vue は **段階的に導入できるフレームワーク**。ルーターや状態管理まで公式でそろう。',
      '利用者の数は React が大きく上回る。',
    ] },

    { type: 'h', text: 'ひと目で比べる' },
    { type: 'table', head: ['', 'React', 'Vue'], rows: [
      ['位置づけ', 'UI を作るライブラリ', '段階的に導入できるフレームワーク'],
      ['生まれ', 'Facebook(現 Meta)', 'Evan You さんの個人プロジェクト'],
      ['運営', 'Meta 発。2025年に React Foundation(Linux Foundation のもと)へ移すと発表', 'Evan You さんとコミュニティ(スポンサーの支援)'],
      ['部品の書き方', 'JSX', '単一ファイルコンポーネント(`.vue`)とテンプレート'],
      ['公式でそろうもの', '本体(`react` / `react-dom`)のみ', 'Vue Router・Pinia・開発ツール'],
      ['フルスタック', 'Next.js、React Router', 'Nuxt'],
      ['ネイティブアプリ', 'React Native', '公式なし'],
    ] },

    { type: 'h', text: '歩み' },
    { type: 'table', head: ['年', 'React', 'Vue'], rows: [
      ['2013', '公開', '—'],
      ['2014', '—', '公開'],
      ['2016', '15', 'Vue 2'],
      ['2017', '16(内部を作り直した Fiber)', '—'],
      ['2019', '16.8 で **フック** が登場', '—'],
      ['2020', '17', '**Vue 3**(Composition API)。Vite も登場'],
      ['2022', '18(並行レンダリング)', 'Vue 3 が標準に'],
      ['2023', '公式ドキュメントが react.dev に', 'Vue 2 のサポート終了'],
      ['2024', '**19**', '3.5'],
      ['2025', 'React Compiler 1.0。Create React App が非推奨に', 'Vapor モード(仮想 DOM を使わない方式)を開発中'],
    ] },
    { type: 'pitfall', label: '調べるときの注意', text: 'どちらも書き方が大きく変わっています(React はクラス → 関数とフック、Vue は Options API → Composition API)。古い記事に注意。' },

    { type: 'h', text: '2026年時点のバージョンと始め方' },
    { type: 'table', head: ['', 'React', 'Vue'], rows: [
      ['バージョン', '19 系', '3 系'],
      ['始め方', 'Vite か、Next.js などのフレームワーク', '`npm create vue@latest`(Vite ベース)'],
    ] },

    { type: 'h', text: '使われ方' },
    { type: 'list', items: [
      '利用者・求人・ライブラリの数は、React が大きく上回る。',
      '**React**：大規模なサービス、Next.js のサイト、React Native でスマホアプリも作るとき。',
      '**Vue**：既存のページに少しずつ組み込むとき、HTML に近い書き方で学びやすくしたいとき。',
    ] },
    { type: 'point', text: 'React は **自由に組み合わせる**、Vue は **公式の道をそろえる**。この違いが、この先の回にも出てきます。' },
  ],
});
