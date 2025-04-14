import React from 'react';
import { createRoot } from 'react-dom/client'; // Use modern root API
// Note: We removed Babel Standalone. Handling dynamic code execution is complex.

/**
 * Claude UI Elements
 * ReactRenderer.js - Renderer for React component artifacts
 * Version 3: Refactored for Vite, ES Modules, removed Babel Standalone
 */

export default class ReactArtifactRenderer {
  // Export class
  /**
   * Create a new React artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add('react-container');
    this.root = null; // Store the React root
  }

  /**
   * Render React component content
   * @param {string} content - React component code to render
   */
  render(content) {
    // Clean up previous root if exists
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    // Remove any existing static content
    this.element.innerHTML = '';

    // Create a container div *inside* the main element for React
    const container = document.createElement('div');
    this.element.appendChild(container);

    // Store content for error display
    this.lastContent = content;

    try {
      // !! SECURITY WARNING & COMPLEXITY !!
      // Executing arbitrary code from `content` is dangerous.
      // A production solution needs sandboxing or a safer transformation method.
      // This is a simplified example assuming `content` defines a `Component`.

      // Option 1: Simple eval (Highly Insecure - use only if content is trusted)
      // const Component = eval(this.wrapContentIfNeeded(content));

      // Option 2: Safer Function constructor (Still risky)
      // const componentFactory = new Function('React', `return (${this.wrapContentIfNeeded(content)})`);
      // const Component = componentFactory(React);

      // Option 3: More robust solution needed (e.g., using a web worker with a transpiler like Sucrase, or a dedicated sandboxed execution environment)

      // *** Placeholder: Assume content somehow provides a valid Component ***
      // This part needs a proper implementation based on security requirements
      // For now, let's show an error indicating this limitation.
      console.error(
        'Dynamic React rendering from string needs secure implementation.'
      );
      this.showError(
        'Rendering dynamic React code from string is not securely implemented in this version.'
      );
      return; // Stop execution for this placeholder

      /* // --- Code that would run if Component was safely created --- 
      if (typeof Component !== 'function' && typeof Component !== 'object') { // Class components are functions, functional components can be objects (from HOCs etc)
        throw new Error('Provided content did not resolve to a renderable React component.');
      }

      // Create a root and render the component
      this.root = createRoot(container);
      this.root.render(React.createElement(Component));
      */
    } catch (error) {
      console.error('Error rendering React component:', error);
      this.showError('Failed to render React component: ' + error.message);
      // Clean up potentially failed root
      if (this.root) {
        this.root.unmount();
        this.root = null;
      }
    }
  }

  /**
   * Wrap content in a component definition if needed (Helper for eval/Function)
   * @param {string} content - React component code
   * @returns {string} Code string potentially wrapped
   */
  wrapContentIfNeeded(content) {
    // Basic checks - this might need more sophisticated parsing
    if (content.includes('export default') || content.match(/^class\s/)) {
      // Assumes content is a full component definition
      // Need to extract the actual component part for eval/Function
      // This logic is complex and depends on the expected format of `content`
      console.warn(
        'React content wrapping might be incorrect for complex inputs.'
      );
      // Placeholder: try to return the core part if possible
      return content.replace(/export default /, '');
    }
    if (content.trim().startsWith('<')) {
      // Wrap JSX fragment/element in a functional component
      return `(props) => { return (${content}); }`;
    }
    // Assume it's the body of a functional component
    return `(props) => { ${content} }`;
  }

  /**
   * Display an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    // Clean up existing React root if any
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    this.element.innerHTML = ''; // Clear container

    // Create error elements (similar to before)
    const errorElement = document.createElement('div');
    errorElement.className = 'react-error';
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.padding = '1rem';
    errorElement.style.border = '1px solid var(--error-color)';
    errorElement.style.borderRadius = '0.25rem';
    errorElement.style.backgroundColor = 'var(--error-bg)';
    errorElement.style.marginTop = '0.5rem';
    errorElement.textContent = message;

    const pre = document.createElement('pre');
    pre.style.marginTop = '0.5rem';
    pre.style.padding = '0.5rem';
    pre.style.backgroundColor = 'var(--code-bg)';
    pre.style.borderRadius = '0.25rem';
    pre.style.overflow = 'auto';
    pre.style.fontSize = '0.8rem';

    const code = document.createElement('code');
    code.className = 'language-jsx'; // Assume JSX
    code.textContent = this.lastContent || '';
    pre.appendChild(code);

    this.element.appendChild(errorElement);
    this.element.appendChild(pre);

    // Apply syntax highlighting if Prism is available
    if (typeof Prism !== 'undefined' && Prism) {
      try {
        Prism.highlightElement(code);
      } catch (e) {
        console.error('Prism highlighting failed for error display');
      }
    }
  }

  // Cleanup root when the renderer is destroyed (if applicable)
  destroy() {
    if (this.root) {
      this.root.unmount();
    }
  }
}
