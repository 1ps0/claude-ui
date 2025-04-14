#!/bin/bash

# Create scripts directory if it doesn't exist
mkdir -p claude-ui/scripts

# Copy build script to scripts directory
cat > claude-ui/scripts/build.js << 'EOL'
/**
 * Claude UI Elements
 * build.js - Build script to create a single HTML file with all components
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier');
const UglifyJS = require('uglify-js');

// Paths
const srcDir = path.join(__dirname, '..', 'src');
const buildDir = path.join(__dirname, '..', 'build');
const outputFile = path.join(buildDir, 'claude-ui.html');

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Read the HTML template
const htmlTemplate = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf8');

// Function to read all CSS files
function getAllCSS() {
  const cssDir = path.join(srcDir, 'css');
  const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
  
  let combinedCSS = '';
  cssFiles.forEach(file => {
    const cssContent = fs.readFileSync(path.join(cssDir, file), 'utf8');
    combinedCSS += `/* ${file} */\n${cssContent}\n\n`;
  });
  
  return combinedCSS;
}

// Function to read all JavaScript files in the correct order
function getAllJS() {
  // Define the order of JS files
  const jsOrder = [
    'renderers/CodeRenderer.js',
    'renderers/MarkdownRenderer.js',
    'renderers/HtmlRenderer.js',
    'renderers/SvgRenderer.js',
    'renderers/MermaidRenderer.js',
    'renderers/ReactRenderer.js',
    'ArtifactFactory.js',
    'MessageRenderer.js',
    'ClaudeUI.js',
    '../test/sampleResponses.js',
    'main.js'
  ];
  
  let combinedJS = '';
  jsOrder.forEach(filePath => {
    const fullPath = path.join(srcDir, 'js', filePath);
    if (fs.existsSync(fullPath)) {
      const jsContent = fs.readFileSync(fullPath, 'utf8');
      combinedJS += `/* ${filePath} */\n${jsContent}\n\n`;
    } else {
      console.warn(`Warning: File not found: ${fullPath}`);
    }
  });
  
  return combinedJS;
}

// Get all CSS and JS content
const allCSS = getAllCSS();
const allJS = getAllJS();

// Create the combined HTML file
let combinedHTML = htmlTemplate;

// Replace external CSS links with inline CSS
combinedHTML = combinedHTML.replace(
  /<link rel="stylesheet" href="css\/[^>]*>/g, 
  ''
);

// Add combined CSS
combinedHTML = combinedHTML.replace(
  '</head>',
  `<style>\n${allCSS}</style>\n</head>`
);

// Replace external JS script tags with inline JS
combinedHTML = combinedHTML.replace(
  /<script src="js\/[^>]*><\/script>\n/g, 
  ''
);
combinedHTML = combinedHTML.replace(
  /<script src="test\/[^>]*><\/script>\n/g, 
  ''
);

// Add combined JS
combinedHTML = combinedHTML.replace(
  '</body>',
  `<script>\n${allJS}</script>\n</body>`
);

// Minification options
const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  minifyCSS: true,
  minifyJS: true
};

// Decide whether to minify based on environment variable
const shouldMinify = process.env.NODE_ENV === 'production';

// Write the output file
if (shouldMinify) {
  const minified = minify(combinedHTML, minifyOptions);
  fs.writeFileSync(outputFile, minified);
  console.log(`Minified HTML file created at: ${outputFile}`);
} else {
  fs.writeFileSync(outputFile, combinedHTML);
  console.log(`HTML file created at: ${outputFile}`);
}

console.log('Build completed successfully!');
EOL

# Make the script executable
chmod +x claude-ui/scripts/build.js

echo "Setup completed. Now you can run the build script with:"
echo "cd claude-ui && npm run build"
