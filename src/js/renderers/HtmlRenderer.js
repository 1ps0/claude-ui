/**
 * Claude UI Elements
 * HtmlRenderer.js - Renderer for HTML artifacts
 * Version 2: Refactored for Vite and ES Modules (using DOM manipulation)
 */

export default class HtmlArtifactRenderer { // Export class
  /**
   * Create a new HTML artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add('html-container');
    this.iframe = null; // Keep track of the iframe
  }
  
  /**
   * Render HTML content in a sandboxed iframe using DOM manipulation
   * @param {string} content - HTML content to render
   */
  render(content) {
    // Remove any existing content or iframe
    this.element.innerHTML = '';
    
    // Create a sandboxed iframe for rendering HTML content
    this.iframe = document.createElement('iframe');
    
    // Set sandbox attributes for security
    this.iframe.sandbox = 'allow-scripts allow-popups allow-same-origin';
    
    // Set styling
    this.iframe.style.width = '100%';
    this.iframe.style.border = 'none';
    this.iframe.style.minHeight = '300px'; // Initial height
    
    // Attach iframe to the DOM
    this.element.appendChild(this.iframe);
    
    // Wait for iframe to load before accessing its contentDocument
    this.iframe.onload = () => {
      const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
      if (!iframeDoc) {
        console.error('Could not access iframe document.');
        return;
      }
      
      // Write the user's HTML content
      iframeDoc.open();
      iframeDoc.write(this.getBoilerplateHTML(content)); // Add basic structure
      iframeDoc.close();
      
      // Inject the helper script using DOM methods
      this.injectHelperScript(iframeDoc);
      
      // Initial height adjustment
      this.adjustIframeHeight();
      
      // Set up message listener after content is loaded
      this.setupMessageListener();
    };

    // Fallback/Error handling for srcdoc if needed, but writing directly is often better
    // Try setting srcdoc first as a simpler alternative? Could have limitations.
    // this.iframe.srcdoc = this.getBoilerplateHTML(content, true); // Add flag for script
  }

  /**
   * Create basic HTML boilerplate to wrap the content
   * @param {string} content - Original HTML content
   * @returns {string} HTML string with basic structure
   */
  getBoilerplateHTML(content) {
    // If content seems to be a full HTML doc, use it directly
    if (content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')) {
        // Potentially inject styles/scripts here if needed, but safer after load
        return content;
    }
    // Otherwise, wrap the content
    // Basic styles included here for simplicity, could be injected too
    return (
      '<!DOCTYPE html>\n' +
      '<html lang="en">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8">\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '  <style>\n' +
      '    body { margin: 0; padding: 1rem; font-family: sans-serif; line-height: 1.5; }\n' +
      '    img, video, canvas, svg { max-width: 100%; height: auto; }\n' +
      '  </style>\n' +
      '</head>\n' +
      '<body>\n' +
      content +
      '</body>\n' +
      '</html>'
    );
  }

  /**
   * Inject the parent communication script into the iframe
   * @param {Document} iframeDoc - The iframe's document object
   */
  injectHelperScript(iframeDoc) {
    try {
        const scriptEl = iframeDoc.createElement('script');
        scriptEl.textContent = `
          function notifyParentResize() {
            // Debounce or throttle this if it fires too often
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'resize', height: height }, '*');
          }
          // Use ResizeObserver for more reliable dynamic height changes
          const resizeObserver = new ResizeObserver(notifyParentResize);
          resizeObserver.observe(document.body);
          // Initial notification
          window.addEventListener('load', notifyParentResize);
          // Fallback for simple cases
          setTimeout(notifyParentResize, 100); // Run after initial render
        `;
        // Append to body or head
        if (iframeDoc.body) {
            iframeDoc.body.appendChild(scriptEl);
        } else {
             iframeDoc.head.appendChild(scriptEl); // Fallback
        }
    } catch (error) {
        console.error('Error injecting helper script into iframe:', error);
    }
  }
  
  /**
   * Adjust iframe height based on content or message
   * @param {number} [height] - Optional height from message
   */
  adjustIframeHeight(height) {
    if (!this.iframe) return;
    try {
        const targetHeight = height || this.iframe.contentDocument?.documentElement?.scrollHeight;
        if (targetHeight) {
            // Add some padding
            this.iframe.style.height = (targetHeight + 20) + 'px';
        }
    } catch (error) {
        // Catch potential security errors accessing cross-origin frame content (if applicable)
        console.warn('Could not automatically adjust iframe height:', error);
    }
  }
  
  /**
   * Set up message listener for iframe communications
   */
  setupMessageListener() {
    // Ensure listener is only added once
    if (this.messageListener) {
        window.removeEventListener('message', this.messageListener);
    }

    this.messageListener = (event) => {
      // Basic security checks
      if (!this.iframe || event.source !== this.iframe.contentWindow) {
        return;
      }
      
      // Handle resize messages
      if (event.data && event.data.type === 'resize') {
        this.adjustIframeHeight(event.data.height);
      }
      // Handle other potential messages from iframe if needed
    };

    window.addEventListener('message', this.messageListener);
  }
  
  /**
   * Set content security policy for the iframe - Deprecated if not needed
   * CSP is often better set via server headers or meta tags in the main document
   */
  /*
  setContentSecurityPolicy(policy) {
    // This is complex to apply reliably to dynamic iframe content via JS.
    // Consider alternative security measures.
  }
  */

  // Cleanup listener when the component is destroyed (if applicable)
  destroy() {
      if (this.messageListener) {
          window.removeEventListener('message', this.messageListener);
      }
  }
}
