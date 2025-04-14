/**
 * Claude UI Elements
 * main.js - Application initialization and event handling
 * Version 4: Refactored for Vite and ES Modules
 */

import ClaudeUI from './ClaudeUI.js';
// Import CSS files
import '../css/main.css';
import '../css/message.css';
import '../css/artifacts.css';
// Import a PrismJS theme (adjust path if necessary)
import 'prismjs/themes/prism.css';
// Import necessary PrismJS components (if not autoloaded or handled differently)
import Prism from 'prismjs';
// You might need to explicitly import languages used, e.g.:
// import 'prismjs/components/prism-javascript';
// import 'prismjs/components/prism-python';

// Import other dependencies if needed by helper functions
import mermaid from 'mermaid';
import { marked } from 'marked'; // Use named import if that's how marked exports

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Claude UI with the container element
  const claudeUI = new ClaudeUI('message-container');

  // Remove event listener setup for the test button
  /*
  const loadTestButton = document.getElementById('load-test-button');
  if (loadTestButton) {
    loadTestButton.addEventListener('click', () => {
      // Load sample response from the test data
      if (window.sampleResponses && window.sampleResponses.length > 0) {
        // Clear existing content first
        claudeUI.clear();
        
        // Use a random sample response
        const randomIndex = Math.floor(Math.random() * window.sampleResponses.length);
        const sampleResponse = window.sampleResponses[randomIndex];
        
        // Render the sample response
        claudeUI.renderResponse(sampleResponse);
      } else {
        console.error('Sample responses not found');
        claudeUI.showError('Sample responses not found');
      }
    });
  }
  */

  // Clear button functionality
  const clearButton = document.getElementById('clear-button');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      claudeUI.clear();
    });
  }

  // File input for loading JSON conversations
  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        loadJsonFromFile(file, claudeUI);
      }
    });
  }

  // Load file button functionality
  const loadFileButton = document.getElementById('load-file-button');
  if (loadFileButton) {
    loadFileButton.addEventListener('click', () => {
      // Trigger the hidden file input
      fileInput.click();
    });
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      toggleDarkMode();
    });

    // Initialize theme based on saved preference or system preference
    initializeTheme();
  }

  // Initialize Mermaid library if available
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode() ? 'dark' : 'neutral',
      securityLevel: 'strict',
    });
  }

  // Set up marked.js options if available
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      sanitize: true,
    });
  }

  // Uncomment the following line to enable this behavior
  // claudeUI.renderResponse(window.sampleResponses[0]);

  // Expose UI instance to window for debugging (optional)
  window.claudeUI = claudeUI;

  console.log('Claude UI Elements initialized successfully via Vite');
});

/**
 * Load JSON conversation from a file
 * @param {File} file - File object to load
 * @param {ClaudeUI} claudeUI - Claude UI instance to render the response
 */
function loadJsonFromFile(file, claudeUI) {
  if (!file) {
    return;
  }

  console.log('[Debug] claudeUI instance in loadJsonFromFile:', claudeUI);
  console.log(
    '[Debug] typeof claudeUI.showLoading:',
    typeof claudeUI.showLoading
  );

  claudeUI.showLoading();

  // Check file type
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    claudeUI.hideLoading();
    claudeUI.showError('Please select a JSON file');
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const jsonData = JSON.parse(event.target.result);
      claudeUI.loadConversationData(jsonData);
    } catch (error) {
      console.error('Error parsing JSON file:', error);
      claudeUI.hideLoading();
      claudeUI.showError('Failed to parse JSON file: ' + error.message);
    }
  };

  reader.onerror = () => {
    console.error('Error reading file');
    claudeUI.hideLoading();
    claudeUI.showError('Error reading file');
  };

  reader.readAsText(file);
}

/**
 * Helper function for loading responses from external JSON files via URL
 * @param {string} url - URL of the JSON file to load
 * @param {function} callback - Callback function to process the response
 */
function loadResponseFromUrl(url, callback) {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('HTTP error! Status: ' + response.status);
      }
      return response.json();
    })
    .then((data) => {
      callback(data);
    })
    .catch((error) => {
      console.error('Error loading response:', error);
    });
}

/**
 * Helper function to detect mobile devices
 * @returns {boolean} True if the user is on a mobile device
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Helper function to format timestamps
 * @param {Date} date - Date object to format
 * @returns {string} Formatted timestamp string
 */
function formatTimestamp(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Check if dark mode is currently active
 * @returns {boolean} True if dark mode is active
 */
function isDarkMode() {
  return document.body.classList.contains('dark-theme');
}

/**
 * Toggle dark mode on/off
 */
function toggleDarkMode() {
  const isDark = isDarkMode();

  // Toggle dark mode class
  document.body.classList.toggle('dark-theme', !isDark);

  // Save preference to localStorage
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');

  // Update Mermaid theme if available
  if (window.mermaid) {
    mermaid.initialize({
      theme: !isDark ? 'dark' : 'neutral',
    });

    // Re-render any existing Mermaid diagrams
    const mermaidContainers = document.querySelectorAll('.mermaid');
    if (mermaidContainers.length > 0) {
      mermaidContainers.forEach((container) => {
        try {
          mermaid.init(undefined, container);
        } catch (e) {
          // Ignore errors during re-rendering
        }
      });
    }
  }

  // Update Prism theme if needed
  updateCodeHighlighting(!isDark);
}

/**
 * Initialize theme based on saved preference or system preference
 */
function initializeTheme() {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    // Apply saved theme
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
  } else {
    // Check system preference
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    document.body.classList.toggle('dark-theme', prefersDark);

    // Save the preference
    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
  }

  // Update code highlighting
  updateCodeHighlighting(isDarkMode());
}

/**
 * Update code highlighting based on theme
 * @param {boolean} isDark - Whether dark mode is active
 */
function updateCodeHighlighting(isDark) {
  // This function can be expanded to dynamically switch Prism themes
  // or make other adjustments to code highlighting

  // For now, we rely on CSS overrides in artifacts.css
  console.log(
    'Code highlighting updated for ' + (isDark ? 'dark' : 'light') + ' mode'
  );
}
