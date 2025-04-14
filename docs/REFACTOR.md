# Refactoring Plan: Claude UI Elements to Vite & ES Modules

**Goal:** Replace the custom Node.js build script with Vite, convert the codebase to use ES Modules, and refactor problematic renderers for better robustness and maintainability.

**Phase 1: Environment Setup & Project Structure**

1.  **Introduce Vite:** Add Vite as a dev dependency.
    *   Command: `npm install --save-dev vite`
2.  **Manage Dependencies via npm:** Add runtime libraries as direct dependencies.
    *   Command: `npm install marked mermaid prismjs react react-dom`
3.  **Update `package.json`:**
    *   **Scripts:** Replace existing `start`, `build`, `build:prod` with:
        *   `"dev": "vite"`
        *   `"build": "vite build"`
        *   `"preview": "vite preview"`
    *   **Dependencies:** Remove `html-minifier`, `uglify-js`, `http-server`.
        *   Command: `npm uninstall html-minifier uglify-js http-server`
4.  **Adjust Project Layout (Manual Step):**
    *   **USER ACTION:** Move `src/index.html` to the project root (`./index.html`).
5.  **Update Root `index.html`:**
    *   Modify the main script tag: `<script type="module" src="/src/js/main.js"></script>`.
    *   Remove all local CSS `<link>` tags.
    *   Remove all external library/local JS `<script>` tags (except the main module one).

**Phase 2: Convert to ES Modules & Import Assets**

1.  **JavaScript Modules (`src/js/**/*.js`):**
    *   Add `export` to necessary classes/functions.
    *   Use `import` for local files and npm packages.
    *   Remove reliance on global variables (`window.*`).
2.  **CSS Importing (`src/js/main.js`):**
    *   Add CSS imports at the top:
        ```javascript
        import '../css/main.css';
        import '../css/message.css';
        import '../css/artifacts.css';
        import 'prismjs/themes/prism.css'; // Or specific theme
        ```

**Phase 3: Refactor Problematic Renderers**

1.  **`HtmlRenderer.js`:**
    *   Remove `enhanceHtmlContent`.
    *   Refactor `render` method to use runtime DOM manipulation (create `<script>` element, set `textContent`, append to iframe).
2.  **`ReactRenderer.js`:**
    *   Remove Babel Standalone dependency/usage.
    *   Use modern `createRoot` API from `react-dom/client`.
    *   Address dynamic component string rendering (details TBD based on exact needs).

**Phase 4: Cleanup and Verification**

1.  **Delete Build Script:** Remove `scripts/build.js`.
2.  **Testing:**
    *   Use `npm run dev` for development testing.
    *   Use `npm run build` and `npm run preview` for production build testing.