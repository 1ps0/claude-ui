import ClaudeMessageRenderer from './MessageRenderer.js';
// Import necessary PrismJS components (if checkDependencies relies on Prism explicitly)
// import Prism from 'prismjs';
// import { marked } from 'marked';
// import mermaid from 'mermaid';
// import React from 'react';
// import ReactDOM from 'react-dom';

/**
 * Claude UI Elements
 * ClaudeUI.js - Main application controller
 * Version 3: Refactored for Vite and ES Modules
 */

export default class ClaudeUI { // Export the class
  /**
   * Create a new Claude UI instance
   * @param {string} containerId - ID of the container element
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error('Container element with ID "' + containerId + '" not found');
    }
    
    this.messageRenderer = new ClaudeMessageRenderer(this.container);
    this.initialize();
  }
  
  /**
   * Initialize the UI components
   */
  initialize() {
    // Remove the dependency check as dependencies are now managed by imports/Vite
    // this.checkDependencies(); 
    
    // Set up UI components
    this.setupHeaderComponents();
    
    console.log('Claude UI initialized');
  }
  
  /**
   * Set up additional header components
   */
  setupHeaderComponents() {
    const header = document.querySelector('.claude-header');
    if (!header) return;
    
    // Add conversation info container
    const infoContainer = document.createElement('div');
    infoContainer.className = 'conversation-info';
    infoContainer.style.display = 'none'; // Hidden by default
    
    // Add metadata elements
    const metadataContainer = document.createElement('div');
    metadataContainer.className = 'conversation-metadata';
    
    infoContainer.appendChild(metadataContainer);
    header.appendChild(infoContainer);
  }
  
  /**
   * Update conversation metadata in the header
   * @param {object} metadata - Conversation metadata
   */
  updateConversationMetadata(metadata) {
    const infoContainer = document.querySelector('.conversation-info');
    const metadataContainer = document.querySelector('.conversation-metadata');
    
    if (!infoContainer || !metadataContainer) return;
    
    // Clear existing metadata
    metadataContainer.innerHTML = '';
    
    // Add metadata fields if available
    if (metadata.uuid) {
      const idElement = document.createElement('div');
      idElement.className = 'metadata-item';
      idElement.innerHTML = '<span class="metadata-label">ID:</span> <span class="metadata-value">' + metadata.uuid + '</span>';
      metadataContainer.appendChild(idElement);
    }
    
    if (metadata.created_at) {
      const createdElement = document.createElement('div');
      createdElement.className = 'metadata-item';
      const date = new Date(metadata.created_at);
      createdElement.innerHTML = '<span class="metadata-label">Created:</span> <span class="metadata-value">' + date.toLocaleString() + '</span>';
      metadataContainer.appendChild(createdElement);
    }
    
    // Show the info container if we have metadata
    if (metadataContainer.children.length > 0) {
      infoContainer.style.display = 'block';
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
      
      // Capture metadata if it's the new Claude format
      if (responseData.uuid && responseData.name) {
        // Update title
        const titleElement = document.querySelector('.claude-header h1');
        if (titleElement) {
          titleElement.textContent = responseData.name || 'Claude UI';
        }
        
        // Update metadata
        this.updateConversationMetadata({
          uuid: responseData.uuid,
          created_at: responseData.created_at,
          updated_at: responseData.updated_at
        });
      }
      
      // Render the response using the message renderer
      this.messageRenderer.parseAndRenderResponse(responseData);
    } catch (error) {
      console.error('Error rendering response:', error);
      this.showError('Failed to render response: ' + error.message);
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
    
    // Reset conversation title
    const titleElement = document.querySelector('.claude-header h1');
    if (titleElement) {
      titleElement.textContent = 'Claude UI';
    }
    
    // Hide and clear metadata
    const infoContainer = document.querySelector('.conversation-info');
    if (infoContainer) {
      infoContainer.style.display = 'none';
    }
    
    const metadataContainer = document.querySelector('.conversation-metadata');
    if (metadataContainer) {
      metadataContainer.innerHTML = '';
    }
  }
  
  /**
   * Show a loading indicator
   */
  showLoading() {
    // Remove any existing loading indicator
    this.hideLoading();
    
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    loadingElement.appendChild(spinner);
    
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Loading conversation...';
    loadingText.style.marginLeft = '10px';
    loadingElement.appendChild(loadingText);
    
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
  
  /**
   * Load a conversation from a JSON file
   * @param {File} file - JSON file to load
   */
  loadFromFile(file) {
    if (!file) {
      this.showError('No file selected');
      return;
    }
    
    // Show loading indicator
    this.showLoading();
    
    // Clear existing content
    this.clear();
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        this.renderResponse(jsonData);
        this.hideLoading();
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        this.hideLoading();
        this.showError('Failed to parse JSON file: ' + error.message);
      }
    };
    
    reader.onerror = () => {
      this.hideLoading();
      this.showError('Error reading file');
    };
    
    reader.readAsText(file);
  }
}
