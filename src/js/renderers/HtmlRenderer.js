/**
 * Claude UI Elements
 * HtmlRenderer.js - Renderer for HTML artifacts
 */

class HtmlArtifactRenderer {
  /**
   * Create a new HTML artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add('html-container');
  }
  
  /**
   * Render HTML content in a sandboxed iframe
   * @param {string} content - HTML content to render
   */
  render(content) {
    // Remove any existing content
    this.element.innerHTML = '';
    
    // Create a sandboxed iframe for rendering HTML content
    const iframe = document.createElement('iframe');
    
    // Set sandbox attributes for security
    // Allow scripts but prevent top-level navigation and accessing parent
    iframe.sandbox = 'allow-scripts allow-popups allow-same-origin';
    
    // Set styling
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.minHeight = '300px';
    
    // Attach iframe to the DOM
    this.element.appendChild(iframe);
    
    // Write content to the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    
    // Add base resources and styles to the iframe content
    const enhancedContent = this.enhanceHtmlContent(content);
    iframeDoc.write(enhancedContent);
    iframeDoc.close();
    
    // Adjust iframe height to match content after it loads
    this.adjustIframeHeight(iframe);
    
    // Listen for messages from the iframe (for resize events, etc.)
    this.setupMessageListener(iframe);
  }
  
  /**
   * Enhance HTML content with additional resources
   * @param {string} content - Original HTML content
   * @returns {string} Enhanced HTML content
   */
  enhanceHtmlContent(content) {
    // If content doesn't include the basic HTML structure, add it
    if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      padding: 1rem;
      margin: 0;
    }
    
    /* Ensure all content fits within the iframe */
    img, video, canvas, svg {
      max-width: 100%;
      height: auto;
    }
    
    /* Basic responsive grid */
    .container {
      width: 100%;
      padding-right: 15px;
      padding-left: 15px;
      margin-right: auto;
      margin-left: auto;
    }
    
    /* Add any other basic styles needed */
  </style>
</head>
<body>
  ${content}
  <script>
    // Helper script to resize iframe
    function notifyParent() {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: 'resize', height: height }, '*');
    }
    
    // Notify when content changes
    window.addEventListener('load', notifyParent);
    window.addEventListener('resize', notifyParent);
    
    // Run once immediately
    notifyParent();
  </script>
</body>
</html>`;
    }
    
    // If content already has HTML structure, add only the resize script
    if (!content.includes('notifyParent()') && content.includes('</body>')) {
      return content.replace('</body>', `
  <script>
    // Helper script to resize iframe
    function notifyParent() {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: 'resize', height: height }, '*');
    }
    
    // Notify when content changes
    window.addEventListener('load', notifyParent);
    window.addEventListener('resize', notifyParent);
    
    // Run once immediately
    notifyParent();
  </script>
</body>`);
    }
    
    // Return the original content if it can't be enhanced
    return content;
  }
  
  /**
   * Adjust iframe height to match content
   * @param {HTMLIFrameElement} iframe - iframe element to adjust
   */
  adjustIframeHeight(iframe) {
    iframe.onload = () => {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const height = iframeDoc.body.scrollHeight;
      iframe.style.height = `${height + 20}px`;
    };
  }
  
  /**
   * Set up message listener for iframe communications
   * @param {HTMLIFrameElement} iframe - iframe element to listen to
   */
  setupMessageListener(iframe) {
    window.addEventListener('message', (event) => {
      // Check that the message is from our iframe
      if (event.source !== iframe.contentWindow) {
        return;
      }
      
      // Handle resize messages
      if (event.data && event.data.type === 'resize') {
        iframe.style.height = `${event.data.height + 20}px`;
      }
    });
  }
  
  /**
   * Set content security policy for the iframe
   * @param {string} policy - CSP policy string
   */
  setContentSecurityPolicy(policy) {
    // Store for future renders
    this.cspPolicy = policy;
    
    // Apply to existing iframe if any
    const iframe = this.element.querySelector('iframe');
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Create meta tag for CSP
      const meta = iframeDoc.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = policy;
      
      // Add to head
      const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];
      if (head) {
        head.appendChild(meta);
      }
    }
  }
}
