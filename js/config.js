/* ═══════════════════════════════════════════════════════════════════════════
   SESMine Platform — Global Configuration v5.0
   Central config for all pages, hubs, roles, and system settings
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

window.SESConfig = {

  /* ── App Meta ── */
  app: {
    name:        'SESMine Intelligence',
    shortName:   'SESMine',
    version:     '5.0.0',
    environment: 'production',
    baseUrl:     window.location.origin,
    logoUrl:     'https://cdn.grapesjs.com/workspaces/cmjdh0oo603xm12grpuiruk7p/assets/f6b95b3d-49d1-4e77-b952-49ed80c4befa__image-9-14-1404-ap-at-8.42-pm.png',
    supportEmail:'support@sesmine.com',
    contactEmail:'hello@sesmine.com',
    phone:       '+61 8 9000 1234',
    address:     '1 Mining Way, Perth WA 6000, Australia',
    abn:         '12 345 678 901',
    founded:     2019,
    copyright:   `© ${new Date().getFullYear()} SESMine Intelligence Pty Ltd. All rights reserved.`
  },

  /* ── Social Links ── */
  social: {
    linkedin:  'https://linkedin.com/company/sesmine',
    twitter:   'https://twitter.com/sesmine',
    youtube:   'https://youtube.com/@sesmine',
    github:    'https://github.com/sesmine',
    instagram: 'https://instagram.com/sesmine'
  },

  /* ── Navigation ── */
  nav: {
    public: [
      { label: 'Platform',  href: '#',           hasDropdown: true },
      { label: 'Hubs',      href: '#',           hasDropdown: true },
      { label: 'Products',  href: '#',           hasDropdown: true },
      { label: 'Pricing',   href: 'pricing.html' },
      { label: 'Resources', href: 'resources.html' },
      { label: 'News',      href: 'news.html' },
      { label: 'Contact',   href: 'contact.html' }
    ],
    dashboard: [
      {
        section: 'Overview',
        items: [
          { label: 'Dashboard',    href: '../dashboard/main-dashboard.html', icon: 'fa-th-large' },
          { label: 'Analytics',    href: '../dashboard/analytics.html',      icon: 'fa-chart-line' },
          { label: 'ESG Report',   href: '../dashboard/esg-dashboard.html',  icon: 'fa-leaf' }
        ]
      },
      {
        section: 'Hubs',
        items: [
          { label: 'Economics',    href: '../hubs/economics-hub.html',     icon: 'fa-chart-bar',    color: '#00D4FF' },
          { label: 'Engineering',  href: '../hubs/engineering-hub.html',   icon: 'fa-cogs',         color: '#F97316' },
          { label: 'Procurement',  href: '../hubs/procurement-hub.html',   icon: 'fa-boxes',        color: '#A855F7' },
          { label: 'Safety',       href: '../hubs/safety-hub.html',        icon: 'fa-hard-hat',     color: '#EF4444' },
          { label: 'Sustainability',href:'../hubs/sustainability-hub.html', icon: 'fa-seedling',     color: '#22C55E' },
          { label: 'Innovation',   href: '../hubs/innovation-hub.html',    icon: 'fa-lightbulb',    color: '#D4AF37' }
        ]
      },
      {
        section: 'Tools',
        items: [
          { label: 'AI Predictor',    href: '../products/ai-predictor.html',      icon: 'fa-brain' },
          { label: 'Cost Calculator', href: '../products/cost-calculator.html',   icon: 'fa-calculator' },
          { label: 'Equipment DB',    href: '../products/equipment-database.html',icon: 'fa-database' }
        ]
      }
    ]
  },

  /* ── Hubs ── */
  hubs: [
    {
      id:          'economics',
      label:       'Economics Hub',
      shortLabel:  'Economics',
      icon:        'fa-chart-bar',
      color:       '#00D4FF',
      colorBg:     'rgba(0,212,255,0.1)',
      colorBorder: 'rgba(0,212,255,0.2)',
      href:        'hubs/economics-hub.html',
      description: 'CAPEX/OPEX modelling, financial forecasting, and mine valuation tools.',
      image:       'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format&fit=crop',
      features:    ['CAPEX Modelling','OPEX Analysis','NPV / IRR Tools','Sensitivity Analysis','Cost Benchmarking'],
      badge:       'Core'
    },
    {
      id:          'engineering',
      label:       'Engineering Hub',
      shortLabel:  'Engineering',
      icon:        'fa-cogs',
      color:       '#F97316',
      colorBg:     'rgba(249,115,22,0.1)',
      colorBorder: 'rgba(249,115,22,0.2)',
      href:        'hubs/engineering-hub.html',
      description: 'Structural design, geotechnical analysis, and mine planning tools.',
      image:       'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80&auto=format&fit=crop',
      features:    ['Mine Planning','Geotechnical Tools','Structural Analysis','Blast Design','Ventilation Modelling'],
      badge:       'Core'
    },
    {
      id:          'procurement',
      label:       'Procurement Hub',
      shortLabel:  'Procurement',
      icon:        'fa-boxes',
      color:       '#A855F7',
      colorBg:     'rgba(168,85,247,0.1)',
      colorBorder: 'rgba(168,85,247,0.2)',
      href:        'hubs/procurement-hub.html',
      description: 'Supplier management, contract tracking, and procurement analytics.',
      image:       'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80&auto=format&fit=crop',
      features:    ['Supplier Database','Contract Management','Spend Analytics','RFQ Automation','Vendor Scoring'],
      badge:       'Pro'
    },
    {
      id:          'safety',
      label:       'Safety Hub',
      shortLabel:  'Safety',
      icon:        'fa-hard-hat',
      color:       '#EF4444',
      colorBg:     'rgba(239,68,68,0.1)',
      colorBorder: 'rgba(239,68,68,0.2)',
      href:        'hubs/safety-hub.html',
      description: 'Incident tracking, risk assessment, and compliance management.',
      image:       'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop',
      features:    ['Incident Reporting','Risk Matrix','TRIFR Tracking','Compliance Audits','Safety Training'],
      badge:       'Core'
    },
    {
      id:          'sustainability',
      label:       'Sustainability Hub',
      shortLabel:  'Sustainability',
      icon:        'fa-seedling',
      color:       '#22C55E',
      colorBg:     'rgba(34,197,94,0.1)',
      colorBorder: 'rgba(34,197,94,0.2)',
      href:        'hubs/sustainability-hub.html',
      description: 'ESG reporting, carbon tracking, and environmental compliance tools.',
      image:       'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80&auto=format&fit=crop',
      features:    ['Carbon Accounting','ESG Reporting','Water Management','Biodiversity Tracking','GRI Standards'],
      badge:       'Pro'
    },
    {
      id:          'innovation',
      label:       'Innovation Hub',
      shortLabel:  'Innovation',
      icon:        'fa-lightbulb',
      color:       '#D4AF37',
      colorBg:     'rgba(212,175,55,0.1)',
      colorBorder: 'rgba(212,175,55,0.2)',
      href:        'hubs/innovation-hub.html',
      description: 'R&D pipeline, technology scouting, and digital transformation tools.',
      image:       'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop',
      features:    ['Tech Scouting','R&D Pipeline','Digital Twin','AI Integration','Innovation Metrics'],
      badge:       'Enterprise'
    }
  ],

  /* ── Products ── */
  products: [
    {
      id:          'ai-predictor',
      label:       'AI Predictor',
      icon:        'fa-brain',
      color:       '#00D4FF',
      href:        'products/ai-predictor.html',
      description: 'Machine-learning cost and production forecasting engine.',
      badge:       'New'
    },
    {
      id:          'cost-calculator',
      label:       'Cost Calculator',
      icon:        'fa-calculator',
      color:       '#A855F7',
      href:        'products/cost-calculator.html',
      description: 'Real-time CAPEX/OPEX estimation with benchmark data.',
      badge:       'Popular'
    },
    {
      id:          'equipment-database',
      label:       'Equipment Database',
      icon:        'fa-database',
      color:       '#F97316',
      href:        'products/equipment-database.html',
      description: '50,000+ equipment specs, pricing, and performance data.',
      badge:       'Core'
    }
  ],

  /* ── Pricing Plans ── */
  plans: [
    {
      id:          'starter',
      name:        'Starter',
      price:       99,
      period:      'month',
      description: 'Perfect for individual engineers and small teams exploring mining intelligence.',
      color:       '#60A5FA',
      features: [
        { text: '2 Hub Access',          included: true },
        { text: 'Basic Analytics',       included: true },
        { text: '5 Projects',            included: true },
        { text: 'Email Support',         included: true },
        { text: 'AI Predictor (Limited)',included: true },
        { text: 'Cost Calculator',       included: true },
        { text: 'Equipment Database',    included: false },
        { text: 'ESG Dashboard',         included: false },
        { text: 'API Access',            included: false },
        { text: 'Priority Support',      included: false }
      ],
      cta:      'Start Free Trial',
      popular:  false,
      role:     'viewer'
    },
    {
      id:          'professional',
      name:        'Professional',
      price:       299,
      period:      'month',
      description: 'For professional teams requiring full hub access and advanced analytics.',
      color:       '#00D4FF',
      features: [
        { text: 'All 6 Hubs',            included: true },
        { text: 'Advanced Analytics',    included: true },
        { text: 'Unlimited Projects',    included: true },
        { text: 'Priority Support',      included: true },
        { text: 'AI Predictor (Full)',   included: true },
        { text: 'Cost Calculator',       included: true },
        { text: 'Equipment Database',    included: true },
        { text: 'ESG Dashboard',         included: true },
        { text: 'API Access (1000/day)', included: true },
        { text: 'Custom Reports',        included: false }
      ],
      cta:      'Start Free Trial',
      popular:  true,
      role:     'analyst'
    },
    {
      id:          'enterprise',
      name:        'Enterprise',
      price:       899,
      period:      'month',
      description: 'Full-scale deployment for large mining organisations with custom integrations.',
      color:       '#D4AF37',
      features: [
        { text: 'Everything in Pro',     included: true },
        { text: 'Custom Integrations',   included: true },
        { text: 'Dedicated CSM',         included: true },
        { text: 'SLA 99.9% Uptime',      included: true },
        { text: 'On-premise Option',     included: true },
        { text: 'Unlimited API Access',  included: true },
        { text: 'Custom Reports',        included: true },
        { text: 'White Labelling',       included: true },
        { text: 'Training & Onboarding', included: true },
        { text: 'Audit Logs',            included: true }
      ],
      cta:      'Contact Sales',
      popular:  false,
      role:     'engineer'
    }
  ],

  /* ── Roles ── */
  roles: {
    super_admin: { label: 'Super Admin',  color: '#D4AF37', hubs: ['all'] },
    admin:       { label: 'Admin',        color: '#F97316', hubs: ['all'] },
    engineer:    { label: 'Engineer',     color: '#00D4FF', hubs: ['all'] },
    analyst:     { label: 'Analyst',      color: '#A855F7', hubs: ['economics','engineering','procurement','sustainability'] },
    viewer:      { label: 'Viewer',       color: '#60A5FA', hubs: ['economics','safety'] }
  },

  /* ── API Endpoints ── */
  api: {
    base:         'https://api.sesmine.com/v1',
    newsApiKey:   'pub_62f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4',
    newsEndpoint: 'https://newsdata.io/api/1/news',
    weatherApi:   'https://api.openweathermap.org/data/2.5',
    timeout:      10000
  },

  /* ── Chart Defaults ── */
  charts: {
    defaultColors: [
      '#00D4FF','#2563EB','#A855F7',
      '#22C55E','#F97316','#D4AF37',
      '#EF4444','#06B6D4','#8B5CF6'
    ],
    gridColor:    'rgba(255,255,255,0.05)',
    textColor:    '#6688A0',
    fontFamily:   "'Inter', sans-serif",
    fontSize:     11,
    animation:    { duration: 800, easing: 'easeInOutQuart' }
  },

  /* ── Map Config ── */
  map: {
    defaultCenter: [-25.2744, 133.7751],
    defaultZoom:   4,
    style:         'dark',
    mineLocations: [
      { name:'Olympic Dam',    lat:-30.4395, lng:136.8870, type:'copper-uranium', company:'BHP',       production:'200kt Cu/yr' },
      { name:'Bowen Basin',    lat:-22.5000, lng:148.5000, type:'coal',           company:'Glencore',  production:'60Mt/yr' },
      { name:'Pilbara Region', lat:-22.0000, lng:118.0000, type:'iron-ore',       company:'Rio Tinto', production:'330Mt/yr' },
      { name:'Goldfields',     lat:-30.7333, lng:121.4667, type:'gold',           company:'Newmont',   production:'1.2Moz/yr' },
      { name:'Mt Isa',         lat:-20.7256, lng:139.4927, type:'copper-zinc',    company:'Glencore',  production:'100kt Cu/yr' },
      { name:'Kalgoorlie',     lat:-30.7490, lng:121.4660, type:'gold',           company:'Northern Star','production':'600koz/yr' },
      { name:'Newman',         lat:-23.3633, lng:119.7328, type:'iron-ore',       company:'BHP',       production:'120Mt/yr' },
      { name:'Roxby Downs',    lat:-30.5500, lng:136.8667, type:'copper',         company:'BHP',       production:'180kt Cu/yr' }
    ]
  },

  /* ── Commodity Prices (mock — replace with live API) ── */
  commodities: [
    { name:'Iron Ore', symbol:'IO',  price: 108.40, change: +1.25, unit:'USD/t',   icon:'fa-mountain' },
    { name:'Copper',   symbol:'CU',  price: 9842,   change: -0.38, unit:'USD/t',   icon:'fa-circle' },
    { name:'Gold',     symbol:'XAU', price: 3318,   change: +0.62, unit:'USD/oz',  icon:'fa-coins' },
    { name:'Silver',   symbol:'XAG', price: 32.85,  change: +0.14, unit:'USD/oz',  icon:'fa-circle' },
    { name:'Coal',     symbol:'COA', price: 134.20, change: -1.10, unit:'USD/t',   icon:'fa-fire' },
    { name:'Nickel',   symbol:'NI',  price: 16820,  change: +0.88, unit:'USD/t',   icon:'fa-atom' },
    { name:'Lithium',  symbol:'LI',  price: 14200,  change: +2.40, unit:'USD/t',   icon:'fa-bolt' },
    { name:'Zinc',     symbol:'ZN',  price: 2940,   change: -0.22, unit:'USD/t',   icon:'fa-layer-group' }
  ],

  /* ── Testimonials ── */
  testimonials: [
    {
      name:    'James Whitfield',
      role:    'Chief Engineer',
      company: 'Rio Tinto',
      avatar:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop&facepad=2',
      text:    'SESMine has completely transformed how we approach CAPEX estimation. The AI-powered forecasting alone has saved us millions in project planning.',
      rating:  5,
      hub:     'economics'
    },
    {
      name:    'Dr. Sarah Chen',
      role:    'Head of Sustainability',
      company: 'BHP',
      avatar:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&auto=format&fit=crop&facepad=2',
      text:    'The ESG dashboard gives us real-time visibility across all our sites. Reporting that used to take weeks now takes hours.',
      rating:  5,
      hub:     'sustainability'
    },
    {
      name:    'Marcus O\'Brien',
      role:    'VP Operations',
      company: 'Newmont',
      avatar:  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&auto=format&fit=crop&facepad=2',
      text:    'The procurement hub has streamlined our supplier relationships dramatically. Vendor scoring alone has cut our procurement cycle by 40%.',
      rating:  5,
      hub:     'procurement'
    },
    {
      name:    'Priya Nair',
      role:    'Safety Manager',
      company: 'Fortescue',
      avatar:  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&auto=format&fit=crop&facepad=2',
      text:    'Incident tracking and TRIFR monitoring in one platform is a game changer. Our safety performance has improved 28% since deployment.',
      rating:  5,
      hub:     'safety'
    },
    {
      name:    'Tom Hargreaves',
      role:    'Mine Planning Engineer',
      company: 'Glencore',
      avatar:  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&auto=format&fit=crop&facepad=2',
      text:    'The engineering hub\'s blast design and ventilation modelling tools are best-in-class. Integrates seamlessly with our existing workflows.',
      rating:  5,
      hub:     'engineering'
    },
    {
      name:    'Amara Diallo',
      role:    'Innovation Director',
      company: 'Anglo American',
      avatar:  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&auto=format&fit=crop&facepad=2',
      text:    'The innovation hub\'s technology scouting capabilities have accelerated our digital transformation roadmap by 18 months.',
      rating:  5,
      hub:     'innovation'
    }
  ],

  /* ── Partner Logos ── */
  partners: [
    { name: 'Rio Tinto',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Rio_Tinto_logo.svg/200px-Rio_Tinto_logo.svg.png' },
    { name: 'BHP',          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/BHP_logo.svg/200px-BHP_logo.svg.png' },
    { name: 'Newmont',      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Newmont_logo.svg/200px-Newmont_logo.svg.png' },
    { name: 'Glencore',     logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Glencore_logo.svg/200px-Glencore_logo.svg.png' },
    { name: 'Fortescue',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Fortescue_Metals_Group_logo.svg/200px-Fortescue_Metals_Group_logo.svg.png' },
    { name: 'Anglo American',logo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Anglo_American_Logo.svg/200px-Anglo_American_Logo.svg.png' },
    { name: 'Vale',         logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Vale_logo.svg/200px-Vale_logo.svg.png' },
    { name: 'Barrick Gold', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Barrick_Gold_logo.svg/200px-Barrick_Gold_logo.svg.png' }
  ],

  /* ── Stats ── */
  stats: [
    { value: '1,200+', label: 'Industry Leaders',   icon: 'fa-users' },
    { value: '$4.2B',  label: 'CAPEX Modelled',     icon: 'fa-dollar-sign' },
    { value: '98.7%',  label: 'Uptime SLA',         icon: 'fa-server' },
    { value: '6',      label: 'Intelligence Hubs',  icon: 'fa-th' },
    { value: '50k+',   label: 'Equipment Records',  icon: 'fa-database' },
    { value: '32',     label: 'Countries',          icon: 'fa-globe' }
  ],

  /* ── ESG Metrics ── */
  esg: {
    targets: {
      carbonReduction: 45,
      waterRecycling:  80,
      renewableEnergy: 60,
      wasteRecovery:   90,
      safetyTRIFR:     2.5,
      communityInvestment: 5
    },
    frameworks: ['GRI Standards','TCFD','SASB Mining','UN SDGs','ISO 14001','ICMM Principles']
  },

  /* ── Equipment Categories ── */
  equipmentCategories: [
    { id: 'drilling',    label: 'Drilling',      icon: 'fa-drill',       count: 8420 },
    { id: 'loading',     label: 'Loading',       icon: 'fa-truck-loading',count: 6200 },
    { id: 'hauling',     label: 'Hauling',       icon: 'fa-truck',       count: 9800 },
    { id: 'processing',  label: 'Processing',    icon: 'fa-industry',    count: 7300 },
    { id: 'crushing',    label: 'Crushing',      icon: 'fa-compress-alt',count: 4100 },
    { id: 'conveyors',   label: 'Conveyors',     icon: 'fa-stream',      count: 5600 },
    { id: 'pumps',       label: 'Pumps',         icon: 'fa-water',       count: 4800 },
    { id: 'electrical',  label: 'Electrical',    icon: 'fa-bolt',        count: 3900 }
  ],

  /* ── Toast defaults ── */
  toast: {
    duration:  3500,
    position:  'bottom-right',
    maxToasts: 5
  },

  /* ── Feature flags ── */
  features: {
    liveNews:       true,
    commodityTicker:true,
    mapEnabled:     true,
    aiPredictor:    true,
    darkModeOnly:   true,
    maintenanceMode:false
  }
};
