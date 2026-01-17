/**
 * Focus Mode Module
 * Provides distraction-free writing by dimming content except the current paragraph
 * @module FocusMode
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * @class FocusMode
 * Handles focus mode functionality for the editor
 */
class FocusMode {
    /**
     * Create a FocusMode instance
     * @param {MarkdownEditor} editor - The main editor instance
     */
    constructor(editor) {
        this.editor = editor;
        this.enabled = false;
        this.focusType = 'paragraph'; // 'paragraph', 'sentence', 'line'
        this.dimOpacity = 0.3;
        
        this.init();
    }

    /**
     * Initialize focus mode
     */
    init() {
        this.createToggleButton();
        this.setupEventListeners();
    }

    /**
     * Create the focus mode toggle button in the header
     */
    createToggleButton() {
        const headerActions = document.querySelector('.header-actions');
        
        // Create focus mode button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'focusModeBtn';
        this.toggleBtn.className = 'btn btn-icon';
        this.toggleBtn.title = 'Toggle Focus Mode';
        this.toggleBtn.setAttribute('aria-label', 'Toggle focus mode for distraction-free writing');
        this.toggleBtn.innerHTML = '👁️';
        
        // Insert before theme picker
        const themePicker = headerActions.querySelector('.theme-picker');
        headerActions.insertBefore(this.toggleBtn, themePicker);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle button click
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });

        // Keyboard shortcut (Ctrl+Shift+F)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Update focus on cursor movement in markdown mode
        const markdownEditor = this.editor.editor;
        markdownEditor.addEventListener('click', () => this.updateFocus());
        markdownEditor.addEventListener('keyup', (e) => {
            // Update on arrow keys and other navigation
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
                this.updateFocus();
            }
        });
        markdownEditor.addEventListener('input', () => this.updateFocus());

        // Update focus on cursor movement in rich text mode
        const richTextEditor = this.editor.richTextEditorElement;
        richTextEditor.addEventListener('click', () => this.updateFocusRichText());
        richTextEditor.addEventListener('keyup', () => this.updateFocusRichText());
        richTextEditor.addEventListener('input', () => this.updateFocusRichText());
    }

    /**
     * Toggle focus mode on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        document.body.classList.toggle('focus-mode', this.enabled);
        
        // Update button appearance
        this.toggleBtn.classList.toggle('active', this.enabled);
        this.toggleBtn.innerHTML = this.enabled ? '👁️‍🗨️' : '👁️';
        this.toggleBtn.title = this.enabled ? 'Exit Focus Mode (Ctrl+Shift+F)' : 'Focus Mode (Ctrl+Shift+F)';
        
        if (this.enabled) {
            this.updateFocus();
            this.updateFocusRichText();
        } else {
            this.clearFocus();
        }
        
        // Save preference
        localStorage.setItem('markdown-editor-focus-mode', this.enabled);
    }

    /**
     * Enable focus mode
     */
    enable() {
        if (!this.enabled) {
            this.toggle();
        }
    }

    /**
     * Disable focus mode
     */
    disable() {
        if (this.enabled) {
            this.toggle();
        }
    }

    /**
     * Check if focus mode is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Update focus highlighting in markdown editor
     */
    updateFocus() {
        if (!this.enabled || this.editor.currentMode !== 'markdown') return;

        const textarea = this.editor.editor;
        const text = textarea.value;
        const cursorPos = textarea.selectionStart;

        // Find current paragraph boundaries
        const { start, end } = this.getCurrentParagraphBounds(text, cursorPos);

        // Update the syntax highlighter to show focus
        if (this.editor.syntaxHighlighter) {
            this.applyFocusToHighlighter(text, start, end);
        }
    }

    /**
     * Get the bounds of the current paragraph
     * @param {string} text - Full text content
     * @param {number} cursorPos - Current cursor position
     * @returns {{start: number, end: number}}
     */
    getCurrentParagraphBounds(text, cursorPos) {
        // Find start of paragraph (previous double newline or start of text)
        let start = cursorPos;
        while (start > 0) {
            if (text[start - 1] === '\n' && (start < 2 || text[start - 2] === '\n')) {
                break;
            }
            // Also break on single newline followed by special chars (headers, lists, etc.)
            if (start > 0 && text[start - 1] === '\n') {
                const nextChar = text[start];
                if (nextChar === '#' || nextChar === '-' || nextChar === '*' || nextChar === '>' || nextChar === '`' || /^\d/.test(text.slice(start))) {
                    break;
                }
            }
            start--;
        }

        // Find end of paragraph (next double newline or end of text)
        let end = cursorPos;
        while (end < text.length) {
            if (text[end] === '\n') {
                // Check if next line is blank or starts with special char
                const nextLineStart = end + 1;
                if (nextLineStart >= text.length || text[nextLineStart] === '\n') {
                    break;
                }
                const nextChar = text[nextLineStart];
                if (nextChar === '#' || nextChar === '-' || nextChar === '*' || nextChar === '>' || nextChar === '`' || /^\d/.test(text.slice(nextLineStart))) {
                    break;
                }
            }
            end++;
        }

        return { start, end };
    }

    /**
     * Apply focus effect to the syntax highlighter
     * @param {string} text - Full text
     * @param {number} focusStart - Start of focused region
     * @param {number} focusEnd - End of focused region
     */
    applyFocusToHighlighter(text, focusStart, focusEnd) {
        const highlighter = this.editor.syntaxHighlighter;
        if (!highlighter || !highlighter.highlightLayer) return;

        // Get current highlighted content and wrap unfocused parts
        const beforeFocus = text.substring(0, focusStart);
        const focused = text.substring(focusStart, focusEnd);
        const afterFocus = text.substring(focusEnd);

        // Reconstruct with focus classes
        let html = '';
        
        if (beforeFocus) {
            html += `<span class="focus-dimmed">${highlighter.highlightMarkdown(beforeFocus)}</span>`;
        }
        
        html += `<span class="focus-active">${highlighter.highlightMarkdown(focused)}</span>`;
        
        if (afterFocus) {
            html += `<span class="focus-dimmed">${highlighter.highlightMarkdown(afterFocus)}</span>`;
        }

        highlighter.highlightLayer.innerHTML = html + '\n';
    }

    /**
     * Update focus highlighting in rich text editor
     */
    updateFocusRichText() {
        if (!this.enabled || this.editor.currentMode !== 'richtext') return;

        const editor = this.editor.richTextEditorElement;
        
        // Remove previous focus highlights
        editor.querySelectorAll('.focus-paragraph').forEach(el => {
            el.classList.remove('focus-paragraph');
        });
        editor.querySelectorAll('.focus-dimmed-rt').forEach(el => {
            el.classList.remove('focus-dimmed-rt');
        });

        // Get current selection
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        let currentNode = range.startContainer;

        // Find the paragraph-level element
        while (currentNode && currentNode !== editor) {
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const tagName = currentNode.tagName.toLowerCase();
                if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote', 'pre'].includes(tagName)) {
                    currentNode.classList.add('focus-paragraph');
                    break;
                }
            }
            currentNode = currentNode.parentNode;
        }

        // Dim other paragraphs
        const allBlocks = editor.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote, pre');
        allBlocks.forEach(block => {
            if (!block.classList.contains('focus-paragraph')) {
                block.classList.add('focus-dimmed-rt');
            }
        });
    }

    /**
     * Clear all focus highlighting
     */
    clearFocus() {
        // Clear markdown focus
        if (this.editor.syntaxHighlighter) {
            this.editor.syntaxHighlighter.update();
        }

        // Clear rich text focus
        const editor = this.editor.richTextEditorElement;
        editor.querySelectorAll('.focus-paragraph').forEach(el => {
            el.classList.remove('focus-paragraph');
        });
        editor.querySelectorAll('.focus-dimmed-rt').forEach(el => {
            el.classList.remove('focus-dimmed-rt');
        });
    }

    /**
     * Load saved focus mode preference
     */
    loadPreference() {
        const saved = localStorage.getItem('markdown-editor-focus-mode');
        if (saved === 'true') {
            this.toggle();
        }
    }

    /**
     * Set focus type
     * @param {string} type - 'paragraph', 'sentence', or 'line'
     */
    setFocusType(type) {
        this.focusType = type;
        if (this.enabled) {
            this.updateFocus();
            this.updateFocusRichText();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FocusMode;
}
