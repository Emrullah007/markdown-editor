/**
 * Markdown Editor Application
 * Main application logic for the markdown editor with live preview,
 * rich text editing, theme support, and export capabilities.
 * @module MarkdownEditorApp
 * @author Emrullah Celik
 * @version 1.1.0
 */

/**
 * Application constants
 * @constant {Object}
 */
const CONSTANTS = {
    AUTO_SAVE_DELAY: 2000, // 2 seconds
    PREVIEW_UPDATE_DELAY: 300, // 300ms
    STATUS_DISPLAY_DURATION: 2000, // 2 seconds
    STORAGE_KEY: 'markdown-editor-content',
    BACKUP_KEY: 'markdown-editor-backup',
    THEME_KEY: 'markdown-editor-theme',
    RESIZER_MIN_PERCENT: 20,
    RESIZER_MAX_PERCENT: 80,
};

// Available themes
const THEMES = ['light', 'dark', 'ocean', 'forest', 'sunset', 'lavender', 'rose', 'mint'];

/**
 * DOMPurify sanitization configuration for XSS protection
 * @constant {Object}
 * @property {string[]} ALLOWED_TAGS - HTML tags allowed in sanitized output
 * @property {string[]} ALLOWED_ATTR - HTML attributes allowed in sanitized output
 * @property {boolean} ALLOW_DATA_ATTR - Whether to allow data-* attributes
 */
const DOMPURIFY_CONFIG = {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'strong', 'em', 'del', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'br', 'hr', 'span', 'div', 'input'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'type', 'checked', 'disabled', 'title', 'id', 'target', 'rel', 'data-image-id', 'style', 'scope'],
    ALLOW_DATA_ATTR: false
};

if (typeof window !== 'undefined') {
    window.__markdownEditorReady = false;
}

/**
 * Main Markdown Editor class
 * Handles all editor functionality including markdown/rich text editing,
 * preview rendering, file operations, and theme management.
 * @class
 */
