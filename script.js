// =========================================================
// Nav toggle (mobile)
// =========================================================
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// =========================================================
// Scroll reveal
// =========================================================
const revealTargets = document.querySelectorAll(
  '.timeline-item, .work-card, .project-card--calm, .project-card--kids, .character-card, .cert-badge, .note-card, .skill-group'
);

revealTargets.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => io.observe(el));

// =========================================================
// ねむひつじ 性別切り替え
// =========================================================
const nemuImage = document.getElementById('nemuImage');
const nemuButtons = document.querySelectorAll('.nemu-btn');

// 青スカーフ(男の子)の画像素材が用意でき次第、
// 'assets/images/nemuhitsuji-sitting-blue.png' に差し替えてください。
// 現状は同じ画像を使い回しています。
const nemuSources = {
  red: 'assets/images/nemuhitsuji-sitting.png',
  blue: 'assets/images/nemuhitsuji-sitting.png'
};

nemuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    nemuButtons.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const scarf = btn.dataset.scarf;
    if (nemuImage && nemuSources[scarf]) {
      nemuImage.src = nemuSources[scarf];
    }
  });
});

// =========================================================
// ヘッダーの背景を、スクロール位置に応じてわずかに濃くする
// =========================================================
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 20
    ? '0 8px 24px rgba(0,0,0,0.25)'
    : 'none';
}, { passive: true });
