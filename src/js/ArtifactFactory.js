// Import the specific renderer classes
import CodeArtifactRenderer from './renderers/CodeRenderer.js';
import MarkdownArtifactRenderer from './renderers/MarkdownRenderer.js';
import HtmlArtifactRenderer from './renderers/HtmlRenderer.js';
import SvgArtifactRenderer from './renderers/SvgRenderer.js';
import MermaidArtifactRenderer from './renderers/MermaidRenderer.js';
import ReactArtifactRenderer from './renderers/ReactRenderer.js';

/**
 * Claude UI Elements
 * ArtifactFactory.js - Factory for creating artifact renderers
 * Version 2: Refactored for Vite and ES Modules
 */

export default class ArtifactRendererFactory { // Export the class
  /**
   * Create a renderer for a specific artifact type
   * @param {string} artifactType - MIME type of the artifact
   * @param {HTMLElement} element - Container element for the artifact
   * @param {string} [options] - Additional options (e.g., language for code)
   * @returns {object} Appropriate renderer for the artifact type
   */
  static createRenderer(artifactType, element, options) {
    switch (artifactType) {
      case 'application/vnd.ant.code':
        return new CodeArtifactRenderer(element, options);
      
      case 'text/markdown':
        return new MarkdownArtifactRenderer(element);
      
      case 'text/html':
        return new HtmlArtifactRenderer(element);
      
      case 'image/svg+xml':
        return new SvgArtifactRenderer(element);
      
      case 'application/vnd.ant.mermaid':
        return new MermaidArtifactRenderer(element);
      
      case 'application/vnd.ant.react':
        return new ReactArtifactRenderer(element);
      
      default:
        // Fallback to plain text renderer
        return {
          render: (content) => {
            element.textContent = content;
          }
        };
    }
  }
  
  /**
   * Detect the likely artifact type based on content
   * @param {string} content - Content to analyze
   * @returns {string} Best guess at the artifact type
   */
  static detectArtifactType(content) {
    // Check for HTML
    if (content.trim().startsWith('<') && 
        (content.includes('</html>') || content.includes('<div') || content.includes('<p'))) {
      return 'text/html';
    }
    
    // Check for SVG
    if (content.includes('<svg') && content.includes('</svg>')) {
      return 'image/svg+xml';
    }
    
    // Check for Mermaid
    if (content.includes('graph ') || content.includes('sequenceDiagram') || 
        content.includes('gantt') || content.includes('classDiagram')) {
      return 'application/vnd.ant.mermaid';
    }
    
    // Check for React components
    if ((content.includes('function Component') || content.includes('const Component =') || 
         content.includes('class Component')) && 
        (content.includes('return (') || content.includes('render('))) {
      return 'application/vnd.ant.react';
    }
    
    // Check for Markdown
    if (content.includes('# ') || content.includes('## ') || 
        content.includes('- ') || content.includes('```')) {
      return 'text/markdown';
    }
    
    // Default to code if we can't determine
    return 'application/vnd.ant.code';
  }
  
  /**
   * Helper method to detect the programming language of code
   * @param {string} code - Code to analyze
   * @returns {string} Best guess at the programming language
   */
  static detectLanguage(code) {
    // Simple language detection based on syntax patterns
    if (code.includes('function') && code.includes('{') && 
        (code.includes('const ') || code.includes('let '))) {
      return 'javascript';
    }
    
    if (code.includes('import ') && code.includes('from ') && 
        (code.includes('const ') || code.includes('let '))) {
      return 'javascript';
    }
    
    if (code.includes('def ') && code.includes(':') && 
        (code.includes('    ') || code.includes('print('))) {
      return 'python';
    }
    
    if (code.includes('public class ') || code.includes('private ') || 
        (code.includes('void ') && code.includes('{'))) {
      return 'java';
    }
    
    if (code.includes('<html') || code.includes('<div') || code.includes('<p')) {
      return 'html';
    }
    
    if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
      return 'html';
    }
    
    if (code.includes('$') && code.includes('->') && code.includes('<?php')) {
      return 'php';
    }
    
    // Default to 'javascript' if we can't determine
    return 'javascript';
  }
}
