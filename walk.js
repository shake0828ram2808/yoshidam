// =========================================================
// だんごむしのお散歩(ヒーロー)
// スティック(ドラッグ)か矢印キーで歩かせ、看板の上にしばらくいると そのセクションへ移動する
// 看板はふつうのリンクでもあるので、押して移動することもできる(遊ばなくても困らない)
// script.js / game.js の後に読み込む(reduceMotion / unlock を使う)
// =========================================================
(() => {
  const field = document.getElementById('walk');
  if (!field) return;
  const dango = document.getElementById('walkDango');
  const joy = document.getElementById('walkJoy');
  const knob = document.getElementById('walkKnob');
  const hint = document.getElementById('walkHint');
  const signs = [...field.querySelectorAll('.walk-sign')];

  const SPEED = 150;        // 1秒に進む距離(px)
  const STEP_MS = 160;      // 足の2コマを切り替える間隔
  const CURL_MS = 1400;     // 止まってから丸まるまで
  const HOLD_MS = 700;      // 看板の上にこの時間いると移動する
  const SIGN_PAD = 10;      // 看板の大きさより少し広めに「乗った」とみなす
  const KNOB_MAX = 30;      // スティックの倒せる幅

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) hint.textContent = '矢印キーかスティックで歩かせて、看板へ';

  // 位置・向き(向きは「上」が0度)
  let x = 0, y = 0, angle = 0;
  let joyX = 0, joyY = 0;   // スティックの倒し具合(-1〜1)
  const keys = new Set();
  let lastMove = 0, stepAt = 0, frameB = false;
  let onSign = null, signSince = 0, visible = false, raf = 0, last = 0, moved = false;

  const size = () => ({ w: field.clientWidth, h: field.clientHeight });
  function home() {
    const { w, h } = size();
    x = w / 2; y = h * 0.42; angle = 0;
    draw();
  }
  function placeSigns() {
    const { w, h } = size();
    signs.forEach(s => { s._x = w * s.dataset.x / 100; s._y = h * s.dataset.y / 100; s._hw = s.offsetWidth / 2 + SIGN_PAD; s._hh = s.offsetHeight / 2 + SIGN_PAD; s.style.left = `${s._x}px`; s.style.top = `${s._y}px`; });
  }
  function draw() {
    dango.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}deg)`;
  }

  // ---- スティック ----
  let joyId = null;
  function setJoy(e) {
    const r = joy.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > KNOB_MAX) { dx = dx / len * KNOB_MAX; dy = dy / len * KNOB_MAX; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    joyX = dx / KNOB_MAX; joyY = dy / KNOB_MAX;
  }
  joy.addEventListener('pointerdown', e => {
    joyId = e.pointerId; joy.setPointerCapture(e.pointerId); joy.classList.add('is-active');
    setJoy(e); start();
  });
  joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) setJoy(e); });
  const release = e => {
    if (e.pointerId !== joyId) return;
    joyId = null; joyX = joyY = 0; knob.style.transform = ''; joy.classList.remove('is-active');
  };
  joy.addEventListener('pointerup', release);
  joy.addEventListener('pointercancel', release);

  // ---- 矢印キー(お散歩の枠を選んでいるときだけ。ページのスクロールは止める) ----
  const KEYMAP = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r' };
  field.addEventListener('keydown', e => {
    const k = KEYMAP[e.key];
    if (!k || e.target !== field) return;
    e.preventDefault(); keys.add(k); start();
  });
  field.addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (k) keys.delete(k); });
  field.addEventListener('blur', () => keys.clear());
  // 枠の空いているところを押したら、キー操作できるように選んでおく(看板・スティックは除く)
  field.addEventListener('pointerdown', e => { if (!e.target.closest('.walk-sign, .walk-joy')) field.focus({ preventScroll: true }); });

  // ---- 毎フレーム ----
  function tick(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    let vx = joyX, vy = joyY;
    if (keys.size) {
      vx = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0);
      vy = (keys.has('d') ? 1 : 0) - (keys.has('u') ? 1 : 0);
    }
    const mag = Math.hypot(vx, vy);
    const walking = mag > 0.15;
    if (walking) {
      if (mag > 1) { vx /= mag; vy /= mag; }
      const { w, h } = size();
      x = Math.max(18, Math.min(w - 18, x + vx * SPEED * dt));
      y = Math.max(30, Math.min(h - 30, y + vy * SPEED * dt));
      angle = Math.atan2(vx, -vy) * 180 / Math.PI;
      lastMove = now;
      if (now - stepAt > STEP_MS) { stepAt = now; frameB = !frameB; }
      if (!moved) { moved = true; field.classList.add('is-played'); }
      draw();
    }
    dango.classList.toggle('is-b', walking && frameB);
    dango.classList.toggle('is-curled', !walking && lastMove > 0 && now - lastMove > CURL_MS);

    // 看板の上にいるか
    const near = signs.find(s => Math.abs(s._x - x) < s._hw && Math.abs(s._y - y) < s._hh);
    if (near !== onSign) {
      signs.forEach(s => { s.classList.toggle('is-near', s === near); s.style.setProperty('--p', 0); });
      onSign = near; signSince = now;
    }
    if (onSign && moved) {
      const p = Math.min(1, (now - signSince) / HOLD_MS);
      onSign.style.setProperty('--p', p.toFixed(3));
      if (p >= 1) { go(onSign); return; }
    }
    if (visible) raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick); } }

  function go(sign) {
    if (typeof unlock === 'function') unlock('walk');
    sign.classList.add('is-go');
    const target = document.querySelector(sign.getAttribute('href'));
    setTimeout(() => {
      sign.classList.remove('is-go', 'is-near'); sign.style.setProperty('--p', 0);
      onSign = null; keys.clear(); joyX = joyY = 0; knob.style.transform = '';
      home();
      target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      start();
    }, 260);
  }

  // 見えている間だけ動かす
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) start(); else { cancelAnimationFrame(raf); raf = 0; }
  }).observe(field);
  new ResizeObserver(() => { placeSigns(); home(); }).observe(field);
  placeSigns(); home();
})();
