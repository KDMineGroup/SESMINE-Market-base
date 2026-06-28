/* ═══════════════════════════════════════════════════════════════════════════
   SESMine Main JavaScript Engine v4.0
   Handles: Sidebar, Charts, Toasts, Modals, Counters, Scroll FX, Utilities
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Namespace ────────────────────────────────────────────────────────────── */
window.SESMine = window.SESMine || {};

/* ═══════════════════════════════════════════════════════════════════════════
   1. TOAST SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.toast = (function () {
  const ICONS = {
    success: 'fa-check-circle',
    error:   'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info:    'fa-info-circle'
  };

  function getContainer() {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      document.body.appendChild(c);
    }
    return c;
  }

  function show(msg, type = 'info', duration = 3500) {
    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${ICONS[type] || ICONS.info} toast-icon"></i>
      <span class="toast-msg">${msg}</span>
      <i class="fas fa-times toast-close" onclick="this.parentElement.remove()"></i>
      <div class="toast-progress" style="animation-duration:${duration}ms;"></div>
    `;
    toast.addEventListener('click', () => dismiss(toast));
    container.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => dismiss(toast), duration);
    return toast;
  }

  function dismiss(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }

  // Convenience aliases
  return {
    show,
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur || 5000),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info:    (msg, dur) => show(msg, 'info',    dur)
  };
})();

// Global shorthand
window.showToast = (msg, type, dur) => SESMine.toast.show(msg, type, dur);

/* ═══════════════════════════════════════════════════════════════════════════
   2. SIDEBAR
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.sidebar = (function () {
  let sidebar, overlay, isCollapsed = false, isMobileOpen = false;

  function init() {
    sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    // Create mobile overlay
    overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.7);
      backdrop-filter:blur(4px);z-index:299;
      display:none;opacity:0;transition:opacity 0.3s ease;
    `;
    overlay.addEventListener('click', closeMobile);
    document.body.appendChild(overlay);

    // Collapse toggle button
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    collapseBtn?.addEventListener('click', toggleCollapse);

    // Mobile toggle
    const mobileBtn = document.getElementById('sidebarMobileBtn');
    mobileBtn?.addEventListener('click', toggleMobile);

    // Keyboard shortcut: Ctrl/Cmd + B
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        if (window.innerWidth <= 768) toggleMobile();
        else toggleCollapse();
      }
    });

    // Restore collapsed state
    const saved = localStorage.getItem('sesmine_sidebar_collapsed');
    if (saved === 'true') {
      isCollapsed = true;
      sidebar.classList.add('collapsed');
    }

    // Active link highlighting
    highlightActiveLink();

    // Responsive handler
    window.addEventListener('resize', handleResize, { passive: true });
  }

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
    sidebar.classList.toggle('collapsed', isCollapsed);
    localStorage.setItem('sesmine_sidebar_collapsed', isCollapsed);

    const icon = document.querySelector('#sidebarCollapseBtn i');
    if (icon) {
      icon.className = isCollapsed
        ? 'fas fa-chevron-right'
        : 'fas fa-chevron-left';
    }
  }

  function toggleMobile() {
    isMobileOpen ? closeMobile() : openMobile();
  }

  function openMobile() {
    isMobileOpen = true;
    sidebar.classList.add('open');
    overlay.style.display = 'block';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    document.body.style.overflow = 'hidden';
  }

  function closeMobile() {
    isMobileOpen = false;
    sidebar.classList.remove('open');
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
  }

  function handleResize() {
    if (window.innerWidth > 768 && isMobileOpen) closeMobile();
  }

  function highlightActiveLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const isActive = href !== '#' && (
        path.endsWith(href) ||
        path.includes(href.replace('../','').replace('.html',''))
      );
      link.classList.toggle('active', isActive);
    });
  }

  return { init, toggleCollapse, toggleMobile, openMobile, closeMobile };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   3. MODAL SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.modal = (function () {
  const modals = new Map();

  function register(id) {
    const el = document.getElementById(id);
    if (!el) return null;

    const overlay = el.querySelector('.modal-overlay');
    const closeBtn = el.querySelector('.modal-close');

    overlay?.addEventListener('click', () => close(id));
    closeBtn?.addEventListener('click', () => close(id));

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && el.classList.contains('active')) close(id);
    });

    modals.set(id, el);
    return el;
  }

  function open(id) {
    const el = modals.get(id) || register(id);
    if (!el) return;
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
    el.querySelector('.modal-box')?.focus();
  }

  function close(id) {
    const el = modals.get(id);
    if (!el) return;
    el.classList.remove('active');
    document.body.style.overflow = '';
  }

  function closeAll() {
    modals.forEach((_, id) => close(id));
  }

  // Confirm dialog
  function confirm(opts = {}) {
    return new Promise(resolve => {
      const {
        title   = 'Are you sure?',
        message = 'This action cannot be undone.',
        confirmText = 'Confirm',
        cancelText  = 'Cancel',
        type        = 'warning'
      } = opts;

      const colors = {
        warning: 'var(--gold-400)',
        danger:  'var(--red-400)',
        info:    'var(--cyan-400)'
      };
      const icons = {
        warning: 'fa-exclamation-triangle',
        danger:  'fa-trash-alt',
        info:    'fa-info-circle'
      };

      const id = `confirm-modal-${Date.now()}`;
      const html = `
        <div class="modal active" id="${id}">
          <div class="modal-overlay"></div>
          <div class="modal-box" style="max-width:420px;">
            <div class="modal-header">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:${colors[type]};">
                  <i class="fas ${icons[type]}"></i>
                </div>
                <span class="modal-title">${title}</span>
              </div>
              <button class="modal-close" onclick="document.getElementById('${id}').remove();"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
              <p style="font-size:0.9rem;color:var(--text-400);line-height:1.65;">${message}</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost btn-sm" id="${id}-cancel">${cancelText}</button>
              <button class="btn btn-sm" id="${id}-confirm"
                style="background:${colors[type]};color:var(--bg-900);font-weight:700;">
                ${confirmText}
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);

      document.getElementById(`${id}-confirm`)?.addEventListener('click', () => {
        document.getElementById(id)?.remove();
        resolve(true);
      });
      document.getElementById(`${id}-cancel`)?.addEventListener('click', () => {
        document.getElementById(id)?.remove();
        resolve(false);
      });
      document.querySelector(`#${id} .modal-overlay`)?.addEventListener('click', () => {
        document.getElementById(id)?.remove();
        resolve(false);
      });
    });
  }

  return { register, open, close, closeAll, confirm };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   4. DROPDOWN SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.dropdown = (function () {
  function init() {
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-dropdown]');
      if (trigger) {
        e.stopPropagation();
        const targetId = trigger.dataset.dropdown;
        const menu = document.getElementById(targetId);
        if (!menu) return;
        const isOpen = menu.classList.contains('open');
        closeAll();
        if (!isOpen) {
          menu.classList.add('open');
          trigger.setAttribute('aria-expanded','true');
        }
        return;
      }
      closeAll();
    });
  }

  function closeAll() {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => {
      m.classList.remove('open');
      m.previousElementSibling?.setAttribute('aria-expanded','false');
    });
  }

  return { init, closeAll };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   5. TABS SYSTEM
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.tabs = (function () {
  function init(containerSelector = '[data-tabs]') {
    document.querySelectorAll(containerSelector).forEach(container => {
      const buttons = container.querySelectorAll('.tab-btn, .tab-underline-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          if (!target) return;

          // Deactivate all
          buttons.forEach(b => b.classList.remove('active'));
          container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

          // Activate target
          btn.classList.add('active');
          const panel = document.getElementById(target) ||
                        container.querySelector(`[data-tab-panel="${target}"]`);
          panel?.classList.add('active');
        });
      });
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   6. SCROLL ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.scrollAnim = (function () {
  let observer;

  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Instantly show all animated elements
      document.querySelectorAll(
        '.animate-fade-up,.animate-fade-in,.animate-fade-left,.animate-fade-right,.animate-scale'
      ).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll(
      '.animate-fade-up,.animate-fade-in,.animate-fade-left,.animate-fade-right,.animate-scale'
    ).forEach(el => observer.observe(el));
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   7. COUNTER ANIMATION
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.counters = (function () {
  function animateOne(el) {
    const target   = parseFloat(el.dataset.count);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const isFloat  = target % 1 !== 0;
    const duration = parseInt(el.dataset.duration) || 2200;
    const start    = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = prefix +
        (isFloat
          ? value.toFixed(1)
          : Math.round(value).toLocaleString()
        ) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function init() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateOne(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
  }

  return { init, animateOne };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   8. CHART ENGINE (Canvas-based, no dependencies)
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.charts = (function () {

  /* ── Line Chart ── */
  function line(canvasId, datasets, labels, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = canvas.offsetWidth  || 600;
    const H = canvas.height = canvas.offsetHeight || 200;

    const pad = { top: 20, right: 20, bottom: 36, left: 48 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top  - pad.bottom;

    // Find data range
    const allVals = datasets.flatMap(d => d.data);
    const minVal  = opts.minVal ?? Math.min(...allVals) * 0.9;
    const maxVal  = opts.maxVal ?? Math.max(...allVals) * 1.1;
    const range   = maxVal - minVal || 1;

    const toX = i => pad.left + (i / (labels.length - 1)) * cW;
    const toY = v => pad.top  + cH - ((v - minVal) / range) * cH;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * cH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    }

    // X labels
    ctx.fillStyle  = 'rgba(96,128,160,0.9)';
    ctx.font       = '10px Inter, sans-serif';
    ctx.textAlign  = 'center';
    labels.forEach((label, i) => {
      if (i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1) {
        ctx.fillText(label, toX(i), H - 8);
      }
    });

    // Y labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = minVal + (range * (4 - i) / 4);
      const y   = pad.top + (i / 4) * cH;
      ctx.fillText(
        val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` :
        val >= 1000    ? `$${(val/1000).toFixed(0)}K`    :
        val.toFixed(0),
        pad.left - 6, y + 4
      );
    }

    // Draw each dataset
    datasets.forEach(ds => {
      const color = ds.color || '#00D4FF';

      // Gradient fill
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + cH);
      grad.addColorStop(0,   color.replace(')',',0.18)').replace('rgb','rgba'));
      grad.addColorStop(0.6, color.replace(')',',0.05)').replace('rgb','rgba'));
      grad.addColorStop(1,   'rgba(0,0,0,0)');

      // Fill area
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(ds.data[0]));
      ds.data.forEach((v, i) => {
        if (i === 0) return;
        const x0 = toX(i-1), y0 = toY(ds.data[i-1]);
        const x1 = toX(i),   y1 = toY(v);
        const cpx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
      });
      ctx.lineTo(toX(ds.data.length - 1), pad.top + cH);
      ctx.lineTo(toX(0), pad.top + cH);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(ds.data[0]));
      ds.data.forEach((v, i) => {
        if (i === 0) return;
        const x0 = toX(i-1), y0 = toY(ds.data[i-1]);
        const x1 = toX(i),   y1 = toY(v);
        const cpx = (x0 + x1) / 2;
        ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2.5;
      ctx.lineJoin    = 'round';
      ctx.stroke();

      // Dots on last point
      const lastX = toX(ds.data.length - 1);
      const lastY = toY(ds.data[ds.data.length - 1]);
      ctx.beginPath();
      ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
      ctx.fillStyle   = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(4,12,26,0.8)';
      ctx.lineWidth   = 2;
      ctx.stroke();
    });
  }

  /* ── Bar Chart ── */
  function bar(canvasId, data, labels, colors, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = canvas.offsetWidth  || 500;
    const H = canvas.height = canvas.offsetHeight || 200;

    const pad = { top: 16, right: 16, bottom: 36, left: 48 };
    const cW  = W - pad.left - pad.right;
    const cH  = H - pad.top  - pad.bottom;
    const maxVal = Math.max(...data) * 1.15 || 1;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * cH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    }

    // Y labels
    ctx.fillStyle = 'rgba(96,128,160,0.9)';
    ctx.font      = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const val = maxVal * (4 - i) / 4;
      ctx.fillText(
        val >= 1000000 ? `${(val/1000000).toFixed(1)}M` :
        val >= 1000    ? `${(val/1000).toFixed(0)}K`    :
        val.toFixed(0),
        pad.left - 6,
        pad.top + (i / 4) * cH + 4
      );
    }

    const barW   = (cW / data.length) * 0.6;
    const barGap = (cW / data.length) * 0.4;

    data.forEach((val, i) => {
      const x   = pad.left + i * (cW / data.length) + barGap / 2;
      const barH = (val / maxVal) * cH;
      const y   = pad.top + cH - barH;
      const col = Array.isArray(colors) ? (colors[i] || colors[0]) : colors;

      // Gradient
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, col);
      grad.addColorStop(1, col.replace(')',',0.4)').replace('rgb','rgba'));

      // Rounded top
      const r = Math.min(4, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // X label
      ctx.fillStyle = 'rgba(96,128,160,0.9)';
      ctx.textAlign = 'center';
      ctx.font      = '10px Inter, sans-serif';
      if (labels[i]) ctx.fillText(labels[i], x + barW / 2, H - 8);
    });
  }

  /* ── Donut Chart ── */
  function donut(canvasId, data, colors, labels, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = Math.min(canvas.offsetWidth || 200, canvas.offsetHeight || 200);
    canvas.width  = size;
    canvas.height = size;

    const cx     = size / 2;
    const cy     = size / 2;
    const radius = size * 0.38;
    const thick  = size * 0.14;
    const total  = data.reduce((a, b) => a + b, 0) || 1;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;
    const gap = 0.04;

    data.forEach((val, i) => {
      const slice = (val / total) * (Math.PI * 2 - gap * data.length);
      const end   = startAngle + slice;
      const col   = colors[i] || '#00D4FF';

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle + gap/2, end - gap/2);
      ctx.arc(cx, cy, radius - thick, end - gap/2, startAngle + gap/2, true);
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, radius - thick, cx, cy, radius);
      grad.addColorStop(0, col + 'CC');
      grad.addColorStop(1, col);
      ctx.fillStyle = grad;
      ctx.fill();

      startAngle = end;
    });

    // Center text
    if (opts.centerText) {
      ctx.fillStyle = 'rgba(240,246,255,0.9)';
      ctx.font      = `bold ${size * 0.12}px Space Grotesk, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(opts.centerText, cx, cy - size * 0.04);

      ctx.fillStyle = 'rgba(96,128,160,0.8)';
      ctx.font      = `${size * 0.07}px Inter, sans-serif`;
      ctx.fillText(opts.centerSub || '', cx, cy + size * 0.08);
    }
  }

  /* ── Gauge Chart ── */
  function gauge(canvasId, value, max, color, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = canvas.offsetWidth  || 200;
    const H = canvas.height = canvas.offsetHeight || 120;

    const cx = W / 2;
    const cy = H * 0.85;
    const r  = Math.min(W, H * 2) * 0.38;

    ctx.clearRect(0, 0, W, H);

    const startA = Math.PI;
    const endA   = Math.PI * 2;
    const pct    = Math.min(value / max, 1);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = r * 0.22;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Value arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, startA + pct * Math.PI);
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + 'AA');
    ctx.strokeStyle = grad;
    ctx.lineWidth   = r * 0.22;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA + pct * Math.PI - 0.05, startA + pct * Math.PI);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center text
    ctx.fillStyle    = 'rgba(240,246,255,0.95)';
    ctx.font         = `bold ${r * 0.4}px Space Grotesk, sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.label || `${Math.round(pct * 100)}%`, cx, cy - r * 0.1);

    ctx.fillStyle = 'rgba(96,128,160,0.8)';
    ctx.font      = `${r * 0.22}px Inter, sans-serif`;
    ctx.fillText(opts.subLabel || '', cx, cy + r * 0.25);
  }

  /* ── Sparkline ── */
  function sparkline(canvasId, data, color = '#00D4FF') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = canvas.offsetWidth  || 100;
    const H = canvas.height = canvas.offsetHeight || 32;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const rng = max - min || 1;

    const toX = i => (i / (data.length - 1)) * W;
    const toY = v => H - ((v - min) / rng) * H * 0.8 - H * 0.1;

    ctx.clearRect(0, 0, W, H);

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   color + '30');
    grad.addColorStop(1,   'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    data.forEach((v, i) => {
      if (i === 0) return;
      const x0 = toX(i-1), y0 = toY(data[i-1]);
      const x1 = toX(i),   y1 = toY(v);
      ctx.bezierCurveTo((x0+x1)/2, y0, (x0+x1)/2, y1, x1, y1);
    });
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0]));
    data.forEach((v, i) => {
      if (i === 0) return;
      const x0 = toX(i-1), y0 = toY(data[i-1]);
      const x1 = toX(i),   y1 = toY(v);
      ctx.bezierCurveTo((x0+x1)/2, y0, (x0+x1)/2, y1, x1, y1);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }

  return { line, bar, donut, gauge, sparkline };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   9. DATA TABLE
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.table = (function () {
  function init(tableId, opts = {}) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const headers = table.querySelectorAll('thead th[data-sort]');
    let sortCol = null, sortDir = 1;

    headers.forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (sortCol === col) sortDir *= -1;
        else { sortCol = col; sortDir = 1; }

        headers.forEach(h => h.classList.remove('sort-asc','sort-desc'));
        th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');

        sortRows(table, col, sortDir);
      });
    });

    // Search
    const searchId = opts.searchInput;
    if (searchId) {
      document.getElementById(searchId)?.addEventListener('input', e => {
        filterRows(table, e.target.value.toLowerCase());
      });
    }
  }

  function sortRows(table, col, dir) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const colIdx = Array.from(table.querySelectorAll('thead th')).findIndex(th => th.dataset.sort === col);
    if (colIdx < 0) return;

    rows.sort((a, b) => {
      const aVal = a.cells[colIdx]?.textContent.trim() || '';
      const bVal = b.cells[colIdx]?.textContent.trim() || '';
      const aNum = parseFloat(aVal.replace(/[^0-9.-]/g,''));
      const bNum = parseFloat(bVal.replace(/[^0-9.-]/g,''));
      if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * dir;
      return aVal.localeCompare(bVal) * dir;
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  function filterRows(table, query) {
    table.querySelectorAll('tbody tr').forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   10. PROGRESS BARS
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.progress = (function () {
  function init() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target.querySelector('.progress-bar-fill');
          const pct  = entry.target.dataset.progress || '0';
          if (fill) {
            setTimeout(() => { fill.style.width = pct + '%'; }, 100);
          }
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-progress]').forEach(el => obs.observe(el));
  }

  function set(el, pct, color) {
    const fill = typeof el === 'string'
      ? document.querySelector(el + ' .progress-bar-fill')
      : el?.querySelector('.progress-bar-fill');
    if (!fill) return;
    fill.style.width = Math.min(100, Math.max(0, pct)) + '%';
    if (color) fill.style.background = color;
  }

  return { init, set };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   11. TOPBAR SEARCH
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.search = (function () {
  function init() {
    // Keyboard shortcut: Ctrl/Cmd + K
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('.topbar-search input');
        if (input) {
          input.focus();
          input.select();
        }
      }
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   12. RIPPLE EFFECT
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.ripple = (function () {
  function init() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn-primary, .btn-gold, [data-ripple]');
      if (!btn) return;
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `
        width:${size}px;height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top - size/2}px;
      `;
      btn.style.position = btn.style.position || 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   13. NAVBAR (Public pages)
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.navbar = (function () {
  function init() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Scroll effect
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile toggle
    const toggle  = document.getElementById('navToggle');
    const links   = document.getElementById('navLinks');
    toggle?.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links?.classList.toggle('open');
    });

    // Close on link click
    links?.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        toggle?.classList.remove('active');
        links.classList.remove('open');
      });
    });

    // Active link on scroll
    const sections   = document.querySelectorAll('section[id]');
    const navLinks   = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 130) current = sec.id;
      });
      navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href === `#${current}`);
      });
    }, { passive: true });
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   14. THEME / PREFERENCES
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.prefs = (function () {
  function get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(`sesmine_${key}`)) ?? fallback; }
    catch { return fallback; }
  }

  function set(key, val) {
    try { localStorage.setItem(`sesmine_${key}`, JSON.stringify(val)); }
    catch {}
  }

  return { get, set };
})();

