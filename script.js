// =========================================================
// 共通
// =========================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// URL に ?todo を付けると、仮のままの場所を枠で囲んで表示する
if (/[?&]todo\b/.test(location.search)) {
  document.documentElement.classList.add('show-todo');
  const todos = [...document.querySelectorAll('[data-todo]')].map(el => el.dataset.todo);
  console.info(`仮のままの場所: ${todos.length}件\n- ` + todos.join('\n- '));
}

// =========================================================
// ナビ(モバイルの開閉)
// =========================================================
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

function setNavOpen(isOpen) {
  mainNav.classList.toggle('is-open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
}
navToggle.addEventListener('click', () => setNavOpen(!mainNav.classList.contains('is-open')));
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavOpen(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setNavOpen(false); });

// =========================================================
// 現在地の表示(ヘッダーの下線・右端のドット)
// =========================================================
const sections = [...document.querySelectorAll('main > section[id]')];
const navLinks = [...mainNav.querySelectorAll('a')];
const indicator = mainNav.querySelector('.nav-indicator');
const dotNav = document.getElementById('dotNav');

sections.forEach(sec => {
  const a = document.createElement('a');
  a.href = `#${sec.id}`;
  a.dataset.target = sec.id;
  a.setAttribute('aria-label', sec.dataset.label || sec.id);
  a.innerHTML = `<span class="dot-label">${sec.dataset.label || sec.id}</span>`;
  dotNav.appendChild(a);
});
const dots = [...dotNav.querySelectorAll('a')];

function moveIndicator(link) {
  if (!link) { indicator.classList.remove('is-on'); return; }
  indicator.style.left = `${link.offsetLeft}px`;
  indicator.style.width = `${link.offsetWidth}px`;
  indicator.classList.add('is-on');
}

let currentId = null;
function setCurrent(id) {
  if (id === currentId) return;
  currentId = id;
  // Skills はヘッダーに無いので、ひとつ前の About を現在地として扱う
  const navId = id === 'skills' ? 'about' : id;
  let active = null;
  navLinks.forEach(a => {
    const on = a.getAttribute('href') === `#${navId}`;
    a.classList.toggle('is-current', on);
    if (on) { a.setAttribute('aria-current', 'location'); active = a; } else a.removeAttribute('aria-current');
  });
  moveIndicator(active);
  dots.forEach(d => {
    const on = d.dataset.target === id;
    d.classList.toggle('is-current', on);
    if (on) d.classList.add('is-seen');
  });
}
window.addEventListener('resize', () => moveIndicator(mainNav.querySelector('a.is-current')));

// =========================================================
// スクロールに合わせた処理(1フレームにまとめる)
// =========================================================
const header = document.getElementById('siteHeader');
const progress = document.getElementById('scrollProgress');
const kidsZone = document.querySelector('.kids-zone');
const timeline = document.querySelector('.timeline');
const timelineItems = timeline ? [...timeline.querySelectorAll('.timeline-item')] : [];

let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;

  header.classList.toggle('is-scrolled', y > 20);
  progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

  // 画面の上から 35% の位置にあるセクションを「現在地」にする
  const probe = y + vh * 0.35;
  let current = sections[0];
  for (const sec of sections) { if (sec.offsetTop <= probe) current = sec; }
  setCurrent(y + vh >= document.documentElement.scrollHeight - 4 ? sections[sections.length - 1].id : current.id);

  dotNav.classList.toggle('is-visible', y > vh * 0.6);
  if (kidsZone) {
    const r = kidsZone.getBoundingClientRect();
    dotNav.classList.toggle('on-light', r.top < vh / 2 && r.bottom > vh / 2);
  }

  // 経歴の縦線を、読み進めた分だけ伸ばす
  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / r.height));
    timeline.style.setProperty('--tl', t.toFixed(3));
    timelineItems.forEach(item => {
      item.classList.toggle('is-lit', item.getBoundingClientRect().top + 10 < vh * 0.65);
    });
  }
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });
onScroll();

// =========================================================
// スクロールのヒント: 何もしないで3秒たったら出す
// =========================================================
const scrollHint = document.getElementById('scrollHint');
let hintTimer = setTimeout(() => { if (window.scrollY < 40) scrollHint.classList.add('is-shown'); }, 3000);
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) { scrollHint.classList.remove('is-shown'); clearTimeout(hintTimer); }
}, { passive: true });

