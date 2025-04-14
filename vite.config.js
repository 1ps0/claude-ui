import { resolve } from 'path'; // Needed for resolving the input path
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // Set base path for GitHub Pages deployment
  base: '/claude-ui/', // Replace with your actual repository name if different
  root: 'src', // Tell Vite the project root for index.html is src/
  plugins: [viteSingleFile()],
  build: {
    // Output directory needs to be relative to the *project* root, not the src/ root
    outDir: '../dist', 
    emptyOutDir: true, // Ensure dist is cleared before build
    rollupOptions: {
        // Ensure Vite processes the correct HTML entry point
        input: resolve(__dirname, 'src/index.html'),
    },
    // Optional: You might want to disable CSS code splitting if the plugin doesn't handle it perfectly
    // cssCodeSplit: false,
    // Optional: Adjust assets inline limit if needed (plugin might override)
    // assetsInlineLimit: 100000000, 
  },
}); 