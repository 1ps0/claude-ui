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
 * Version 3: Generalized type handling
 */

export default class ArtifactRendererFactory {
  // Export the class
  /**
   * Create a renderer for a specific artifact type
   * @param {string} artifactType - MIME type of the artifact
   * @param {HTMLElement} element - Container element for the artifact
   * @param {string} [options] - Additional options (e.g., language for code)
   * @returns {object} Appropriate renderer for the artifact type
   */
  static createRenderer(artifactType, element, options) {
    // Normalize type to lowercase for matching
    const lowerCaseType = typeof artifactType === 'string' ? artifactType.toLowerCase() : '';

    // Specific known types (Ant specific or complex renderers)
    switch (lowerCaseType) {
      case 'application/vnd.ant.code':
        return new CodeArtifactRenderer(element, options || 'plaintext'); // Use options or default
      case 'text/markdown':
        console.log('[Debug] ArtifactRendererFactory: Matched type text/markdown');
        return new MarkdownArtifactRenderer(element);
      case 'text/html':
        return new HtmlArtifactRenderer(element);
      case 'image/svg+xml':
        return new SvgArtifactRenderer(element);
      case 'application/vnd.ant.mermaid':
        return new MermaidArtifactRenderer(element);
      case 'application/vnd.ant.react':
        return new ReactArtifactRenderer(element);
      // Add more specific cases if needed
    }

    // Generalized common types
    if (lowerCaseType.startsWith('image/')) {
        // Basic image renderer
        return {
            render: (content) => {
                // Assume content is a data URL or accessible image URL
                // In a real scenario, might need blob handling if content is raw bytes
                const img = document.createElement('img');
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                // Use content directly as src. Handle potential security implications.
                img.src = content;
                img.alt = 'Image Artifact';
                element.appendChild(img);
            }
        };
    }

    if (lowerCaseType === 'application/json') {
        return new CodeArtifactRenderer(element, 'json');
    }

    if (lowerCaseType === 'text/css') {
        return new CodeArtifactRenderer(element, 'css');
    }

    if (lowerCaseType === 'text/javascript' || lowerCaseType === 'application/javascript') {
        return new CodeArtifactRenderer(element, 'javascript');
    }
    
    if (lowerCaseType === 'application/x-python' || lowerCaseType === 'text/x-python') {
        return new CodeArtifactRenderer(element, 'python');
    }
    
    if (lowerCaseType === 'text/plain' || lowerCaseType === 'application/octet-stream' || lowerCaseType === 'application/x-godot-scene' || !artifactType) {
        // Default to plain text / code attempt for unknown or explicit text
        // If content looks like code, try code renderer, else plain text
        return {
            render: (content) => {
                const looksLikeCode = /(\{|\}|;|function|class|def|=)/.test(String(content).substring(0, 500));
                if (looksLikeCode) {
                    console.log(`[Debug] ArtifactRendererFactory: Fallback: Treating unknown type (${artifactType}) as code.`);
                    const lang = ArtifactRendererFactory.detectLanguage(content) || 'plaintext';
                    const codeRenderer = new CodeArtifactRenderer(element, lang);
                    codeRenderer.render(content);
                } else {
                    console.log(`[Debug] ArtifactRendererFactory: Fallback: Treating unknown type (${artifactType}) as plain text.`);
                    const pre = document.createElement('pre');
                    pre.style.whiteSpace = 'pre-wrap'; // Wrap text
                    pre.style.wordBreak = 'break-all'; // Break long words
                    pre.textContent = content;
                    element.appendChild(pre);
                }
            }
        };
    }

    // If still not matched, use the plain text fallback as a last resort
    console.warn(`[Debug] ArtifactRendererFactory: No specific renderer found for type ${artifactType}, using default text/code fallback.`);
    return {
        render: (content) => {
             const pre = document.createElement('pre');
             pre.style.whiteSpace = 'pre-wrap';
             pre.style.wordBreak = 'break-all';
             pre.textContent = content;
             element.appendChild(pre);
        }
    };
  }

  /**
   * Detect the likely artifact type based on content
   * @param {string} content - Content to analyze
   * @returns {string} Best guess at the artifact type
   */
  static detectArtifactType(content) {
    // Check for HTML
    if (
      content.trim().startsWith('<') &&
      (content.includes('</html>') ||
        content.includes('<div') ||
        content.includes('<p'))
    ) {
      return 'text/html';
    }

    // Check for SVG
    if (content.includes('<svg') && content.includes('</svg>')) {
      return 'image/svg+xml';
    }

    // Check for Mermaid
    if (
      content.includes('graph ') ||
      content.includes('sequenceDiagram') ||
      content.includes('gantt') ||
      content.includes('classDiagram')
    ) {
      return 'application/vnd.ant.mermaid';
    }

    // Check for React components
    if (
      (content.includes('function Component') ||
        content.includes('const Component =') ||
        content.includes('class Component')) &&
      (content.includes('return (') || content.includes('render('))
    ) {
      return 'application/vnd.ant.react';
    }

    // Check for Markdown
    if (
      content.includes('# ') ||
      content.includes('## ') ||
      content.includes('- ') ||
      content.includes('```')
    ) {
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
    if (
      code.includes('function') &&
      code.includes('{') &&
      (code.includes('const ') || code.includes('let '))
    ) {
      return 'javascript';
    }

    if (
      code.includes('import ') &&
      code.includes('from ') &&
      (code.includes('const ') || code.includes('let '))
    ) {
      return 'javascript';
    }

    if (
      code.includes('def ') &&
      code.includes(':') &&
      (code.includes('    ') || code.includes('print('))
    ) {
      return 'python';
    }

    if (
      code.includes('public class ') ||
      code.includes('private ') ||
      (code.includes('void ') && code.includes('{'))
    ) {
      return 'java';
    }

    if (
      code.includes('<html') ||
      code.includes('<div') ||
      code.includes('<p')
    ) {
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
