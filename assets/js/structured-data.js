/**
 * SESMine Structured Data Injector
 * Auto-detects page and injects the correct JSON-LD schema
 */
(function () {
  'use strict';

  const BASE_URL  = 'https://www.sesmine.com';
  const LOGO_URL  = `${BASE_URL}/assets/img/icon-512.png`;
  const OG_IMAGE  = `${BASE_URL}/assets/img/og-cover.jpg`;
  const path      = window.location.pathname;

  function inject(schema) {
    const s = document.createElement('script');
    s.type  = 'application/ld+json';
    s.text  = JSON.stringify(schema, null, 2);
    document.head.appendChild(s);
  }

  /* ── Always inject: Organization + WebSite ── */
  inject({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type':       'Organization',
        '@id':         `${BASE_URL}/#organization`,
        'name':        'SESMine',
        'url':          BASE_URL,
        'logo': {
          '@type': 'ImageObject',
          'url':    LOGO_URL,
          'width':  512,
          'height': 512
        },
        'description': 'AI-powered mining intelligence platform for commodity forecasting, cost modelling, and ESG analytics.',
        'foundingDate': '2024',
        'address': {
          '@type':           'PostalAddress',
          'streetAddress':   'Level 12, 140 St Georges Terrace',
          'addressLocality': 'Perth',
          'addressRegion':   'WA',
          'postalCode':      '6000',
          'addressCountry':  'AU'
        },
        'contactPoint': {
          '@type':            'ContactPoint',
          'email':            'hello@sesmine.com',
          'contactType':      'customer support',
          'availableLanguage': 'English'
        },
        'sameAs': [
          'https://www.linkedin.com/company/sesmine',
          'https://twitter.com/sesmine'
        ]
      },
      {
        '@type': 'WebSite',
        '@id':   `${BASE_URL}/#website`,
        'name':  'SESMine',
        'url':    BASE_URL,
        'publisher': { '@id': `${BASE_URL}/#organization` },
        'potentialAction': {
          '@type':       'SearchAction',
          'target':      `${BASE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  });

  /* ── Home page ── */
  if (path === '/' || path.includes('index')) {
    inject({
      '@context': 'https://schema.org',
      '@type':    'SoftwareApplication',
      'name':     'SESMine Intelligence Platform',
      'url':       BASE_URL,
      'applicationCategory': 'BusinessApplication',
      'operatingSystem':     'Web Browser',
      'screenshot':           OG_IMAGE,
      'featureList': [
        'AI Commodity Price Forecasting',
        'Mining Cost Calculator (C1, AISC, NPV)',
        'Global Equipment Database',
        'ESG Reporting Dashboard',
        'Economics Intelligence Hub',
        'Safety & Incident Tracking'
      ],
      'offers': {
        '@type':       'Offer',
        'price':       '0',
        'priceCurrency': 'USD',
        'description': 'Free tier available. Professional and Enterprise plans available.'
      },
      'aggregateRating': {
        '@type':       'AggregateRating',
        'ratingValue': '4.8',
        'reviewCount': '142',
        'bestRating':  '5',
        'worstRating': '1'
      },
      'publisher': { '@id': `${BASE_URL}/#organization` }
    });
  }

  /* ── AI Predictor ── */
  if (path.includes('ai-predictor')) {
    inject({
      '@context': 'https://schema.org',
      '@type':    'WebApplication',
      'name':     'SESMine AI Commodity Price Predictor',
      'url':      `${BASE_URL}/products/ai-predictor.html`,
      'description': 'ML-powered commodity price forecasting tool. Predict iron ore, copper, gold, lithium prices with 94%+ directional accuracy using LSTM, XGBoost, and Transformer models.',
      'applicationCategory': 'FinanceApplication',
      'operatingSystem':     'Web Browser',
      'featureList': [
        'LSTM Neural Network forecasting',
        'XGBoost Ensemble model',
        'Transformer attention model',
        'Hybrid ensemble model',
        '1–24 month forecast horizons',
        'Confidence interval output',
        'CSV export'
      ],
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home',         'item': BASE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools',        'item': `${BASE_URL}/products/` },
          { '@type': 'ListItem', 'position': 3, 'name': 'AI Predictor', 'item': `${BASE_URL}/products/ai-predictor.html` }
        ]
      }
    });
  }

  /* ── Cost Calculator ── */
  if (path.includes('cost-calculator')) {
    inject({
      '@context': 'https://schema.org',
      '@type':    'WebApplication',
      'name':     'SESMine Mining Cost Calculator',
      'url':      `${BASE_URL}/products/cost-calculator.html`,
      'description': 'Free online mining cost calculator. Compute C1 cash cost, AISC, NPV, IRR, and payback period for open cut, underground, and ISR mining operations.',
      'applicationCategory': 'FinanceApplication',
      'operatingSystem':     'Web Browser',
      'featureList': [
        'C1 Cash Cost calculation',
        'AISC (All-In Sustaining Cost)',
        'NPV and IRR modelling',
        'Sensitivity tornado chart',
        'Bear / Base / Bull scenario comparison',
        'CSV export'
      ],
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home',             'item': BASE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools',            'item': `${BASE_URL}/products/` },
          { '@type': 'ListItem', 'position': 3, 'name': 'Cost Calculator',  'item': `${BASE_URL}/products/cost-calculator.html` }
        ]
      }
    });
  }

  /* ── Equipment Database ── */
  if (path.includes('equipment-database')) {
    inject({
      '@context': 'https://schema.org',
      '@type':    'Dataset',
      'name':     'SESMine Global Mining Equipment Database',
      'url':      `${BASE_URL}/products/equipment-database.html`,
      'description': 'Searchable database of 2,400+ mining equipment specifications including OEE, MTBF, fuel consumption, and pricing for haul trucks, excavators, drills, and processing equipment.',
      'keywords':  ['mining equipment', 'haul truck specifications', 'excavator specs', 'OEE benchmarks', 'MTBF mining'],
      'creator':   { '@id': `${BASE_URL}/#organization` },
      'license':   `${BASE_URL}/terms`,
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home',             'item': BASE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tools',            'item': `${BASE_URL}/products/` },
          { '@type': 'ListItem', 'position': 3, 'name': 'Equipment DB',     'item': `${BASE_URL}/products/equipment-database.html` }
        ]
      }
    });
  }

  /* ── Contact page ── */
  if (path.includes('contact')) {
    inject({
      '@context': 'https://schema.org',
      '@type':    'ContactPage',
      'name':     'Contact SESMine',
      'url':      `${BASE_URL}/contact.html`,
      'description': 'Contact the SESMine team for support, enterprise enquiries, demos, and partnership opportunities.',
      'breadcrumb': {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home',    'item': BASE_URL },
          { '@type': 'ListItem', 'position': 2, 'name': 'Contact', 'item': `${BASE_URL}/contact.html` }
        ]
      }
    });
  }

  /* ── Hub pages ── */
  const hubMap = {
    'economics-hub':     { name: 'Economics Intelligence Hub',    desc: 'Real-time commodity prices, market intelligence, and economic analysis for the global mining industry.' },
    'engineering-hub':   { name: 'Engineering Intelligence Hub',  desc: 'Mining equipment benchmarks, OEE analysis, and engineering performance data.' },
    'procurement-hub':   { name: 'Procurement Intelligence Hub',  desc: 'Supplier intelligence, contract benchmarks, and procurement analytics for mining operations.' },
    'safety-hub':        { name: 'Safety Intelligence Hub',       desc: 'TRIFR tracking, incident analysis, and safety risk management for mining sites.' },
    'sustainability-hub':{ name: 'Sustainability Intelligence Hub',desc: 'ESG reporting, emissions tracking, and biodiversity metrics for mining companies.' },
    'innovation-hub':    { name: 'Innovation Intelligence Hub',   desc: 'Mining R&D trends, patent analysis, and emerging technology intelligence.' }
  };

  Object.keys(hubMap).forEach(function (key) {
    if (path.includes(key)) {
      const hub = hubMap[key];
      inject({
        '@context': 'https://schema.org',
        '@type':    'WebPage',
        'name':      hub.name,
        'url':      `${BASE_URL}/hubs/${key}.html`,
        'description': hub.desc,
        'isPartOf':  { '@id': `${BASE_URL}/#website` },
        'breadcrumb': {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home',   'item': BASE_URL },
            { '@type': 'ListItem', 'position': 2, 'name': 'Hubs',   'item': `${BASE_URL}/hubs/` },
            { '@type': 'ListItem', 'position': 3, 'name': hub.name, 'item': `${BASE_URL}/hubs/${key}.html` }
          ]
        }
      });
    }
  });

})();
