// =========================================================
// 技術記事(notes/)の組み立て
//  - 記事の中身は「ブロックの並び」で書き、このファイルがHTMLにする
//  - 同じブロックから Markdown(Zenn 形式)も書き出せる → note / Zenn / Qiita へ移しやすい
//  - 外部ライブラリなし。file:// で開いても動く(fetch を使わず <script> で読み込む)
// =========================================================
(() => {
  const NOTES = window.NOTES || { series: [], articles: [] };
  // このファイルの置き場所(notes/)。どの階層のページからでも記事へのリンクを作れるようにする
  const BASE = new URL('.', document.currentScript.src);
  const PORTFOLIO = new URL('../', BASE);

  const LABELS = {
    lead: 'この回の結論',
    point: 'ポイント',
    pitfall: 'ハマりどころ',
    mine: '自分のアプリでは',
  };
  const LANG_NAMES = { vue: 'Vue', tsx: 'React(TSX)', jsx: 'React(JSX)', ts: 'TypeScript', js: 'JavaScript', html: 'HTML', css: 'CSS', sh: 'ターミナル' };

  // ---------- 文字の整形 ----------
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // 文中の `コード` と **太字** だけを使う(Markdown と同じ書き方なので、書き出すときはそのまま使える)
  function inline(text) {
    return String(text).split(/(`[^`]+`)/).map(part => {
      if (/^`[^`]+`$/.test(part)) return `<code>${esc(part.slice(1, -1))}</code>`;
      return esc(part).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    }).join('');
  }

  // ---------- コードの色分け(コメント・文字列・タグ・キーワード・APIの名前・数字) ----------
  const CODE_RE = new RegExp([
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)/.source,
    /('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)/.source,
    /(<\/?[A-Za-z][\w.:-]*)/.source,
    /\b(import|from|export|default|const|let|var|function|return|if|else|for|of|in|new|true|false|null|undefined|type|interface|as|async|await|lang|setup)\b/.source,
    /\b(ref|reactive|computed|watch|watchEffect|onMounted|onUnmounted|defineProps|defineEmits|defineModel|provide|inject|defineStore|useState|useEffect|useMemo|useCallback|useRef|useContext|createContext|memo)\b/.source,
    /\b(\d+(?:\.\d+)?)\b/.source,
  ].join('|'), 'g');
  function highlight(src) {
    let out = '', last = 0, m;
    CODE_RE.lastIndex = 0;
    while ((m = CODE_RE.exec(src))) {
      out += esc(src.slice(last, m.index));
      const cls = m[1] ? 'tok-c' : m[2] ? 'tok-s' : m[3] ? 'tok-t' : m[4] ? 'tok-k' : m[5] ? 'tok-f' : 'tok-n';
      out += `<span class="${cls}">${esc(m[0])}</span>`;
      last = CODE_RE.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  const tidy = code => String(code).replace(/^\n+|\s+$/g, '');

  function codeBlock({ lang = 'ts', file = '', code = '', caption = '' }, tag = '') {
    const head = `${tag}<span class="n-file">${esc(file || LANG_NAMES[lang] || lang)}</span>`;
    return `<figure class="n-code"><div class="n-code-head">${head}<button type="button" class="n-copy">コピー</button></div>`
      + `<pre><code>${highlight(tidy(code))}</code></pre>${caption ? `<figcaption>${inline(caption)}</figcaption>` : ''}</figure>`;
  }

  // ---------- 記事の一覧から、前後・目次を作る ----------
  const linkOf = a => new URL(`${a.series}/${a.slug}.html`, BASE).href;
  const seriesOf = id => NOTES.series.find(s => s.id === id) || { id, title: id };
  const articlesOf = id => NOTES.articles.filter(a => a.series === id).sort((a, b) => a.no - b.no);
  const noLabel = a => (a.no === 0 ? 'はじめに' : `第${a.no}回`);

  function tocHTML(seriesId, currentSlug) {
    return `<ol class="n-toc">${articlesOf(seriesId).map(a => {
      const body = `<span class="n-no">${noLabel(a)}</span><span>${esc(a.title)}</span>`;
      if (a.planned) return `<li><span class="is-planned">${body}</span></li>`;
      const cur = a.slug === currentSlug;
      return `<li><a href="${linkOf(a)}"${cur ? ' class="is-current" aria-current="page"' : ''}>${body}</a></li>`;
    }).join('')}</ol>`;
  }

  // ---------- ブロック → HTML ----------
  let headCount = 0;
  let compareCount = 0;
  const box = (kind, b) => `<aside class="n-box n-box--${kind}"><span class="n-box-label">${esc(b.label || LABELS[kind])}</span>`
    + `${b.text ? `<p>${inline(b.text)}</p>` : ''}${b.items ? `<ul>${b.items.map(i => `<li>${inline(i)}</li>`).join('')}</ul>` : ''}`
    + `${b.code ? codeBlock(b.code) : ''}</aside>`;

  const RENDER = {
    h: b => `<h2 id="s${++headCount}">${inline(b.text)}</h2>`,
    h3: b => `<h3>${inline(b.text)}</h3>`,
    p: b => `<p>${inline(b.text)}</p>`,
    list: b => {
      const t = b.ordered ? 'ol' : 'ul';
      return `<${t}>${b.items.map(i => `<li>${inline(i)}</li>`).join('')}</${t}>`;
    },
    lead: b => `<div class="n-lead"><span class="n-lead-label">${esc(b.label || LABELS.lead)}</span><ul>${b.items.map(i => `<li>${inline(i)}</li>`).join('')}</ul></div>`,
    point: b => box('point', b),
    pitfall: b => box('pitfall', b),
    mine: b => box('mine', b),
    code: b => codeBlock(b),
    table: b => `<div class="n-table-wrap"><table class="n-table"><thead><tr>${b.head.map(h => `<th scope="col">${inline(h)}</th>`).join('')}</tr></thead>`
      + `<tbody>${b.rows.map(r => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`,
    compare: b => {
      const id = `cmp${++compareCount}`;
      return `<div class="n-compare" data-compare>`
        + `<div class="n-compare-tabs" role="tablist" aria-label="Vue と React を切り替える">`
        + `<button type="button" role="tab" data-side="vue" id="${id}-tv" aria-controls="${id}-vue" aria-selected="true">Vue</button>`
        + `<button type="button" role="tab" data-side="react" id="${id}-tr" aria-controls="${id}-react" aria-selected="false" tabindex="-1">React</button></div>`
        + `<div class="n-compare-grid">`
        + `<div id="${id}-vue" role="tabpanel" aria-labelledby="${id}-tv">${codeBlock({ lang: 'vue', ...b.vue }, '<span class="n-tag n-tag--vue">Vue</span>')}</div>`
        + `<div id="${id}-react" role="tabpanel" aria-labelledby="${id}-tr">${codeBlock({ lang: 'tsx', ...b.react }, '<span class="n-tag n-tag--react">React</span>')}</div>`
        + `</div>${b.note ? `<p class="n-compare-note">${inline(b.note)}</p>` : ''}</div>`;
    },
    toc: (b, ctx) => tocHTML(ctx.series, ctx.slug),
  };

  // ---------- ブロック → Markdown(Zenn の書き方。note には見ながら貼る) ----------
  const fence = ({ lang = 'ts', file = '', code = '' }) => `\`\`\`${lang}${file ? `:${file}` : ''}\n${tidy(code)}\n\`\`\``;
  const mdBox = (kind, b, type) => [
    `:::message${type ? ` ${type}` : ''}`,
    `**${b.label || LABELS[kind]}**`,
    b.text || '',
    ...(b.items || []).map(i => `- ${i}`),
    b.code ? fence(b.code) : '',
    ':::',
  ].filter(Boolean).join('\n');
  const MD = {
    h: b => `## ${b.text}`,
    h3: b => `### ${b.text}`,
    p: b => b.text,
    list: b => b.items.map((i, n) => `${b.ordered ? `${n + 1}.` : '-'} ${i}`).join('\n'),
    lead: b => [`:::message`, `**${b.label || LABELS.lead}**`, ...b.items.map(i => `- ${i}`), ':::'].join('\n'),
    point: b => mdBox('point', b),
    pitfall: b => mdBox('pitfall', b, 'alert'),
    mine: b => mdBox('mine', b),
    code: b => fence(b),
    table: b => [`| ${b.head.join(' | ')} |`, `| ${b.head.map(() => '---').join(' | ')} |`, ...b.rows.map(r => `| ${r.join(' | ')} |`)].join('\n'),
    compare: b => [`**Vue**`, fence({ lang: 'vue', ...b.vue }), `**React**`, fence({ lang: 'tsx', ...b.react }), b.note || ''].filter(Boolean).join('\n\n'),
    toc: (b, ctx) => articlesOf(ctx.series).map(a => `- ${noLabel(a)}：${a.title}${a.planned ? '(準備中)' : ''}`).join('\n'),
  };
  function toMarkdown(data) {
    const s = seriesOf(data.series);
    const front = ['---', `title: "${data.title.replace(/"/g, '\\"')}"`, `emoji: "${data.emoji || '📘'}"`, 'type: "tech"',
      `topics: [${(data.topics || []).map(t => `"${t}"`).join(', ')}]`, 'published: false', '---'].join('\n');
    const body = data.blocks.map(b => (MD[b.type] ? MD[b.type](b, data) : '')).filter(Boolean).join('\n\n');
    return `${front}\n\n※ 連載「${s.title}」の${noLabel(data)}です。\n\n${body}\n`;
  }

  // ---------- ページの部品 ----------
  const topBar = () => `<header class="n-top"><a class="n-home" href="${PORTFOLIO.href}">よしだ</a><a href="${new URL('index.html', BASE).href}">記事一覧</a></header>`;
  const footer = () => `<footer class="n-foot"><a href="${PORTFOLIO.href}">ポートフォリオへ戻る</a></footer>`;
  function toast(msg) {
    let t = document.querySelector('.n-toast');
    if (!t) { t = document.createElement('div'); t.className = 'n-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  // コピー・Vue/React の切り替え(記事を組み立てたあとに付ける)
  function wire(root) {
    root.querySelectorAll('.n-copy').forEach(btn => btn.addEventListener('click', async () => {
      const text = btn.closest('.n-code').querySelector('pre').textContent;
      try { await navigator.clipboard.writeText(text); toast('コードをコピーしました'); } catch (e) { toast('コピーできませんでした'); }
    }));
    root.querySelectorAll('[data-compare]').forEach(cmp => {
      const tabs = [...cmp.querySelectorAll('[role="tab"]')];
      const select = (tab, focus) => tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) t.focus();
      });
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(t));
        t.addEventListener('keydown', e => {
          const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
        });
      });
      // PCでは両方を並べる(タブは隠れる)。スマホでは選んだ方だけ
      const mq = window.matchMedia('(max-width: 899px)');
      const apply = () => {
        if (mq.matches) select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0]);
        else tabs.forEach(t => { document.getElementById(t.getAttribute('aria-controls')).hidden = false; });
      };
      apply();
      mq.addEventListener?.('change', apply);
    });
  }

  // ---------- 記事ページ ----------
  window.article = function article(content) {
    const list = articlesOf(content.series);
    const idx = list.findIndex(a => a.slug === content.slug);
    const meta = list[idx] || {};
    // 回の番号・公開日などは記事の一覧(articles.js)から受け取る
    const data = { ...meta, ...content };
    const s = seriesOf(data.series);
    const prev = list.slice(0, Math.max(idx, 0)).reverse().find(a => !a.planned);
    const next = list.slice(idx + 1).find(a => !a.planned);
    const chars = data.blocks.reduce((n, b) => n + JSON.stringify(b).length, 0);
    const minutes = Math.max(3, Math.round(chars / 900));

    const body = data.blocks.map(b => (RENDER[b.type] ? RENDER[b.type](b, data) : '')).join('');
    const pager = `<nav class="n-pager" aria-label="前後の記事">`
      + (prev ? `<a href="${linkOf(prev)}"><small>← 前の記事</small>${esc(prev.title)}</a>` : '')
      + (next ? `<a class="is-next" href="${linkOf(next)}"><small>次の記事 →</small>${esc(next.title)}</a>` : '')
      + `</nav>`;

    document.body.innerHTML = `${topBar()}<main class="n-main" id="article">`
      + `<p class="n-series"><a href="${new URL('index.html', BASE).href}#${esc(s.id)}">${esc(s.title)}</a> · ${noLabel(data)}</p>`
      + `<h1 class="n-title">${esc(data.title)}</h1>`
      + `<p class="n-meta">${meta.date ? `<time datetime="${esc(meta.date)}">${esc(meta.date.replace(/-/g, '.'))}</time>` : ''}<span>約${minutes}分</span>`
      + `<button type="button" class="n-export" title="Zenn の形式で、この記事を Markdown ファイルにします">Markdown で書き出す</button></p>`
      + `<div class="n-body">${body}</div>${pager}`
      + `<section aria-labelledby="toc-title" style="margin-top:48px"><h2 id="toc-title" style="font-size:1rem;margin-bottom:12px">連載の目次</h2>${tocHTML(data.series, data.slug)}</section>`
      + `${footer()}</main>`;

    wire(document.body);
    document.querySelector('.n-export').addEventListener('click', () => {
      const blob = new Blob([toMarkdown(data)], { type: 'text/markdown' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${data.slug}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('Markdown を書き出しました');
    });
    // ページ内リンク(#s2 など)で開いたときも、組み立てたあとの見出しへ移動する
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  };
  // ほかで使えるように(書き出しの確認など)
  window.article.toMarkdown = toMarkdown;

  // ---------- 記事一覧ページ ----------
  window.renderNotesIndex = function renderNotesIndex() {
    const cards = NOTES.series.map(s => `<section class="n-series-card" id="${esc(s.id)}"><h2>${esc(s.title)}</h2><p>${esc(s.description || '')}</p>${tocHTML(s.id)}</section>`).join('');
    document.body.innerHTML = `${topBar()}<main class="n-main"><p class="n-series">Notes</p><h1 class="n-title">技術記事</h1>`
      + `<p class="n-index-lead">学んだことや、開発で工夫したことを書いています。</p>${cards}${footer()}</main>`;
  };
})();
