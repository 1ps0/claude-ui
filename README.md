# Claude UI Elements

A lightweight, standalone viewer for Claude AI responses and artifacts.

## Overview

Claude UI Elements is a focused implementation for rendering Claude's JSON responses, including specialized artifact renderers for various content types. This project provides a simple, efficient way to display Claude's responses with proper formatting and styling.

## Features

- Renders Claude message content with appropriate styling
- Supports various artifact types:
  - Code with syntax highlighting
  - Markdown content
  - HTML content in sandboxed iframes
  - SVG graphics
  - Mermaid diagrams
  - React components
- Responsive design for different screen sizes
- Copy functionality for code artifacts
- Self-contained implementation option (single HTML file)

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/claude-ui.git

# Navigate to the project directory
cd claude-ui

# Install dependencies
npm install
```

### Usage

You can use Claude UI Elements in two ways:

#### 1. As a standalone HTML file

Simply open the `build/claude-ui.html` file in a browser.

#### 2. As a component in your own project

```javascript
// Import the main class
import { ClaudeUI } from './path/to/ClaudeUI.js';

// Initialize with a container element
const claudeUI = new ClaudeUI('your-container-id');

// Render a Claude response
claudeUI.renderResponse(claudeResponseJSON);
```

## Development

### Project Structure

```
claude-ui/
├── src/
│   ├── index.html          # Demo page
│   ├── css/                # Styling
│   ├── js/                 # Core functionality
│   │   └── renderers/      # Artifact renderers
│   └── test/               # Test data
├── build/                  # Built files
└── package.json
```

### Building

To build the project into a single HTML file:

```bash
npm run build
```

This will create `build/claude-ui.html` with all necessary CSS and JavaScript included.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
