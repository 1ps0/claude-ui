import mermaid from 'mermaid';

/**
 * Claude UI Elements
 * MermaidRenderer.js - Renderer for Mermaid diagram artifacts
 * Version 2: Refactored for Vite and ES Modules
 */

export default class MermaidArtifactRenderer {
  /**
   * Create a new Mermaid artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add('mermaid-container');
  }
  
  /**
   * Render Mermaid diagram content
   * @param {string} content - Mermaid diagram definition to render
   */
  render(content) {
    // Remove any existing content
    this.element.innerHTML = '';
    
    // Create a container for the diagram with the mermaid class
    const container = document.createElement('div');
    container.className = 'mermaid';
    container.textContent = content;
    
    // Add a unique ID to the container for mermaid initialization
    const uniqueId = 'mermaid-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    container.id = uniqueId;
    
    // Append container to the DOM
    this.element.appendChild(container);
    
    // Initialize Mermaid if available (imported)
    if (mermaid) {
      try {
        // Check if mermaid is already initialized (v9+ check)
        // Initialization might be better handled centrally in main.js
        // if (typeof mermaid.initialize === 'function') {
          // Set default configuration
          // mermaid.initialize({ ... }); // Possibly move to main.js
        // }
        
        // Render the diagram
        this.renderDiagram(uniqueId, content);
      } catch (error) {
        console.error('Error initializing Mermaid:', error);
        this.showError('Mermaid initialization error: ' + error.message);
      }
    } else {
      console.warn('Mermaid library not loaded. Displaying raw content instead.');
      this.showError('Mermaid library not loaded. Displaying raw content.');
    }
  }
  
  /**
   * Render a Mermaid diagram
   * @param {string} id - ID of the container element
   * @param {string} definition - Mermaid diagram definition
   */
  renderDiagram(id, definition) {
    // Check if we should use the new API (mermaid v9+) or old API
    if (typeof mermaid.render === 'function') {
      try {
        // New API (mermaid v9+)
        mermaid.render(id, definition).then(({ svg, bindFunctions }) => {
          document.getElementById(id).innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(document.getElementById(id));
          }
        }).catch(error => {
          console.error('Error rendering Mermaid diagram:', error);
          this.showError('Diagram syntax error: ' + error.message);
        });
      } catch (error) {
        console.error('Error in Mermaid render process:', error);
        this.showError('Diagram rendering error: ' + error.message);
      }
    } else if (typeof mermaid.init === 'function') {
      // Legacy API (mermaid v8 and earlier)
      try {
        mermaid.init(undefined, document.getElementById(id));
      } catch (error) {
        console.error('Error initializing Mermaid diagram:', error);
        this.showError('Diagram syntax error: ' + error.message);
      }
    } else {
      console.error('Mermaid rendering method not found');
      this.showError('Compatible Mermaid rendering method not found');
    }
  }
  
  /**
   * Display an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    // Clear existing content
    this.element.innerHTML = '';
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'mermaid-error';
    errorElement.style.color = '#EF4444';
    errorElement.style.padding = '1rem';
    errorElement.style.border = '1px solid #EF4444';
    errorElement.style.borderRadius = '0.25rem';
    errorElement.style.backgroundColor = '#FEF2F2';
    errorElement.style.marginTop = '0.5rem';
    
    // Add error message
    errorElement.textContent = message;
    
    // Create pre element for diagram code
    const pre = document.createElement('pre');
    pre.style.marginTop = '0.5rem';
    pre.style.padding = '0.5rem';
    pre.style.backgroundColor = '#F1F5F9';
    pre.style.borderRadius = '0.25rem';
    pre.style.overflow = 'auto';
    pre.style.fontSize = '0.8rem';
    pre.textContent = this.lastContent || '';
    
    // Append elements
    this.element.appendChild(errorElement);
    this.element.appendChild(pre);
  }
  
  /**
   * Set theme for Mermaid diagrams
   * @param {string} theme - Theme name
   */
  setTheme(theme) {
    if (mermaid) {
      // Re-initialization for theme change might need updated API call for v10+
      // mermaid.initialize({ theme: theme }); // Check Mermaid docs for dynamic theme change
      
      // Re-render if we have content already
      if (this.lastContent) {
        this.render(this.lastContent);
      }
    }
  }
}
