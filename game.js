// =========================================================
// 遊びの要素: 実績・かくれた どんぐり・探索度
// script.js の後に読み込む(sections / currentId / scrollHooks / skyPhase などを使う)
// =========================================================

// ---------------------------------------------------------
// 実績の一覧。secret: true は、解除するまで名前も伏せる
// ---------------------------------------------------------
const ACHIEVEMENTS = [
  { id: 'start',     icon: '👣', name: 'はじめの一歩',       desc: 'スクロールして、冒険をはじめた' },
  { id: 'dawn',      icon: '🌅', name: '夜明けを見た',       desc: '空が明るくなるところまで進んだ' },
  { id: 'noon',      icon: '🎪', name: 'お昼の原っぱ',       desc: '子どもと楽しむアプリのゾーンに着いた' },
  { id: 'builder',   icon: '🛠️', name: 'つくりかた見学',     desc: 'Focus の3つのアプリを全部見た' },
  { id: 'play',      icon: '🎮', name: 'あそんでみた',       desc: '個人開発のアプリを開いてみた' },
  { id: 'piko',      icon: '🫧', name: 'ピコと仲間達と なかよし', desc: 'ピコと仲間達の3匹を全部つついた' },
  { id: 'dango',     icon: '🌀', name: 'ころころ',           desc: 'だんごむしを丸めて、転がした' },
  { id: 'nemu',      icon: '🧣', name: 'おきがえ',           desc: 'ねむひつじのスカーフを切り替えた' },
  { id: 'egg',       icon: '🥚', name: 'たまごを育てた',     desc: '自分でつついて、たまごを おとなまで育てた' },
  { id: 'night',     icon: '🌙', name: 'おやすみなさい',     desc: '夜まで、ページの最後まで読んだ' },
  { id: 'explorer',  icon: '🧭', name: 'ぜんぶ見た',         desc: 'すべてのセクションを訪れた' },
  { id: 'acorn1',    icon: '🌰', name: 'はじめての どんぐり', desc: 'かくれた どんぐりを1つ見つけた' },
  { id: 'acorn5',    icon: '👑', name: 'どんぐりマスター',   desc: 'どんぐりを5つ全部見つけた' },
  { id: 'wish',      icon: '🌠', name: 'ねがいごと',         desc: '流れ星が流れている間に、画面をタップした', secret: true },
  { id: 'konami',    icon: '🕹️', name: 'ひみつのコマンド',   desc: '↑↑↓↓←→←→BA', secret: true },
];
const ACORN_IDS = ['hero', 'skills', 'kids', 'focus', 'notes'];
const ACORN_IMG = 'assets/images/characters/acorn.png';
const STORE_KEY = 'yoshidam:quest:v1';
const TOAST_MS = window.innerWidth <= 600 ? 2400 : 3600; // スマホは短めに

// ---------------------------------------------------------
// 記録の読み書き(localStorage が使えない環境でも動くように)
// ---------------------------------------------------------
function loadQuest() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      // Works を外したので、そこで拾った どんぐりは Focus のものとして数える
      const acorns = (d.acorns || []).map(id => (id === 'works' ? 'focus' : id));
      return { seen: d.seen || [], ach: d.ach || {}, acorns, piko: Array.isArray(d.piko) ? d.piko : [], details: d.details || [] };
    }
  } catch (e) { /* 読めなければ はじめから */ }
  return { seen: [], ach: {}, acorns: [], piko: [], details: [] };
}
function saveQuest() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(quest)); } catch (e) { /* 保存できなくても遊べる */ }
}
let quest = loadQuest();

// ---------------------------------------------------------
// 画面の部品
// ---------------------------------------------------------
const questChip = document.getElementById('questChip');
const questPanel = document.getElementById('questPanel');
const toastStack = document.getElementById('toastStack');
const achList = document.getElementById('achList');
const acornSlots = document.getElementById('questAcornSlots');
const acornButtons = [...document.querySelectorAll('.acorn')];
const resultAcorns = document.getElementById('questResultAcorns');

// パネルの実績一覧・どんぐりの枠を作る
achList.innerHTML = ACHIEVEMENTS.map(a => `
  <li class="ach" data-ach="${a.id}">
    <span class="ach-icon" aria-hidden="true">${a.icon}</span>
    <span><span class="ach-name"></span><span class="ach-desc"></span></span>
  </li>`).join('');
acornSlots.innerHTML = ACORN_IDS.map(id => `<span class="acorn-slot" data-slot="${id}"><img src="${ACORN_IMG}" alt="" width="142" height="207"></span>`).join('');
resultAcorns.innerHTML = ACORN_IDS.map(id => `<img src="${ACORN_IMG}" alt="" data-slot="${id}" width="142" height="207">`).join('');

