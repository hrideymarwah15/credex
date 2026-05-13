// SpendLens Embeddable Widget
// Usage: <script src="https://spendlens.vercel.app/widget.js" data-theme="dark" async></script>

(function() {
  'use strict';

  // Find all script tags pointing to this widget
  const scripts = document.querySelectorAll('script[src*="widget.js"]');

  scripts.forEach((script) => {
    const theme = script.getAttribute('data-theme') || 'light';
    const width = script.getAttribute('data-width') || '100%';
    const height = script.getAttribute('data-height') || '600';

    // Get base URL from script src
    const scriptSrc = script.getAttribute('src');
    const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

    // Create container
    const container = document.createElement('div');
    container.className = 'spendlens-widget-container';
    container.style.width = width;
    container.style.maxWidth = '100%';
    container.style.margin = '0 auto';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/embed?theme=${theme}`;
    iframe.width = '100%';
    iframe.height = height;
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.display = 'block';
    iframe.loading = 'lazy';
    iframe.title = 'SpendLens AI Spend Audit';

    // Handle dynamic height resize
    window.addEventListener('message', (event) => {
      if (event.data.type === 'spendlens-resize') {
        iframe.style.height = event.data.height + 'px';
      }
    });

    // Insert iframe into container
    container.appendChild(iframe);

    // Insert container after script tag
    script.parentNode.insertBefore(container, script.nextSibling);
  });
})();
