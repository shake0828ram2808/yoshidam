# ポートフォリオサイト

GitHub Pagesでそのまま公開できる静的サイトです。

## 公開方法

1. GitHubで新しいリポジトリを作成(例:`yourname.github.io`、または好きなリポジトリ名)
2. このフォルダの中身(index.html, styles.css, script.js, assets/)をリポジトリ直下にアップロード
3. GitHubの Settings → Pages で公開設定
   - リポジトリ名を `yourname.github.io` にした場合:特に設定不要でそのまま公開されます
   - 別名のリポジトリの場合:Settings → Pages で「Branch: main / (root)」を選択して Save

## 差し替えが必要な場所(index.html内にコメント有り)

- `#about` の自己紹介文・経歴タイムライン(ダミーです)
- `#skills` のスキル一覧(ダミーです)
- `#works` のnote記事リンク(`href="#"` のまま)
- `#certifications` の資格情報(ダミーです)
- `#notes` のnote記事リンク・タイトル
- 個人開発アプリ(Claude Codeで作った学習アプリ)のリンク

## 今後の追加でやると良いこと

- 「ねむひつじ」の男の子(青いスカーフ)バージョンの画像を用意し、
  `assets/images/` に追加後、`script.js` 内の `nemuSources.blue` のパスを差し替える
- 「だんごむし」「ピコ」のCharactersセクションは現在アイコン(絵文字)で仮置きしているので、
  実際のキャラクターイラストがあれば `index.html` の該当箇所を画像に差し替えるとより魅力的になります
- Works / Notes セクションのリンク先をnote公開後のURLに差し替える
