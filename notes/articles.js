// =========================================================
// 技術記事の一覧
//  - 記事を足すときは、ここに1件足して、<slug>.html と <slug>.js を作る(slug に回の番号は入れない。順番は no で決める)
//  - planned: true の記事は「準備中」として目次にだけ出る(リンクにしない)
// =========================================================
window.NOTES = {
  series: [
    {
      id: 'react-vue',
      title: 'Vue エンジニアが学ぶ React',
      description: '業務で使っている Vue.js と比べながら、React の考え方を1つずつ整理する連載。小さな ToDo アプリを両方で書き比べます。',
    },
  ],
  articles: [
    { series: 'react-vue', no: 0, slug: 'intro', title: '比べる理由、8個の観点', date: '2026-10-07' },
    { series: 'react-vue', no: 1, slug: 'overview', title: 'Vue と React の概要：生まれ・バージョン・使われ方', date: '2026-10-07' },
    { series: 'react-vue', no: 2, slug: 'react-basics', title: 'React の基礎：最低限の構成と、必要に応じて足すもの', date: '2026-10-07' },
    { series: 'react-vue', no: 3, slug: 'reactivity', title: '画面の更新の仕組み：リアクティブと再実行', date: '2026-10-07' },
    { series: 'react-vue', no: 4, slug: 'template-jsx', title: 'テンプレートと JSX：条件分岐とリスト', planned: true },
    { series: 'react-vue', no: 5, slug: 'state', title: 'ref と useState：書き換えるか、入れ替えるか', planned: true },
    { series: 'react-vue', no: 6, slug: 'derived-effects', title: 'computed・watch と useMemo・useEffect', planned: true },
    { series: 'react-vue', no: 7, slug: 'props-events', title: '親子のやりとり：emit とコールバック、v-model と制御コンポーネント', planned: true },
    { series: 'react-vue', no: 8, slug: 'provide-context', title: 'provide・inject と Context', planned: true },
    { series: 'react-vue', no: 9, slug: 'store', title: 'Pinia と zustand', planned: true },
    { series: 'react-vue', no: 10, slug: 'composables-hooks', title: 'コンポーザブルとカスタムフック', planned: true },
    { series: 'react-vue', no: 11, slug: 'performance', title: '性能の考え方：自動で追跡するか、自分で止めるか', planned: true },
    { series: 'react-vue', no: 12, slug: 'summary', title: 'まとめ：同じ ToDo アプリを両方で', planned: true },
  ],
};
