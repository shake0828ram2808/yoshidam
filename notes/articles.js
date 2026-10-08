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
    { series: 'react-vue', no: 0, slug: 'intro', title: '比べる理由と、Vue.js・React の概要', date: '2026-10-08' },
    { series: 'react-vue', no: 1, slug: 'checklist-design', title: 'Vue で作る「おかえりチェック」：設計', date: '2026-10-08' },
    { series: 'react-vue', no: 2, slug: 'checklist-vue', title: 'Vue で作る「おかえりチェック」：実装', planned: true },
  ],
};
