/* ═══════════════════════════════════════════════════════════════════════════
   SESMine Platform — Main JavaScript Engine v5.0
   Global utilities, UI components, animations, charts, news API
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════
   1. GLOBAL NAMESPACE
══════════════════════════════════════════════ */
window.SES = window.SES || {};

/* ══════════════════════════════════════════════
   2. DOM READY
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  SES.UI.init();
  SES.Scroll.init();
  SES.Navbar.init();
  SES.Ticker.init();
  SES.Tooltips.init();
  SES.Ripple.init();
  SES.Counter.init();
  SES.PageLoader.hide();
});

/* ══════════════════════════════════════════════
   3. TOAST SYSTEM
══════════════════════════════════════════════ */
SES.Toast = (() => {
  const cfg = window.SESConfig?.toast || { duration: 3500, maxToasts: 5 };

  function getContainer() {
    let c = document.getElementById('toastContainer');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toastContainer';
      c.style.cssText = `
        position:fixed;bottom:24px;right:24px;
        z-index:9999;display:flex;flex-direction:column;gap:8px;
        pointer-events:none;
      `;
      document.body.appendChild(c);
    }
    return c;
  }

  const iconMap = {
    success: { icon: 'fa-check-circle',       color: '#4ADE80' },
    error:   { icon: 'fa-exclamation-circle',  color: '#FCA5A5' },
    warning: { icon: 'fa-exclamation-triangle',color: '#FDB07A' },
    info:    { icon: 'fa-info-circle',         color: '#00D4FF' }
  };

  function show(message, type = 'info', duration = cfg.duration) {
    const container = getContainer();

    // Limit max toasts
    while (container.children.length >= cfg.maxToasts) {
      container.firstChild?.remove();
    }

    const meta = iconMap[type] || iconMap.info;
    const el   = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.style.cssText = `
      display:flex;align-items:center;gap:10px;
      padding:12px 16px;
      background:rgba(13,24,48,0.98);
      border:1px solid rgba(255,255,255,0.08);
      border-left:3px solid ${meta.color};
      border-radius:12px;
      font-size:0.82rem;color:#F0F6FF;
      font-family:'Inter',sans-serif;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
      min-width:280px;max-width:380px;
      transform:translateX(120%);
      transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
      pointer-events:all;cursor:pointer;
      position:relative;overflow:hidden;
    `;
    el.innerHTML = `
      <i class="fas ${meta.icon}" style="color:${meta.color};flex-shrink:0;font-size:0.9rem;"></i>
      <span style="flex:1;line-height:1.5;">${message}</span>
      <i class="fas fa-times" style="color:rgba(148,163,184,0.5);font-size:0.75rem;flex-shrink:0;"></i>
      <div style="
        position:absolute;bottom:0;left:0;height:2px;
        background:${meta.color};opacity:0.4;
        animation:toastProgress ${duration}ms linear forwards;
      "></div>
    `;
    el.onclick = () => dismiss(el);
    container.appendChild(el);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; });
    });

    setTimeout(() => dismiss(el), duration);
    return el;
  }

  function dismiss(el) {
    if (!el || !el.parentNode) return;
    el.style.transform = 'translateX(120%)';
    setTimeout(() => el.remove(), 400);
  }

  function success(msg, dur) { return show(msg, 'success', dur); }
  function error(msg, dur)   { return show(msg, 'error',   dur); }
  function warning(msg, dur) { return show(msg, 'warning', dur); }
  function info(msg, dur)    { return show(msg, 'info',    dur); }

  return { show, dismiss, success, error, warning, info };
})();

// Global shorthand
window.toast = SES.Toast;

/* ══════════════════════════════════════════════
   4. MODAL SYSTEM
══════════════════════════════════════════════ */
SES.Modal = (() => {
  const stack = [];

  function open(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('no-scroll');
    stack.push(id);
    modal.querySelector('.modal-overlay')?.addEventListener('click', () => close(id), { once: true });
  }

  function close(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
    const idx = stack.indexOf(id);
    if (idx > -1) stack.splice(idx, 1);
    if (!stack.length) document.body.classList.remove('no-scroll');
  }

  function closeAll() {
    [...stack].forEach(id => close(id));
  }

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && stack.length) close(stack[stack.length - 1]);
  });

  return { open, close, closeAll };
})();

