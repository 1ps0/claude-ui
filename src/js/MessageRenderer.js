import ArtifactRendererFactory from './ArtifactFactory.js';
import { marked } from 'marked'; // Make sure marked is imported
// Potentially import formatTimestamp if moved to a utility file or defined here
// import { formatTimestamp } from './utils.js';

/**
 * Claude UI Elements
 * MessageRenderer.js - Handles rendering of messages and artifacts
 * Version 7: Inline Tag Parsing (<antThinking>, <antArtifact>)
 */

export default class ClaudeMessageRenderer {
  // Export the class
  /**
   * Create a new message renderer
   * @param {HTMLElement} container - Container element for messages
   */
  constructor(container) {
    this.container = container;
  }

  /**
   * Parse and render a Claude response
   * @param {object|array} responseData - Claude response data (can be message array, single message, or full conversation object)
   */
  parseAndRenderResponse(responseData) {
    // *** Add Debug Log ***
    console.log(
      '[Debug] MessageRenderer received in parseAndRenderResponse:',
      responseData
    );
    try {
      let messagesToRender = null;

      // ** Mark-2 Check: If passed a full conversation object, use its *chat_messages* array **
      if (
        typeof responseData === 'object' &&
        !Array.isArray(responseData) &&
        responseData !== null &&
        Array.isArray(responseData.chat_messages)
      ) {
        messagesToRender = responseData.chat_messages; // Use chat_messages
      }
      // Original Checks (handle direct message array or single message)
      else if (Array.isArray(responseData)) {
        messagesToRender = responseData; // It's already the array of messages
      } else if (responseData && responseData.role) {
        messagesToRender = [responseData]; // Wrap single message in an array
      }
      // Optional: Check for older format where root object *was* the message list holder (less likely needed now)
      // else if (typeof responseData === 'object' && responseData !== null && Array.isArray(responseData.messages)) {
      //   messagesToRender = responseData.messages;
      // }

      // Check if we successfully found messages to render
      if (!messagesToRender) {
        // Check if it's a single message object without messages array (older format?)
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          responseData.role &&
          responseData.content
        ) {
          messagesToRender = [responseData]; // Treat as single message
        } else {
          throw new Error(
            'Invalid response format: Could not find messages array or recognizable message structure.'
          );
        }
      }

      // Render the messages
      messagesToRender.forEach((message) => this.renderMessage(message));

      // Scroll to bottom after rendering
      this.scrollToBottom();
    } catch (error) {
      console.error('Error parsing response:', error);
      // Display the raw input if possible during error
      let content =
        typeof responseData === 'string'
          ? responseData
          : JSON.stringify(responseData, null, 2);
      this.renderErrorMessage(
        'Failed to parse response format. Error: ' +
          error.message +
          '\n\nReceived:\n' +
          content.substring(0, 500) +
          (content.length > 500 ? '...' : '')
      );
    }
  }

  /**
   * Render a single message
   * @param {object} message - Message data to render (chat_messages structure)
   */
  renderMessage(message) {
    // Create message element
    const messageElement = document.createElement('div');
    const senderClass = message.sender === 'human' ? 'user-message' : 'claude-message';
    messageElement.className = senderClass;

    // Add message header if needed
    if (message.sender && message.sender !== 'human') {
      const headerElement = document.createElement('div');
      headerElement.className = 'message-header';
      headerElement.textContent = message.sender.charAt(0).toUpperCase() + message.sender.slice(1);
      messageElement.appendChild(headerElement);
    }

    // Create container for potentially mixed content (text, thinking)
    const contentContainer = document.createElement('div');
    contentContainer.className = 'message-text'; // Reuse class or create new?

    let contentRendered = false;

    // Handle content array
    if (Array.isArray(message.content) && message.content.length > 0) {
      message.content.forEach(part => {
        if (part.type === 'text' && typeof part.text === 'string' && part.text.trim() !== '') {
          // *** Call new parser for each text part ***
          this.parseAndRenderContentString(part.text, contentContainer, messageElement);
          contentRendered = true;
        }
        // Handle other potential part types here if necessary
      });
    } 
    // Fallback to top-level text property
    else if (typeof message.text === 'string' && message.text.trim() !== '') {
       // *** Call new parser for the top-level text ***
       this.parseAndRenderContentString(message.text, contentContainer, messageElement);
       contentRendered = true;
    }

    // Only append the content container if something was actually rendered into it
    if (contentRendered) {
        messageElement.appendChild(contentContainer);
    }

    // *** REMOVED artifact rendering based on message.attachments ***
    // Artifacts will now be rendered ONLY if found via <antArtifact> tags during parseAndRenderContentString
    /* 
    if (message.attachments && Array.isArray(message.attachments)) {
      message.attachments.forEach(attachment => {
        this.renderArtifact(messageElement, attachment);
      });
    }
    */

    // Add timestamp using created_at
    if (message.created_at) { 
      const metadataElement = document.createElement('div');
      metadataElement.className = 'message-metadata';
      const timestamp = new Date(message.created_at);
      metadataElement.textContent = this.formatTimestamp(timestamp);
      messageElement.appendChild(metadataElement);
    }

    // Append message to container
    this.container.appendChild(messageElement);
  }

  /**
   * Parses a string containing mixed text and custom tags (<antThinking>, <antArtifact>)
   * Appends text nodes, styled thinking blocks, and triggers artifact rendering.
   * @param {string} rawContentString - The raw string content from the message.
   * @param {HTMLElement} textParentElement - The DOM element to append text/thinking nodes to.
   * @param {HTMLElement} messageElement - The top-level message element to append artifacts to.
   */
  parseAndRenderContentString(rawContentString, textParentElement, messageElement) {
    console.log("[Debug] parseAndRenderContentString called with:", rawContentString.substring(0,100)+"...");

    try {
        if (marked) {
            // Parse the entire string as Markdown first
            let htmlContent = marked.parse(rawContentString);
            
            // --- Phase 2: Handle Custom Tags via Regex on HTML String --- 
            // NOTE: This assumes tags don't contain complex nested HTML from markdown.
            // It looks for HTML-escaped versions of the tags.

            // Handle <antThinking>...</antThinking>
            htmlContent = htmlContent.replace(/&lt;antThinking&gt;(.*?)&lt;\/antThinking&gt;/gs, 
                (match, innerContent) => `<span class=\"thinking-content\">${innerContent}</span>`);

            // Handle <pointer1: ...>
            htmlContent = htmlContent.replace(/&lt;pointer1:\\s*(.*?)&gt;/g, 
                (match, innerContent) => `<span class=\"pointer-content pointer-1\">${innerContent.trim()}</span>`);

            // Handle <pointer2: ...>
            htmlContent = htmlContent.replace(/&lt;pointer2:\\s*(.*?)&gt;/g, 
                (match, innerContent) => `<span class=\"pointer-content pointer-2\">${innerContent.trim()}</span>`);

            // TODO: Handle <antArtifact> - requires different logic (extract, remove, call renderArtifact)

            // Set the final processed HTML
            textParentElement.innerHTML = htmlContent; 

            // After setting innerHTML, re-apply Prism highlighting to any code blocks within
            this.highlightCodeBlocksInElement(textParentElement);

        } else {
            console.warn('[Debug] Marked library not available for parseAndRenderContentString. Rendering raw text.');
            textParentElement.appendChild(document.createTextNode(rawContentString));
        }
    } catch (error) {
        console.error('[Debug] Error parsing markdown or processing tags:', error);
        textParentElement.appendChild(document.createTextNode(rawContentString)); // Fallback on error
    }
  }

  /**
   * Helper to apply Prism highlighting to code blocks within a given element.
   * (Extracted from MarkdownRenderer for reuse)
   */
  highlightCodeBlocksInElement(element) {
    const codeBlocks = element.querySelectorAll('pre code');
    if (typeof Prism !== 'undefined' && Prism && codeBlocks.length > 0) {
      codeBlocks.forEach(codeBlock => {
        const langClass = Array.from(codeBlock.classList).find(cls => cls.startsWith('language-'));
        if (!langClass) {
          // Use the factory's language detection
          const language = ArtifactRendererFactory.detectLanguage(codeBlock.textContent) || 'plaintext'; 
          codeBlock.classList.add('language-' + language);
        }
        try {
          Prism.highlightElement(codeBlock);
        } catch (error) {
          console.error('Error highlighting code block within markdown:', error);
        }
      });
    }
  }

  /**
   * Render an artifact within a message
   * @param {HTMLElement} parentElement - Parent element to append the artifact to
   * @param {object} artifact - Artifact data object (potentially varied schema)
   */
  renderArtifact(parentElement, artifact) {
    // *** Adapt to schema variations ***
    const artifactType = artifact.type || artifact.file_type;
    const artifactContent = artifact.content !== undefined ? artifact.content : artifact.extracted_content;
    // Use filename as title fallback if title is missing
    const artifactTitle = artifact.title || artifact.file_name;

    // *** Add Debug Log: Check adapted artifact type and presence of content ***
    console.log(`[Debug] MessageRenderer: Processing adapted artifact type: ${artifactType}`, artifact);
    if (artifactContent === undefined) {
      console.warn(`[Debug] MessageRenderer: Artifact content (content/extracted_content) not found for type ${artifactType}`, artifact);
      // Optionally render an error or skip rendering this artifact
      // return; // Skip rendering if content is missing
    }

    // Create artifact container
    const artifactContainer = document.createElement('div');
    artifactContainer.className = 'artifact-container';

    // Create artifact header
    const header = document.createElement('div');
    header.className = 'artifact-header';

    // Create artifact title (using adapted title)
    const title = document.createElement('div');
    title.className = 'artifact-title';
    title.textContent = artifactTitle || this.getArtifactTypeLabel(artifactType);
    header.appendChild(title);

    // Create artifact type badge (using adapted type)
    const typeBadge = document.createElement('div');
    typeBadge.className = 'artifact-type';
    typeBadge.textContent = this.getArtifactTypeLabel(artifactType);
    header.appendChild(typeBadge);

    // Create artifact actions container
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'artifact-actions';

    // Add copy button for code artifacts (check adapted type)
    // Also check if content exists before adding button
    if (artifactType === 'application/vnd.ant.code' && artifactContent !== undefined) {
      const copyButton = document.createElement('button');
      copyButton.className = 'copy-button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => {
        this.copyArtifactContent(artifactContent); // Copy adapted content
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
      expandButton.textContent = content.classList.contains('expanded')
        ? 'Collapse'
        : 'Expand';
    });
    actionsContainer.appendChild(expandButton);

    header.appendChild(actionsContainer);

    // Create artifact content container
    const content = document.createElement('div');
    content.className = 'artifact-content';

    // Add specific class based on artifact type (using adapted type)
    if (artifactType) { // Check if type exists before trying to split/replace
        const typeClass = artifactType.split('/').pop().replace(/\./g, '-');
        content.classList.add(typeClass + '-container');
    } else {
        content.classList.add('unknown-type-container');
    }

    // Determine the language for code artifacts (using adapted type)
    let language = 'javascript'; // Default language
    if (artifactType === 'application/vnd.ant.code' && artifact.language) {
      language = artifact.language;
    }

    // Create and use appropriate renderer (using adapted type)
    const renderer = ArtifactRendererFactory.createRenderer(
      artifactType,
      content,
      language
    );
    
    // *** Add Debug Log: Check renderer created and content ***
    console.log(`[Debug] MessageRenderer: Renderer created for type ${artifactType}:`, renderer);
    console.log(`[Debug] MessageRenderer: Content for renderer:`, artifactContent ? String(artifactContent).substring(0, 100) + '...' : '(undefined)');

    // Ensure renderer has a render method before calling
    if (renderer && typeof renderer.render === 'function') {
        // Pass adapted content
        renderer.render(artifactContent || '');
    } else {
        console.error(`[Debug] MessageRenderer: No valid renderer or render method found for type ${artifactType}`, renderer);
        // Fallback to plain text display in case of renderer failure
        content.textContent = String(artifactContent !== undefined ? artifactContent : '(Error: Could not render artifact content)');
    }

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
    navigator.clipboard.writeText(content).catch((err) => {
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
      'application/vnd.ant.react': 'React',
      // Add common types if needed, though generalization handles them
      'application/json': 'JSON',
      'text/plain': 'Text',
      'text/css': 'CSS',
      'text/javascript': 'JavaScript',
      'application/javascript': 'JavaScript',
      'application/x-python': 'Python',
      'application/x-godot-scene': 'Godot Scene',
    };

    if (typeMap[type]) {
      return typeMap[type];
    }

    // Generalization for unknown types
    if (typeof type === 'string' && type.includes('/')) {
      try {
        let mainType = type.split('/')[1]; // Get text after slash
        // Handle suffixes like +xml, +json
        mainType = mainType.split('+')[0]; 
        // Replace common separators, capitalize words
        const parts = mainType.split(/[._-]/);
        const label = parts.map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
        // Add prefix for context if useful (e.g., Image Png)
        const prefix = type.startsWith('image/') ? 'Image ' : ''; 
        return prefix + label || 'Unknown Type'; // Return generated label or fallback
      } catch (e) {
          // Fallback if string manipulation fails
          console.warn('Could not generate label for type:', type, e);
          return 'Artifact'; 
      }
    }
    
    // Ultimate fallback
    return type ? String(type) : 'Artifact'; // Return original type if string, else 'Artifact'
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
      hour12: true,
    }).format(date);
  }
}
