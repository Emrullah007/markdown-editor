/**
 * Rich Text Editor Module
 * Handles WYSIWYG editing with HTML to Markdown conversion
 * @module RichTextEditor
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * Maximum allowed image size in bytes (2MB for inline, 10MB for IndexedDB)
 * @constant {number}
 */
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Class representing the Rich Text Editor
 * Provides WYSIWYG editing capabilities with bidirectional markdown conversion
 * @class
 */
class RichTextEditor {
    /**
     * Create a RichTextEditor instance
     * @param {HTMLElement} editorElement - The contenteditable element for editing
     * @param {MarkdownEditor} markdownEditor - Reference to the main editor instance
     */
    constructor(editorElement, markdownEditor) {
        /**
         * The contenteditable editor element
         * @type {HTMLElement}
         */
        this.editor = editorElement;

        /**
         * Reference to the main MarkdownEditor instance
         * @type {MarkdownEditor}
         */
        this.markdownEditor = markdownEditor;

        /**
         * Turndown service for HTML to Markdown conversion
         * @type {TurndownService|null}
         * @private
         */
        this.turndownService = null;

        this.init();
    }

    /**
     * Initialize the rich text editor
     * Sets up Turndown, paste handler, and drag-drop support
     * @private
     */
    init() {
        this.setupTurndown();
        this.setupPasteHandler();
        this.setupDragDropHandler();
        this.setupKeyboardNavigation();
    }

