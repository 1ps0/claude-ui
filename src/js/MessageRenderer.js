import ArtifactRendererFactory from './ArtifactFactory.js';
// Potentially import formatTimestamp if moved to a utility file or defined here
// import { formatTimestamp } from './utils.js'; 

/**
 * Claude UI Elements
 * MessageRenderer.js - Handles rendering of messages and artifacts
 * Version 2: Refactored for Vite and ES Modules
 */

export default class ClaudeMessageRenderer { // Export the class
  /**
   * Create a new message renderer
   * @param {HTMLElement} container - Container element for messages
   */
  constructor(container) {
    this.container = container;
  }
  
  /**
   * Parse and render a Claude response
   * @param {object|array} responseData - Claude response data
   */
  parseAndRenderResponse(responseData) {
    try {
      // Handle array of messages or single message
      if (Array.isArray(responseData)) {
        responseData.forEach(message => this.renderMessage(message));
      } else if (responseData.role) {
        // Single message with role
        this.renderMessage(responseData);
      } else if (responseData.messages) {
        // Response with messages array
        responseData.messages.forEach(message => this.renderMessage(message));
      } else {
        throw new Error('Invalid response format');
      }
      
      // Scroll to bottom after rendering
      this.scrollToBottom();
    } catch (error) {
      console.error('Error parsing response:', error);
      this.renderErrorMessage('Failed to parse Claude response');
    }
  }
  
  /**
   * Render a single message
   * @param {object} message - Message data to render
   */
  renderMessage(message) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = message.role === 'user' ? 'user-message' : 'claude-message';
    
    // Add message header with role if needed
    if (message.role && message.role !== 'user') {
      const headerElement = document.createElement('div');
      headerElement.className = 'message-header';
      headerElement.textContent = message.role.charAt(0).toUpperCase() + message.role.slice(1);
      messageElement.appendChild(headerElement);
    }
    
    // Render text content
    if (message.content) {
      const textElement = document.createElement('div');
      textElement.className = 'message-text';
      
      // Handle string content
      if (typeof message.content === 'string') {
        textElement.textContent = message.content;
      } 
      // Handle content array (newer Claude format)
      else if (Array.isArray(message.content)) {
        message.content.forEach(part => {
          if (part.type === 'text') {
            const textNode = document.createTextNode(part.text);
            textElement.appendChild(textNode);
          } else if (part.type === 'artifact') {
            // For inline artifacts, we'll render them after the text
            this.renderArtifact(messageElement, part);
          }
        });
      }
      
      messageElement.appendChild(textElement);
    }
    
    // Render artifacts if present in the standalone format
    if (message.artifacts && Array.isArray(message.artifacts)) {
      message.artifacts.forEach(artifact => {
        this.renderArtifact(messageElement, artifact);
      });
    }
    
    // Add timestamp if available
    if (message.timestamp) {
      const metadataElement = document.createElement('div');
      metadataElement.className = 'message-metadata';
      
      const timestamp = new Date(message.timestamp);
      // Assume formatTimestamp is available globally or imported
      // If formatTimestamp remains in main.js, this needs adjustment 
      // (e.g., pass it during construction or import it if exported)
      metadataElement.textContent = this.formatTimestamp(timestamp); // Or call imported function
      
      messageElement.appendChild(metadataElement);
    }
    
    // Append message to container
    this.container.appendChild(messageElement);
  }
  
  /**
   * Render an artifact within a message
   * @param {HTMLElement} parentElement - Parent element to append the artifact to
   * @param {object} artifact - Artifact data to render
   */
  renderArtifact(parentElement, artifact) {
    // Create artifact container
    const artifactContainer = document.createElement('div');
    artifactContainer.className = 'artifact-container';
    
    // Create artifact header
    const header = document.createElement('div');
    header.className = 'artifact-header';
    
    // Create artifact title
    const title = document.createElement('div');
    title.className = 'artifact-title';
    title.textContent = artifact.title || this.getArtifactTypeLabel(artifact.type);
    header.appendChild(title);
    
    // Create artifact type badge
    const typeBadge = document.createElement('div');
    typeBadge.className = 'artifact-type';
    typeBadge.textContent = this.getArtifactTypeLabel(artifact.type);
    header.appendChild(typeBadge);
    
    // Create artifact actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'artifact-actions';
    
    // Add copy button for code artifacts
    if (artifact.type === 'application/vnd.ant.code') {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => {
        this.copyArtifactContent(artifact.content);
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
      actionsContainer.appendChild(copyButton);
    }
    
    // Add expand/collapse button
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-button';
    expandButton.textContent = 'Expand';
    expandButton.addEventListener('click', () => {
      const content = artifactContainer.querySelector('.artifact-content');
      content.classList.toggle('expanded');
      expandButton.textContent = content.classList.contains('expanded') ? 'Collapse' : 'Expand';
    });
    actionsContainer.appendChild(expandButton);
    
    header.appendChild(actionsContainer);
    
    // Create artifact content container
    const content = document.createElement('div');
    content.className = 'artifact-content';
    
    // Add specific class based on artifact type
    const typeClass = artifact.type.split('/').pop().replace(/\./g, '-');
    content.classList.add(typeClass + '-container');
    
    // Determine the language for code artifacts
    let language = 'javascript'; // Default language
    if (artifact.type === 'application/vnd.ant.code' && artifact.language) {
      language = artifact.language;
    }
    
    // Create and use appropriate renderer
    const renderer = ArtifactRendererFactory.createRenderer(artifact.type, content, language);
    renderer.render(artifact.content || '');
    
    // Assemble artifact elements
    artifactContainer.appendChild(header);
    artifactContainer.appendChild(content);
    parentElement.appendChild(artifactContainer);
  }
  
  /**
   * Render an error message
   * @param {string} message - Error message to display
   */
  renderErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'claude-message error';
    
    const textElement = document.createElement('div');
    textElement.className = 'message-text';
    textElement.textContent = message;
    
    errorElement.appendChild(textElement);
    this.container.appendChild(errorElement);
  }
  
  /**
   * Copy artifact content to clipboard
   * @param {string} content - Content to copy
   */
  copyArtifactContent(content) {
    navigator.clipboard.writeText(content)
      .catch(err => {
        console.error('Failed to copy content:', err);
      });
  }
  
  /**
   * Get a human-readable label for an artifact type
   * @param {string} type - MIME type of the artifact
   * @returns {string} Human-readable label
   */
  getArtifactTypeLabel(type) {
    const typeMap = {
      'application/vnd.ant.code': 'Code',
      'text/markdown': 'Markdown',
      'text/html': 'HTML',
      'image/svg+xml': 'SVG',
      'application/vnd.ant.mermaid': 'Mermaid',
      'application/vnd.ant.react': 'React'
    };
    
    return typeMap[type] || 'Artifact';
  }
  
  /**
   * Scroll the container to the bottom
   */
  scrollToBottom() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  // Temporary placeholder for formatTimestamp - ideally import or pass in
  // Remove this if formatTimestamp is properly imported/provided
  formatTimestamp(date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  }
}
