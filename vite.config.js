import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    // Optional: You might want to disable CSS code splitting if the plugin doesn't handle it perfectly
    // cssCodeSplit: false,
    // Optional: Adjust assets inline limit if needed (plugin might override)
    // assetsInlineLimit: 100000000, 
  },
}); 