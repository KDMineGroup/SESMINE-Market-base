/**
 * SESMine SEO & Analytics Helper
 * Handles: GA4 events · page timing · scroll depth · outbound links · error logging
 */
(function () {
  'use strict';

  /* ── CONFIG ── change only these two values ── */
  const GA_ID        = 'G-XXXXXXXXXX';   /* ← your GA4 measurement ID   */
  const SITE_DOMAIN  = 'sesmine.com';    /* ← your domain (no https://) */

  /* ── Inject GA4 script dynamically ── */
  function loadGA() {
    if (window.__ga_loaded) return;
    window.__ga_loaded = true;

    const s = document.createElement('script');
    s.async = true;
    s.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID, {
      page_title:    document.title,
      page_location: window.location.href,
      send_page_view: true,
      anonymize_ip:  true
    });
  }

  /* ── Track custom event ── */
  window.trackEvent = function (action, category, label, value) {
    if (typeof gtag !== 'function') return;
    gtag('event', action, {
      event_category: category || 'General',
      event_label:    label    || '',
      value:          value    || 0
    });
  };

  /* ── Scroll depth tracking ── */
  function initScrollDepth() {
    const milestones = [25, 50, 75, 90, 100];
    const fired      = new Set();

    window.addEventListener('scroll', function () {
      const scrolled = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      milestones.forEach(m => {
        if (scrolled >= m && !fired.has(m)) {
          fired.add(m);
          trackEvent('scroll_depth', 'Engagement', `${m}%`);
        }
      });
    }, { passive: true });
  }

  /* ── Time on page ── */
  function initTimeOnPage() {
    const start = Date.now();
    const thresholds = [30, 60, 120, 300]; /* seconds */
    const fired = new Set();

    setInterval(function () {
      const elapsed = Math.round((Date.now() - start) / 1000);
      thresholds.forEach(t => {
        if (elapsed >= t && !fired.has(t)) {
          fired.add(t);
          trackEvent('time_on_page', 'Engagement', `${t}s`, t);
        }
      });
    }, 5000);
  }

  /* ── Outbound link tracking ── */
  function initOutboundLinks() {
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.href || '';
      if (href && !href.includes(SITE_DOMAIN) && href.startsWith('http')) {
        trackEvent('outbound_click', 'Outbound Links', href);
      }
    });
  }

  /* ── Tool interaction tracking ── */
  function initToolTracking() {
    const path = window.location.pathname;

    /* AI Predictor */
    if (path.includes('ai-predictor')) {
      document.addEventListener('click', function (e) {
        if (e.target.closest('#runBtn')) {
          const commodity = document.getElementById('pCommodity')?.value || 'unknown';
          const horizon   = document.getElementById('pHorizon')?.value   || '0';
          trackEvent('prediction_run', 'AI Predictor', `${commodity}_${horizon}mo`);
        }
      });
    }

    /* Cost Calculator */
    if (path.includes('cost-calculator')) {
      let calcTimer;
      document.addEventListener('input', function () {
        clearTimeout(calcTimer);
        calcTimer = setTimeout(function () {
          const commodity = document.getElementById('commodity')?.value || 'unknown';
          const mineType  = document.getElementById('mineType')?.value  || 'unknown';
          trackEvent('calculation_run', 'Cost Calculator', `${mineType}_${commodity}`);
        }, 1500);
      });
    }

    /* Equipment DB */
    if (path.includes('equipment-database')) {
      document.addEventListener('click', function (e) {
        const row = e.target.closest('tr[onclick]');
        if (row) {
          const name = row.querySelector('td:nth-child(2)')?.textContent?.trim() || 'unknown';
          trackEvent('equipment_view', 'Equipment DB', name);
        }
        if (e.target.closest('#runBtn')) {
          trackEvent('comparison_run', 'Equipment DB', 'compare_clicked');
        }
      });
      document.addEventListener('input', function (e) {
        if (e.target.id === 'searchInput') {
          trackEvent('search_used', 'Equipment DB', e.target.value.slice(0, 40));
        }
      });
    }

    /* Contact form */
    if (path.includes('contact')) {
      document.getElementById('contactForm')?.addEventListener('submit', function () {
        const subject = document.getElementById('fSubject')?.value || 'unknown';
        trackEvent('form_submit', 'Contact', subject);
      });
    }

    /* Hub pages */
    if (path.includes('/hubs/')) {
      const hubName = path.split('/hubs/')[1]?.replace('.html', '') || 'unknown';
      trackEvent('hub_visit', 'Hubs', hubName);
    }
  }

  /* ── 404 / JS error tracking ── */
  function initErrorTracking() {
    window.addEventListener('error', function (e) {
      trackEvent('js_error', 'Errors', `${e.message} @ ${e.filename}:${e.lineno}`);
    });
  }

  /* ── Page performance (Core Web Vitals proxy) ── */
  function initPerformance() {
    window.addEventListener('load', function () {
      setTimeout(function () {
        const nav  = performance.getEntriesByType('navigation')[0];
        if (!nav) return;
        const ttfb = Math.round(nav.responseStart - nav.requestStart);
        const load = Math.round(nav.loadEventEnd   - nav.startTime);
        trackEvent('page_load_time', 'Performance', document.title, load);
        trackEvent('ttfb',           'Performance', document.title, ttfb);
      }, 0);
    });
  }

  /* ── Init all ── */
  loadGA();
  initScrollDepth();
  initTimeOnPage();
  initOutboundLinks();
  initToolTracking();
  initErrorTracking();
  initPerformance();

})();