// ---------------------------------------------------------
// 探索度(0〜100)= 訪れたセクション 50% + 実績 30% + どんぐり 20%
// ---------------------------------------------------------
function explorePercent() {
  const normal = ACHIEVEMENTS.filter(a => !a.secret);
  const achDone = normal.filter(a => quest.ach[a.id]).length;
  const p = (quest.seen.length / sections.length) * 50
          + (achDone / normal.length) * 30
          + (quest.acorns.length / ACORN_IDS.length) * 20;
  return Math.min(100, Math.round(p));
}

function renderQuest() {
  const pct = explorePercent();
  document.getElementById('questRing').style.setProperty('--pct', pct);
  document.getElementById('questAcorns').textContent = quest.acorns.length;
  document.getElementById('questPercent').textContent = pct;
  document.getElementById('questPercentSr').textContent = pct;
  document.getElementById('questMeterBar').style.setProperty('--pct', (pct / 100).toFixed(3));

  achList.querySelectorAll('.ach').forEach(li => {
    const a = ACHIEVEMENTS.find(x => x.id === li.dataset.ach);
    const done = !!quest.ach[a.id];
    li.classList.toggle('is-unlocked', done);
    const hidden = a.secret && !done;
    li.querySelector('.ach-name').textContent = hidden ? '？？？' : a.name;
    li.querySelector('.ach-desc').textContent = hidden ? 'ひみつの実績' : a.desc;
    li.querySelector('.ach-icon').textContent = hidden ? '？' : a.icon;
  });
  document.querySelectorAll('[data-slot]').forEach(el => {
    el.classList.toggle('is-found', quest.acorns.includes(el.dataset.slot));
  });
  acornButtons.forEach(b => b.classList.toggle('is-found', quest.acorns.includes(b.dataset.acorn)));

  // Contact の「冒険の結果」
  const n = quest.acorns.length;
  const msg = document.getElementById('questResultMsg');
  const secret = document.getElementById('questSecret');
  if (n === 0) {
    msg.textContent = finePointer
      ? 'このページのどこかに、どんぐりが5つ隠れています。カーソルを近づけると光ります。'
      : 'このページのどこかに、どんぐりが5つ隠れています。ときどき揺れているかも。';
  } else if (n < ACORN_IDS.length) {
    msg.textContent = `どんぐり ${n}/5。あと ${ACORN_IDS.length - n} 個 隠れています。`;
  } else {
    msg.textContent = '全部見つけてくれて、ありがとうございます! お礼に、このサイトの仕掛けを少しだけ。';
  }
  secret.hidden = n < ACORN_IDS.length;
  document.getElementById('questResult').classList.toggle('is-complete', n >= ACORN_IDS.length);
}

// ---------------------------------------------------------
// お知らせ(トースト)
// ---------------------------------------------------------
function showToast({ icon, kicker, title, desc, iconImg }) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `
    <span class="toast-icon" aria-hidden="true">${iconImg ? `<img src="${iconImg}" alt="">` : icon}</span>
    <span><span class="toast-kicker">${kicker}</span><span class="toast-title">${title}</span>${desc ? `<span class="toast-desc">${desc}</span>` : ''}</span>`;
  toastStack.appendChild(t);
  // 同時に出すのは3つまで(スマホは1つ)。あふれたら古いものから下げる
  const maxToasts = window.innerWidth <= 600 ? 1 : 3;
  while (toastStack.children.length > maxToasts) toastStack.firstElementChild.remove();
  setTimeout(() => {
    t.classList.add('is-leaving');
    t.addEventListener('animationend', () => t.remove(), { once: true });
    if (reduceMotion) t.remove();
  }, TOAST_MS);
}

function bumpChip() {
  questChip.classList.remove('is-bump');
  void questChip.offsetWidth;
  questChip.classList.add('is-bump');
}

function unlock(id) {
  if (quest.ach[id]) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  quest.ach[id] = Date.now();
  saveQuest();
  renderQuest();
  bumpChip();
  document.dispatchEvent(new CustomEvent('quest:unlock', { detail: { id } }));
  // ページの途中へ一気に移動したときなど、同時に解除されたものは1枚にまとめる
  pendingAch.push(a);
  clearTimeout(achTimer);
  achTimer = setTimeout(flushAchToasts, 300);
}

let pendingAch = [];
let achTimer = null;
function flushAchToasts() {
  const list = pendingAch;
  pendingAch = [];
  if (list.length === 1) {
    const a = list[0];
    showToast({ icon: a.icon, kicker: '実績を解除しました', title: a.name, desc: a.desc });
  } else if (list.length > 1) {
    showToast({
      icon: '🏅',
      kicker: `実績を ${list.length} 個 解除しました`,
      title: list.map(a => a.name).join('・'),
      desc: '冒険の記録で確認できます',
    });
  }
}

