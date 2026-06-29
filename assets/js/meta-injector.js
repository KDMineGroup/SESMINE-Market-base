/**
 * SESMine Meta Tag Auto-Injector
 * Reads the current URL and injects the correct SEO meta tags
 */
(function () {
  'use strict';

  const BASE   = 'https://www.sesmine.com';
  const IMAGE  = `${BASE}/assets/img/og-cover.jpg`;
  const path   = window.location.pathname;

  /* ── Page definitions ── */
  const PAGES = {
    default: {
      title:       'SESMine — Mining Intelligence Platform',
      description: 'AI-powered commodity price forecasting, mining cost modelling, ESG analytics, and equipment intelligence for the global mining industry.',
      keywords:    'mining intelligence, commodity prices, iron ore forecast, copper price, mining analytics, AISC calculator, mining software, ESG mining',
      canonical:    BASE + '/'
    },
    'ai-predictor': {
      title:       'AI Commodity Price Predictor — SESMine',
      description: 'Predict iron ore, copper, gold, and lithium prices using ML models trained on 20+ years of data. 94.2% directional accuracy. Free to use.',
      keywords:    'iron ore price forecast, copper price prediction AI, gold price forecast 2026, lithium price outlook, commodity price AI tool',
      canonical:    BASE + '/products/ai-predictor.html'
    },
    'cost-calculator': {
      title:       'Mining Cost Calculator — C1, AISC, NPV | SESMine',
      description: 'Free online mining cost calculator. Compute C1 cash cost, AISC, NPV, and IRR for open cut and underground operations. Benchmarked against 2,400+ global mines.',
      keywords:    'mining cost calculator, C1 cash cost calculator, AISC calculator, mining NPV calculator, OPEX CAPEX mining, mine financial model',
      canonical:    BASE + '/products/cost-calculator.html'
    },
    'equipment-database': {
      title:       'Mining Equipment Database — 2,400+ Specs | SESMine',
      description: 'Search and compare specifications for 2,400+ mining equipment. OEE benchmarks, MTBF data, fuel consumption, and pricing for haul trucks, excavators, drills, and more.',
      keywords:    'mining equipment specifications, haul truck specs, CAT 793F specs, Komatsu 930E specs, mining equipment database, OEE benchmarks mining',
      canonical:    BASE + '/products/equipment-database.html'
    },
    'economics-hub': {
      title:       'Mining Economics Intelligence Hub — SESMine',
      description: 'Real-time commodity prices, market intelligence, and economic analysis for iron ore, copper, gold, lithium, and 40+ commodities.',
      keywords:    'mining economics, commodity price intelligence, iron ore spot price, copper LME price, mining market analysis',
      canonical:    BASE + '/hubs/economics-hub.html'
    },
    'engineering-hub': {
      title:       'Mining Engineering Intelligence Hub — SESMine',
      description: 'Equipment OEE benchmarks, maintenance metrics, and engineering performance data for mining operations worldwide.',
      keywords:    'mining engineering, OEE mining, equipment reliability, MTBF mining, mining performance benchmarks',
      canonical:    BASE + '/hubs/engineering-hub.html'
    },
    'procurement-hub': {
      title:       'Mining Procurement Intelligence Hub — SESMine',
      description: 'Supplier intelligence, contract benchmarks, and procurement analytics to optimise mining supply chain costs.',
      keywords:    'mining procurement, mining supply chain, mining supplier intelligence, contract benchmarks mining',
      canonical:    BASE + '/hubs/procurement-hub.html'
    },
    'safety-hub': {
      title:       'Mining Safety Intelligence Hub — SESMine',
      description: 'TRIFR tracking, incident analysis, and safety risk management dashboards for mining operations.',
      keywords:    'mining safety, TRIFR calculator, mining incident reporting, safety KPIs mining, mine site risk management',
      canonical:    BASE + '/hubs/safety-hub.html'
    },
    'sustainability-hub': {
      title:       'Mining Sustainability & ESG Hub — SESMine',
      description: 'ESG reporting, Scope 1/2/3 emissions tracking, water usage, and biodiversity metrics for mining companies.',
      keywords:    'mining ESG, mining sustainability, Scope 1 2 3 emissions mining, ESG reporting software mining, mining carbon footprint',
      canonical:    BASE + '/hubs/sustainability-hub.html'
    },
    'innovation-hub': {
      title:       'Mining Innovation Intelligence Hub — SESMine',
      description: 'Mining R&D trends, patent analysis, emerging technology intelligence, and startup tracking for the global mining industry.',
      keywords:    'mining innovation, mining technology trends, autonomous mining, mining patents, mining startups',
      canonical:    BASE + '/hubs/innovation-hub.html'
    },
    'contact': {
      title:       'Contact SESMine — Support & Enterprise Enquiries',
      description: 'Contact the SESMine team for technical support, enterprise subscriptions, API integration, or partnership opportunities. Response within 24 hours.',
      keywords:    'contact SESMine, mining software support, mining intelligence platform demo, enterprise mining software',
      canonical:    BASE + '/contact.html'
    },
    'news': {
      title:       'Mining News & Intelligence — SESMine',
      description: 'Latest mining industry news, commodity market updates, and intelligence briefings from the SESMine platform.',
      keywords:    'mining news, commodity market news, mining industry updates, iron ore news, copper market news',
      canonical:    BASE + '/news.html'
    },
    'resources': {
      title:       'Mining Resources & Reports — SESMine',
      description: 'Free mining industry reports, whitepapers, guides, and data resources from the SESMine Intelligence Platform.',
      keywords:    'mining reports, mining whitepapers, mining industry guides, free mining data, mining research',
      canonical:    BASE + '/resources.html'
    }
  };

  /* ── Detect current page ── */
  function detectPage() {
    for (const key of Object.keys(PAGES)) {
      if (key !== 'default' && path.includes(key)) return PAGES[key];
    }
    return PAGES.default;
  }

  const page = detectPage();

  /* ── Inject helper ── */
  function setMeta(name, content, prop) {
    let el = prop
      ? document.querySelector(`meta[property="${name}"]`)
      : document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      prop ? el.setAttribute('property', name) : el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  /* ── Apply meta tags ── */
  /* Title */
  document.title = page.title;

  /* Standard */
  setMeta('description',  page.description);
  setMeta('keywords',     page.keywords);
  setMeta('author',       'SESMine');
  setMeta('robots',       'index, follow');
  setMeta('theme-color',  '#020810');

  /* Canonical */
  setLink('canonical', page.canonical);

  /* Open Graph */
  setMeta('og:type',        'website',       true);
  setMeta('og:title',       page.title,      true);
  setMeta('og:description', page.description,true);
  setMeta('og:image',       IMAGE,           true);
  setMeta('og:url',         page.canonical,  true);
  setMeta('og:site_name',   'SESMine',       true);
  setMeta('og:locale',      'en_AU',         true);

  /* Twitter Card */
  setMeta('twitter:card',        'summary_large_image');
  setMeta('twitter:site',        '@SESMine');
  setMeta('twitter:title',       page.title);
  setMeta('twitter:description', page.description);
  setMeta('twitter:image',       IMAGE);

  /* Favicon suite */
  setLink('icon',             '/assets/img/favicon-32.png');
  setLink('apple-touch-icon', '/assets/img/apple-touch-icon.png');
  setLink('manifest',         '/site.webmanifest');

  /* Preconnects for performance */
  ['https://fonts.googleapis.com',
   'https://fonts.gstatic.com',
   'https://cdnjs.cloudflare.com',
   'https://cdn.jsdelivr.net'].forEach(function (origin) {
    const l = document.createElement('link');
    l.rel = 'preconnect';
    l.href = origin;
    if (origin.includes('gstatic')) l.crossOrigin = 'anonymous';
    document.head.insertBefore(l, document.head.firstChild);
  });

})();
