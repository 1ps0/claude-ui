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
 * Version 4: Mark-2 Multi-conversation support
 */

export default class ClaudeUI {
  // Export the class
  /**
   * Create a new Claude UI instance
   * @param {string} containerId - ID of the container element
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(
        'Container element with ID "' + containerId + '" not found'
      );
    }

    this.messageRenderer = new ClaudeMessageRenderer(this.container);

    // Mark-2 State Variables
    this.allConversations = [];
    this.currentView = 'empty'; // 'empty', 'list', 'conversation'
    this.selectedConversationUUID = null;

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

    console.log('Claude UI Mark-2 initialized');
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
      idElement.innerHTML =
        '<span class="metadata-label">ID:</span> <span class="metadata-value">' +
        metadata.uuid +
        '</span>';
      metadataContainer.appendChild(idElement);
    }

    if (metadata.created_at) {
      const createdElement = document.createElement('div');
      createdElement.className = 'metadata-item';
      const date = new Date(metadata.created_at);
      createdElement.innerHTML =
        '<span class="metadata-label">Created:</span> <span class="metadata-value">' +
        date.toLocaleString() +
        '</span>';
      metadataContainer.appendChild(createdElement);
    }

    // Show the info container if we have metadata
    if (metadataContainer.children.length > 0) {
      infoContainer.style.display = 'block';
    }
  }

  /**
   * Loads and validates the multi-conversation data
   * @param {any} jsonData - Parsed JSON data from the file
   */
  loadConversationData(jsonData) {
    if (!Array.isArray(jsonData)) {
      this.showError(
        'Error: Loaded file does not contain a valid JSON array of conversations.'
      );
      this.currentView = 'empty'; // Reset view
      return;
    }
    // Optional: Add deeper validation for conversation object structure here

    this.allConversations = jsonData;
    this.selectedConversationUUID = null; // Ensure nothing is selected
    this.currentView = 'list';
    this.renderListView();

    // Reset header title/metadata when showing the list
    this.resetHeader();
    this.hideLoading(); // Ensure loading indicator is hidden
  }

  /**
   * Renders the searchable list of conversations
   */
  renderListView() {
    this.clearMessageContainer(); // Clear existing content

    // Create Search Bar (if not already in HTML)
    const searchInput = this.getOrCreateElement(
      'conversation-search-input',
      'input',
      this.container.parentNode
    ); // Place before container
    searchInput.type = 'search';
    searchInput.placeholder = 'Search conversations by name...';
    searchInput.style.display = 'block'; // Ensure visible
    searchInput.style.width = '95%'; // Adjust as needed
    searchInput.style.margin = '0.5rem auto';
    searchInput.style.padding = '0.5rem';
    searchInput.oninput = (e) => this.filterAndRenderList(e.target.value);

    // Create List Container
    const listContainer = this.getOrCreateElement(
      'conversation-list-container',
      'div',
      this.container
    );
    listContainer.style.padding = '1rem'; // Add some padding
    listContainer.innerHTML = ''; // Clear previous list

    // Generate List Items
    const listElement = document.createElement('ul');
    listElement.style.listStyle = 'none';
    listElement.style.padding = '0';
    listElement.style.margin = '0';

    const conversationsToRender = this.filterConversations(searchInput.value); // Use current search term

    if (conversationsToRender.length === 0) {
      listElement.innerHTML =
        '<p style="text-align: center; color: var(--muted-text-color);">No conversations found.</p>';
    } else {
      conversationsToRender.forEach((convo) => {
        const listItem = document.createElement('li');
        listItem.style.padding = '0.75rem 0.5rem';
        listItem.style.borderBottom = '1px solid var(--border-color)';
        listItem.style.cursor = 'pointer';
        listItem.dataset.uuid = convo.uuid;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = convo.name || 'Untitled Conversation';
        nameSpan.style.fontWeight = '600';

        const dateSpan = document.createElement('span');
        try {
          const date = new Date(convo.created_at);
          // Using MessageRenderer's temporary formatter - ideally import/centralize
          dateSpan.textContent =
            new ClaudeMessageRenderer(null).formatTimestamp(date) +
            ' ' +
            date.toLocaleDateString();
        } catch (e) {
          dateSpan.textContent = convo.created_at || 'Invalid Date';
        }
        dateSpan.style.fontSize = '0.85rem';
        dateSpan.style.color = 'var(--muted-text-color)';
        dateSpan.style.marginLeft = '1rem';
        dateSpan.style.float = 'right'; // Align date to the right

        listItem.appendChild(nameSpan);
        listItem.appendChild(dateSpan);

        listItem.onclick = () => this.selectConversation(convo.uuid);
        listItem.onmouseover = () =>
          (listItem.style.backgroundColor = 'var(--user-message-bg)'); // Simple hover effect
        listItem.onmouseout = () =>
          (listItem.style.backgroundColor = 'transparent');

        listElement.appendChild(listItem);
      });
    }

    listContainer.appendChild(listElement);

    // Hide Back button if it exists
    this.toggleBackButton(false);
  }

