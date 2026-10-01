// =========================================================
// 効果音(はじめはオフ)。音声ファイルは使わず、WebAudio でその場で合成する
// 他のファイルには手を入れず、クリックや実績のお知らせを横から拾って鳴らす
// =========================================================
(() => {
  const STORE_KEY = 'yoshidam:sound';
  const VOLUME = 0.18;
  const toggle = document.getElementById('soundToggle');
  if (!toggle) return;

  let enabled = false;
  try { enabled = localStorage.getItem(STORE_KEY) === 'on'; } catch (e) { /* 使えなければ オフのまま */ }
  let ctx = null;
  let master = null;

  // ブラウザは、ユーザーの操作の中でしか音を出せないので、オンにしたときに用意する
  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);
    return ctx;
  }

  // 音の部品: 周波数を f0→f1 に動かす短い音
  function tone({ f0, f1 = f0, dur = 0.12, type = 'sine', vol = 1, at = 0 }) {
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }
  const arp = (freqs, step, opts = {}) => freqs.forEach((f, i) => tone({ f0: f, dur: step * 1.8, at: i * step, ...opts }));

  const SOUNDS = {
    on:      () => arp([660, 990], 0.07, { type: 'triangle', vol: 0.6 }),
    tap:     () => tone({ f0: 620, f1: 820, dur: 0.06, vol: 0.5 }),
    piko:    () => tone({ f0: 420, f1: 980, dur: 0.16, type: 'triangle', vol: 0.8 }),
    roll:    () => { tone({ f0: 300, f1: 140, dur: 0.35, type: 'sine', vol: 0.7 }); tone({ f0: 900, f1: 500, dur: 0.12, type: 'triangle', vol: 0.3, at: 0.05 }); },
    chime:   () => arp([784, 1046, 1318], 0.06, { type: 'sine', vol: 0.5 }),
    acorn:   () => arp([880, 1175, 1568], 0.055, { type: 'triangle', vol: 0.7 }),
    unlock:  () => arp([523, 659, 784, 1046], 0.08, { type: 'triangle', vol: 0.6 }),
    open:    () => tone({ f0: 520, f1: 700, dur: 0.1, vol: 0.4 }),
  };

  // 同じ音が一度にたくさん重ならないよう、60ms 以内の連打は間引く
  const lastAt = {};
  function play(name) {
    if (!enabled || !ensureCtx() || !SOUNDS[name]) return;
    const now = performance.now();
    if (now - (lastAt[name] || 0) < 60) return;
    lastAt[name] = now;
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[name]();
  }

  function render() {
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '効果音をオフにする' : '効果音をオンにする');
  }
  toggle.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(STORE_KEY, enabled ? 'on' : 'off'); } catch (e) { /* 保存できなくても動く */ }
    render();
    play('on');
  });
  render();

  // どこを押したかで鳴らし分ける
  const RULES = [
    ['.piko-pal', 'piko'],
    ['#dangoButton', 'roll'],
    ['.nemu-btn', 'chime'],
    ['.acorn', 'acorn'],
    ['.craft-tabs [role="tab"], .log-dot, .cycle-step', 'tap'],
    ['#questChip, [data-open-quest]', 'open'],
  ];
  document.addEventListener('click', e => {
    for (const [sel, name] of RULES) {
      if (e.target.closest(sel)) { play(name); return; }
    }
  });
  // 実績の解除は game.js が知らせてくれる(どんぐりの音と重ならないよう少し遅らせる)
  document.addEventListener('quest:unlock', () => setTimeout(() => play('unlock'), 350));
})();
