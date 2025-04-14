/**
 * Claude UI Elements
 * SvgRenderer.js - Renderer for SVG artifacts
 */

class SvgArtifactRenderer {
  /**
   * Create a new SVG artifact renderer
   * @param {HTMLElement} element - Container element for the artifact
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add('svg-container');
  }
  
  /**
   * Render SVG content
   * @param {string} content - SVG content to render
   */
  render(content) {
    // Remove any existing content
    this.element.innerHTML = '';
    
    // Insert SVG content directly
    this.element.innerHTML = content;
    
    // Ensure SVG is responsive and properly formatted
    this.enhanceSVG();
  }
  
  /**
   * Enhance the SVG for better display
   */
  enhanceSVG() {
    // Get the SVG element
    const svg = this.element.querySelector('svg');
    if (!svg) {
      console.warn('No SVG element found in content');
      return;
    }
    
    // Ensure SVG is responsive
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxHeight = '500px';
    
    // Ensure viewBox is set if not already
    if (!svg.getAttribute('viewBox') && 
        svg.getAttribute('width') && 
        svg.getAttribute('height')) {
      const width = svg.getAttribute('width');
      const height = svg.getAttribute('height');
      
      // Convert to numbers and remove any units
      const numericWidth = parseFloat(width);
      const numericHeight = parseFloat(height);
      
      if (!isNaN(numericWidth) && !isNaN(numericHeight)) {
        svg.setAttribute('viewBox', `0 0 ${numericWidth} ${numericHeight}`);
      }
    }
    
    // Remove fixed width and height if present
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    
    // Add title for accessibility if not present
    if (!svg.querySelector('title')) {
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'SVG Visualization';
      
      // Add title as the first child of the SVG
      if (svg.firstChild) {
        svg.insertBefore(title, svg.firstChild);
      } else {
        svg.appendChild(title);
      }
    }
    
    // Make the SVG interactive if it has elements that could be interactive
    this.makeInteractive(svg);
  }
  
  /**
   * Make the SVG interactive with zoom and pan capabilities
   * @param {SVGElement} svg - The SVG element to enhance
   */
  makeInteractive(svg) {
    // Only add interactivity if the SVG has enough elements
    const elements = svg.querySelectorAll('path, rect, circle, ellipse, line, polyline, polygon');
    if (elements.length < 5) {
      return; // Not complex enough to need interactivity
    }
    
    // Set up zoom and pan variables
    let isPanning = false;
    let startPoint = { x: 0, y: 0 };
    let endPoint = { x: 0, y: 0 };
    let scale = 1;
    
    // Get SVG view box values
    let viewBox = svg.viewBox.baseVal;
    
    // Store original viewBox values
    const originalViewBox = {
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width,
      height: viewBox.height
    };
    
    // Add mouse wheel event for zooming
    svg.addEventListener('wheel', (event) => {
      event.preventDefault();
      
      // Determine zoom direction
      const delta = event.deltaY < 0 ? 1.1 : 0.9;
      
      // Limit zoom level
      const newScale = scale * delta;
      if (newScale > 0.2 && newScale < 5) {
        scale = newScale;
        
        // Calculate zoom around mouse position
        const mouseX = event.clientX - svg.getBoundingClientRect().left;
        const mouseY = event.clientY - svg.getBoundingClientRect().top;
        
        // Convert mouse position to SVG coordinates
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = mouseX;
        svgPoint.y = mouseY;
        const svgCoords = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
        
        // Update viewBox
        viewBox.width = originalViewBox.width / scale;
        viewBox.height = originalViewBox.height / scale;
        
        // Adjust viewBox position to zoom around mouse point
        viewBox.x = svgCoords.x - (mouseX / svg.clientWidth) * viewBox.width;
        viewBox.y = svgCoords.y - (mouseY / svg.clientHeight) * viewBox.height;
      }
    });
    
    // Add mouse events for panning
    svg.addEventListener('mousedown', (event) => {
      if (event.button === 0) {
        isPanning = true;
        startPoint = { x: event.clientX, y: event.clientY };
        svg.style.cursor = 'grabbing';
      }
    });
    
    svg.addEventListener('mousemove', (event) => {
      if (isPanning) {
        endPoint = { x: event.clientX, y: event.clientY };
        
        // Calculate distance moved
        const dx = (endPoint.x - startPoint.x) * viewBox.width / svg.clientWidth;
        const dy = (endPoint.y - startPoint.y) * viewBox.height / svg.clientHeight;
        
        // Update viewBox
        viewBox.x -= dx;
        viewBox.y -= dy;
        
        // Update start point
        startPoint = { x: endPoint.x, y: endPoint.y };
      }
    });
    
    svg.addEventListener('mouseup', () => {
      isPanning = false;
      svg.style.cursor = 'grab';
    });
    
    svg.addEventListener('mouseleave', () => {
      isPanning = false;
      svg.style.cursor = 'default';
    });
    
    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset View';
    resetButton.className = 'svg-reset-button';
    resetButton.style.position = 'absolute';
    resetButton.style.top = '5px';
    resetButton.style.right = '5px';
    resetButton.style.zIndex = 100;
    resetButton.style.padding = '4px 8px';
    resetButton.style.fontSize = '12px';
    resetButton.style.backgroundColor = '#7C3AED';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '4px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.opacity = '0.8';
    
    resetButton.addEventListener('click', () => {
      // Reset viewBox to original values
      viewBox.x = originalViewBox.x;
      viewBox.y = originalViewBox.y;
      viewBox.width = originalViewBox.width;
      viewBox.height = originalViewBox.height;
      scale = 1;
    });
    
    // Position the container relatively to place the button
    this.element.style.position = 'relative';
    this.element.appendChild(resetButton);
    
    // Set initial cursor style
    svg.style.cursor = 'grab';
  }
  
  /**
   * Set a background for the SVG for better visibility
   * @param {string} color - Background color
   */
  setBackground(color) {
    const svg = this.element.querySelector('svg');
    if (svg) {
      svg.style.backgroundColor = color;
    }
  }
}