class MarkdownEditor {
    /**
     * Create a MarkdownEditor instance
     * Initializes all DOM element references and sets up the editor
     */
    constructor() {
        // Cache all DOM elements to reduce queries
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.saveStatus = document.getElementById('saveStatus');
        this.wordCount = document.getElementById('wordCount');

        // Rich text editor elements
        this.richTextEditorElement = document.getElementById('richTextEditor');
        this.richTextEditor = null;
        this.currentMode = 'markdown'; // 'markdown' or 'richtext'
        this.richTextToolbar = document.getElementById('richTextToolbar');

        // Toolbar buttons
        this.modeToggle = document.getElementById('modeToggle');
        this.editorModeLabel = document.getElementById('editorModeLabel');
        this.findReplaceBtn = document.getElementById('findReplaceBtn');
        this.themePickerBtn = document.getElementById('themePickerBtn');
        this.themePickerDropdown = document.getElementById('themePickerDropdown');
        this.clearBtn = document.getElementById('clearBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.restoreBtn = document.getElementById('restoreBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.importMdBtn = document.getElementById('importMdBtn');
        this.downloadMdBtn = document.getElementById('downloadMdBtn');
        this.downloadPdfBtn = document.getElementById('downloadPdfBtn');
        this.copyMdBtn = document.getElementById('copyMdBtn');
        this.copyHtmlBtn = document.getElementById('copyHtmlBtn');
        this.editorFullscreenBtn = document.getElementById('editorFullscreenBtn');
        this.previewFullscreenBtn = document.getElementById('previewFullscreenBtn');

        // Rich text toolbar buttons
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        this.underlineBtn = document.getElementById('underlineBtn');
        this.strikeBtn = document.getElementById('strikeBtn');
        this.headingSelect = document.getElementById('headingSelect');
        this.bulletListBtn = document.getElementById('bulletListBtn');
        this.numberListBtn = document.getElementById('numberListBtn');
        this.checkListBtn = document.getElementById('checkListBtn');
        this.linkBtn = document.getElementById('linkBtn');
        this.imageBtn = document.getElementById('imageBtn');
        this.tableBtn = document.getElementById('tableBtn');
        this.codeBlockBtn = document.getElementById('codeBlockBtn');

        // Container elements
        this.container = document.querySelector('.container');

        // Timers
        this.autoSaveTimer = null;
        this.previewUpdateTimer = null;

        // History tracking flag
        this.isApplyingHistoryState = false;

        // Find & Replace instance
        this.findReplace = null;

        // PDF Export instance
        this.pdfExport = null;

        // Current theme
        this.currentTheme = 'light';

        // Syntax highlighter
        this.syntaxHighlighter = null;

        // Focus mode
        this.focusMode = null;

        // Auto-pair
        this.autoPair = null;

        // Typewriter mode
        this.typewriterMode = null;

        // Statistics panel
        this.statisticsPanel = null;

        // Templates
        this.templates = null;

        // Spell checker
        this.spellChecker = null;

        // Table editor
        this.tableEditor = null;

        // Initialize
        this.init();
    }

    async init() {
        // Initialize IndexedDB for image storage
        await imageStorage.init();

        this.setupEventListeners();
        this.loadContent();
        this.loadThemePreference();

        // Initialize rich text editor
        this.richTextEditor = new RichTextEditor(
            this.richTextEditorElement,
            this
        );

        // Initialize Find & Replace
        this.findReplace = new FindReplace(this);

        // Initialize PDF Export
        this.pdfExport = new PDFExport(this);

        // Initialize Syntax Highlighter for markdown editor
        this.syntaxHighlighter = new SyntaxHighlighter(this.editor);

        // Initialize Focus Mode
        this.focusMode = new FocusMode(this);
        this.focusMode.loadPreference();

        // Initialize Auto-pair for markdown editor
        this.autoPair = new AutoPair(this.editor);

        // Initialize Typewriter Mode
        this.typewriterMode = new TypewriterMode(this);
        this.typewriterMode.loadPreference();

        // Initialize Statistics Panel
        this.statisticsPanel = new StatisticsPanel(this);

        // Initialize Templates
        this.templates = new Templates(this);

        // Initialize Spell Checker
        this.spellChecker = new SpellChecker(this);

        // Initialize Table Editor
        this.tableEditor = new TableEditor(this);
        this.setupTableEditorListeners();

        this.updatePreview();
        this.resetScrollPosition();

        if (typeof window !== 'undefined') {
            window.__markdownEditorReady = true;
            window.dispatchEvent(new Event('markdownEditorReady'));
        }
    }

    setupEventListeners() {
        // Editor input - live preview with debouncing
        this.editor.addEventListener('input', () => {
            this.schedulePreviewUpdate();
            this.scheduleAutoSave();
            this.updateWordCount();

            // Track history (debounced internally by history manager)
            if (!this.isApplyingHistoryState) {
                historyManager.pushState(this.editor.value);
                this.updateUndoRedoButtons();
            }
        });

        // Mode toggle
        this.modeToggle.addEventListener('click', () => {
            this.toggleMode();
        });

        // Rich text editor input
        this.richTextEditorElement.addEventListener('input', () => {
            this.handleRichTextInput();
            this.updateWordCount();

            // Track history in rich text mode
            if (!this.isApplyingHistoryState) {
                const markdown = this.richTextEditor.getMarkdown();
                historyManager.pushState(markdown);
                this.updateUndoRedoButtons();
            }
        });

        // Find & Replace button
        this.findReplaceBtn.addEventListener('click', () => {
            this.findReplace.open(false);
        });

        // Theme picker
        this.setupThemePicker();

        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.clearEditor();
        });

        // Reset to default (with draft backup)
        this.resetBtn.addEventListener('click', () => {
            this.resetToDefault();
        });

        // Restore cached draft
        this.restoreBtn.addEventListener('click', () => {
            this.restoreCachedDraft();
        });

        // Undo/Redo buttons
        this.undoBtn.addEventListener('click', () => {
            this.undo();
        });

        this.redoBtn.addEventListener('click', () => {
            this.redo();
        });

        // Rich text toolbar buttons
        this.setupRichTextToolbar();

        // Import button
        this.importMdBtn.addEventListener('click', () => {
            this.importMarkdown();
        });

        // Download buttons
        this.downloadMdBtn.addEventListener('click', () => {
            this.downloadMarkdown();
        });

        this.downloadPdfBtn.addEventListener('click', () => {
            this.pdfExport.openExportDialog();
        });

        // Copy buttons
        this.copyMdBtn.addEventListener('click', () => {
            this.copyMarkdown();
        });

        this.copyHtmlBtn.addEventListener('click', () => {
            this.copyHtml();
        });

        // Fullscreen buttons
        this.editorFullscreenBtn.addEventListener('click', () => {
            this.toggleEditorFullscreen();
        });

