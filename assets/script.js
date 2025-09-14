/* ---------- NAVIGATION ---------- */
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('.section');

function activateSection(hash) {
  // remove all actives
  navLinks.forEach(l => l.classList.remove('active'));
  sections.forEach(s => s.classList.remove('active'));

  // find link and section
  const link = Array.from(navLinks).find(l => l.getAttribute('href') === hash);
  if (link) link.classList.add('active');
  const sec = document.querySelector(hash);
  if (sec) sec.classList.add('active');
}

// init: keep hash or default to #home
const initialHash = location.hash && document.querySelector(location.hash) ? location.hash : '#home';
activateSection(initialHash);

// attach clicks
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const href = link.getAttribute('href');
    history.pushState(null, '', href);
    activateSection(href);

    // fire any on-show hooks
    if (href === '#skills') renderSkillsChart();
  });
});

// handle back/forward
window.addEventListener('popstate', () => {
  const h = location.hash || '#home';
  activateSection(h);
});

/* ---------- FILTERS (Portfolio) ---------- */
const filters = document.querySelectorAll('.filter');
const items = document.querySelectorAll('.portfolio-item');

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    items.forEach(it => {
      if (f === 'all' || it.classList.contains(f)) it.style.display = '';
      else it.style.display = 'none';
    });
  });
});

/* ---------- BLOG MODAL ---------- */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

document.querySelectorAll('.read-more').forEach(btn => {
  btn.addEventListener('click', () => {
    const title = btn.dataset.title;
    const body = btn.dataset.body;
    modalTitle.textContent = title;
    modalBody.textContent = body;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

modalClose.addEventListener('click', () => {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show'); document.body.style.overflow = '';
  }
});

/* ---------- CONTACT FORM (stub) ---------- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // simple UI feedback, replace with real backend later
    alert('Thanks — message sent (this is a demo stub).');
    contactForm.reset();
  });
}

/* ---------- SKILLS CHART (canvas radial grouped bars) ---------- */
const skillsData = [
  { label: 'Frontend', value: 85, colorStart: '#60a5fa', colorEnd: '#6ee7b7' },
  { label: 'Backend', value: 78, colorStart: '#7c3aed', colorEnd: '#60a5fa' },
  { label: 'Databases', value: 70, colorStart: '#f97316', colorEnd: '#f59e0b' },
  { label: 'Dev Tools', value: 75, colorStart: '#10b981', colorEnd: '#34d399' },
  { label: 'Communication', value: 88, colorStart: '#ef4444', colorEnd: '#f97316' }
];

let chartDrawn = false;
function renderSkillsChart() {
  if (chartDrawn) return;
  const c = document.getElementById('skillsChart');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  const cx = w/2, cy = h/2;
  const radiusBase = Math.min(w,h) * 0.32;
  const gap = 18;
  ctx.clearRect(0,0,w,h);

  // draw background circles
  ctx.font = '14px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // animate via requestAnimationFrame
  let tStart = null;
  function animate(ts) {
    if (!tStart) tStart = ts;
    const t = Math.min((ts - tStart) / 900, 1); // 0..1 over 900ms

    ctx.clearRect(0,0,w,h);
    // center title
    ctx.fillStyle = '#cfe7ff';
    ctx.font = '600 16px Inter, Arial';
    ctx.fillText('Skills Overview', cx, cy - radiusBase - 16);

    // draw rings
    skillsData.forEach((s, idx) => {
      const r = radiusBase + idx*(gap + 8);
      const thickness = 12;
      // background ring
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      ctx.stroke();

      // foreground arc (animated)
      const endAngle = (Math.PI*2) * (s.value/100) * t;
      // gradient
      const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      grad.addColorStop(0, s.colorStart); grad.addColorStop(1, s.colorEnd);
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + endAngle);
      ctx.stroke();

      // label at right side for each ring
      const angle = -Math.PI/2 + endAngle;
      const lx = cx + Math.cos(angle) * (r + 26);
      const ly = cy + Math.sin(angle) * (r + 26);
      // small dot
      ctx.beginPath(); ctx.fillStyle = s.colorEnd; ctx.arc(lx, ly, 4, 0, Math.PI*2); ctx.fill();

      // text
      ctx.fillStyle = '#e6eef6';
      ctx.font = '600 12px Inter, Arial';
      ctx.fillText(`${s.label} — ${Math.round(s.value*t)}%`, cx + radiusBase + 110, cy - radiusBase + idx * 24);
    });

    if (t < 1) requestAnimationFrame(animate);
    else chartDrawn = true;
  }
  requestAnimationFrame(animate);
}

// if skills section is currently visible on load, draw
if (location.hash === '#skills') renderSkillsChart();

// also trigger when user clicks nav to skills (nav handler above already calls renderSkillsChart)
