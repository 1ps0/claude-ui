/**
 * Claude UI Elements
 * ClaudeUI.js - Main application controller
 */

class ClaudeUI {
  /**
   * Create a new Claude UI instance
   * @param {string} containerId - ID of the container element
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with ID "${containerId}" not found`);
    }
    
    this.messageRenderer = new ClaudeMessageRenderer(this.container);
    this.initialize();
  }
  
  /**
   * Initialize the UI components
   */
  initialize() {
    // Check if required libraries are loaded
    this.checkDependencies();
    
    console.log('Claude UI initialized');
  }
  
  /**
   * Check if required dependencies are available
   */
  checkDependencies() {
    const dependencies = [
      { name: 'Prism', object: window.Prism },
      { name: 'Marked', object: window.marked },
      { name: 'Mermaid', object: window.mermaid },
      { name: 'React', object: window.React },
      { name: 'ReactDOM', object: window.ReactDOM }
    ];
    
    const missingDependencies = dependencies
      .filter(dep => !dep.object)
      .map(dep => dep.name);
    
    if (missingDependencies.length > 0) {
      console.warn(`Missing dependencies: ${missingDependencies.join(', ')}`);
    }
  }
  
  /**
   * Render a Claude response in the UI
   * @param {string|object} response - JSON string or object representing the Claude response
   */
  renderResponse(response) {
    try {
      // Parse the response if it's a string
      const responseData = typeof response === 'string' 
        ? JSON.parse(response) 
        : response;
      
      // Render the response using the message renderer
      this.messageRenderer.parseAndRenderResponse(responseData);
    } catch (error) {
      console.error('Error rendering response:', error);
      this.showError(`Failed to render response: ${error.message}`);
    }
  }
  
  /**
   * Show an error message in the UI
   * @param {string} message - Error message to display
   */
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    this.container.appendChild(errorElement);
  }
  
  /**
   * Clear all content from the container
   */
  clear() {
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
  
  /**
   * Show a loading indicator
   */
  showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    loadingElement.appendChild(spinner);
    
    this.container.appendChild(loadingElement);
  }
  
  /**
   * Hide the loading indicator
   */
  hideLoading() {
    const loadingElement = this.container.querySelector('.loading');
    if (loadingElement) {
      this.container.removeChild(loadingElement);
    }
  }
  
  /**
   * Set a theme for the UI
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  setTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }
}
