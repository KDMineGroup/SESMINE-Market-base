/**
 * Vercel Web Analytics Integration
 * This script initializes Vercel Web Analytics for tracking page views and events.
 */
(function() {
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
  
  // Create and inject the analytics script
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  
  // Append to document head or body
  var target = document.head || document.body;
  if (target) {
    target.appendChild(script);
  }
})();
