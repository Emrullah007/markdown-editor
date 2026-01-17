/**
 * Auto-pair Module
 * Automatically closes brackets, quotes, and markdown syntax
 * @module AutoPair
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * @class AutoPair
 * Handles automatic pairing of brackets, quotes, and markdown syntax
 */
class AutoPair {
    /**
     * Create an AutoPair instance
     * @param {HTMLTextAreaElement} textarea - The textarea to enhance
     * @param {Object} options - Configuration options
     */
    constructor(textarea, options = {}) {
        this.textarea = textarea;
        this.enabled = true;
        
        // Default pair mappings
        this.pairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '<': '>',
            '"': '"',
            "'": "'",
            '`': '`',
            '*': '*',
            '_': '_',
            '~': '~'
        };
        
        // Markdown-specific pairs (double characters)
        this.markdownPairs = {
            '**': '**',  // Bold
            '__': '__',  // Bold alt
            '~~': '~~',  // Strikethrough
            '``': '``',  // Code
        };
        
        // Characters that should wrap selected text
        this.wrapChars = ['(', '[', '{', '"', "'", '`', '*', '_', '~', '<'];
        
        // Characters that can be skipped over
        this.skipChars = [')', ']', '}', '>', '"', "'", '`', '*', '_', '~'];
        
        this.options = {
            autoPairBrackets: true,
            autoPairQuotes: true,
            autoPairMarkdown: true,
            wrapSelection: true,
            ...options
        };
        
