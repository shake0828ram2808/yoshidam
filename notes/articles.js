// =========================================================
// 技術記事の一覧
//  - 記事を足すときは、ここに1件足して、<slug>.html と <slug>.js を作る
//  - planned: true の記事は「準備中」として目次にだけ出る(リンクにしない)
// =========================================================
window.NOTES = {
  series: [
    {
      id: 'react-vue',
      title: 'Vueエンジニアが学ぶReact',
      description: '業務で使っている Vue.js と比べながら、React の考え方を1つずつ整理する連載。小さな ToDo アプリを両方で書き比べます。',
    },
  ],
  articles: [
    { series: 'react-vue', no: 0, slug: '00-intro', title: 'はじめに：比べて学ぶ理由と、8つの観点', date: '2026-10-07' },
    { series: 'react-vue', no: 1, slug: '01-reactivity', title: '画面の更新の仕組み：リアクティブと再実行', date: '2026-10-07' },
    { series: 'react-vue', no: 2, slug: '02-template-jsx', title: 'テンプレートと JSX：条件分岐とリスト', planned: true },
    { series: 'react-vue', no: 3, slug: '03-state', title: 'ref と useState：書き換えるか、入れ替えるか', planned: true },
    { series: 'react-vue', no: 4, slug: '04-derived-effects', title: 'computed・watch と useMemo・useEffect', planned: true },
    { series: 'react-vue', no: 5, slug: '05-props-events', title: '親子のやりとり：emit とコールバック、v-model と制御コンポーネント', planned: true },
    { series: 'react-vue', no: 6, slug: '06-provide-context', title: 'provide・inject と Context', planned: true },
    { series: 'react-vue', no: 7, slug: '07-store', title: 'Pinia と zustand', planned: true },
    { series: 'react-vue', no: 8, slug: '08-composables-hooks', title: 'コンポーザブルとカスタムフック', planned: true },
    { series: 'react-vue', no: 9, slug: '09-performance', title: '性能の考え方：自動で追跡するか、自分で止めるか', planned: true },
    { series: 'react-vue', no: 10, slug: '10-summary', title: 'まとめ：同じ ToDo アプリを両方で', planned: true },
  ],
};