// ---------------------------------------------------------
// どんぐり: 近づくと光る。押すと拾って、ヘッダーへ飛んでいく
// ---------------------------------------------------------
acornButtons.forEach((btn, i) => btn.style.setProperty('--wd', `${i * 1.3}s`));

if (finePointer) {
  let px = -999, py = -999, pending = false;
  const updateNear = () => {
    pending = false;
    acornButtons.forEach(btn => {
      if (btn.classList.contains('is-found')) return;
      const r = btn.getBoundingClientRect();
      const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
      btn.style.setProperty('--near', Math.max(0, 1 - d / 140).toFixed(2));
    });
  };
  window.addEventListener('pointermove', e => {
    px = e.clientX; py = e.clientY;
    if (!pending) { pending = true; requestAnimationFrame(updateNear); }
  }, { passive: true });
  window.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(updateNear); } }, { passive: true });
}

function flyToChip(fromEl) {
  if (reduceMotion || !fromEl.animate) return;
  const a = fromEl.getBoundingClientRect();
  const b = questChip.getBoundingClientRect();
  const img = document.createElement('img');
  img.src = ACORN_IMG;
  img.className = 'acorn-fly';
  img.style.left = `${a.left}px`;
  img.style.top = `${a.top}px`;
  document.body.appendChild(img);
  const dx = b.left + 10 - a.left;
  const dy = b.top + 4 - a.top;
  img.animate([
    { transform: 'translate(0,0) scale(1) rotate(0)' },
    { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 80}px) scale(1.5) rotate(-160deg)`, offset: 0.4 },
    { transform: `translate(${dx}px, ${dy}px) scale(.4) rotate(-360deg)`, opacity: 0.6 },
  ], { duration: 800, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => { img.remove(); bumpChip(); };
}

acornButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.acorn;
    if (quest.acorns.includes(id)) return;
    flyToChip(btn);
    quest.acorns.push(id);
    saveQuest();
    // 飛んでいくのを見せてから消す
    setTimeout(renderQuest, reduceMotion ? 0 : 60);
    const n = quest.acorns.length;
    showToast({
      iconImg: ACORN_IMG,
      kicker: `どんぐり ${n}/5`,
      title: n < 5 ? 'どんぐりを見つけた!' : '5つ全部 見つけた!',
      desc: n < 5 ? `あと ${5 - n} 個、どこかに隠れています` : 'Contact に、ささやかなお礼があります',
    });
    if (n === 1) setTimeout(() => unlock('acorn1'), 500);
    if (n === 5) setTimeout(() => unlock('acorn5'), 500);
  });
});

// ---------------------------------------------------------
// 実績のきっかけ
// ---------------------------------------------------------
// スクロールに合わせて: 訪れたセクション・空の時刻
scrollHooks.push((y, vh) => {
  if (currentId && !quest.seen.includes(currentId)) {
    quest.seen.push(currentId);
    saveQuest();
    renderQuest();
    if (quest.seen.length >= sections.length) unlock('explorer');
  }
  if (y > vh * 0.5) unlock('start');
  const ph = skyPhase(y, vh);
  if (ph >= 0.45) unlock('dawn');
  if (ph >= 0.99 && currentId === 'contact') unlock('night');
  const kz = document.getElementById('kidsZone');
  if (kz && kz.getBoundingClientRect().top < vh * 0.5) unlock('noon');
});

// Focus のタブを全部見た
{
  const seenTabs = new Set(['tab-zutsu']);
  document.addEventListener('craft-tab', e => {
    seenTabs.add(e.target.id);
    if (seenTabs.size >= document.querySelectorAll('.craft-tabs [role="tab"]').length) unlock('builder');
  });
}

// アプリを開いた
document.querySelectorAll('.projects a[target="_blank"]').forEach(a => {
  a.addEventListener('click', () => unlock('play'));
});

// キャラクター
document.querySelectorAll('.piko-pal').forEach(pal => pal.addEventListener('click', () => {
  if (!Array.isArray(quest.piko)) quest.piko = []; // 古い記録(回数)からの移行
  if (!quest.piko.includes(pal.dataset.color)) { quest.piko.push(pal.dataset.color); saveQuest(); }
  if (quest.piko.length >= 3) unlock('piko');
}));
document.getElementById('dangoButton')?.addEventListener('click', () => {
  // 1回目で丸まり、丸まったまま もう1回で転がる
  if (document.getElementById('dangoButton').classList.contains('is-rolling')) unlock('dango');
});
document.querySelectorAll('.nemu-btn').forEach(b => b.addEventListener('click', () => {
  if (b.dataset.scarf === 'blue') unlock('nemu');
}));

// たまご: 自分でつついて、おとなまで育てた(自動で育ったときは数えない)
{
  let pokedToAdult = 0;
  document.getElementById('eggButton')?.addEventListener('click', () => {
    pokedToAdult += 1;
    const step = Number(document.getElementById('eggStage').dataset.step);
    if (step === 0) pokedToAdult = 0;               // 一周して はじめに戻った
    if (step === 7 && pokedToAdult >= 3) unlock('egg'); // 少なくとも何回かは自分で育てた
  });
}

// 流れ星が流れている間にタップしたら、ひみつの実績(script.js の meteorActive を見る)
document.addEventListener('pointerdown', () => { if (typeof meteorActive !== 'undefined' && meteorActive) unlock('wish'); });

// ひみつのコマンド ↑↑↓↓←→←→BA
{
  const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  document.addEventListener('keydown', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === CODE[pos] ? pos + 1 : (key === CODE[0] ? 1 : 0);
    if (pos === CODE.length) {
      pos = 0;
      unlock('konami');
      // ごほうび: 空がいっきに一日分まわる
      document.documentElement.classList.add('is-konami');
      setTimeout(() => document.documentElement.classList.remove('is-konami'), 2400);
    }
  });
}

// ---------------------------------------------------------
// 冒険の記録パネル
// ---------------------------------------------------------
function openQuest() {
  renderQuest();
  if (questPanel.showModal) questPanel.showModal(); else questPanel.setAttribute('open', '');
}
questChip.addEventListener('click', openQuest);
document.querySelectorAll('[data-open-quest]').forEach(b => b.addEventListener('click', openQuest));
document.getElementById('questClose').addEventListener('click', () => questPanel.close());
// 背景(パネルの外)を押したら閉じる
questPanel.addEventListener('click', e => { if (e.target === questPanel) questPanel.close(); });
document.getElementById('questReset').addEventListener('click', () => {
  if (!window.confirm('冒険の記録(実績とどんぐり)を消して、はじめからにしますか?')) return;
  quest = { seen: [], ach: {}, acorns: [], piko: [], details: [] };
  saveQuest();
  renderQuest();
});

// ---------------------------------------------------------
// コンソールを開いたエンジニアへ
// ---------------------------------------------------------
console.log(
  '%c(\\_/)\n( •.•)  ここまで見てくれて ありがとう!\n/ > 🌰  このサイトは HTML/CSS/JS だけで作っています。\n\nひみつのコマンドも、ひとつ隠れています。',
  'font-family: monospace; color: #C97B63; font-size: 12px; line-height: 1.5;'
);

renderQuest();
requestTick(); // はじめの現在地(Top)も記録する

// ---------------------------------------------------------
// ヒーローのだんごむし: スクロールすると小道を歩き、先のどんぐりを拾う(だんごむしのぼうけんと同じ2コマ歩き)
// 1つ目のどんぐりがここで自然に入るので「1/5」と表示され、集められることが伝わる
// ---------------------------------------------------------
{
  const track = document.getElementById('heroWalk');
  const walker = track && track.querySelector('.hw-dango');
  const trailAcorn = track && track.querySelector('.acorn');
  if (track && walker && trailAcorn) {
    const STEP_PX = 16;      // この距離ごとに足を入れかえる
    const CURL_MS = 900;     // 止まってから丸まるまで
    let lastP = 0, travelled = 0, frameB = false, idle = 0;
    let picked = quest.acorns.includes('hero');
    track.classList.toggle('is-done', picked);
    const walk = (y, vh) => {
      const len = Math.max(0, track.clientHeight - walker.offsetHeight - 36);
      const p = Math.min(1, Math.max(0, y / (vh * 0.4)));
      const d = (p - lastP) * len;
      if (!reduceMotion && Math.abs(d) > 0.3) {
        travelled += Math.abs(d);
        if (travelled > STEP_PX) { travelled = 0; frameB = !frameB; walker.classList.toggle('is-b', frameB); }
        walker.classList.toggle('is-up', d < 0);
        walker.classList.remove('is-curled');
        clearTimeout(idle);
        idle = setTimeout(() => walker.classList.add('is-curled'), CURL_MS);
      }
      lastP = p;
      walker.style.setProperty('--hw-y', `${(p * len).toFixed(1)}px`);
      track.classList.toggle('is-walking', p > 0.02);
      if (p >= 0.97 && !picked) {
        picked = true;
        trailAcorn.click();
        track.classList.add('is-done');
      }
    };
    scrollHooks.push(walk);
    walk(window.scrollY, window.innerHeight);
  }
}