// =========================================================
// 表示されたらふわっと出す
// =========================================================
const revealGroups = [
  '.timeline-item', '.skill-group', '.case-card', '.project-card--calm',
  '.project-card--kids', '.character-card', '.cert-badge', '.note-card',
  '.section-title', '.section-lead', '.about-grid'
];
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealGroups.forEach(sel => {
  document.querySelectorAll(sel).forEach(el => {
    el.classList.add('reveal');
    // 同じ並びの兄弟の中で、順番に少しずつ遅らせる
    const idx = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = `${Math.min(idx, 4) * 80}ms`;
    io.observe(el);
  });
});

// =========================================================
// ヒーローの演出(星・数字のカウントアップ)
// =========================================================
const stars = document.querySelector('.hero-stars');
if (stars && !reduceMotion) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i');
    s.style.left = `${Math.random() * 100}%`;
    s.style.top = `${Math.random() * 100}%`;
    s.style.setProperty('--s', `${Math.random() < 0.15 ? 3 : 1.5}px`);
    s.style.setProperty('--t', `${3 + Math.random() * 4}s`);
    s.style.setProperty('--delay', `${-Math.random() * 6}s`);
    s.style.setProperty('--o', (0.25 + Math.random() * 0.5).toFixed(2));
    frag.appendChild(s);
  }
  stars.appendChild(frag);
}

function countUp(el) {
  const to = Number(el.dataset.count);
  if (reduceMotion || !to) { el.textContent = to; return; }
  const dur = 1400;
  const start = performance.now();
  el.textContent = '0';
  const step = now => {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(to * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// ヒーローの登場アニメ(0.9秒後)に合わせて数え始める
document.querySelectorAll('.hero [data-count]').forEach(el => {
  el.textContent = reduceMotion ? el.dataset.count : '0';
  setTimeout(() => countUp(el), 1000);
});

// =========================================================
// ポインターの演出(マウス操作の端末だけ)
// =========================================================
if (finePointer && !reduceMotion) {
  // 磁石ボタン: カーソルに少し吸い寄せられる
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
  });

  // ケーススタディのカード: ポインターの位置にほのかな光
  document.querySelectorAll('.case-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// =========================================================
// キャラクター
// =========================================================
// ピコ: つつくと「？」が「！」になって、びよんと伸びる
const pikoButton = document.getElementById('pikoButton');
const piko = pikoButton && pikoButton.querySelector('.piko');
if (piko) {
  let pikoTimer;
  pikoButton.addEventListener('click', () => {
    piko.classList.remove('is-boing');
    void piko.getBoundingClientRect(); // アニメを最初から再生しなおす
    piko.classList.add('is-boing', 'is-surprised');
    clearTimeout(pikoTimer);
    pikoTimer = setTimeout(() => piko.classList.remove('is-surprised'), 1200);
  });
  piko.addEventListener('animationend', e => {
    if (e.animationName === 'piko-boing') piko.classList.remove('is-boing');
  });
}

// だんごむし: つつくと丸まって、ころんと転がる。少したつと元に戻る
const dangoButton = document.getElementById('dangoButton');
if (dangoButton) {
  let dangoTimer;
  dangoButton.addEventListener('click', () => {
    const wasCurled = dangoButton.classList.contains('is-curled');
    dangoButton.classList.add('is-curled');
    if (wasCurled) {
      dangoButton.classList.remove('is-rolling');
      void dangoButton.offsetWidth;
      dangoButton.classList.add('is-rolling');
    }
    clearTimeout(dangoTimer);
    dangoTimer = setTimeout(() => dangoButton.classList.remove('is-curled', 'is-rolling'), 2600);
  });
}

// ねむひつじ: スカーフの色を切り替える(2枚の画像をクロスフェード)
const nemuVisual = document.querySelector('.character-visual--nemu');
const nemuButtons = document.querySelectorAll('.nemu-btn');
nemuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    nemuButtons.forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    nemuVisual.dataset.scarf = btn.dataset.scarf;
  });
});
