/**
 * Claude UI Elements
 * CodeRenderer.js - Renderer for code artifacts
 */

class CodeArtifactRenderer {
  /**
   * Create a new code artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   * @param {string} language - Programming language for syntax highlighting
   */
  constructor(element, language) {
    this.element = element;
    this.language = language || 'javascript';
  }
  
  /**
   * Render code content with syntax highlighting
   * @param {string} content - Code content to render
   */
  render(content) {
    // Remove any existing content
    this.element.innerHTML = '';
    
    // Create pre and code elements
    const pre = document.createElement('pre');
    pre.className = 'line-numbers';
    
    const code = document.createElement('code');
    code.className = `language-${this.language}`;
    code.textContent = content;
    
    // Append elements
    pre.appendChild(code);
    this.element.appendChild(pre);
    
    // Apply syntax highlighting if Prism.js is available
    if (window.Prism) {
      try {
        Prism.highlightElement(code);
      } catch (error) {
        console.error('Error during syntax highlighting:', error);
      }
    }
  }
  
  /**
   * Set the language for syntax highlighting
   * @param {string} language - Programming language
   */
  setLanguage(language) {
    this.language = language;
  }
  
  /**
   * Automatically detect the language based on the content
   * @param {string} content - Code content to analyze
   */
  detectAndSetLanguage(content) {
    this.language = ArtifactRendererFactory.detectLanguage(content);
  }
  
  /**
   * Add line numbers to the code display
   * @param {boolean} show - Whether to show line numbers
   */
  setLineNumbers(show) {
    const pre = this.element.querySelector('pre');
    if (pre) {
      if (show) {
        pre.classList.add('line-numbers');
      } else {
        pre.classList.remove('line-numbers');
      }
      
      // Update Prism line numbers if available
      if (window.Prism && Prism.plugins && Prism.plugins.lineNumbers) {
        Prism.plugins.lineNumbers.highlightAll();
      }
    }
  }
  
  /**
   * Toggle word wrap for the code display
   * @param {boolean} wrap - Whether to wrap lines
   */
  setWordWrap(wrap) {
    const pre = this.element.querySelector('pre');
    if (pre) {
      pre.style.whiteSpace = wrap ? 'pre-wrap' : 'pre';
    }
  }
}