/* ══════════════════════════════════════════════
   5. NAVBAR
══════════════════════════════════════════════ */
SES.Navbar = (() => {
  function init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Scroll effect
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile menu
    const mobileBtn  = document.querySelector('.nav-mobile-btn');
    const mobileMenu = document.querySelector('.nav-mobile-menu');
    const closeBtn   = document.querySelector('.nav-mobile-close');

    mobileBtn?.addEventListener('click', () => {
      mobileMenu?.classList.add('open');
      document.body.classList.add('no-scroll');
    });
    closeBtn?.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });

    // Active link
    const current = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#' && current.includes(href.split('/').pop())) {
        link.classList.add('active');
      }
    });

    // Inject logo if missing
    const logoImg = document.querySelector('.nav-logo-img');
    if (logoImg && !logoImg.src) {
      logoImg.src = window.SESConfig?.app?.logoUrl || '';
    }
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   6. SCROLL ANIMATIONS
══════════════════════════════════════════════ */
SES.Scroll = (() => {
  let observer;

  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all
      document.querySelectorAll('.animate-fade-up,.animate-fade-in,.animate-fade-left,.animate-fade-right,.animate-scale')
        .forEach(el => el.classList.add('in-view'));
      return;
    }

    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.animate-fade-up,.animate-fade-in,.animate-fade-left,.animate-fade-right,.animate-scale'
    ).forEach(el => observer.observe(el));
  }

  function refresh() {
    document.querySelectorAll(
      '.animate-fade-up:not(.in-view),.animate-fade-in:not(.in-view),.animate-fade-left:not(.in-view),.animate-fade-right:not(.in-view),.animate-scale:not(.in-view)'
    ).forEach(el => observer?.observe(el));
  }

  return { init, refresh };
})();

