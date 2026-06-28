'use strict';

/**
 * SESMine — Main JavaScript Module
 * Centralised utilities, chart renderers, UI components
 * Version 3.2 | June 2026
 */

(function () {

  // ─── CHART.JS LOADER ───────────────────────────────────────────────────────
  function loadChartJS(cb) {
    if (window.Chart) { cb(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  // ─── CHART DEFAULTS ────────────────────────────────────────────────────────
  function applyChartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.color            = 'rgba(148,163,184,0.8)';
    Chart.defaults.borderColor      = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family      = 'Inter, sans-serif';
    Chart.defaults.font.size        = 11;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15,23,42,0.95)';
    Chart.defaults.plugins.tooltip.borderColor      = 'rgba(245,166,35,0.3)';
    Chart.defaults.plugins.tooltip.borderWidth      = 1;
    Chart.defaults.plugins.tooltip.padding          = 10;
    Chart.defaults.plugins.tooltip.titleColor       = '#F5A623';
    Chart.defaults.plugins.tooltip.bodyColor        = 'rgba(148,163,184,0.9)';
    Chart.defaults.plugins.tooltip.cornerRadius     = 8;
  }

  // Chart instance registry — prevents canvas reuse errors
  const _charts = {};
  function destroyChart(id) {
    if (_charts[id]) { _charts[id].destroy(); delete _charts[id]; }
  }

  // ─── SPARKLINE ─────────────────────────────────────────────────────────────
  function renderSparkline(canvasId, data, color) {
    loadChartJS(() => {
      applyChartDefaults();
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      destroyChart(canvasId);
      _charts[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
          labels: data.map((_, i) => i),
          datasets: [{
            data,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
            backgroundColor: (ctx) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, canvas.height);
              gradient.addColorStop(0, color + '30');
              gradient.addColorStop(1, color + '00');
              return gradient;
            }
          }]
        },
        options: {
          responsive: false,
          animation: { duration: 800, easing: 'easeOutQuart' },
          scales: { x: { display: false }, y: { display: false } },
          plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
      });
    });
  }

  // ─── LINE CHART ────────────────────────────────────────────────────────────
  function renderLineChart(canvasId, datasets, labels) {
    loadChartJS(() => {
      applyChartDefaults();
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      destroyChart(canvasId);
      _charts[canvasId] = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: datasets.map((ds, i) => ({
            data: ds.data,
            borderColor: ds.color,
            borderWidth: 2.5,
            borderDash: ds.dashed ? [6, 3] : [],
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: ds.color,
            pointBorderColor: 'transparent',
            tension: 0.4,
            fill: i === 0,
            backgroundColor: (ctx) => {
              if (i !== 0) return 'transparent';
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, canvas.height);
              gradient.addColorStop(0, ds.color + '22');
              gradient.addColorStop(1, ds.color + '00');
              return gradient;
            }
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: { duration: 1000, easing: 'easeOutQuart' },
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
              ticks: { maxRotation: 0, color: 'rgba(148,163,184,0.7)' }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
              ticks: { color: 'rgba(148,163,184,0.7)', padding: 8 },
              beginAtZero: false
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.dataset.label || 'Value'}: ${ctx.parsed.y.toLocaleString()}`
              }
            }
          }
        }
      });
    });
  }

  // ─── BAR CHART ─────────────────────────────────────────────────────────────
  function renderBarChart(canvasId, data, labels, color) {
    loadChartJS(() => {
      applyChartDefaults();
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      destroyChart(canvasId);
      _charts[canvasId] = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: data.map((_, i) =>
              i === data.indexOf(Math.max(...data))
                ? color
                : color + '70'
            ),
            borderColor: 'transparent',
            borderRadius: 5,
            borderSkipped: false,
            hoverBackgroundColor: color
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: { duration: 900, easing: 'easeOutQuart' },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: 'rgba(148,163,184,0.7)', maxRotation: 0 }
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
              ticks: { color: 'rgba(148,163,184,0.7)', padding: 8 },
              beginAtZero: true
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    });
  }

  // ─── DONUT CHART ───────────────────────────────────────────────────────────
  function renderDonutChart(canvasId, data, colors) {
    loadChartJS(() => {
      applyChartDefaults();
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      destroyChart(canvasId);
      _charts[canvasId] = new Chart(canvas, {
        type: 'doughnut',
        data: {
          datasets: [{
            data,
            backgroundColor: colors,
            borderColor: 'rgba(15,23,42,0.8)',
            borderWidth: 3,
            hoverBorderWidth: 0,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: false,
          cutout: '72%',
          animation: { duration: 1000, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.parsed}%`
              }
            }
          }
        }
      });
    });
  }

  // ─── SIDEBAR ───────────────────────────────────────────────────────────────
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle  = document.getElementById('sidebarToggle');
    if (!sidebar || !toggle) return;

    // Restore collapsed state
    const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (collapsed) sidebar.classList.add('collapsed');

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // Mobile overlay close
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 &&
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !toggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });

    // Mobile toggle
    if (window.innerWidth <= 768) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    }
  }

  // ─── ACTIVE NAV LINK ───────────────────────────────────────────────────────
  function setActiveNavLink() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const href = link.getAttribute('href')?.split('/').pop();
      if (href === path) {
        link.classList.add('active');
      }
    });
  }

  // ─── NAVBAR ────────────────────────────────────────────────────────────────
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');

    // Scroll effect
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    // Mobile toggle
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('open');
        toggle.classList.toggle('active');
      });
    }

    // Close on link click (mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        links?.classList.remove('open');
        toggle?.classList.remove('active');
      });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ─── TOAST NOTIFICATIONS ───────────────────────────────────────────────────
  let _toastContainer = null;

  function showToast(message, type = 'info', duration = 3500) {
    if (!_toastContainer) {
      _toastContainer = document.createElement('div');
      _toastContainer.id = 'toastContainer';
      _toastContainer.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(_toastContainer);
    }

    const icons  = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const colors = { success: '#22C55E', error: '#EF4444', warning: '#F5A623', info: '#3B82F6' };

    const toast = document.createElement('div');
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      background: rgba(15,23,42,0.97);
      border: 1px solid ${colors[type]}40;
      border-left: 3px solid ${colors[type]};
      border-radius: 10px;
      font-size: 0.875rem;
      color: rgba(226,232,240,0.95);
      font-family: Inter, sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      pointer-events: all;
      cursor: pointer;
      max-width: 340px;
      transform: translateX(120%);
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
      opacity: 0;
    `;
    toast.innerHTML = `
      <i class="fas ${icons[type]}" style="color:${colors[type]};font-size:0.9rem;flex-shrink:0;"></i>
      <span style="flex:1;">${message}</span>
      <i class="fas fa-times" style="color:rgba(148,163,184,0.5);font-size:0.75rem;flex-shrink:0;"></i>
    `;

    _toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity   = '1';
      });
    });

    // Dismiss
    const dismiss = () => {
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity   = '0';
      setTimeout(() => toast.remove(), 350);
    };

    toast.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);
  }

  // ─── MODAL HELPERS ─────────────────────────────────────────────────────────
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ─── TABLE SEARCH ──────────────────────────────────────────────────────────
  function initTableSearch(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    if (!input || !table) return;

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      table.querySelectorAll('tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = !query || text.includes(query) ? '' : 'none';
      });
    });
  }

  // ─── RANGE SLIDERS ─────────────────────────────────────────────────────────
  function initRangeSliders() {
    document.querySelectorAll('.range-slider').forEach(slider => {
      const displayId = slider.dataset.rangeDisplay;
      const prefix    = slider.dataset.prefix || '';
      const suffix    = slider.dataset.suffix || '';
      if (!displayId) return;

      const display = document.querySelector(`[data-range-display="${displayId}"]`);
      if (!display) return;

      const update = () => {
        const val = parseFloat(slider.value);
        display.textContent = prefix + (Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2)) + suffix;
      };

      slider.addEventListener('input', update);
      update();
    });
  }

  // ─── SCROLL ANIMATIONS ─────────────────────────────────────────────────────
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-fade-up, .animate-fade-in, .animate-slide-left, .animate-slide-right')
      .forEach(el => observer.observe(el));
  }

  // ─── COUNTER ANIMATION ─────────────────────────────────────────────────────
  function animateCounter(el, target, duration = 1800, prefix = '', suffix = '') {
    const start     = performance.now();
    const startVal  = 0;
    const isDecimal = String(target).includes('.');
    const decimals  = isDecimal ? String(target).split('.')[1].length : 0;

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current  = startVal + (target - startVal) * ease;

      el.textContent = prefix + (isDecimal ? current.toFixed(decimals) : Math.floor(current).toLocaleString()) + suffix;

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  function initCounters() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseFloat(el.dataset.count);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        if (!isNaN(target)) animateCounter(el, target, 1800, prefix, suffix);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  }

  // ─── EXPORT TO CSV ─────────────────────────────────────────────────────────
  function exportToCSV(data, filename = 'export.csv') {
    if (!data || !data.length) {
      showToast('No data to export', 'warning');
      return;
    }
    const headers = Object.keys(data[0]);
    const rows    = data.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '').replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${data.length} rows to ${filename}`, 'success');
  }

  // ─── EXPORT TO PDF (print-based) ───────────────────────────────────────────
  function exportToPDF(elementId, filename = 'export.pdf') {
    showToast('Preparing PDF — print dialog will open', 'info');
    setTimeout(() => window.print(), 600);
  }

  // ─── THEME TOGGLE ──────────────────────────────────────────────────────────
  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const saved = localStorage.getItem('sesmine-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('sesmine-theme', next);
      btn.querySelector('i').className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
  }

  // ─── DROPDOWN MENUS ────────────────────────────────────────────────────────
  function initDropdowns() {
    document.querySelectorAll('[data-dropdown]').forEach(trigger => {
      const targetId = trigger.dataset.dropdown;
      const target   = document.getElementById(targetId);
      if (!target) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = target.classList.contains('open');
        // Close all
        document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
        if (!isOpen) target.classList.add('open');
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    });
  }

  // ─── TABS ──────────────────────────────────────────────────────────────────
  function initTabs(containerSelector) {
    document.querySelectorAll(containerSelector || '[data-tabs]').forEach(container => {
      const tabs    = container.querySelectorAll('[data-tab]');
      const panels  = container.querySelectorAll('[data-panel]');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.dataset.tab;
          tabs.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          tab.classList.add('active');
          container.querySelector(`[data-panel="${target}"]`)?.classList.add('active');
        });
      });
    });
  }

  // ─── FORM VALIDATION ───────────────────────────────────────────────────────
  function validateForm(formId) {
    const form   = document.getElementById(formId);
    if (!form) return false;
    let valid = true;

    form.querySelectorAll('[required]').forEach(field => {
      const isEmpty = !field.value.trim();
      field.style.borderColor = isEmpty ? 'var(--color-red)' : '';
      if (isEmpty) {
        valid = false;
        field.addEventListener('input', () => field.style.borderColor = '', { once: true });
      }
    });

    if (!valid) showToast('Please fill in all required fields', 'error');
    return valid;
  }

  // ─── LOADING STATES ────────────────────────────────────────────────────────
  function setLoading(buttonEl, loading, originalText) {
    if (!buttonEl) return;
    if (loading) {
      buttonEl._originalHTML = buttonEl.innerHTML;
      buttonEl.innerHTML     = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      buttonEl.disabled      = true;
    } else {
      buttonEl.innerHTML = originalText || buttonEl._originalHTML || 'Submit';
      buttonEl.disabled  = false;
    }
  }

  // ─── NOTIFICATION BADGE ────────────────────────────────────────────────────
  function updateNotifBadge(count) {
    const dot = document.querySelector('.notif-dot');
    if (!dot) return;
    if (count > 0) {
      dot.style.display = 'block';
      dot.setAttribute('data-count', count > 9 ? '9+' : count);
    } else {
      dot.style.display = 'none';
    }
  }

  // ─── TOOLTIP INIT ──────────────────────────────────────────────────────────
  function initTooltips() {
    document.querySelectorAll('[title]').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const tip = document.createElement('div');
        tip.className  = 'sesmine-tooltip';
        tip.textContent = el.getAttribute('title');
        tip.style.cssText = `
          position: fixed;
          background: rgba(15,23,42,0.97);
          color: rgba(226,232,240,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 5px 10px;
          font-size: 0.78rem;
          font-family: Inter, sans-serif;
          pointer-events: none;
          z-index: 99999;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(tip);

        const rect = el.getBoundingClientRect();
        tip.style.top  = (rect.top - tip.offsetHeight - 8) + 'px';
        tip.style.left = (rect.left + rect.width / 2 - tip.offsetWidth / 2) + 'px';

        el._tooltip = tip;
        el.removeAttribute('title');
        el._titleText = el.getAttribute('title') || tip.textContent;
      });

      el.addEventListener('mouseleave', () => {
        el._tooltip?.remove();
        if (el._titleText) el.setAttribute('title', el._titleText);
      });
    });
  }

  // ─── KEYBOARD SHORTCUTS ────────────────────────────────────────────────────
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Escape — close any open modal
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => {
          m.classList.remove('active');
          document.body.style.overflow = '';
        });
        document.querySelectorAll('.user-modal-overlay.active').forEach(m => {
          m.classList.remove('active');
          document.body.style.overflow = '';
        });
      }

      // Ctrl/Cmd + K — focus search (if present)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const search = document.querySelector('input[type="text"][placeholder*="Search"]');
        if (search) { search.focus(); search.select(); }
      }
    });
  }

  // ─── LAZY IMAGE LOADING ────────────────────────────────────────────────────
  function initLazyImages() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }

  // ─── PROGRESS BAR ANIMATION ────────────────────────────────────────────────
  function animateProgressBars() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar    = entry.target;
          const target = bar.dataset.width || bar.style.width;
          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.transition = 'width 1.2s cubic-bezier(0.4,0,0.2,1)';
            bar.style.width = target;
          }, 100);
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('[data-animate-bar]').forEach(bar => observer.observe(bar));
  }

  // ─── COPY TO CLIPBOARD ─────────────────────────────────────────────────────
  function copyToClipboard(text, successMsg = 'Copied to clipboard') {
    navigator.clipboard?.writeText(text)
      .then(() => showToast(successMsg, 'success'))
      .catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast(successMsg, 'success');
      });
  }

  // ─── DEBOUNCE UTILITY ──────────────────────────────────────────────────────
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // ─── THROTTLE UTILITY ──────────────────────────────────────────────────────
  function throttle(fn, limit = 100) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= limit) { last = now; fn(...args); }
    };
  }

  // ─── FORMAT UTILITIES ──────────────────────────────────────────────────────
  const format = {
    currency: (val, symbol = '$', decimals = 1) => {
      if (val >= 1e9) return symbol + (val / 1e9).toFixed(decimals) + 'B';
      if (val >= 1e6) return symbol + (val / 1e6).toFixed(decimals) + 'M';
      if (val >= 1e3) return symbol + (val / 1e3).toFixed(decimals) + 'K';
      return symbol + val.toFixed(decimals);
    },
    number: (val) => Number(val).toLocaleString(),
    percent: (val, decimals = 1) => val.toFixed(decimals) + '%',
    date: (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
    relativeTime: (date) => {
      const diff = Date.now() - new Date(date).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1)   return 'Just now';
      if (mins < 60)  return `${mins}m ago`;
      if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
      return `${Math.floor(mins / 1440)}d ago`;
    }
  };

  // ─── AUTO-INIT ON DOM READY ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initCounters();
    initKeyboardShortcuts();
    initLazyImages();
    animateProgressBars();
    initThemeToggle();
    initDropdowns();
    initTooltips();

    // Auto-init range sliders if present
    if (document.querySelector('.range-slider')) initRangeSliders();

    // Auto-init table search if both elements present
    const searchInput = document.querySelector('[id$="Search"]');
    const searchTable = document.querySelector('[id$="Table"]');
    if (searchInput && searchTable) {
      initTableSearch(searchInput.id, searchTable.id);
    }
  });

  // ─── PUBLIC API ────────────────────────────────────────────────────────────
  window.SESMine = {
    // Charts
    renderSparkline,
    renderLineChart,
    renderBarChart,
    renderDonutChart,

    // UI
    initSidebar,
    setActiveNavLink,
    initNavbar,
    showToast,
    openModal,
    closeModal,
    initTableSearch,
    initRangeSliders,
    initTabs,
    setLoading,
    updateNotifBadge,

    // Data
    exportToCSV,
    exportToPDF,
    copyToClipboard,
    validateForm,

    // Utilities
    debounce,
    throttle,
    format,
    animateCounter
  };

})();
