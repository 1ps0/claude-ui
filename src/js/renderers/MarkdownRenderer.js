import { marked } from 'marked'; // Assuming named export
import Prism from 'prismjs';
// Import ArtifactFactory for language detection - Check for circular dependency potential
import ArtifactRendererFactory from '../ArtifactFactory.js';

/**
 * Claude UI Elements
 * MarkdownRenderer.js - Renderer for Markdown artifacts
 * Version 3: Debugging Markdown Rendering
 */

export default class MarkdownArtifactRenderer {
  // Export class
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

    // *** Add Debug Log: Check marked object ***
    console.log('[Debug] MarkdownRenderer: marked library object:', typeof marked !== 'undefined' ? marked : 'NOT FOUND');

    // Render markdown using imported marked library
    if (marked) {
      try {
        // *** Add Debug Log: Attempting parse ***
        console.log('[Debug] MarkdownRenderer: Attempting marked.parse()');
        this.element.innerHTML = marked.parse(content);
        // *** Add Debug Log: Parse successful ***
        console.log('[Debug] MarkdownRenderer: marked.parse() successful');

        // Process any code blocks inside the markdown for syntax highlighting
        this.highlightCodeBlocks();
      } catch (error) {
        // *** Add Debug Log: Parse failed ***
        console.error('[Debug] MarkdownRenderer: Error during marked.parse():', error);
        this.element.textContent = content; // Fallback to raw text
      }
    } else {
      // *** Add Debug Log: marked not found ***
      console.warn('[Debug] MarkdownRenderer: Marked library not found. Displaying raw content.');
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

    // Apply syntax highlighting using imported Prism
    if (Prism && codeBlocks.length > 0) {
      codeBlocks.forEach((codeBlock) => {
        // Get language from class (language-xxx)
        const langClass = Array.from(codeBlock.classList).find((cls) =>
          cls.startsWith('language-')
        );

        // If no language class is found, try to detect the language
        if (!langClass) {
          const language = ArtifactRendererFactory.detectLanguage(
            codeBlock.textContent
          );
          codeBlock.classList.add('language-' + language);
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
    links.forEach((link) => {
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
    images.forEach((image) => {
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
    if (marked) {
      // marked.setOptions might work differently when imported
      // Check marked documentation for ES module usage
      try {
        marked.setOptions(options);
      } catch (e) {
        console.warn('Could not set marked options:', e);
      }
    }
  }
}