/* ══════════════════════════════════════════════
   7. COMMODITY TICKER
══════════════════════════════════════════════ */
SES.Ticker = (() => {
  function init() {
    const container = document.getElementById('commodityTicker');
    if (!container) return;

    const commodities = window.SESConfig?.commodities || [];
    if (!commodities.length) return;

    // Build double set for seamless loop
    const items = [...commodities, ...commodities];
    const html  = items.map(c => {
      const up    = c.change >= 0;
      const arrow = up ? '▲' : '▼';
      const color = up ? '#4ADE80' : '#FCA5A5';
      return `
        <div class="marquee-item" style="display:flex;align-items:center;gap:8px;padding:0 8px;">
          <i class="fas ${c.icon}" style="color:rgba(0,212,255,0.6);font-size:0.75rem;"></i>
          <span style="font-weight:700;color:#F0F6FF;font-size:0.8rem;">${c.name}</span>
          <span style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;color:#F0F6FF;">
            ${c.unit.includes('oz') ? '$' : '$'}${c.price.toLocaleString()}
          </span>
          <span style="color:${color};font-size:0.72rem;font-weight:700;">
            ${arrow} ${Math.abs(c.change)}%
          </span>
          <span style="color:rgba(255,255,255,0.15);margin:0 4px;">|</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="
        display:flex;gap:0;
        animation:marquee 35s linear infinite;
        width:max-content;
      " id="tickerTrack">
        ${html}
      </div>
    `;

    // Pause on hover
    const track = document.getElementById('tickerTrack');
    container.addEventListener('mouseenter', () => {
      if (track) track.style.animationPlayState = 'paused';
    });
    container.addEventListener('mouseleave', () => {
      if (track) track.style.animationPlayState = 'running';
    });
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   8. COUNTER ANIMATION
══════════════════════════════════════════════ */
SES.Counter = (() => {
  function animateValue(el, start, end, duration, prefix = '', suffix = '') {
    const startTime = performance.now();
    const isFloat   = String(end).includes('.');
    const decimals  = isFloat ? String(end).split('.')[1].length : 0;

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = start + (end - start) * eased;
      el.textContent = prefix + (isFloat ? value.toFixed(decimals) : Math.floor(value).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function init() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const raw    = el.dataset.count;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const dur    = parseInt(el.dataset.duration || '1800');

        // Parse numeric value (strip non-numeric except dot)
        const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (!isNaN(numeric)) {
          animateValue(el, 0, numeric, dur, prefix, suffix);
        }
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  return { init, animateValue };
})();

/* ══════════════════════════════════════════════
   9. TOOLTIPS
══════════════════════════════════════════════ */
SES.Tooltips = (() => {
  let tip;

  function getOrCreate() {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'ses-tooltip';
      tip.style.cssText = `
        position:fixed;z-index:9999;
        background:rgba(10,18,40,0.98);
        border:1px solid rgba(0,212,255,0.2);
        border-radius:8px;padding:6px 10px;
        font-size:0.75rem;color:#D4E0F0;
        pointer-events:none;white-space:normal;
        box-shadow:0 8px 24px rgba(0,0,0,0.5);
        backdrop-filter:blur(8px);
        max-width:220px;line-height:1.45;
        font-family:'Inter',sans-serif;
        opacity:0;transition:opacity 0.15s ease;
      `;
      document.body.appendChild(tip);
    }
    return tip;
  }

  function init() {
    document.addEventListener('mouseover', e => {
      const el = e.target.closest('[data-tooltip]');
      if (!el) return;
      const t = getOrCreate();
      t.textContent = el.dataset.tooltip;
      t.style.opacity = '1';
      position(e);
    });
    document.addEventListener('mousemove', e => {
      if (!tip || tip.style.opacity === '0') return;
      const el = e.target.closest('[data-tooltip]');
      if (el) position(e);
      else { tip.style.opacity = '0'; }
    });
    document.addEventListener('mouseout', e => {
      const el = e.target.closest('[data-tooltip]');
      if (el && tip) tip.style.opacity = '0';
    });
  }

  function position(e) {
    if (!tip) return;
    const x = e.clientX + 12;
    const y = e.clientY - 8;
    const rect = tip.getBoundingClientRect();
    tip.style.left = (x + rect.width > window.innerWidth ? x - rect.width - 24 : x) + 'px';
    tip.style.top  = (y + rect.height > window.innerHeight ? y - rect.height : y) + 'px';
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   10. RIPPLE EFFECT
══════════════════════════════════════════════ */
SES.Ripple = (() => {
  function init() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('.btn, .ripple');
      if (!btn) return;
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;border-radius:50%;
        width:${size}px;height:${size}px;
        left:${x}px;top:${y}px;
        background:rgba(255,255,255,0.12);
        transform:scale(0);
        animation:ripple 0.6s linear;
        pointer-events:none;
      `;
      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }
  return { init };
})();

/* ══════════════════════════════════════════════
   11. PAGE LOADER
══════════════════════════════════════════════ */
SES.PageLoader = (() => {
  function hide() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }, 400);
  }
  function show() {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.style.cssText = `
      position:fixed;inset:0;
      background:#040c1a;
      z-index:9999;
      display:flex;align-items:center;justify-content:center;
      flex-direction:column;gap:20px;
    `;
    loader.innerHTML = `
      <img src="${window.SESConfig?.app?.logoUrl || ''}"
           style="height:52px;filter:drop-shadow(0 0 16px rgba(0,212,255,0.5));
                  animation:pulse 1.5s ease-in-out infinite;" />
      <div style="width:180px;height:3px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
        <div style="height:100%;background:linear-gradient(90deg,#00D4FF,#2563EB);
                    border-radius:99px;animation:progressFill 1.2s ease forwards;"></div>
      </div>
    `;
    document.body.appendChild(loader);
  }
  return { show, hide };
})();

/* ══════════════════════════════════════════════
   12. CHART FACTORY
══════════════════════════════════════════════ */
SES.Charts = (() => {
  const cfg = window.SESConfig?.charts || {};
  const COLORS = cfg.defaultColors || ['#00D4FF','#2563EB','#A855F7','#22C55E','#F97316','#D4AF37'];

  function defaults() {
    if (!window.Chart) return;
    Chart.defaults.color          = cfg.textColor    || '#6688A0';
    Chart.defaults.font.family    = cfg.fontFamily   || "'Inter',sans-serif";
    Chart.defaults.font.size      = cfg.fontSize     || 11;
    Chart.defaults.animation.duration = cfg.animation?.duration || 800;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding       = 16;
    Chart.defaults.plugins.tooltip.backgroundColor     = 'rgba(10,18,40,0.97)';
    Chart.defaults.plugins.tooltip.borderColor         = 'rgba(0,212,255,0.2)';
    Chart.defaults.plugins.tooltip.borderWidth         = 1;
    Chart.defaults.plugins.tooltip.padding             = 10;
    Chart.defaults.plugins.tooltip.cornerRadius        = 8;
    Chart.defaults.plugins.tooltip.titleColor          = '#F0F6FF';
    Chart.defaults.plugins.tooltip.bodyColor           = '#94A3B8';
  }

  function line(canvasId, labels, datasets, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return null;
    defaults();
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((d, i) => ({
          borderColor:     d.color || COLORS[i % COLORS.length],
          backgroundColor: d.fill ? `${d.color || COLORS[i % COLORS.length]}18` : 'transparent',
          borderWidth:     2,
          pointRadius:     3,
          pointHoverRadius:5,
          tension:         0.4,
          fill:            d.fill || false,
          ...d
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: {
            grid: { color: cfg.gridColor || 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { maxTicksLimit: 8 }
          },
          y: {
            grid: { color: cfg.gridColor || 'rgba(255,255,255,0.05)', drawBorder: false },
            ticks: { maxTicksLimit: 6 }
          }
        },
        plugins: { legend: { display: datasets.length > 1 } },
        ...options
      }
    });
  }

  function bar(canvasId, labels, datasets, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return null;
    defaults();
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: datasets.map((d, i) => ({
          backgroundColor: d.color || COLORS[i % COLORS.length],
          borderRadius:    6,
          borderSkipped:   false,
          ...d
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: cfg.gridColor || 'rgba(255,255,255,0.05)' } }
        },
        plugins: { legend: { display: datasets.length > 1 } },
        ...options
      }
    });
  }

  function doughnut(canvasId, labels, data, colors, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return null;
    defaults();
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || COLORS,
          borderWidth:     2,
          borderColor:     '#0a1830',
          hoverBorderColor:'rgba(255,255,255,0.2)',
          hoverOffset:     6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'right',
            labels: { padding: 14, boxWidth: 10 }
          }
        },
        ...options
      }
    });
  }

  function radar(canvasId, labels, datasets, options = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return null;
    defaults();
    return new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: datasets.map((d, i) => ({
          borderColor:     d.color || COLORS[i % COLORS.length],
          backgroundColor: `${d.color || COLORS[i % COLORS.length]}20`,
          borderWidth:     2,
          pointRadius:     3,
          ...d
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          r: {
            grid:       { color: 'rgba(255,255,255,0.06)' },
            angleLines: { color: 'rgba(255,255,255,0.06)' },
            ticks:      { display: false },
            pointLabels:{ color: '#94A3B8', font: { size: 11 } }
          }
        },
        plugins: { legend: { display: false } },
        ...options
      }
    });
  }

  function area(canvasId, labels, datasets, options = {}) {
    return line(canvasId, labels, datasets.map(d => ({ ...d, fill: true })), options);
  }

  function destroyAll() {
    Object.values(Chart.instances || {}).forEach(c => c.destroy());
  }

  return { line, bar, doughnut, radar, area, defaults, destroyAll, COLORS };
})();

/* ══════════════════════════════════════════════
   13. NEWS API
══════════════════════════════════════════════ */
SES.News = (() => {
  const CACHE_KEY = 'sesmine_news_cache_v5';
  const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  async function fetch(query = 'mining industry', language = 'en', size = 10) {
    // Check cache
    const cached = getCached(query);
    if (cached) return cached;

    const cfg = window.SESConfig?.api;
    if (!cfg?.newsApiKey || !cfg?.newsEndpoint) {
      return getFallbackNews();
    }

    try {
      const url = `${cfg.newsEndpoint}?apikey=${cfg.newsApiKey}&q=${encodeURIComponent(query)}&language=${language}&size=${size}&category=business,technology&prioritydomain=top`;
      const res  = await window.fetch(url, { signal: AbortSignal.timeout(cfg.timeout || 8000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const articles = (json.results || []).map(normalise);
      setCache(query, articles);
      return articles;
    } catch (err) {
      console.warn('SES.News: API fetch failed, using fallback.', err.message);
      return getFallbackNews();
    }
  }

  function normalise(article) {
    return {
      id:          article.article_id || Math.random().toString(36).slice(2),
      title:       article.title       || 'Untitled',
      description: article.description || article.content?.slice(0, 200) || '',
      url:         article.link        || '#',
      image:       article.image_url   || getPlaceholderImage(),
      source:      article.source_id   || article.source_name || 'Industry News',
      publishedAt: article.pubDate     || new Date().toISOString(),
      category:    article.category?.[0] || 'mining',
      country:     article.country?.[0]  || 'au',
      keywords:    article.keywords      || []
    };
  }

  function getPlaceholderImage() {
    const imgs = [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80&auto=format&fit=crop'
    ];
    return imgs[Math.floor(Math.random() * imgs.length)];
  }

  function getFallbackNews() {
    return [
      {
        id:'n1', title:'Rio Tinto Reports Record Iron Ore Production in Q2 2026',
        description:'Rio Tinto has announced record quarterly iron ore production from its Pilbara operations, driven by autonomous haulage expansion and improved processing efficiency.',
        url:'#', image:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80&auto=format&fit=crop',
        source:'Mining Journal', publishedAt: new Date(Date.now()-2*3600000).toISOString(),
        category:'production', country:'au', keywords:['iron ore','production','pilbara']
      },
      {
        id:'n2', title:'BHP Accelerates Net Zero Target to 2040 with New Carbon Strategy',
        description:'BHP has announced an accelerated pathway to net zero operational emissions by 2040, backed by a $4.5 billion green investment fund targeting renewable energy and carbon capture.',
        url:'#', image:'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80&auto=format&fit=crop',
        source:'Financial Review', publishedAt: new Date(Date.now()-5*3600000).toISOString(),
        category:'sustainability', country:'au', keywords:['ESG','net zero','carbon']
      },
      {
        id:'n3', title:'Copper Prices Surge 8% on EV Battery Demand Forecasts',
        description:'Copper futures climbed to a six-month high as analysts revised upward their demand forecasts for electric vehicle battery manufacturing, with supply constraints from Chilean mines adding upward pressure.',
        url:'#', image:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop',
        source:'Reuters Commodities', publishedAt: new Date(Date.now()-8*3600000).toISOString(),
        category:'commodities', country:'global', keywords:['copper','EV','battery','prices']
      },
      {
        id:'n4', title:'Autonomous Mining Equipment Market to Reach $12B by 2028',
        description:'A new industry report projects the autonomous mining equipment market will reach $12 billion by 2028, driven by safety improvements, labour cost reduction, and 24/7 operational capability.',
        url:'#', image:'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80&auto=format&fit=crop',
        source:'Mining Technology', publishedAt: new Date(Date.now()-12*3600000).toISOString(),
        category:'technology', country:'global', keywords:['autonomous','equipment','technology']
      },
      {
        id:'n5', title:'Newmont Completes $2.3B Acquisition of Tier-1 Gold Asset in West Africa',
        description:'Newmont Corporation has completed its strategic acquisition of a tier-1 gold asset in Ghana, adding 500,000 ounces per year to its global production portfolio.',
        url:'#', image:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&auto=format&fit=crop',
        source:'Bloomberg Mining', publishedAt: new Date(Date.now()-18*3600000).toISOString(),
        category:'mergers', country:'global', keywords:['gold','acquisition','newmont']
      },
      {
        id:'n6', title:'Australia Launches $800M Critical Minerals Processing Fund',
        description:'The Australian Government has announced an $800 million fund to accelerate domestic critical minerals processing, targeting lithium, cobalt, and rare earth elements for battery supply chains.',
        url:'#', image:'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80&auto=format&fit=crop',
        source:'ABC Business', publishedAt: new Date(Date.now()-24*3600000).toISOString(),
        category:'policy', country:'au', keywords:['critical minerals','lithium','australia','policy']
      },
      {
        id:'n7', title:'Glencore Unveils AI-Powered Predictive Maintenance Platform',
        description:'Glencore has deployed an AI-powered predictive maintenance system across 14 operations, reducing unplanned downtime by 31% and saving an estimated $180 million annually.',
        url:'#', image:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop',
        source:'Mining Global', publishedAt: new Date(Date.now()-30*3600000).toISOString(),
        category:'technology', country:'global', keywords:['AI','predictive maintenance','glencore']
      },
      {
        id:'n8', title:'Lithium Spot Price Rebounds 18% on Battery Gigafactory Announcements',
        description:'Lithium carbonate spot prices have rebounded sharply following announcements of three new battery gigafactories in Europe and North America, easing concerns about oversupply.',
        url:'#', image:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80&auto=format&fit=crop',
        source:'S&P Global', publishedAt: new Date(Date.now()-36*3600000).toISOString(),
        category:'commodities', country:'global', keywords:['lithium','battery','gigafactory']
      }
    ];
  }

  function getCached(query) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      const entry = cache[query];
      if (!entry) return null;
      if (Date.now() - entry.timestamp > CACHE_TTL) return null;
      return entry.data;
    } catch { return null; }
  }

  function setCache(query, data) {
    try {
      const raw   = localStorage.getItem(CACHE_KEY);
      const cache = raw ? JSON.parse(raw) : {};
      cache[query] = { data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {}
  }

  function formatRelativeTime(iso) {
    const diff  = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-AU', { day:'numeric', month:'short' });
  }

  function renderCard(article, size = 'normal') {
    const time = formatRelativeTime(article.publishedAt);
    if (size === 'compact') {
      return `
        <a href="${article.url}" target="_blank" rel="noopener" style="
          display:flex;align-items:flex-start;gap:12px;
          padding:12px;border-radius:10px;
          background:rgba(255,255,255,0.02);
          border:1px solid rgba(255,255,255,0.06);
          text-decoration:none;color:inherit;
          transition:all 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.04)'"
           onmouseout="this.style.background='rgba(255,255,255,0.02)'">
          <img src="${article.image}" alt="${article.title}"
               style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0;"
               onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=60'" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.8rem;font-weight:700;line-height:1.4;
                        color:#F0F6FF;margin-bottom:4px;
                        display:-webkit-box;-webkit-line-clamp:2;
                        -webkit-box-orient:vertical;overflow:hidden;">
              ${article.title}
            </div>
            <div style="font-size:0.68rem;color:#6688A0;">
              ${article.source} · ${time}
            </div>
          </div>
        </a>
      `;
    }

    return `
      <a href="${article.url}" target="_blank" rel="noopener"
         style="display:block;text-decoration:none;color:inherit;
                background:#132035;border:1px solid rgba(255,255,255,0.07);
                border-radius:16px;overflow:hidden;
                transition:all 0.25s ease;"
         onmouseover="this.style.transform='translateY(-4px)';this.style.borderColor='rgba(0,212,255,0.2)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.3)'"
         onmouseout="this.style.transform='';this.style.borderColor='rgba(255,255,255,0.07)';this.style.boxShadow=''">
        <div style="height:180px;overflow:hidden;position:relative;">
          <img src="${article.image}" alt="${article.title}"
               style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;"
               onmouseover="this.style.transform='scale(1.05)'"
               onmouseout="this.style.transform=''"
               onerror="this.src='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80'" />
          <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(10,18,40,0.8));"></div>
          <span style="
            position:absolute;top:10px;left:10px;
            padding:3px 9px;border-radius:99px;
            font-size:0.62rem;font-weight:800;
            text-transform:uppercase;letter-spacing:0.08em;
            background:rgba(0,212,255,0.15);
            border:1px solid rgba(0,212,255,0.25);
            color:#00D4FF;
          ">${article.category}</span>
        </div>
        <div style="padding:16px;">
          <div style="font-size:0.88rem;font-weight:700;line-height:1.45;
                      color:#F0F6FF;margin-bottom:8px;
                      display:-webkit-box;-webkit-line-clamp:2;
                      -webkit-box-orient:vertical;overflow:hidden;">
            ${article.title}
          </div>
          <div style="font-size:0.78rem;color:#6688A0;line-height:1.6;
                      display:-webkit-box;-webkit-line-clamp:2;
                      -webkit-box-orient:vertical;overflow:hidden;
                      margin-bottom:12px;">
            ${article.description}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:0.7rem;font-weight:700;color:#94A3B8;">
              <i class="fas fa-newspaper" style="margin-right:4px;color:rgba(0,212,255,0.5);"></i>
              ${article.source}
            </span>
            <span style="font-size:0.7rem;color:#6688A0;">
              <i class="fas fa-clock" style="margin-right:3px;"></i>${time}
            </span>
          </div>
        </div>
      </a>
    `;
  }

  return { fetch, renderCard, formatRelativeTime, getFallbackNews };
})();

/* ══════════════════════════════════════════════
   14. FORM VALIDATION
══════════════════════════════════════════════ */
SES.Form = (() => {
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRx = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

  function validate(formEl) {
    let valid = true;
    const errors = {};

    formEl.querySelectorAll('[data-validate]').forEach(field => {
      const rules   = field.dataset.validate.split('|');
      const value   = field.value.trim();
      const name    = field.name || field.id;
      const errEl   = document.getElementById(`${field.id}Err`) ||
                      field.parentElement.querySelector('.field-error');

      let fieldValid = true;
      let message    = '';

      for (const rule of rules) {
        if (rule === 'required' && !value) {
          fieldValid = false; message = 'This field is required.'; break;
        }
        if (rule === 'email' && value && !emailRx.test(value)) {
          fieldValid = false; message = 'Enter a valid email address.'; break;
        }
        if (rule === 'phone' && value && !phoneRx.test(value)) {
          fieldValid = false; message = 'Enter a valid phone number.'; break;
        }
        if (rule.startsWith('min:')) {
          const min = parseInt(rule.split(':')[1]);
          if (value.length < min) { fieldValid = false; message = `Minimum ${min} characters required.`; break; }
        }
        if (rule.startsWith('max:')) {
          const max = parseInt(rule.split(':')[1]);
          if (value.length > max) { fieldValid = false; message = `Maximum ${max} characters allowed.`; break; }
        }
        if (rule.startsWith('match:')) {
          const targetId = rule.split(':')[1];
          const target   = document.getElementById(targetId);
          if (target && value !== target.value) { fieldValid = false; message = 'Fields do not match.'; break; }
        }
      }

      if (!fieldValid) {
        valid = false;
        errors[name] = message;
        field.classList.add('error');
        if (errEl) { errEl.textContent = message; errEl.classList.add('show'); }
      } else {
        field.classList.remove('error');
        if (errEl) errEl.classList.remove('show');
      }
    });

    return { valid, errors };
  }

  function clearErrors(formEl) {
    formEl.querySelectorAll('.form-input.error, .form-select.error').forEach(el => el.classList.remove('error'));
    formEl.querySelectorAll('.field-error.show').forEach(el => el.classList.remove('show'));
  }

  function setLoading(btn, state, loadingText = 'Loading...') {
    if (!btn) return;
    btn.disabled = state;
    if (state) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
    } else {
      btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    }
  }

  return { validate, clearErrors, setLoading, emailRx, phoneRx };
})();

/* ══════════════════════════════════════════════
   15. DASHBOARD SIDEBAR
══════════════════════════════════════════════ */
SES.Sidebar = (() => {
  function init() {
    const sidebar   = document.getElementById('dashSidebar');
    const overlay   = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('sidebarToggle');
    if (!sidebar) return;

    toggleBtn?.addEventListener('click', () => toggle());
    overlay?.addEventListener('click', () => close());

    // Active link
    const current = window.location.pathname.split('/').pop();
    sidebar.querySelectorAll('.sidebar-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '#' && current === href.split('/').pop()) {
        link.classList.add('active');
      }
    });

    // Render user info
    renderUser();
  }

  function toggle() {
    const sidebar = document.getElementById('dashSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('active');
    document.body.classList.toggle('no-scroll', sidebar?.classList.contains('open'));
  }

  function close() {
    const sidebar = document.getElementById('dashSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  function renderUser() {
    const user = window.SESAuth?.Store?.get(window.SESAuth?.KEYS?.CURRENT_USER);
    if (!user) return;

    const nameEl   = document.getElementById('sidebarUserName');
    const roleEl   = document.getElementById('sidebarUserRole');
    const avatarEl = document.getElementById('sidebarUserAvatar');

    if (nameEl)   nameEl.textContent   = `${user.firstName} ${user.lastName}`;
    if (roleEl)   roleEl.textContent   = window.SESAuth?.getRoleInfo(user.role)?.label || user.role;
    if (avatarEl) avatarEl.innerHTML   = window.SESAuth?.renderUserAvatar(user, 34) || '';
  }

  return { init, toggle, close, renderUser };
})();

/* ══════════════════════════════════════════════
   16. GENERAL UI HELPERS
══════════════════════════════════════════════ */
SES.UI = (() => {
  function init() {
    // Inject toast container
    if (!document.getElementById('toastContainer')) {
      const c = document.createElement('div');
      c.id = 'toastContainer';
      document.body.appendChild(c);
    }

    // Dropdown menus
    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-dropdown]');
      if (trigger) {
        const menuId = trigger.dataset.dropdown;
        const menu   = document.getElementById(menuId);
        if (menu) {
          const isOpen = menu.classList.contains('open');
          document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
          if (!isOpen) menu.classList.add('open');
          e.stopPropagation();
          return;
        }
      }
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    });

    // Tab switching
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.tabGroup || 'default';
        const target = btn.dataset.tab;
        document.querySelectorAll(`[data-tab-group="${group}"] [data-tab]`).forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-tab-panel="${group}"]`).forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(target)?.classList.add('active');
      });
    });

    // Smooth anchor scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Auto-hide alerts
    document.querySelectorAll('[data-auto-hide]').forEach(el => {
      const delay = parseInt(el.dataset.autoHide) || 5000;
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.4s ease';
        setTimeout(() => el.remove(), 400);
      }, delay);
    });

    // Copy to clipboard
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.copy;
        navigator.clipboard.writeText(text).then(() => {
          SES.Toast.success('Copied to clipboard!');
        }).catch(() => {
          SES.Toast.error('Copy failed.');
        });
      });
    });
  }

  function formatNumber(n, decimals = 0) {
    if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`;
    return n.toFixed(decimals);
  }

  function formatCurrency(n, currency = 'USD') {
    return new Intl.NumberFormat('en-AU', { style:'currency', currency, maximumFractionDigits: 0 }).format(n);
  }

  function formatPercent(n, decimals = 1) {
    return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
  }

  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function throttle(fn, limit = 100) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function truncate(str, len = 100) {
    return str.length > len ? str.slice(0, len).trimEnd() + '…' : str;
  }

  function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function randomColor(seed) {
    const colors = ['#2563EB','#7C3AED','#DC2626','#D97706','#059669','#0891B2','#9333EA','#DB2777'];
    const idx    = typeof seed === 'string'
      ? seed.charCodeAt(0) % colors.length
      : Math.floor(Math.random() * colors.length);
    return colors[idx];
  }

  function setTheme(theme = 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sesmine_theme', theme);
  }

  return {
    init,
    formatNumber, formatCurrency, formatPercent,
    debounce, throttle, slugify, truncate,
    getInitials, randomColor, setTheme
  };
})();

/* ══════════════════════════════════════════════
   17. PROGRESS BAR ANIMATION
══════════════════════════════════════════════ */
SES.Progress = (() => {
  function animateAll() {
    const bars = document.querySelectorAll('.progress-bar-fill[data-value]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el  = entry.target;
          const val = Math.min(100, Math.max(0, parseFloat(el.dataset.value)));
          setTimeout(() => { el.style.width = `${val}%`; }, 100);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => observer.observe(b));
  }

  function set(barId, value, animate = true) {
    const el = document.getElementById(barId);
    if (!el) return;
    if (!animate) { el.style.transition = 'none'; }
    el.style.width = `${Math.min(100, Math.max(0, value))}%`;
    if (!animate) setTimeout(() => { el.style.transition = ''; }, 50);
  }

  return { animateAll, set };
})();

/* ══════════════════════════════════════════════
   18. PARTICLE BACKGROUND
══════════════════════════════════════════════ */
SES.Particles = (() => {
  function init(canvasId, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cfg = {
      count:     options.count     || 60,
      color:     options.color     || 'rgba(0,212,255,',
      maxSize:   options.maxSize   || 2.5,
      speed:     options.speed     || 0.4,
      connected: options.connected !== false,
      maxDist:   options.maxDist   || 120
    };

    let particles = [];
    let animId;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      particles = Array.from({ length: cfg.count }, () => ({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * cfg.speed,
        vy: (Math.random() - 0.5) * cfg.speed,
        r:  Math.random() * cfg.maxSize + 0.5,
        o:  Math.random() * 0.5 + 0.2
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${cfg.color}${p.o})`;
        ctx.fill();

        if (cfg.connected) {
          for (let j = i + 1; j < particles.length; j++) {
            const q    = particles[j];
            const dist = Math.hypot(p.x - q.x, p.y - q.y);
            if (dist < cfg.maxDist) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
                             ctx.strokeStyle = `${cfg.color}${(1 - dist / cfg.maxDist) * 0.15})`;
              ctx.lineWidth   = 0.8;
              ctx.stroke();
            }
          }
        }
      });
      animId = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      createParticles();
      draw();
    }

    function stop() {
      cancelAnimationFrame(animId);
    }

    function destroy() {
      stop();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = [];
    }

    window.addEventListener('resize', SES.UI.debounce(() => {
      resize();
      createParticles();
    }, 300));

    start();
    return { start, stop, destroy };
  }

  return { init };
})();