  /**
   * Filters the conversation list based on search term
   * @param {string} searchTerm
   * @returns {Array} Filtered array of conversations
   */
  filterConversations(searchTerm) {
    const lowerCaseSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';
    if (!lowerCaseSearchTerm) {
      return this.allConversations;
    }
    return this.allConversations.filter(
      (convo) =>
        (convo.name &&
          convo.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (convo.uuid && convo.uuid.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }

  /**
   * Rerenders the list view based on the current search term
   * @param {string} searchTerm
   */
  filterAndRenderList(searchTerm) {
    // Find list container and regenerate items
    const listContainer = document.getElementById(
      'conversation-list-container'
    );
    if (!listContainer) return; // Should not happen if view is correct
    listContainer.innerHTML = ''; // Clear list
    const listElement = document.createElement('ul');
    listElement.style.listStyle = 'none';
    listElement.style.padding = '0';
    listElement.style.margin = '0';

    const conversationsToRender = this.filterConversations(searchTerm);

    if (conversationsToRender.length === 0) {
      listElement.innerHTML =
        '<p style="text-align: center; color: var(--muted-text-color);">No conversations found matching "' +
        searchTerm +
        '".</p>';
    } else {
      // (Duplicate code from renderListView - refactor opportunity)
      conversationsToRender.forEach((convo) => {
        const listItem = document.createElement('li');
        listItem.style.padding = '0.75rem 0.5rem';
        listItem.style.borderBottom = '1px solid var(--border-color)';
        listItem.style.cursor = 'pointer';
        listItem.dataset.uuid = convo.uuid;

        const nameSpan = document.createElement('span');
        nameSpan.textContent = convo.name || 'Untitled Conversation';
        nameSpan.style.fontWeight = '600';

        const dateSpan = document.createElement('span');
        try {
          const date = new Date(convo.created_at);
          dateSpan.textContent =
            new ClaudeMessageRenderer(null).formatTimestamp(date) +
            ' ' +
            date.toLocaleDateString();
        } catch (e) {
          dateSpan.textContent = convo.created_at || 'Invalid Date';
        }
        dateSpan.style.fontSize = '0.85rem';
        dateSpan.style.color = 'var(--muted-text-color)';
        dateSpan.style.marginLeft = '1rem';
        dateSpan.style.float = 'right';

        listItem.appendChild(nameSpan);
        listItem.appendChild(dateSpan);

        listItem.onclick = () => this.selectConversation(convo.uuid);
        listItem.onmouseover = () =>
          (listItem.style.backgroundColor = 'var(--user-message-bg)');
        listItem.onmouseout = () =>
          (listItem.style.backgroundColor = 'transparent');

        listElement.appendChild(listItem);
      });
    }
    listContainer.appendChild(listElement);
  }

  /**
   * Selects and displays a specific conversation
   * @param {string} uuid - UUID of the conversation to display
   */
  selectConversation(uuid) {
    const conversation = this.allConversations.find(
      (convo) => convo.uuid === uuid
    );
    if (!conversation) {
      this.showError('Error: Could not find conversation with UUID: ' + uuid);
      return;
    }

    this.selectedConversationUUID = uuid;
    this.currentView = 'conversation';

    this.clearMessageContainer(); // Clear list view elements
    this.hideSearch(); // Hide search bar

    // Update header
    this.updateConversationMetadata(conversation);

    // Render the selected conversation messages/artifacts
    this.messageRenderer.parseAndRenderResponse(conversation);

    // Show Back button
    this.toggleBackButton(true);
  }

  /**
   * Clear current view or all data
   */
  clear() {
    if (this.currentView === 'conversation') {
      // Go back to list view
      this.selectedConversationUUID = null;
      this.currentView = 'list';
      this.renderListView();
      this.resetHeader();
    } else if (this.currentView === 'list') {
      // Clear everything
      this.allConversations = [];
      this.selectedConversationUUID = null;
      this.currentView = 'empty';
      this.clearMessageContainer();
      this.hideSearch();
      this.toggleBackButton(false);
      this.resetHeader();
    } else {
      // Already empty, do nothing
    }
  }

  /**
   * Deprecated/Internal: Use selectConversation instead for external calls.
   * Handles rendering of a single conversation object.
   * @param {string|object} response - JSON string or object representing the Claude response
   */
  renderResponse(response) {
    // This should only be called internally now by selectConversation
    // or potentially if loading a single-conversation file (handle legacy?)
    console.warn(
      'renderResponse called directly. Use selectConversation for Mark-2 flow.'
    );
    try {
      const conversationData =
        typeof response === 'string' ? JSON.parse(response) : response;

      // Update header if it's a full conversation object
      if (conversationData.uuid) {
        this.updateConversationMetadata(conversationData);
      }

      // Render the response using the message renderer
      this.messageRenderer.parseAndRenderResponse(conversationData);
    } catch (error) {
      console.error('Error rendering single response:', error);
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
    // Ensure it doesn't stack infinitely
    const existingError = this.container.querySelector('.error-message');
    if (existingError) existingError.remove();
    // Prepend error message for visibility?
    this.container.prepend(errorElement);
  }

  /**
   * Show a loading indicator - ADDED BACK
   */
  showLoading() {
    // Remove any existing loading indicator
    this.hideLoading();

    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading';
    loadingElement.id = 'loading-indicator'; // Add ID for easier removal

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    loadingElement.appendChild(spinner);

    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = 'Loading conversation...';
    loadingText.style.marginLeft = '10px';
    loadingElement.appendChild(loadingText);

    // Prepend to container? Or specific location?
    this.container.prepend(loadingElement);
  }

  /**
   * Hide the loading indicator - ADDED BACK
   */
  hideLoading() {
    const loadingElement = document.getElementById('loading-indicator');
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.parentNode.removeChild(loadingElement);
    }
  }

  /**
   * Set a theme for the UI - ADDED BACK
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  setTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }

  // --- Helper Methods ---

  clearMessageContainer() {
    // Clear specific list container if it exists
    const listContainer = document.getElementById(
      'conversation-list-container'
    );
    if (listContainer) listContainer.remove();
    // Clear main message container content
    this.container.innerHTML = '';
  }

  resetHeader() {
    const titleElement = document.querySelector('.claude-header h1');
    if (titleElement) titleElement.textContent = 'Claude UI';
    const infoContainer = document.querySelector('.conversation-info');
    if (infoContainer) infoContainer.style.display = 'none';
    const metadataContainer = document.querySelector('.conversation-metadata');
    if (metadataContainer) metadataContainer.innerHTML = '';
  }

  hideSearch() {
    const searchInput = document.getElementById('conversation-search-input');
    if (searchInput) searchInput.style.display = 'none';
  }

  toggleBackButton(show) {
    let backButton = document.getElementById('back-to-list-button');
    if (!backButton) {
      // Create if it doesn't exist (place in controls area)
      const controls = document.querySelector('.test-controls');
      if (!controls) return; // Can't add button if controls area doesn't exist
      backButton = document.createElement('button');
      backButton.id = 'back-to-list-button';
      backButton.textContent = '‹ Back to List';
      // Style similarly to other control buttons
      backButton.style.backgroundColor = 'var(--secondary-button)';
      backButton.onclick = () => this.clear(); // Clear action goes back to list from conversation view
      controls.insertBefore(backButton, controls.firstChild); // Add at the beginning
    }
    backButton.style.display = show ? 'inline-block' : 'none';
  }

  getOrCreateElement(id, tagName, parent) {
    let element = document.getElementById(id);
    if (!element) {
      element = document.createElement(tagName);
      element.id = id;
      // Prepend to parent to place it before the message container usually
      if (parent.firstChild) {
        parent.insertBefore(element, parent.firstChild);
      } else {
        parent.appendChild(element);
      }
    }
    return element;
  }

  // ... (keep showError, showLoading, hideLoading, setTheme, loadFromFile is now primarily in main.js) ...

  // Removed checkDependencies method
}
