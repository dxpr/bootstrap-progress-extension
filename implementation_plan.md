# Implementation Plan: Update Progress Bar Configuration

This plan outlines the steps to modify the Bootstrap Progress Bar Extension to support configuration via individual `data-bs-*` attributes alongside the existing `data-bs-config` JSON attribute, making the individual attributes the primary method shown in examples.

## 1. Modify `_getConfig` Method (in `src/js/bootstrap-progress-extension.js`) - Compact Implementation

-   **Maintain Precedence Order:**
    1.  JavaScript options passed to the constructor (Highest)
    2.  Individual `data-bs-*` attributes
    3.  `data-bs-config` JSON attribute
    4.  Default values (Lowest)
-   **Compact Update Logic:**
    -   Initialize `result` with `Default` values: `let result = { ...Default };`.
    -   Merge `data-bs-config` JSON attribute if present (using existing try-catch logic).
    -   **Iterate over Default keys to process individual attributes:**
        ```javascript
        Object.keys(Default).forEach(key => {
          // Construct kebab-case attribute name (e.g., data-bs-stroke-width)
          const attrName = `data-bs-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;

          if (this._element.hasAttribute(attrName)) {
            const attrValue = this._element.getAttribute(attrName);

            // Type conversion based on key
            switch (key) {
              case 'duration':
              case 'delay':
              case 'strokeWidth':
              case 'size':
                const num = parseInt(attrValue, 10);
                if (!isNaN(num)) {
                  result[key] = num;
                }
                break;
              case 'animation':
              case 'animateInViewport':
                // Attribute presence means true, unless its value is explicitly "false"
                result[key] = attrValue !== 'false';
                break;
              // No default needed as we only process known keys from Default
            }
          }
        });
        ```
    -   Finally, merge the direct JavaScript constructor `config` options: `result = { ...result, ...(config || {}) };`.
    -   Return `result`.

## 2. Update Documentation (`index.html`)

-   Modify the "Configuration Options" section:
    -   Clearly state the precedence order (JS options > individual `data-bs-*` > `data-bs-config` > defaults).
    -   Explain that while `data-bs-config` is still supported, the individual `data-bs-*` attributes are now the recommended approach shown in the examples, aligning with standard Bootstrap configuration patterns.
    -   List all available `data-bs-*` attributes (e.g., `data-bs-duration`, `data-bs-delay`, `data-bs-stroke-width`, `data-bs-size`, `data-bs-animation`, `data-bs-animate-in-viewport`).

## 3. Refactor Existing Examples (`index.html`)

-   Go through *every* progress bar instance in `index.html` (both the demonstration sections and the "Code Examples" section).
-   For each instance currently using `data-bs-config`:
    -   Remove the `data-bs-config='{...}'` attribute.
    -   Add the equivalent individual `data-bs-*` attributes.
        -   *Example (Original):*
            ```html
            <div class="progress circular" ... data-bs-config='{"strokeWidth": 5, "animation": true}'>...</div>
            ```
        -   *Example (Refactored):*
            ```html
            <div class="progress circular" ... data-bs-stroke-width="5" data-bs-animation>...</div>
            ```
        -   *Example (Original):*
            ```html
            <div class="progress" ... data-bs-config='{"duration": 2500, "animation": true}' style="height: 15px;">...</div>
            ```
        -   *Example (Refactored):*
            ```html
            <div class="progress" ... data-bs-duration="2500" data-bs-animation style="height: 15px;">...</div>
            ```
        -   *Note:* Boolean attributes like `data-bs-animation` only need to be present to indicate `true`. Omit them for `false`.
    -   Update the code snippets shown within the `<pre><code>` blocks in the "Code Examples" section to match the refactored HTML.

## 4. Add New `data-bs-config` Example (`index.html`)

-   Add one *new*, clear example demonstrating the use of *only* the `data-bs-config` attribute.
-   This example should configure multiple settings (e.g., `size`, `strokeWidth`, `duration`, `delay`, `animation`) using the JSON format.
-   Place this example logically, perhaps within the "Code Examples" section or near the "Configuration Options" documentation, clearly labelling it as demonstrating the JSON configuration method.
-   Include the corresponding HTML snippet for this example.

## 5. Testing

-   Thoroughly test all examples in `index.html` in a browser.
-   Verify that both individual attributes and the `data-bs-config` attribute work correctly.
-   Test the precedence rules (e.g., ensure an individual attribute overrides a setting in `data-bs-config`).
-   Test boolean attribute handling (presence means true, absence means false, `="false"` means false).
-   Test `prefers-reduced-motion` behavior with both configuration methods.
-   Test dynamic initialization via MutationObserver with both configuration methods.

## 6. Final Code Size Check & Refactoring

-   After completing the code changes in `src/js/bootstrap-progress-extension.js`, run the following command in the terminal:
    ```bash
    cat src/js/bootstrap-progress-extension.js | wc -l
    ```
-   Check the output line count.
-   **If the line count exceeds 400:**
    -   Review the implemented code, particularly the `_getConfig` method, for opportunities to improve conciseness.
    -   Refactor the JavaScript code carefully to reduce the line count while maintaining readability and functionality.
    -   Repeat the line count check until the file is under 400 lines. 