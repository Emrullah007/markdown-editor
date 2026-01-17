/**
 * Markdown Syntax Highlighter
 * Provides real-time syntax highlighting for markdown content in a textarea
 * Uses an overlay technique with a backdrop div for highlighting
 * @module SyntaxHighlighter
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * @class SyntaxHighlighter
 * Handles markdown syntax highlighting in the editor textarea
 */
class SyntaxHighlighter {
    /**
     * Create a SyntaxHighlighter instance
     * @param {HTMLTextAreaElement} textarea - The textarea element to enhance
     * @param {Object} options - Configuration options
     */
    constructor(textarea, options = {}) {
        this.textarea = textarea;
        this.options = {
            enabled: true,
            ...options
        };
        
        this.backdrop = null;
        this.highlightLayer = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the syntax highlighter
     * Creates the backdrop element and sets up event listeners
     */
    init() {
        if (this.isInitialized) return;
        
        this.createBackdrop();
        this.setupEventListeners();
        this.syncStyles();
        this.highlight();
        
        this.isInitialized = true;
    }

    /**
     * Create the backdrop div that displays highlighted content
     */
    createBackdrop() {
        // Create container wrapper
        const container = document.createElement('div');
        container.className = 'syntax-highlight-container';
        
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'syntax-highlight-backdrop';
        
        // Create highlight layer
        this.highlightLayer = document.createElement('div');
        this.highlightLayer.className = 'syntax-highlight-layer';
        
        this.backdrop.appendChild(this.highlightLayer);
        
        // Wrap the textarea
        this.textarea.parentNode.insertBefore(container, this.textarea);
        container.appendChild(this.backdrop);
        container.appendChild(this.textarea);
        
        // Add class to textarea
        this.textarea.classList.add('syntax-highlight-textarea');
    }

    /**
     * Set up event listeners for input, scroll, and resize
     */
    setupEventListeners() {
        // Update highlight on input
        this.textarea.addEventListener('input', () => {
            this.highlight();
        });
        
        // Sync scroll position
        this.textarea.addEventListener('scroll', () => {
            this.syncScroll();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.syncStyles();
        });
        
        // Handle focus states
        this.textarea.addEventListener('focus', () => {
            this.backdrop.classList.add('focused');
        });
        
        this.textarea.addEventListener('blur', () => {
            this.backdrop.classList.remove('focused');
        });
    }

    /**
     * Sync CSS styles between textarea and backdrop
     */
    syncStyles() {
        const styles = window.getComputedStyle(this.textarea);
        
        // Copy relevant styles
        const stylesToCopy = [
            'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
            'letterSpacing', 'wordSpacing', 'padding', 'paddingTop',
            'paddingRight', 'paddingBottom', 'paddingLeft',
            'borderWidth', 'borderStyle', 'boxSizing'
        ];
        
        stylesToCopy.forEach(prop => {
            this.highlightLayer.style[prop] = styles[prop];
        });
        
        // Set dimensions
        this.backdrop.style.width = this.textarea.offsetWidth + 'px';
        this.backdrop.style.height = this.textarea.offsetHeight + 'px';
    }

    /**
     * Sync scroll position between textarea and backdrop
     */
    syncScroll() {
        this.backdrop.scrollTop = this.textarea.scrollTop;
        this.backdrop.scrollLeft = this.textarea.scrollLeft;
    }

    /**
     * Main highlighting function
     * Parses the markdown and applies syntax highlighting
     */
    highlight() {
        if (!this.options.enabled) {
            this.highlightLayer.innerHTML = this.escapeHtml(this.textarea.value);
            return;
        }
        
        const text = this.textarea.value;
        const highlighted = this.highlightMarkdown(text);
        this.highlightLayer.innerHTML = highlighted + '\n'; // Extra newline for scrolling
        
        this.syncScroll();
    }

    /**
     * Apply markdown syntax highlighting to text
     * @param {string} text - The markdown text to highlight
     * @returns {string} HTML with syntax highlighting spans
     */
    highlightMarkdown(text) {
        // Escape HTML first
        let result = this.escapeHtml(text);
        
        // Process line by line for block elements
        const lines = result.split('\n');
        const highlightedLines = lines.map((line, index) => {
            return this.highlightLine(line, index, lines);
        });
        
        result = highlightedLines.join('\n');
        
        // Inline elements (process after line-level)
        result = this.highlightInlineElements(result);
        
        return result;
    }

    /**
     * Highlight a single line of markdown
     * @param {string} line - The line to highlight
     * @param {number} index - Line index
     * @param {string[]} allLines - All lines for context
     * @returns {string} Highlighted line
     */
    highlightLine(line, index, allLines) {
        // Code block detection (fenced)
        if (line.match(/^```/)) {
            const lang = line.slice(3).trim();
            if (lang) {
                return `<span class="sh-code-fence">\`\`\`</span><span class="sh-code-lang">${lang}</span>`;
            }
            return `<span class="sh-code-fence">${line}</span>`;
        }
        
        // Check if we're inside a code block
        if (this.isInsideCodeBlock(index, allLines)) {
            return `<span class="sh-code-content">${line}</span>`;
        }
        
        // Headers
        const headerMatch = line.match(/^(#{1,6})\s(.*)$/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            return `<span class="sh-header sh-h${level}"><span class="sh-header-marker">${headerMatch[1]}</span> <span class="sh-header-text">${headerMatch[2]}</span></span>`;
        }
        
        // Blockquotes
        if (line.match(/^>\s/)) {
            return `<span class="sh-blockquote"><span class="sh-blockquote-marker">&gt;</span>${line.slice(1)}</span>`;
        }
        
        // Unordered lists
        const ulMatch = line.match(/^(\s*)([-*+])\s(.*)$/);
        if (ulMatch) {
            return `${ulMatch[1]}<span class="sh-list-marker">${ulMatch[2]}</span> ${ulMatch[3]}`;
        }
        
        // Ordered lists
        const olMatch = line.match(/^(\s*)(\d+\.)\s(.*)$/);
        if (olMatch) {
            return `${olMatch[1]}<span class="sh-list-marker">${olMatch[2]}</span> ${olMatch[3]}`;
        }
        
        // Task lists
        const taskMatch = line.match(/^(\s*[-*+])\s\[([ xX])\]\s(.*)$/);
        if (taskMatch) {
            const checked = taskMatch[2].toLowerCase() === 'x';
            return `<span class="sh-list-marker">${taskMatch[1]}</span> <span class="sh-task-checkbox ${checked ? 'sh-checked' : ''}">[${taskMatch[2]}]</span> ${taskMatch[3]}`;
        }
        
        // Horizontal rules
        if (line.match(/^([-*_]){3,}\s*$/)) {
            return `<span class="sh-hr">${line}</span>`;
        }
        
        // Table rows
        if (line.match(/^\|.*\|$/)) {
            return this.highlightTableRow(line);
        }
        
        return line;
    }

    /**
     * Check if a line index is inside a code block
     * @param {number} index - Current line index
     * @param {string[]} lines - All lines
     * @returns {boolean} True if inside code block
     */
    isInsideCodeBlock(index, lines) {
        let insideBlock = false;
        for (let i = 0; i < index; i++) {
            if (lines[i].match(/^```/)) {
                insideBlock = !insideBlock;
            }
        }
        return insideBlock;
    }

    /**
     * Highlight a table row
     * @param {string} line - Table row line
     * @returns {string} Highlighted table row
     */
    highlightTableRow(line) {
        // Check if it's a separator row
        if (line.match(/^\|[\s\-:|]+\|$/)) {
            return `<span class="sh-table-separator">${line}</span>`;
        }
        
        // Regular table row
        return line.replace(/\|/g, '<span class="sh-table-pipe">|</span>');
    }

    /**
     * Highlight inline markdown elements
     * @param {string} text - Text to process
     * @returns {string} Text with inline elements highlighted
     */
    highlightInlineElements(text) {
        // Bold (** or __)
        text = text.replace(
            /(\*\*|__)(?!\s)([^*_]+?)(?<!\s)\1/g,
            '<span class="sh-bold"><span class="sh-marker">$1</span><span class="sh-bold-text">$2</span><span class="sh-marker">$1</span></span>'
        );
        
        // Italic (* or _) - must not be inside bold
        text = text.replace(
            /(?<!\*|_)(\*|_)(?!\s|\*|_)([^*_]+?)(?<!\s)\1(?!\*|_)/g,
            '<span class="sh-italic"><span class="sh-marker">$1</span><span class="sh-italic-text">$2</span><span class="sh-marker">$1</span></span>'
        );
        
        // Strikethrough
        text = text.replace(
            /(~~)([^~]+?)\1/g,
            '<span class="sh-strikethrough"><span class="sh-marker">$1</span><span class="sh-strike-text">$2</span><span class="sh-marker">$1</span></span>'
        );
        
        // Inline code
        text = text.replace(
            /(`+)([^`]+?)\1/g,
            '<span class="sh-inline-code"><span class="sh-code-marker">$1</span><span class="sh-code-text">$2</span><span class="sh-code-marker">$1</span></span>'
        );
        
        // Links [text](url)
        text = text.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<span class="sh-link"><span class="sh-link-bracket">[</span><span class="sh-link-text">$1</span><span class="sh-link-bracket">]</span><span class="sh-link-paren">(</span><span class="sh-link-url">$2</span><span class="sh-link-paren">)</span></span>'
        );
        
        // Images ![alt](url)
        text = text.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            '<span class="sh-image"><span class="sh-image-marker">!</span><span class="sh-link-bracket">[</span><span class="sh-image-alt">$1</span><span class="sh-link-bracket">]</span><span class="sh-link-paren">(</span><span class="sh-image-url">$2</span><span class="sh-link-paren">)</span></span>'
        );
        
        return text;
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Enable syntax highlighting
     */
    enable() {
        this.options.enabled = true;
        this.textarea.classList.add('syntax-highlight-textarea');
        this.backdrop.style.display = 'block';
        this.highlight();
    }

    /**
     * Disable syntax highlighting
     */
    disable() {
        this.options.enabled = false;
        this.textarea.classList.remove('syntax-highlight-textarea');
        this.backdrop.style.display = 'none';
    }

    /**
     * Toggle syntax highlighting on/off
     * @returns {boolean} New enabled state
     */
    toggle() {
        if (this.options.enabled) {
            this.disable();
        } else {
            this.enable();
        }
        return this.options.enabled;
    }

    /**
     * Check if syntax highlighting is enabled
     * @returns {boolean} Enabled state
     */
    isEnabled() {
        return this.options.enabled;
    }

    /**
     * Update highlighting (call after external content changes)
     */
    update() {
        this.syncStyles();
        this.highlight();
    }

    /**
     * Destroy the syntax highlighter and clean up
     */
    destroy() {
        if (!this.isInitialized) return;
        
        const container = this.textarea.parentNode;
        if (container && container.classList.contains('syntax-highlight-container')) {
            container.parentNode.insertBefore(this.textarea, container);
            container.remove();
        }
        
        this.textarea.classList.remove('syntax-highlight-textarea');
        this.isInitialized = false;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SyntaxHighlighter;
}
