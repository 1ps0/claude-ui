/**
 * Claude UI Elements
 * main.js - Application initialization and event handling
 */

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Claude UI with the container element
  const claudeUI = new ClaudeUI('message-container');
  
  // Set up event listeners for test buttons
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
  
  // Clear button functionality
  const clearButton = document.getElementById('clear-button');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      claudeUI.clear();
    });
  }
  
  // Initialize Mermaid library if available
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'strict'
    });
  }
  
  // Set up marked.js options if available
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: true,
      sanitize: true
    });
  }
  
  // Optional: Load a default response on startup
  // Uncomment the following line to enable this behavior
  // claudeUI.renderResponse(window.sampleResponses[0]);
  
  // Expose UI instance to window for debugging (optional)
  window.claudeUI = claudeUI;
  
  console.log('Claude UI Elements initialized successfully');
});

/**
 * Helper function for loading responses from external JSON files
 * @param {string} url - URL of the JSON file to load
 * @param {function} callback - Callback function to process the response
 */
function loadResponseFromFile(url, callback) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      callback(data);
    })
    .catch(error => {
      console.error('Error loading response:', error);
    });
}

/**
 * Helper function to detect mobile devices
 * @returns {boolean} True if the user is on a mobile device
 */
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
    hour12: true
  }).format(date);
}