        this.init();
    }

    /**
     * Initialize auto-pair functionality
     */
    init() {
        this.textarea.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * Handle keydown events
     * @param {KeyboardEvent} e - The keyboard event
     */
    handleKeyDown(e) {
        if (!this.enabled) return;
        
        const key = e.key;
        const { selectionStart, selectionEnd, value } = this.textarea;
        const hasSelection = selectionStart !== selectionEnd;
        
        // Handle backspace - delete pair if cursor is between pair
        if (key === 'Backspace') {
            if (this.handleBackspace(e, selectionStart, value)) return;
        }
        
        // Handle Tab for markdown code blocks
        if (key === 'Tab' && !e.shiftKey) {
            // Let default behavior for most cases
        }
        
        // Handle Enter in code blocks
        if (key === 'Enter') {
            if (this.handleEnter(e, selectionStart, value)) return;
        }
        
        // Check for skip-over behavior (typing closing char when cursor is before it)
        if (this.skipChars.includes(key)) {
            const charAfter = value[selectionStart];
            if (charAfter === key && !hasSelection) {
                e.preventDefault();
                this.moveCursor(selectionStart + 1);
                return;
            }
        }
        
        // Handle wrap selection
        if (hasSelection && this.options.wrapSelection && this.wrapChars.includes(key)) {
            e.preventDefault();
            this.wrapSelection(key, this.pairs[key] || key);
            return;
        }
        
        // Auto-pair single characters
        if (this.pairs[key] && !hasSelection) {
            const charBefore = value[selectionStart - 1];
            const charAfter = value[selectionStart];
            
            // Don't auto-pair if character after is alphanumeric
            if (charAfter && /\w/.test(charAfter)) return;
            
            // Handle quotes - don't pair if preceded by alphanumeric
            if ((key === '"' || key === "'" || key === '`') && charBefore && /\w/.test(charBefore)) {
                return;
            }
            
            // Handle brackets
            if (this.options.autoPairBrackets && '([{<'.includes(key)) {
                e.preventDefault();
                this.insertPair(key, this.pairs[key]);
                return;
            }
            
            // Handle quotes
            if (this.options.autoPairQuotes && '"\'\`'.includes(key)) {
                e.preventDefault();
                this.insertPair(key, this.pairs[key]);
                return;
            }
            
            // Handle markdown syntax
            if (this.options.autoPairMarkdown && '*_~'.includes(key)) {
                // Check if we're creating a double pair (for bold/strikethrough)
                if (charBefore === key) {
                    // Already have one, let user complete the pair manually
                    return;
                }
                e.preventDefault();
                this.insertPair(key, this.pairs[key]);
                return;
            }
        }
    }

    /**
     * Handle backspace to delete pairs
     * @param {KeyboardEvent} e - The keyboard event
     * @param {number} pos - Current cursor position
     * @param {string} value - Textarea value
     * @returns {boolean} Whether the event was handled
     */
    handleBackspace(e, pos, value) {
        if (pos === 0) return false;
        
        const charBefore = value[pos - 1];
        const charAfter = value[pos];
        
        // Check if we're between a pair
        if (this.pairs[charBefore] === charAfter) {
            e.preventDefault();
            
            // Delete both characters
            const newValue = value.substring(0, pos - 1) + value.substring(pos + 1);
            this.textarea.value = newValue;
            this.moveCursor(pos - 1);
            this.triggerInput();
            return true;
        }
        
        // Check for double-character pairs (**, __, ~~)
        if (pos >= 2) {
            const twoBefore = value.substring(pos - 2, pos);
            const twoAfter = value.substring(pos, pos + 2);
            
            if (this.markdownPairs[twoBefore] === twoAfter) {
                e.preventDefault();
                
                // Delete all four characters
                const newValue = value.substring(0, pos - 2) + value.substring(pos + 2);
                this.textarea.value = newValue;
                this.moveCursor(pos - 2);
                this.triggerInput();
                return true;
            }
        }
        
        return false;
    }

    /**
     * Handle Enter key in special contexts
     * @param {KeyboardEvent} e - The keyboard event
     * @param {number} pos - Current cursor position
     * @param {string} value - Textarea value
     * @returns {boolean} Whether the event was handled
     */
    handleEnter(e, pos, value) {
        const charBefore = value[pos - 1];
        const charAfter = value[pos];
        
        // Check if we're between braces/brackets
        if ((charBefore === '{' && charAfter === '}') ||
            (charBefore === '[' && charAfter === ']') ||
            (charBefore === '(' && charAfter === ')')) {
            e.preventDefault();
            
            // Get current line's indentation
            const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
            const currentLine = value.substring(lineStart, pos);
            const indent = currentLine.match(/^\s*/)[0];
            
            // Insert new lines with proper indentation
            const insert = '\n' + indent + '    \n' + indent;
            const newValue = value.substring(0, pos) + insert + value.substring(pos);
            this.textarea.value = newValue;
            
            // Position cursor on the middle line
            this.moveCursor(pos + indent.length + 5);
            this.triggerInput();
            return true;
        }
        
        return false;
    }

    /**
     * Insert a character pair at cursor position
     * @param {string} open - Opening character
     * @param {string} close - Closing character
     */
    insertPair(open, close) {
        const { selectionStart, value } = this.textarea;
        
        const newValue = value.substring(0, selectionStart) + open + close + value.substring(selectionStart);
        this.textarea.value = newValue;
        
        // Position cursor between the pair
        this.moveCursor(selectionStart + open.length);
        this.triggerInput();
    }

    /**
     * Wrap selected text with characters
     * @param {string} open - Opening character(s)
     * @param {string} close - Closing character(s)
     */
    wrapSelection(open, close) {
        const { selectionStart, selectionEnd, value } = this.textarea;
        const selectedText = value.substring(selectionStart, selectionEnd);
        
        const newValue = value.substring(0, selectionStart) + 
                        open + selectedText + close + 
                        value.substring(selectionEnd);
        
        this.textarea.value = newValue;
        
        // Keep selection on the wrapped text
        this.textarea.selectionStart = selectionStart + open.length;
        this.textarea.selectionEnd = selectionEnd + open.length;
        this.triggerInput();
    }

    /**
     * Move cursor to position
     * @param {number} pos - New cursor position
     */
    moveCursor(pos) {
        this.textarea.selectionStart = pos;
        this.textarea.selectionEnd = pos;
    }

    /**
     * Trigger input event for other listeners
     */
    triggerInput() {
        this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /**
     * Enable auto-pair functionality
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable auto-pair functionality
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Toggle auto-pair functionality
     * @returns {boolean} New enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Check if auto-pair is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Update options
     * @param {Object} newOptions - New options to merge
     */
    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AutoPair;
}
