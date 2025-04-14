# Mark-2 Design: Multi-Conversation Loading & Browsing

**1. Goal:**

Extend the Claude UI Elements application to support loading a single JSON file containing an array of conversation objects. Provide a user interface to browse, search, and select individual conversations from the loaded file for display using the existing rendering capabilities.

**2. Current State:**

*   The application loads data via a "Load From File" button.
*   It expects the loaded JSON to represent a *single* conversation structure (either the root object contains messages/artifacts or it has a `messages` array property).
*   `ClaudeUI.js` orchestrates the UI, using `MessageRenderer.js` to display the content of this single loaded conversation in the `#message-container`.
*   `ClaudeUI.js` updates the header with metadata (`name`, `uuid`, `created_at`) if present in the root of the loaded JSON.
*   The "Clear" button removes the currently displayed conversation.

**3. Proposed High-Level Changes:**

*   **Data Model:** Introduce internal state within `ClaudeUI` to store the entire array of loaded conversations.
*   **UI States:** Manage two primary UI views:
    *   **List View:** Displays a searchable list of loaded conversations.
    *   **Conversation View:** Displays the messages and artifacts of a single selected conversation (using the existing `#message-container` and renderers).
*   **Loading Workflow:** Modify the "Load From File" action to parse the expected JSON array, store it, and display the List View.
*   **Navigation:** Allow users to select a conversation from the List View to enter the Conversation View. Provide a way to return to the List View.
*   **Search:** Implement client-side search functionality within the List View.

**4. Schema Assumption:**

*   The loaded JSON file will be an array (`[]`).
*   Each element in the array will be a "conversation object".
*   Each conversation object will contain at least the following keys for identification and rendering:
    *   `uuid`: A unique identifier for the conversation.
    *   `name`: A display name or title for the conversation.
    *   `created_at`: A timestamp string indicating creation time.
    *   `messages` (or `content`): The array/data representing the actual messages and artifacts, compatible with the *existing* `ClaudeMessageRenderer.parseAndRenderResponse` input requirements.

**5. Detailed Implementation Plan:**

**5.1. `ClaudeUI.js` Modifications:**

*   **State Variables:** Add new instance variables:
    *   `this.allConversations = [];` (Stores the parsed array from the file)
    *   `this.currentView = 'empty';` (Tracks current state: 'empty', 'list', 'conversation')
    *   `this.selectedConversationUUID = null;` (Stores the UUID of the currently viewed conversation)
*   **New Methods:**
    *   `loadConversationData(jsonData)`:
        *   Validates `jsonData` is an array. Shows error if not.
        *   Stores `jsonData` in `this.allConversations`.
        *   Sets `this.currentView = 'list'`.
        *   Calls `this.renderListView()`.
        *   Clears header title/metadata.
    *   `renderListView()`:
        *   Clears the `#message-container`.
        *   Creates and prepends a search input element above the container (or integrate into header/controls).
        *   Generates HTML for a list (`<ul>` or similar) based on `this.allConversations`.
        *   Each list item (`<li>`) should display key info (e.g., `name`, formatted `created_at`).
        *   Add `data-uuid` attribute to each list item.
        *   Attach click event listeners to list items. On click: call `this.selectConversation(uuid)`.
        *   Attach input event listener to the search input. On input: call `this.filterAndRenderList(searchTerm)`.
        *   Appends the list to `#message-container`.
    *   `filterAndRenderList(searchTerm)`:
        *   Filters `this.allConversations` based on `searchTerm` (matching against `name`, potentially `uuid`).
        *   Re-runs the list generation and rendering part of `renderListView()` with the filtered results.
    *   `selectConversation(uuid)`:
        *   Finds the conversation object in `this.allConversations` matching the `uuid`.
        *   Stores the `uuid` in `this.selectedConversationUUID`.
        *   Sets `this.currentView = 'conversation'`.
        *   Clears the `#message-container`.
        *   Updates the header title/metadata using the selected conversation's data (`this.updateConversationMetadata(...)`).
        *   Calls `this.messageRenderer.parseAndRenderResponse()` with the selected conversation object.
        *   Possibly adds a "Back to List" button to the UI.
*   **Modified Methods:**
    *   `clear()`:
        *   If `this.currentView === 'conversation'`, clear the message container, clear header, set `this.selectedConversationUUID = null`, set `this.currentView = 'list'`, and call `this.renderListView()`.
        *   If `this.currentView === 'list'`, clear the message container, set `this.allConversations = []`, set `this.currentView = 'empty'`.
        *   If `this.currentView === 'empty'`, do nothing.
    *   `renderResponse()`: Deprecate or refactor. The primary rendering path will be through `selectConversation`.
    *   `updateConversationMetadata()`: Keep as is, will be called by `selectConversation`.
    *   `showLoading() / hideLoading()`: May need adjustment for list view rendering.

**5.2. `main.js` Modifications:**

*   **`loadJsonFromFile(file, claudeUI)`:**
    *   Change the `reader.onload` handler. Instead of calling `claudeUI.renderResponse(jsonData)`, call `claudeUI.loadConversationData(jsonData)`.
*   **Event Listeners:**
    *   Keep the "Load From File" and "Clear" button listeners (they will call the updated `ClaudeUI` methods).
    *   Add necessary listeners for the *new* search input and potential "Back to List" button if they are managed directly in `main.js` instead of delegated via `ClaudeUI`.

**5.3. `index.html` Modifications:**

*   Consider adding dedicated elements for:
    *   A search bar (`<input type="search" id="conversation-search">`), placed logically (e.g., above message container or in controls).
    *   A "Back to List" button (`<button id="back-to-list-button">`), initially hidden.

**6. UI/UX Considerations:**

*   The initial state shows only the "Load From File" and "Clear" buttons.
*   After loading a file, the view changes to the searchable list of conversations.
*   Clicking a conversation title/item loads that conversation into the main view and hides the list. The "Back to List" button appears.
*   Clicking "Back to List" returns to the searchable list view.
*   Clicking "Clear" while viewing a conversation goes back to the list. Clicking "Clear" while viewing the list clears everything.
*   Loading indicator (`showLoading`) should be used during file parsing and potentially during list rendering if it's slow.
*   Styling will be needed for the list view, search bar, and back button.

**7. Potential Future Enhancements:**

*   Pagination or virtual scrolling for very large conversation lists.
*   More advanced search (e.g., searching message content, date ranges).
*   Sorting options for the conversation list (by date, name).
*   Ability to remove conversations from the list (client-side only).
*   Persisting the loaded file/list state (e.g., using `localStorage` or `IndexedDB`).

**8. Open Questions:**

*   Exact styling and placement of the search bar and back button.
*   Performance of client-side search for very large conversation lists.
*   Specific implementation details for the dynamic React component rendering (placeholder in current plan).