        this.previewFullscreenBtn.addEventListener('click', () => {
            this.togglePreviewFullscreen();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z or Cmd+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
                return;
            }

            // Ctrl+Shift+Z or Cmd+Shift+Z for redo (also Ctrl+Y)
            if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && (e.key === 'Z' || e.key === 'z')) || e.key === 'y')) {
                e.preventDefault();
                this.redo();
                return;
            }

            // Ctrl+S or Cmd+S to download markdown
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.downloadMarkdown();
                return;
            }

            // Rich text formatting shortcuts (only when in rich text mode)
            if (this.currentMode === 'richtext') {
                // Ctrl+B or Cmd+B for bold
                if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                    e.preventDefault();
                    this.richTextEditor.formatText('bold');
                    return;
                }

                // Ctrl+I or Cmd+I for italic
                if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                    e.preventDefault();
                    this.richTextEditor.formatText('italic');
                    return;
                }

                // Ctrl+U or Cmd+U for underline
                if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                    e.preventDefault();
                    this.richTextEditor.formatText('underline');
                    return;
                }

                // Ctrl+K or Cmd+K for link
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.richTextEditor.insertLink();
                    return;
                }

                // Ctrl+Shift+X or Cmd+Shift+X for strikethrough
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
                    e.preventDefault();
                    this.richTextEditor.formatText('strikeThrough');
                    return;
                }
            }
        });

        // Setup resizer
        this.setupResizer();
    }

    /**
     * Set up table editor event listeners
     */
    setupTableEditorListeners() {
        // Double-click on table in rich text editor opens table editor
        this.richTextEditorElement.addEventListener('dblclick', (e) => {
            if (this.currentMode !== 'richtext') return;
            const tableEl = e.target.closest('table');
            if (tableEl) {
                e.preventDefault();
                this.tableEditor.editHTMLTable(tableEl);
            }
        });
    }

    openTableGrid(anchorButton) {
        if (this.tableEditor && anchorButton) {
            this.tableEditor.openGridPicker((rows, cols) => {
                this.tableEditor.insertNewTable(rows, cols);
            }, anchorButton);
        } else if (this.richTextEditor) {
            // Fallback to legacy prompt-based insertion if the table editor isn't ready yet
            this.richTextEditor.insertTable();
        }
    }

    schedulePreviewUpdate() {
        // Clear existing timer
        if (this.previewUpdateTimer) {
            clearTimeout(this.previewUpdateTimer);
        }

        // Set new timer for debounced update
        this.previewUpdateTimer = setTimeout(() => {
            this.updatePreview();
        }, CONSTANTS.PREVIEW_UPDATE_DELAY);
    }

    async updatePreview() {
        const markdown = this.editor.value;
        const html = markdownParser.parse(markdown);
        // Sanitize HTML to prevent XSS attacks
        const cleanHtml = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
        this.preview.innerHTML = cleanHtml;

        // Load images from IndexedDB
        await this.loadIndexedImages();
    }

    /**
     * Load images from IndexedDB with lazy loading support
     * Uses Intersection Observer for performance optimization
     * @returns {Promise<void>}
     */
    async loadIndexedImages() {
        // Find all images with IndexedDB references
        const indexedImages = this.preview.querySelectorAll('img[data-image-id]');

        // Use Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            // Disconnect previous observer to prevent memory leak
            if (this._imageObserver) {
                this._imageObserver.disconnect();
            }

            this._imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        await this.loadSingleIndexedImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '100px', // Start loading 100px before image enters viewport
                threshold: 0.01
            });

            indexedImages.forEach(img => {
                // Set placeholder while loading
                img.style.minHeight = '100px';
                img.style.backgroundColor = 'var(--bg-tertiary)';
                this._imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without Intersection Observer
            for (const img of indexedImages) {
                await this.loadSingleIndexedImage(img);
            }
        }
    }

    /**
     * Load a single image from IndexedDB
     * @param {HTMLImageElement} img - The image element to load
     * @returns {Promise<void>}
     */
    async loadSingleIndexedImage(img) {
        const imageId = img.getAttribute('data-image-id');
        try {
            const imageRecord = await imageStorage.getImage(imageId);
            if (imageRecord && imageRecord.data) {
                img.src = imageRecord.data;
                img.style.maxWidth = '100%';
                img.style.minHeight = '';
                img.style.backgroundColor = '';
            } else {
                // Image not found in IndexedDB
                img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50" font-size="12">Image not found</text></svg>';
                img.title = 'Image not found in storage';
                img.style.minHeight = '';
                img.style.backgroundColor = '';
            }
        } catch (error) {
            console.error('Error loading image from IndexedDB:', error);
            img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50" font-size="12">Error loading image</text></svg>';
            img.style.minHeight = '';
            img.style.backgroundColor = '';
        }
    }

    async toggleMode() {
        // Close table editor if open
        if (this.tableEditor && this.tableEditor.isOpen) {
            this.tableEditor.closeEditor(true);
        }

        if (this.currentMode === 'markdown') {
            // Switch to rich text mode
            this.currentMode = 'richtext';

            // Convert markdown to HTML and set in rich text editor
            const markdown = this.editor.value;
            await this.richTextEditor.setContent(markdown);
            if (!this.richTextEditorElement.textContent.trim()) {
                const fallbackHtml = DOMPurify.sanitize(
                    this.preview.innerHTML || markdownParser.parse(markdown),
                    DOMPURIFY_CONFIG
                );
                this.richTextEditorElement.innerHTML = fallbackHtml;
            }

            // Disable syntax highlighting in rich text mode
            if (this.syntaxHighlighter) {
                this.syntaxHighlighter.disable();
            }

            // Toggle visibility
            this.editor.parentNode.style.display = 'none';
            this.richTextEditorElement.style.display = 'block';
            this.richTextToolbar.style.display = 'block';

            // Update UI
            this.modeToggle.innerHTML = '📝 Switch to Markdown';
            this.editorModeLabel.textContent = 'Rich Text Editor';
            this.resetScrollPosition();
            this.richTextEditorElement.focus();

        } else {
            // Switch to markdown mode
            this.currentMode = 'markdown';

            // Convert HTML to markdown and set in textarea
            const markdown = this.richTextEditor.getMarkdown();
            this.editor.value = markdown;

            // Enable syntax highlighting in markdown mode
            if (this.syntaxHighlighter) {
                this.syntaxHighlighter.enable();
                this.syntaxHighlighter.update();
            }

            // Toggle visibility
            this.editor.parentNode.style.display = 'flex';
            this.richTextEditorElement.style.display = 'none';
            this.richTextToolbar.style.display = 'none';

            // Update UI
            this.modeToggle.innerHTML = '📝 Switch to Rich Text';
            this.editorModeLabel.textContent = 'Markdown Editor';

            // Update preview
            await this.updatePreview();
            this.resetScrollPosition();
        }
    }

    handleRichTextInput() {
        // Debounce preview update for rich text as well
        if (this.previewUpdateTimer) {
            clearTimeout(this.previewUpdateTimer);
        }

        this.previewUpdateTimer = setTimeout(async () => {
            // Convert to markdown and update preview
            const markdown = this.richTextEditor.getMarkdown();
            const html = markdownParser.parse(markdown);
            // Sanitize HTML to prevent XSS attacks
            const cleanHtml = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
            this.preview.innerHTML = cleanHtml;

            // Load images from IndexedDB
            await this.loadIndexedImages();
        }, CONSTANTS.PREVIEW_UPDATE_DELAY);

        // Schedule auto-save
        this.scheduleAutoSave();
    }

    setupRichTextToolbar() {
        // Bold, italic, underline, strikethrough
        this.boldBtn.addEventListener('click', () =>
            this.richTextEditor.formatText('bold'));
        this.italicBtn.addEventListener('click', () =>
            this.richTextEditor.formatText('italic'));
        this.underlineBtn.addEventListener('click', () =>
            this.richTextEditor.formatText('underline'));
        this.strikeBtn.addEventListener('click', () =>
            this.richTextEditor.formatText('strikeThrough'));

        // Headings
        this.headingSelect.addEventListener('change', (e) => {
            this.richTextEditor.applyHeading(e.target.value);
            e.target.value = 'p'; // Reset to normal
        });

        // Lists
        this.bulletListBtn.addEventListener('click', () =>
            this.richTextEditor.insertList('ul'));
        this.numberListBtn.addEventListener('click', () =>
            this.richTextEditor.insertList('ol'));
        this.checkListBtn.addEventListener('click', () =>
            this.richTextEditor.insertList('checklist'));

        // Insert elements
        this.linkBtn.addEventListener('click', () =>
            this.richTextEditor.insertLink());
        this.imageBtn.addEventListener('click', () =>
            this.richTextEditor.insertImage());
        this.tableBtn.addEventListener('click', () =>
            this.openTableGrid(this.tableBtn));
        this.codeBlockBtn.addEventListener('click', () =>
            this.richTextEditor.insertCodeBlock());
    }

    scheduleAutoSave() {
        // Clear existing timer
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // Set new timer
        this.autoSaveTimer = setTimeout(() => {
            this.saveContent();
        }, CONSTANTS.AUTO_SAVE_DELAY);

        this.updateSaveStatus('Typing...');
    }

    saveContent() {
        let content;
        if (this.currentMode === 'markdown') {
            content = this.editor.value;
        } else {
            // Save as markdown (converted from rich text)
            content = this.richTextEditor.getMarkdown();
        }

        try {
            localStorage.setItem(CONSTANTS.STORAGE_KEY, content);
            this.updateSaveStatus('Saved');

            // Reset status after configured duration
            setTimeout(() => {
                this.updateSaveStatus('Auto-save enabled');
            }, CONSTANTS.STATUS_DISPLAY_DURATION);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.updateSaveStatus('Save failed');
        }
    }

    loadContent() {
        try {
            const saved = localStorage.getItem(CONSTANTS.STORAGE_KEY);

            if (saved) {
                this.editor.value = saved;
            } else {
                // Load default sample content
                this.editor.value = this.getDefaultContent();
            }

            // Set cursor to the beginning of the textarea to prevent scrolling to the end
            this.editor.setSelectionRange(0, 0);

            // Initialize history with the loaded content
            historyManager.pushState(this.editor.value, true);
            this.updateUndoRedoButtons();
            this.updateWordCount();

            // Update syntax highlighting after content is loaded
            // (deferred to allow DOM to settle)
            setTimeout(() => {
                if (this.syntaxHighlighter) {
                    this.syntaxHighlighter.update();
                }
            }, 0);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.editor.value = this.getDefaultContent();
            // Set cursor to the beginning of the textarea to prevent scrolling to the end
            this.editor.setSelectionRange(0, 0);
            historyManager.pushState(this.editor.value, true);
            this.updateUndoRedoButtons();
            this.updateWordCount();
        }
    }

    getDefaultContent() {
        return `# Welcome to Markdown Editor! 📝

A modern, feature-rich markdown editor with live preview.

## Features

- ✨ **Live Preview** - See your markdown rendered in real-time
- 💾 **Auto-save** - Your work is automatically saved to browser storage
- 🌙 **Dark Mode** - Easy on the eyes with dark theme
- 📥 **Export** - Download as .md or .html
- 📋 **Copy** - Copy markdown or HTML to clipboard
- 🎨 **Syntax Highlighting** - Beautiful code blocks
- 📱 **Responsive** - Works great on mobile too

## Markdown Guide

### Headers
Use \`#\` for headers (h1 through h6)

### Emphasis
- **Bold text** with \`**double asterisks**\`
- *Italic text* with \`*single asterisks*\`
- ~~Strikethrough~~ with \`~~tildes~~\`

### Lists

**Unordered:**
- Item 1
- Item 2
  - Nested item
  - Another nested item

**Ordered:**
1. First item
2. Second item
3. Third item

### Links and Images
- [Link text](https://example.com)
- ![Alt text](https://via.placeholder.com/150)

### Code

Inline code: \`const x = 10;\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Blockquotes
> This is a blockquote.
> It can span multiple lines.

### Tables
| Feature | Supported |
|---------|-----------|
| Tables | ✓ |
| GFM | ✓ |
| Syntax Highlighting | ✓ |

### Task Lists
- [x] Completed task
- [ ] Pending task
- [ ] Another task

---

**Start typing to see your markdown come to life!** 🚀
`;
    }

    resetScrollPosition() {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
        if (this.editor) {
            this.editor.scrollTop = 0;
        }
        if (this.preview) {
            this.preview.scrollTop = 0;
        }
        if (this.richTextEditorElement) {
            this.richTextEditorElement.scrollTop = 0;
        }
    }

    updateSaveStatus(message) {
        this.saveStatus.textContent = message;
    }

    /**
     * Set up the theme picker dropdown
     */
    setupThemePicker() {
        // Toggle dropdown
        this.themePickerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = this.themePickerDropdown.classList.contains('visible');
            this.themePickerDropdown.classList.toggle('visible');
            this.themePickerBtn.setAttribute('aria-expanded', !isOpen);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.themePickerBtn.contains(e.target) && !this.themePickerDropdown.contains(e.target)) {
                this.themePickerDropdown.classList.remove('visible');
                this.themePickerBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Theme option clicks
        const themeOptions = this.themePickerDropdown.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                this.themePickerDropdown.classList.remove('visible');
                this.themePickerBtn.setAttribute('aria-expanded', 'false');
            });

            // Keyboard navigation
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });

        // Keyboard navigation for dropdown
        this.themePickerBtn.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' && this.themePickerDropdown.classList.contains('visible')) {
                e.preventDefault();
                const firstOption = this.themePickerDropdown.querySelector('.theme-option');
                if (firstOption) firstOption.focus();
            }
        });
    }

    /**
     * Set the application theme
     * @param {string} theme - Theme name (light, dark, ocean, forest, sunset, lavender, rose, mint)
     */
    setTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('dark-mode');
        THEMES.forEach(t => {
            if (t !== 'light' && t !== 'dark') {
                document.body.classList.remove(`theme-${t}`);
            }
        });

        // Apply new theme
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (theme !== 'light') {
            document.body.classList.add(`theme-${theme}`);
        }

        this.currentTheme = theme;
        localStorage.setItem(CONSTANTS.THEME_KEY, theme);

        // Update active state in dropdown
        const themeOptions = this.themePickerDropdown.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
    }

    /**
     * Load theme preference from localStorage or system preference
     */
    loadThemePreference() {
        let theme = localStorage.getItem(CONSTANTS.THEME_KEY);

        // Check system preference if no saved preference
        if (!theme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }

        this.setTheme(theme);
    }

    clearEditor() {
        if (confirm('Are you sure you want to clear the editor? This action cannot be undone.')) {
            if (this.currentMode === 'markdown') {
                this.editor.value = '';
                // Update syntax highlighting
                if (this.syntaxHighlighter) {
                    this.syntaxHighlighter.update();
                }
            } else {
                this.richTextEditorElement.innerHTML = '';
            }
            this.updatePreview();
            this.saveContent();

            // Clear history and start fresh
            historyManager.clear();
            historyManager.pushState('', true);
            this.updateUndoRedoButtons();
        }
    }

    async resetToDefault() {
        const currentContent = this.currentMode === 'markdown'
            ? this.editor.value
            : this.richTextEditor.getMarkdown();

        try {
            localStorage.setItem(CONSTANTS.BACKUP_KEY, currentContent);
        } catch (error) {
            console.error('Error caching draft before reset:', error);
        }

        await this.applyContentToEditor(this.getDefaultContent(), true);
        this.updateSaveStatus('Default content restored (draft saved)');
        setTimeout(() => {
            this.updateSaveStatus('Auto-save enabled');
        }, CONSTANTS.STATUS_DISPLAY_DURATION);
    }

    async restoreCachedDraft() {
        const cached = localStorage.getItem(CONSTANTS.BACKUP_KEY);
        if (!cached) {
            alert('No cached draft found to restore.');
            return;
        }

        await this.applyContentToEditor(cached, true);
        this.updateSaveStatus('Draft restored from cache');
        setTimeout(() => {
            this.updateSaveStatus('Auto-save enabled');
        }, CONSTANTS.STATUS_DISPLAY_DURATION);
    }

    async applyContentToEditor(content, resetHistory = false) {
        this.currentMode = 'markdown';
        this.editor.parentNode.style.display = 'flex';
        this.richTextEditorElement.style.display = 'none';
        this.richTextToolbar.style.display = 'none';
        this.modeToggle.innerHTML = '📝 Switch to Rich Text';
        this.editorModeLabel.textContent = 'Markdown Editor';
        this.editor.value = content;

        if (this.syntaxHighlighter) {
            this.syntaxHighlighter.enable();
            this.syntaxHighlighter.update();
        }

        if (resetHistory) {
            historyManager.clear();
            historyManager.pushState(content, true);
        }
        this.updateUndoRedoButtons();

        await this.updatePreview();
        this.updateWordCount();
        this.saveContent();
        this.resetScrollPosition();
    }

    async undo() {
        const previousState = historyManager.undo();
        if (previousState !== null) {
            this.isApplyingHistoryState = true;

            if (this.currentMode === 'markdown') {
                this.editor.value = previousState;
                await this.updatePreview();
                // Update syntax highlighting
                if (this.syntaxHighlighter) {
                    this.syntaxHighlighter.update();
                }
            } else {
                // In rich text mode, we need to update the rich text editor
                const html = markdownParser.parse(previousState);
                this.richTextEditorElement.innerHTML = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
            }

            this.updateUndoRedoButtons();
            this.isApplyingHistoryState = false;
        }
    }

    async redo() {
        const nextState = historyManager.redo();
        if (nextState !== null) {
            this.isApplyingHistoryState = true;

            if (this.currentMode === 'markdown') {
                this.editor.value = nextState;
                await this.updatePreview();
                // Update syntax highlighting
                if (this.syntaxHighlighter) {
                    this.syntaxHighlighter.update();
                }
            } else {
                // In rich text mode, we need to update the rich text editor
                const html = markdownParser.parse(nextState);
                this.richTextEditorElement.innerHTML = DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
            }

            this.updateUndoRedoButtons();
            this.isApplyingHistoryState = false;
        }
    }

    updateUndoRedoButtons() {
        // Update button states based on history availability
        this.undoBtn.disabled = !historyManager.canUndo();
        this.redoBtn.disabled = !historyManager.canRedo();
    }

    updateWordCount() {
        // Get current content
        let content;
        if (this.currentMode === 'markdown') {
            content = this.editor.value;
        } else {
            content = this.richTextEditor.getMarkdown();
        }

        // Calculate stats
        const stats = this.calculateTextStats(content);

        // Update display
        this.wordCount.textContent = `${stats.words} words • ${stats.characters} characters • ${stats.readTime} min read`;
    }

    calculateTextStats(text) {
        // Remove markdown syntax for more accurate word count
        const cleanText = text
            // Remove code blocks
            .replace(/```[\s\S]*?```/g, '')
            // Remove inline code
            .replace(/`[^`]+`/g, '')
            // Remove links but keep text
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Remove images
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
            // Remove headers
            .replace(/^#{1,6}\s+/gm, '')
            // Remove bold/italic
            .replace(/[*_]{1,3}/g, '')
            // Remove strikethrough
            .replace(/~~(.+?)~~/g, '$1')
            // Remove blockquotes
            .replace(/^>\s+/gm, '')
            // Remove list markers
            .replace(/^[-*+]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '')
            // Remove horizontal rules
            .replace(/^[-*_]{3,}$/gm, '')
            .trim();

        // Count words (split by whitespace)
        const words = cleanText.length > 0
            ? cleanText.split(/\s+/).filter(word => word.length > 0).length
            : 0;

        // Count characters (excluding whitespace)
        const characters = cleanText.replace(/\s/g, '').length;

        // Calculate read time (average 200 words per minute)
        const readTime = Math.ceil(words / 200) || 0;

        return {
            words,
            characters,
            readTime
        };
    }

    importMarkdown() {
        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.md,.markdown,.txt';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();

                // Confirm if editor has content
                const currentContent = this.currentMode === 'markdown'
                    ? this.editor.value
                    : this.richTextEditor.getMarkdown();

                if (currentContent.trim() && !confirm('This will replace your current content. Continue?')) {
                    return;
                }

                // Import the content
                if (this.currentMode === 'markdown') {
                    this.editor.value = text;
                } else {
                    // Switch to markdown mode for import
                    this.currentMode = 'markdown';
                    this.editor.value = text;
                    this.editor.style.display = 'block';
                    this.richTextEditorElement.style.display = 'none';
                    this.richTextToolbar.style.display = 'none';
                    this.modeToggle.innerHTML = '📝 Switch to Rich Text';
                    this.editorModeLabel.textContent = 'Markdown Editor';
                }

                // Update preview and save
                await this.updatePreview();
                this.saveContent();

                // Add to history
                historyManager.pushState(text, true);
                this.updateUndoRedoButtons();

                // Update syntax highlighting
                if (this.syntaxHighlighter) {
                    this.syntaxHighlighter.update();
                }

                this.updateSaveStatus('File imported');
                setTimeout(() => {
                    this.updateSaveStatus('Auto-save enabled');
                }, CONSTANTS.STATUS_DISPLAY_DURATION);

            } catch (error) {
                console.error('Error importing file:', error);
                alert('Failed to import file. Please try again.');
            }
        };

        // Trigger file picker
        input.click();
    }

    downloadMarkdown() {
        let content;
        if (this.currentMode === 'markdown') {
            content = this.editor.value;
        } else {
            content = this.richTextEditor.getMarkdown();
        }
        const blob = new Blob([content], { type: 'text/markdown' });
        this.downloadFile(blob, 'document.md');
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async copyMarkdown() {
        let content;
        if (this.currentMode === 'markdown') {
            content = this.editor.value;
        } else {
            content = this.richTextEditor.getMarkdown();
        }
        try {
            await navigator.clipboard.writeText(content);
            this.showCopySuccess('Markdown copied!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showCopyError();
        }
    }

    async copyHtml() {
        let markdown;
        if (this.currentMode === 'markdown') {
            markdown = this.editor.value;
        } else {
            markdown = this.richTextEditor.getMarkdown();
        }
        try {
            const html = markdownParser.parse(markdown);
            await navigator.clipboard.writeText(html);
            this.showCopySuccess('HTML copied!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showCopyError();
        }
    }

    showCopySuccess(message) {
        const originalStatus = this.saveStatus.textContent;
        this.updateSaveStatus(message);
        setTimeout(() => {
            this.updateSaveStatus(originalStatus);
        }, CONSTANTS.STATUS_DISPLAY_DURATION);
    }

    showCopyError() {
        alert('Failed to copy to clipboard. Please try again.');
    }

    setupResizer() {
        const resizer = document.querySelector('.resizer');
        const editorPane = document.querySelector('.editor-pane');
        const previewPane = document.querySelector('.preview-pane');
        const container = document.querySelector('.main-content');

        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const offsetX = e.clientX - containerRect.left;
            const percentage = (offsetX / containerRect.width) * 100;

            // Limit between configured min and max percentages
            if (percentage > CONSTANTS.RESIZER_MIN_PERCENT && percentage < CONSTANTS.RESIZER_MAX_PERCENT) {
                editorPane.style.flex = `0 0 ${percentage}%`;
                previewPane.style.flex = `0 0 ${100 - percentage}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
            }
        });
    }

    toggleEditorFullscreen() {
        this.container.classList.toggle('editor-fullscreen');

        if (this.container.classList.contains('editor-fullscreen')) {
            this.editorFullscreenBtn.textContent = '✕'; // Exit fullscreen icon
            this.editorFullscreenBtn.title = 'Exit fullscreen';
        } else {
            this.editorFullscreenBtn.textContent = '⛶'; // Fullscreen icon
            this.editorFullscreenBtn.title = 'Toggle editor fullscreen';
        }
    }

    togglePreviewFullscreen() {
        this.container.classList.toggle('preview-fullscreen');

        if (this.container.classList.contains('preview-fullscreen')) {
            this.previewFullscreenBtn.textContent = '✕'; // Exit fullscreen icon
            this.previewFullscreenBtn.title = 'Exit fullscreen';
        } else {
            this.previewFullscreenBtn.textContent = '⛶'; // Fullscreen icon
            this.previewFullscreenBtn.title = 'Toggle preview fullscreen';
        }
    }
}

