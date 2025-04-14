/**
 * Claude UI Elements
 * MarkdownRenderer.js - Renderer for Markdown artifacts
 */

class MarkdownArtifactRenderer {
  /**
   * Create a new Markdown artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add('markdown-content');
  }
  
  /**
   * Render Markdown content
   * @param {string} content - Markdown content to render
   */
  render(content) {
    // Remove any existing content
    this.element.innerHTML = '';
    
    // Render markdown if a library like marked.js is available
    if (window.marked) {
      try {
        this.element.innerHTML = marked.parse(content);
        
        // Process any code blocks inside the markdown for syntax highlighting
        this.highlightCodeBlocks();
      } catch (error) {
        console.error('Error rendering markdown:', error);
        this.element.textContent = content;
      }
    } else {
      // Fallback to simple text display if marked is not available
      console.warn('Marked.js not loaded. Displaying raw content instead.');
      this.element.textContent = content;
    }
    
    // Add event listeners for interactive elements
    this.addEventListeners();
  }
  
  /**
   * Highlight code blocks within the rendered markdown
   */
  highlightCodeBlocks() {
    // Find all code blocks
    const codeBlocks = this.element.querySelectorAll('pre code');
    
    // Apply syntax highlighting if Prism is available
    if (window.Prism && codeBlocks.length > 0) {
      codeBlocks.forEach(codeBlock => {
        // Get language from class (language-xxx)
        const langClass = Array.from(codeBlock.classList)
          .find(cls => cls.startsWith('language-'));
        
        // If no language class is found, try to detect the language
        if (!langClass) {
          const language = ArtifactRendererFactory.detectLanguage(codeBlock.textContent);
          codeBlock.classList.add(`language-${language}`);
        }
        
        // Apply highlighting
        try {
          Prism.highlightElement(codeBlock);
        } catch (error) {
          console.error('Error highlighting code block:', error);
        }
      });
    }
  }
  
  /**
   * Add event listeners to elements in the rendered markdown
   */
  addEventListeners() {
    // Add click handlers for links to open in new tab
    const links = this.element.querySelectorAll('a');
    links.forEach(link => {
      // Skip links that already have event listeners
      if (link.getAttribute('data-event-bound')) {
        return;
      }
      
      // Add target="_blank" for external links
      if (link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
      
      link.setAttribute('data-event-bound', 'true');
    });
    
    // Add expandable behavior for images
    const images = this.element.querySelectorAll('img');
    images.forEach(image => {
      // Skip images that already have event listeners
      if (image.getAttribute('data-event-bound')) {
        return;
      }
      
      image.addEventListener('click', () => {
        image.classList.toggle('expanded');
      });
      
      image.setAttribute('data-event-bound', 'true');
    });
  }
  
  /**
   * Set options for markdown rendering
   * @param {object} options - Rendering options
   */
  setOptions(options) {
    if (window.marked) {
      marked.setOptions(options);
    }
  }
}