    /**
     * Validate and sanitize URLs for security
     * Blocks dangerous protocols like javascript:, data:, etc.
     * @param {string} url - URL to validate
     * @returns {boolean} Whether the URL is safe to use
     */
    isValidUrl(url) {
        if (!url || typeof url !== 'string') return false;

        url = url.trim();

        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
        const lowerUrl = url.toLowerCase();

        for (let protocol of dangerousProtocols) {
            if (lowerUrl.startsWith(protocol)) {
                return false;
            }
        }

        // Allow http, https, mailto, relative URLs
        if (url.startsWith('http://') || url.startsWith('https://') ||
            url.startsWith('mailto:') || url.startsWith('/') ||
            url.startsWith('#') || url.startsWith('./') || url.startsWith('../')) {
            return true;
        }

        // Allow URLs without protocol (assume https)
        if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}/i.test(url)) {
            return true;
        }

        return false;
    }

    /**
     * HTML escape utility for security
     * @param {string} text - Text to escape
     * @returns {string} HTML-escaped text
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Setup Turndown for HTML to Markdown conversion
     * Configures GFM support and custom rules
     * @private
     */
    setupTurndown() {
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-',
            emDelimiter: '*',
            strongDelimiter: '**',
        });

        // Use GFM plugin for tables, strikethrough, task lists
        if (window.turndownPluginGfm) {
            const gfm = window.turndownPluginGfm.gfm;
            this.turndownService.use(gfm);
        }

        // Custom rule for images with IndexedDB IDs
        this.turndownService.addRule('indexedImages', {
            filter: function (node) {
                return node.nodeName === 'IMG' && node.hasAttribute('data-image-id');
            },
            replacement: function (content, node) {
                const alt = node.getAttribute('alt') || '';
                const imageId = node.getAttribute('data-image-id');
                return `![${alt}](indexed://${imageId})`;
            }
        });

        // Keep underline as HTML since markdown doesn't support it
        this.turndownService.keep(['u']);
    }

    /**
     * Setup keyboard navigation for toolbar accessibility
     * @private
     */
    setupKeyboardNavigation() {
        const toolbar = document.getElementById('richTextToolbar');
        if (!toolbar) return;

        const buttons = toolbar.querySelectorAll('button, select');
        
        buttons.forEach((button, index) => {
            button.setAttribute('tabindex', index === 0 ? '0' : '-1');
            
            button.addEventListener('keydown', (e) => {
                let nextIndex;
                
                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        nextIndex = (index + 1) % buttons.length;
                        buttons[nextIndex].focus();
                        break;
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        nextIndex = (index - 1 + buttons.length) % buttons.length;
                        buttons[nextIndex].focus();
                        break;
                    case 'Home':
                        e.preventDefault();
                        buttons[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        buttons[buttons.length - 1].focus();
                        break;
                }
            });

            // Update tabindex when button is focused
            button.addEventListener('focus', () => {
                buttons.forEach((btn, i) => {
                    btn.setAttribute('tabindex', i === index ? '0' : '-1');
                });
            });
        });
    }

    // ===== Formatting Commands =====

    /**
     * Apply text formatting using execCommand
     * @param {string} command - The execCommand to execute (bold, italic, etc.)
     * @param {string|null} [value=null] - Optional value for the command
     */
    formatText(command, value = null) {
        document.execCommand(command, false, value);
        this.editor.focus();
    }

    /**
     * Apply heading or paragraph formatting
     * @param {string} tag - HTML tag (h1-h6 or p)
     */
    applyHeading(tag) {
        if (tag === 'p') {
            document.execCommand('formatBlock', false, '<p>');
        } else {
            document.execCommand('formatBlock', false, `<${tag}>`);
        }
        this.editor.focus();
    }

    /**
     * Insert a list (unordered, ordered, or checklist)
     * @param {string} type - List type: 'ul', 'ol', or 'checklist'
     */
    insertList(type) {
        if (type === 'ul') {
            document.execCommand('insertUnorderedList', false, null);
        } else if (type === 'ol') {
            document.execCommand('insertOrderedList', false, null);
        } else if (type === 'checklist') {
            this.insertChecklist();
        }
        this.editor.focus();
    }

    /**
     * Insert a checklist (task list) item
     * @private
     */
    insertChecklist() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const li = document.createElement('li');
            li.style.listStyle = 'none';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '0.5rem';
            checkbox.setAttribute('aria-label', 'Task checkbox');

            const textNode = document.createTextNode(' Task item');

            li.appendChild(checkbox);
            li.appendChild(textNode);

            // Check if we're already in a list
            let parent = range.commonAncestorContainer;
            while (parent && parent !== this.editor) {
                if (parent.tagName === 'UL' || parent.tagName === 'OL') {
                    range.insertNode(li);
                    this.editor.focus();
                    return;
                }
                parent = parent.parentNode;
            }

            // Create new list
            const ul = document.createElement('ul');
            ul.setAttribute('role', 'list');
            ul.appendChild(li);
            range.insertNode(ul);
        }
    }

    /**
     * Insert a hyperlink
     * Prompts user for URL and link text
     */
    insertLink() {
        const url = prompt('Enter URL:');
        if (url) {
            if (!this.isValidUrl(url)) {
                alert('Invalid or unsafe URL. Please use http://, https://, or a valid domain name.\nJavaScript and data URLs are not allowed for security reasons.');
                this.editor.focus();
                return;
            }

            const text = prompt('Enter link text:', url);
            if (text !== null) {
                const safeUrl = this.escapeHtml(url.trim());
                const safeText = this.escapeHtml(text || url);
                const link = `<a href="${safeUrl}">${safeText}</a>`;
                document.execCommand('insertHTML', false, link);
            }
        }
        this.editor.focus();
    }

    /**
     * Insert an image from file picker
     * Opens file dialog for image selection
     */
    insertImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.setAttribute('aria-label', 'Select image file');

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.insertImageFromFile(file);
            }
        };

        input.click();
    }

    /**
     * Insert a table with specified dimensions
     * Prompts user for row and column count
     */
    insertTable() {
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');

        if (!rows || !cols || isNaN(rows) || isNaN(cols)) return;

        const rowCount = Math.min(parseInt(rows), 20); // Limit for safety
        const colCount = Math.min(parseInt(cols), 10); // Limit for safety

        let tableHTML = '<table role="grid"><thead><tr>';

        // Header row
        for (let c = 0; c < colCount; c++) {
            tableHTML += '<th scope="col">Header ' + (c + 1) + '</th>';
        }
        tableHTML += '</tr></thead><tbody>';

        // Body rows
        for (let r = 0; r < rowCount - 1; r++) {
            tableHTML += '<tr>';
            for (let c = 0; c < colCount; c++) {
                tableHTML += '<td>Cell</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';

        document.execCommand('insertHTML', false, tableHTML);
        this.editor.focus();
    }

    /**
     * Insert a code block
     * Prompts user for programming language
     */
    insertCodeBlock() {
        const language = prompt('Enter programming language (optional):', 'javascript');
        const pre = document.createElement('pre');
        const code = document.createElement('code');

        if (language) {
            code.className = `language-${language}`;
        }

        code.textContent = '// Enter your code here';
        pre.appendChild(code);

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(pre);

            // Add a paragraph after for easier editing
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            pre.parentNode.insertBefore(p, pre.nextSibling);
        }

        this.editor.focus();
    }

    // ===== Conversion Methods =====

    /**
     * Get the current content as markdown
     * @returns {string} Markdown representation of the editor content
     */
    getMarkdown() {
        return this.turndownService.turndown(this.editor.innerHTML);
    }

    /**
     * Set editor content from markdown
     * @param {string} markdown - Markdown content to render
     * @returns {Promise<void>} Resolves when content is set and images are loaded
     */
    async setContent(markdown) {
        const html = markdownParser.parse(markdown);
        this.editor.innerHTML = html;
        await this.loadIndexedImages();
    }

    /**
     * Load images from IndexedDB for display
     * Replaces placeholder src with actual image data
     * @returns {Promise<void>}
     * @private
     */
    async loadIndexedImages() {
        const indexedImages = this.editor.querySelectorAll('img[data-image-id]');

        for (const img of indexedImages) {
            const imageId = img.getAttribute('data-image-id');
            try {
                const imageRecord = await imageStorage.getImage(imageId);
                if (imageRecord && imageRecord.data) {
                    img.src = imageRecord.data;
                }
            } catch (error) {
                console.error('Error loading image from IndexedDB:', error);
            }
        }
    }

    // ===== Image Handling =====

    /**
     * Setup paste handler for images
     * Allows pasting images directly from clipboard
     * @private
     */
    setupPasteHandler() {
        this.editor.addEventListener('paste', async (event) => {
            const items = event.clipboardData.items;

            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    await this.insertImageFromFile(file);
                    break;
                }
            }
        });
    }

    /**
     * Setup drag and drop handler for images
     * Allows dropping image files into the editor
     * @private
     */
    setupDragDropHandler() {
        this.editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.editor.addEventListener('drop', async (e) => {
            e.preventDefault();

            const files = e.dataTransfer.files;
            for (let file of files) {
                if (file.type.indexOf('image') !== -1) {
                    await this.insertImageFromFile(file);
                }
            }
        });
    }

    /**
     * Insert an image from a File object
     * Validates, stores in IndexedDB, and inserts at cursor
     * @param {File} file - Image file to insert
     * @returns {Promise<void>}
     */
    async insertImageFromFile(file) {
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }

            // Validate file size
            const MAX_INDEXEDDB_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
            if (file.size > MAX_INDEXEDDB_IMAGE_SIZE) {
                alert('Image is too large. Please use an image smaller than 10MB.\n\nTip: Consider uploading to an image hosting service and using a URL instead.');
                return;
            }

            const base64 = await this.imageToBase64(file);

            // Store image in IndexedDB
            const imageId = await imageStorage.storeImage(base64, {
                alt: file.name || 'Image',
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            });

            // Create image element
            const img = document.createElement('img');
            img.src = base64;
            img.alt = file.name || 'Image';
            img.style.maxWidth = '100%';
            img.dataset.imageId = imageId;
            img.setAttribute('loading', 'lazy');

            // Insert at cursor
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(img);

                // Move cursor after image
                range.setStartAfter(img);
                range.setEndAfter(img);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                this.editor.appendChild(img);
            }
        } catch (error) {
            console.error('Error inserting image:', error);
            alert('Failed to insert image. Please try again.');
        }
    }

    /**
     * Convert a File to base64 data URL
     * @param {File} file - File to convert
     * @returns {Promise<string>} Base64 data URL
     * @private
     */
    imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