/* ═══════════════════════════════════════════════════════════════════════════
   15. UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

SESMine.utils = {
  // Format currency
  currency(val, currency = 'USD', compact = false) {
    if (compact) {
      if (val >= 1e9)  return `$${(val/1e9).toFixed(1)}B`;
      if (val >= 1e6)  return `$${(val/1e6).toFixed(1)}M`;
      if (val >= 1e3)  return `$${(val/1e3).toFixed(0)}K`;
      return `$${val.toFixed(0)}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  },

  // Format number
  number(val, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(val);
  },

  // Format percentage
  percent(val, decimals = 1) {
    return `${val >= 0 ? '+' : ''}${val.toFixed(decimals)}%`;
  },

  // Format date
  date(d, opts = {}) {
    return new Intl.DateTimeFormat('en-AU', {
      day: 'numeric', month: 'short', year: 'numeric', ...opts
    }).format(new Date(d));
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Throttle
  throttle(fn, limit = 100) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= limit) { last = now; fn(...args); }
    };
  },

  // Copy to clipboard
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      SESMine.toast.success('Copied to clipboard');
      return true;
    } catch {
      SESMine.toast.error('Failed to copy');
      return false;
    }
  },

  // Generate random ID
  uid(prefix = 'ses') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
  },

  // Deep clone
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  // Truncate text
  truncate(str, len = 60) {
    return str.length > len ? str.slice(0, len) + '…' : str;
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   16. AUTO-INIT ON DOM READY
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Core systems — always init
  SESMine.scrollAnim.init();
  SESMine.counters.init();
  SESMine.dropdown.init();
  SESMine.tabs.init();
  SESMine.progress.init();
  SESMine.ripple.init();
  SESMine.search.init();

  // Sidebar — only on dashboard pages
  if (document.getElementById('sidebar')) {
    SESMine.sidebar.init();
  }

  // Navbar — only on public pages
  if (document.getElementById('navbar')) {
    SESMine.navbar.init();
  }

  // Register all modals
  document.querySelectorAll('.modal[id]').forEach(m => {
    SESMine.modal.register(m.id);
  });

  // Global modal open triggers
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      SESMine.modal.open(btn.dataset.modalOpen);
    });
  });

  // Global modal close triggers
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      SESMine.modal.close(btn.dataset.modalClose);
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Auto-resize textareas
  document.querySelectorAll('textarea.form-textarea').forEach(ta => {
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  });

  // Tooltips (title attribute → custom tooltip)
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', e => {
      const tip = document.createElement('div');
      tip.className = 'ses-tooltip';
      tip.textContent = el.dataset.tooltip;
      tip.style.cssText = `
        position:fixed;z-index:99999;
        background:rgba(10,18,40,0.98);
        border:1px solid rgba(0,212,255,0.2);
        border-radius:6px;
        padding:6px 10px;
        font-size:0.75rem;
        font-family:Inter,sans-serif;
        color:rgba(240,246,255,0.9);
        pointer-events:none;
        white-space:nowrap;
        box-shadow:0 4px 16px rgba(0,0,0,0.4);
        backdrop-filter:blur(8px);
        max-width:240px;
        white-space:normal;
        line-height:1.4;
      `;
      document.body.appendChild(tip);
      el._tooltip = tip;

      const rect = el.getBoundingClientRect();
      const tipW = tip.offsetWidth;
      const tipH = tip.offsetHeight;
      let left = rect.left + rect.width / 2 - tipW / 2;
      let top  = rect.top - tipH - 8;

      // Flip if off-screen top
      if (top < 8) top = rect.bottom + 8;
      // Clamp horizontal
      left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8));

      tip.style.left = left + 'px';
      tip.style.top  = top  + 'px';
      tip.style.opacity = '0';
      tip.style.transform = 'translateY(4px)';
      tip.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
      requestAnimationFrame(() => {
        tip.style.opacity  = '1';
        tip.style.transform = 'translateY(0)';
      });
    });

    el.addEventListener('mouseleave', () => {
      el._tooltip?.remove();
      el._tooltip = null;
    });
  });

  // ── Page entrance animation ──────────────────────────────────────────────
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  console.log(
    '%c⛏ SESMine v4.0 %c AI Mining Intelligence Platform ',
    'background:#00D4FF;color:#020810;font-weight:800;padding:4px 8px;border-radius:4px 0 0 4px;font-size:12px;',
    'background:#0A1228;color:#00D4FF;font-weight:600;padding:4px 8px;border-radius:0 4px 4px 0;font-size:12px;border:1px solid #00D4FF33;'
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   17. EXPORT LEGACY API
   (Backwards-compatible with older page scripts that call window.SESMine.*)
   ═══════════════════════════════════════════════════════════════════════════ */

