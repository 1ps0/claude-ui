/**
 * Claude UI Elements
 * ReactRenderer.js - Renderer for React component artifacts
 */

class ReactArtifactRenderer {
  /**
   * Create a new React artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add('react-container');
  }
  
  /**
   * Render React component content
   * @param {string} content - React component code to render
   */
  render(content) {
    // Remove any existing content
    this.element.innerHTML = '';
    
    // Create a container for React rendering
    const container = document.createElement('div');
    container.id = `react-container-${Date.now()}`;
    
    // Append container to the DOM
    this.element.appendChild(container);
    
    // Check if React and ReactDOM are available
    if (window.React && window.ReactDOM && window.Babel) {
      try {
        // Create a script element to evaluate the React component
        const script = document.createElement('script');
        script.type = 'text/babel';
        
        // Wrap content in a component definition if needed
        const wrappedContent = this.wrapContentIfNeeded(content);
        
        // Set the script content
        script.textContent = `
          ${wrappedContent}
          
          // Render the component to the container
          ReactDOM.render(
            React.createElement(Component),
            document.getElementById('${container.id}')
          );
        `;
        
        // Append script to the DOM
        document.body.appendChild(script);
        
        // Store the content for later use
        this.lastContent = content;
        
        // Remove script after execution to avoid cluttering the DOM
        // Use a slight delay to ensure Babel has time to process it
        setTimeout(() => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        }, 1000);
      } catch (error) {
        console.error('Error rendering React component:', error);
        this.showError(`Failed to render React component: ${error.message}`);
      }
    } else {
      // Libraries not available
      const missingLibs = [];
      if (!window.React) missingLibs.push('React');
      if (!window.ReactDOM) missingLibs.push('ReactDOM');
      if (!window.Babel) missingLibs.push('Babel');
      
      console.warn(`${missingLibs.join(', ')} not loaded. Displaying raw content instead.`);
      this.showError(`${missingLibs.join(', ')} not loaded. Displaying raw content.`);
    }
  }
  
  /**
   * Wrap content in a component definition if needed
   * @param {string} content - React component code
   * @returns {string} Properly formatted component code
   */
  wrapContentIfNeeded(content) {
    // Check if content is already a component definition
    if (content.includes('function Component') || 
        content.includes('class Component') || 
        content.includes('const Component =')) {
      return content;
    }
    
    // Check if content imports specific React elements
    if (content.includes('import React') || 
        content.includes('import { ') || 
        content.includes('import {')) {
      // Probably a complete component with imports
      // Add a default export if none exists
      if (!content.includes('export default')) {
        return `${content}\n\nconst Component = () => ${content.trim().startsWith('<') ? content : `{ return (${content}); }`};\nexport default Component;`;
      }
      return content;
    }
    
    // Check if content is a JSX fragment or element
    if (content.trim().startsWith('<')) {
      // Wrap in a component definition
      return `const Component = () => {
        return (${content});
      }`;
    }
    
    // Assume it's a component body that returns JSX
    return `const Component = () => {
      ${content}
    }`;
  }
  
  /**
   * Display an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'react-error';
    errorElement.style.color = '#EF4444';
    errorElement.style.padding = '1rem';
    errorElement.style.border = '1px solid #EF4444';
    errorElement.style.borderRadius = '0.25rem';
    errorElement.style.backgroundColor = '#FEF2F2';
    errorElement.style.marginTop = '0.5rem';
    errorElement.textContent = message;
    
    // Create pre element for component code
    const pre = document.createElement('pre');
    pre.style.marginTop = '0.5rem';
    pre.style.padding = '0.5rem';
    pre.style.backgroundColor = '#F1F5F9';
    pre.style.borderRadius = '0.25rem';
    pre.style.overflow = 'auto';
    pre.style.fontSize = '0.8rem';
    
    // Create code element
    const code = document.createElement('code');
    code.className = 'language-jsx';
    code.textContent = this.lastContent || '';
    pre.appendChild(code);
    
    // Clear the container
    this.element.innerHTML = '';
    
    // Append error elements
    this.element.appendChild(errorElement);
    this.element.appendChild(pre);
    
    // Apply syntax highlighting if available
    if (window.Prism) {
      Prism.highlightElement(code);
    }
  }
  
  /**
   * Set props for the React component
   * @param {object} props - Props to pass to the component
   */
  setProps(props) {
    // Store props for re-rendering
    this.props = props;
    
    // Re-render the component if we have content
    if (this.lastContent) {
      // Create a container with a new ID
      const container = document.createElement('div');
      container.id = `react-container-${Date.now()}`;
      
      // Replace the existing container
      this.element.innerHTML = '';
      this.element.appendChild(container);
      
      // Create script for rendering with props
      const script = document.createElement('script');
      script.type = 'text/babel';
      
      // Wrap content and include props
      const wrappedContent = this.wrapContentIfNeeded(this.lastContent);
      const propsString = JSON.stringify(props);
      
      script.textContent = `
        ${wrappedContent}
        
        // Render with props
        ReactDOM.render(
          React.createElement(Component, ${propsString}),
          document.getElementById('${container.id}')
        );
      `;
      
      // Append script and remove after execution
      document.body.appendChild(script);
      setTimeout(() => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      }, 1000);
    }
  }
}