// Initialize the app when DOM is ready
let deferredInstallPrompt = null;

document.addEventListener('DOMContentLoaded', () => {
    new MarkdownEditor();

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content available, show update notification
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    }

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        showInstallButton();
    });
});

/**
 * Show update notification when new service worker is available
 */
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <span>✨ New version available!</span>
        <button onclick="window.location.reload()">Update</button>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    document.body.appendChild(notification);
}

/**
 * Show install button when PWA can be installed
 * @param {Event} deferredPrompt - The beforeinstallprompt event
 */
function showInstallButton() {
    // Create install button in header
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) {
        return;
    }
    const existingButtons = document.querySelectorAll('#installBtn');
    if (existingButtons.length > 0) {
        // Clean up any duplicates created by older versions.
        for (let i = 1; i < existingButtons.length; i++) {
            existingButtons[i].remove();
        }
        return;
    }

    const installBtn = document.createElement('button');
    installBtn.id = 'installBtn';
    installBtn.className = 'btn btn-icon install-btn';
    installBtn.title = 'Install App';
    installBtn.innerHTML = '📲 Install';

    installBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            return;
        }
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
            installBtn.remove();
        }

        deferredInstallPrompt = null;
    });

    // Insert at the beginning
    headerActions.insertBefore(installBtn, headerActions.firstChild);
}