/* ══════════════════════════════════════════════
   19. SEARCH
══════════════════════════════════════════════ */
SES.Search = (() => {
  function filterTable(tableBodyId, query, columns = []) {
    const tbody = document.getElementById(tableBodyId);
    if (!tbody) return;
    const q = query.toLowerCase().trim();
    let visible = 0;
    tbody.querySelectorAll('tr').forEach(row => {
      const text = columns.length
        ? columns.map(i => row.cells[i]?.textContent || '').join(' ').toLowerCase()
        : row.textContent.toLowerCase();
      const show = !q || text.includes(q);
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    return visible;
  }

  function filterCards(containerSelector, query, textSelector = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const q = query.toLowerCase().trim();
    let visible = 0;
    container.querySelectorAll('[data-searchable]').forEach(card => {
      const text = textSelector
        ? card.querySelector(textSelector)?.textContent.toLowerCase() || ''
        : (card.dataset.searchable || card.textContent).toLowerCase();
      const show = !q || text.includes(q);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    return visible;
  }

  return { filterTable, filterCards };
})();

/* ══════════════════════════════════════════════
   20. EXPORT UTILITIES
══════════════════════════════════════════════ */
SES.Export = (() => {
  function toCSV(data, filename = 'export.csv') {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows    = data.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        return typeof val === 'string' && (val.includes(',') || val.includes('"'))
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      }).join(',')
    );
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    download(blob, filename);
  }

  function toJSON(data, filename = 'export.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    download(blob, filename);
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function printSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head>
        <title>SESMine Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f4f4f4; font-weight: 700; }
        </style>
      </head><body>${section.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  }

  return { toCSV, toJSON, download, printSection };
})();

/* ══════════════════════════════════════════════
   21. CLOCK UTILITY
══════════════════════════════════════════════ */
SES.Clock = (() => {
  const timers = new Map();

  function start(elementId, options = {}) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const tz   = options.timezone || 'Australia/Perth';
    const fmt  = options.format   || { hour:'2-digit', minute:'2-digit', second:'2-digit' };
    const tick = () => {
      el.textContent = new Date().toLocaleTimeString('en-AU', { timeZone: tz, ...fmt });
    };
    tick();
    const id = setInterval(tick, 1000);
    timers.set(elementId, id);
    return id;
  }

  function stop(elementId) {
    const id = timers.get(elementId);
    if (id) { clearInterval(id); timers.delete(elementId); }
  }

  function stopAll() {
    timers.forEach((id) => clearInterval(id));
    timers.clear();
  }

  return { start, stop, stopAll };
})();

/* ══════════════════════════════════════════════
   22. GLOBAL LOGOUT HANDLER
══════════════════════════════════════════════ */
window.handleLogout = function(isAdmin = false) {
  if (confirm('Are you sure you want to sign out?')) {
    window.SESAuth?.logout(isAdmin);
  }
};

/* ══════════════════════════════════════════════
   23. GLOBAL ERROR HANDLER
══════════════════════════════════════════════ */
window.addEventListener('error', e => {
  console.error('SESMine Error:', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', e => {
  console.warn('SESMine Unhandled Promise:', e.reason);
});

/* ══════════════════════════════════════════════
   24. EXPOSE GLOBALS
══════════════════════════════════════════════ */
window.SES = SES;