// Convenience aliases for dashboard pages
SESMine.showToast       = (msg, type, dur) => SESMine.toast.show(msg, type, dur);
SESMine.openModal       = (id)             => SESMine.modal.open(id);
SESMine.closeModal      = (id)             => SESMine.modal.close(id);
SESMine.confirm         = (opts)           => SESMine.modal.confirm(opts);
SESMine.renderLineChart = (id, ds, labels) => SESMine.charts.line(id, ds, labels);
SESMine.renderBarChart  = (id, d, l, c)    => SESMine.charts.bar(id, d, l, c);
SESMine.renderDonutChart= (id, d, c, l)    => SESMine.charts.donut(id, d, c, l);
SESMine.renderGauge     = (id, v, m, c, o) => SESMine.charts.gauge(id, v, m, c, o);
SESMine.renderSparkline = (id, d, c)       => SESMine.charts.sparkline(id, d, c);
SESMine.initSidebar     = ()               => SESMine.sidebar.init();
SESMine.initNavbar      = ()               => SESMine.navbar.init();
SESMine.initCounters    = ()               => SESMine.counters.init();
SESMine.initScrollAnim  = ()               => SESMine.scrollAnim.init();
SESMine.copyToClipboard = (t)              => SESMine.utils.copy(t);
SESMine.formatCurrency  = (v, c, x)        => SESMine.utils.currency(v, c, x);
SESMine.formatNumber    = (v, d)           => SESMine.utils.number(v, d);
SESMine.debounce        = (fn, d)          => SESMine.utils.debounce(fn, d);
