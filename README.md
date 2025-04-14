# Claude UI Elements

A lightweight, standalone viewer for Claude AI responses and artifacts, powered by Vite.

## Overview

Claude UI Elements is a focused implementation for rendering Claude's JSON responses, including specialized artifact renderers for various content types. This project provides a simple, efficient way to display Claude's responses with proper formatting and styling, supporting both single and multi-conversation JSON files.

## Features

- Renders Claude message content with improved styling.
- Loads JSON files containing an array of conversations.
- Provides a searchable list view to browse and select conversations.
- Supports various artifact types:
  - Code with syntax highlighting (PrismJS)
  - Markdown content (Marked)
  - HTML content in sandboxed iframes
  - SVG graphics
  - Mermaid diagrams
  - React components (Basic structure, execution needs secure implementation)
- Handles inline custom tags (`<antThinking>`, `<pointer*>`).
- Responsive design.
- Dark mode support.
- Copy functionality for code artifacts.
- Built with Vite.
- Produces a single, self-contained HTML file for easy use.

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/1ps0/claude-ui.git

# Navigate to the project directory
cd claude-ui

# Install dependencies
npm install
```

### Usage

#### 1. As a standalone HTML file

First, build the project:

```bash
npm run build 
```

This command creates a single, self-contained HTML file at `dist/index.html`.

Open the generated `dist/index.html` file in your web browser.

#### 2. As components in your own project (Advanced)

The core classes are built as ES Modules and could potentially be imported into another Vite project. Refer to the source code (`src/js/`) for details on classes like `ClaudeUI` and `MessageRenderer`.

## Development

### Project Structure

```
claude-ui/
├── dist/                   # Build output (contains index.html)
├── src/
│   ├── css/                # Styling
│   │   ├── main.css
│   │   ├── message.css
│   │   └── artifacts.css
│   └── js/                 # Core ES Modules
│       ├── main.js           # Application entry point, event handling
│       ├── ClaudeUI.js       # Main application class, UI logic
│       ├── MessageRenderer.js # Handles rendering messages & artifacts
│       ├── ArtifactFactory.js # Creates appropriate artifact renderers
│       └── renderers/      # Individual artifact renderers
│           ├── CodeRenderer.js
│           ├── MarkdownRenderer.js
│           ├── HtmlRenderer.js
│           ├── SvgRenderer.js
│           ├── MermaidRenderer.js
│           └── ReactRenderer.js
├── index.html              # Main HTML entry point
├── vite.config.js          # Vite configuration
├── package.json
├── README.md               # This file
├── LICENSE                 # MIT License
└── CONTRIBUTING.md         # Contribution Guidelines
```

### Running the Development Server

```