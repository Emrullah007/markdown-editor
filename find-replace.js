/**
 * Find & Replace Module
 * Provides find and replace functionality for the markdown editor
 * @module FindReplace
 */

/**
 * Class representing the Find & Replace functionality
 */
class FindReplace {
    /**
     * Create a FindReplace instance
     * @param {MarkdownEditor} editorInstance - Reference to the main editor instance
     */
    constructor(editorInstance) {
        /** @type {MarkdownEditor} Reference to the main editor */
        this.editorInstance = editorInstance;
        
        /** @type {HTMLElement} The find/replace dialog element */
        this.dialog = null;
        
        /** @type {HTMLInputElement} The find input field */
        this.findInput = null;
        
        /** @type {HTMLInputElement} The replace input field */
        this.replaceInput = null;
        
        /** @type {HTMLElement} Element showing match count */
        this.matchCount = null;
        
        /** @type {Array<{start: number, end: number}>} Array of match positions */
        this.matches = [];
        
        /** @type {number} Current match index */
        this.currentMatchIndex = -1;
        
        /** @type {boolean} Whether search is case sensitive */
        this.caseSensitive = false;
        
        /** @type {boolean} Whether to use regex search */
        this.useRegex = false;
        
        /** @type {boolean} Whether to match whole words only */
        this.wholeWord = false;
        
        this.init();
    }

    /**
     * Initialize the find/replace dialog
     */
    init() {
        this.createDialog();
        this.setupKeyboardShortcuts();
    }

    /**
     * Create the find/replace dialog HTML
     */
    createDialog() {
        this.dialog = document.createElement('div');
        this.dialog.id = 'findReplaceDialog';
        this.dialog.className = 'find-replace-dialog';
        this.dialog.setAttribute('role', 'dialog');
        this.dialog.setAttribute('aria-label', 'Find and Replace');
        this.dialog.innerHTML = `
            <div class="find-replace-content">
                <div class="find-replace-header">
                    <h3>Find & Replace</h3>
                    <button class="find-replace-close" id="findReplaceClose" title="Close (Esc)" aria-label="Close dialog">×</button>
                </div>
                <div class="find-replace-body">
                    <div class="find-replace-row">
                        <label for="findInput" class="find-replace-label">Find:</label>
                        <input type="text" id="findInput" class="find-replace-input" placeholder="Search text..." autocomplete="off">
                        <span id="matchCount" class="match-count" aria-live="polite">0 results</span>
                    </div>
                    <div class="find-replace-row">
                        <label for="replaceInput" class="find-replace-label">Replace:</label>
                        <input type="text" id="replaceInput" class="find-replace-input" placeholder="Replace with..." autocomplete="off">
                    </div>
                    <div class="find-replace-options">
                        <label class="find-replace-option">
                            <input type="checkbox" id="caseSensitive"> Case sensitive
                        </label>
                        <label class="find-replace-option">
                            <input type="checkbox" id="wholeWord"> Whole word
                        </label>
                        <label class="find-replace-option">
                            <input type="checkbox" id="useRegex"> Regex
                        </label>
                    </div>
                    <div class="find-replace-actions">
                        <button id="findPrevBtn" class="btn btn-icon" title="Previous match (Shift+Enter)">
                            <span class="icon">↑</span> Prev
                        </button>
                        <button id="findNextBtn" class="btn btn-icon" title="Next match (Enter)">
                            <span class="icon">↓</span> Next
                        </button>
                        <button id="replaceBtn" class="btn btn-icon" title="Replace current match">
                            Replace
                        </button>
                        <button id="replaceAllBtn" class="btn btn-primary" title="Replace all matches">
                            Replace All
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.dialog);

        // Cache DOM elements
        this.findInput = document.getElementById('findInput');
        this.replaceInput = document.getElementById('replaceInput');
        this.matchCount = document.getElementById('matchCount');

        this.setupEventListeners();
    }

    /**
     * Set up event listeners for the dialog
     */
    setupEventListeners() {
        // Close button
        document.getElementById('findReplaceClose').addEventListener('click', () => this.close());

        // Find input changes
        this.findInput.addEventListener('input', () => this.performFind());

        // Option checkboxes
        document.getElementById('caseSensitive').addEventListener('change', (e) => {
            this.caseSensitive = e.target.checked;
            this.performFind();
        });

        document.getElementById('wholeWord').addEventListener('change', (e) => {
            this.wholeWord = e.target.checked;
            this.performFind();
        });

        document.getElementById('useRegex').addEventListener('change', (e) => {
            this.useRegex = e.target.checked;
            this.performFind();
        });

        // Navigation buttons
        document.getElementById('findPrevBtn').addEventListener('click', () => this.findPrevious());
        document.getElementById('findNextBtn').addEventListener('click', () => this.findNext());

        // Replace buttons
        document.getElementById('replaceBtn').addEventListener('click', () => this.replaceCurrent());
        document.getElementById('replaceAllBtn').addEventListener('click', () => this.replaceAll());

        // Keyboard navigation within dialog
        this.findInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.findPrevious();
                } else {
                    this.findNext();
                }
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        this.replaceInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.replaceAll();
                } else {
                    this.replaceCurrent();
                }
            } else if (e.key === 'Escape') {
                this.close();
            }
        });

        // Close on clicking outside
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close();
            }
        });
    }

    /**
     * Set up global keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+F or Cmd+F to open find
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.open(false);
            }
            // Ctrl+H or Cmd+H to open find & replace
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.open(true);
            }
        });
    }

    /**
     * Open the find/replace dialog
     * @param {boolean} showReplace - Whether to focus the replace input
     */
    open(showReplace = false) {
        this.dialog.classList.add('visible');
        
        // Get selected text from editor
        const editor = this.getActiveEditor();
        if (editor) {
            const selectedText = this.getSelectedText(editor);
            if (selectedText) {
                this.findInput.value = selectedText;
            }
        }

        // Focus appropriate input
        if (showReplace) {
            this.replaceInput.focus();
        } else {
            this.findInput.focus();
            this.findInput.select();
        }

        // Perform initial find if there's text
        if (this.findInput.value) {
            this.performFind();
        }
    }

    /**
     * Close the find/replace dialog
     */
    close() {
        this.dialog.classList.remove('visible');
        this.clearHighlights();
        this.matches = [];
        this.currentMatchIndex = -1;
        
        // Return focus to editor
        const editor = this.getActiveEditor();
        if (editor) {
            editor.focus();
        }
    }

    /**
     * Check if dialog is currently open
     * @returns {boolean} Whether the dialog is visible
     */
    isOpen() {
        return this.dialog.classList.contains('visible');
    }

    /**
     * Get the currently active editor element
     * @returns {HTMLElement|null} The active editor (textarea or contenteditable)
     */
    getActiveEditor() {
        if (this.editorInstance.currentMode === 'markdown') {
            return this.editorInstance.editor;
        } else {
            return this.editorInstance.richTextEditorElement;
        }
    }

    /**
     * Get selected text from an editor element
     * @param {HTMLElement} editor - The editor element
     * @returns {string} The selected text
     */
    getSelectedText(editor) {
        if (editor.tagName === 'TEXTAREA') {
            return editor.value.substring(editor.selectionStart, editor.selectionEnd);
        } else {
            return window.getSelection().toString();
        }
    }

    /**
     * Get the current content from the active editor
     * @returns {string} The editor content
     */
    getContent() {
        const editor = this.getActiveEditor();
        if (!editor) return '';
        
        if (editor.tagName === 'TEXTAREA') {
            return editor.value;
        } else {
            return editor.innerText;
        }
    }

    /**
     * Set content in the active editor
     * @param {string} content - The new content
     */
    setContent(content) {
        const editor = this.getActiveEditor();
        if (!editor) return;
        
        if (editor.tagName === 'TEXTAREA') {
            editor.value = content;
            // Trigger input event for preview update
            editor.dispatchEvent(new Event('input'));
        } else {
            // For contenteditable, we need to be more careful
            editor.innerText = content;
            editor.dispatchEvent(new Event('input'));
        }
    }

    /**
     * Build a search pattern based on current options
     * @param {string} searchText - The text to search for
     * @returns {RegExp|null} The search pattern or null if invalid
     */
    buildSearchPattern(searchText) {
        if (!searchText) return null;

        let pattern;
        let flags = 'g';
        
        if (!this.caseSensitive) {
            flags += 'i';
        }

        try {
            if (this.useRegex) {
                pattern = new RegExp(searchText, flags);
            } else {
                // Escape special regex characters
                let escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                if (this.wholeWord) {
                    escaped = `\\b${escaped}\\b`;
                }
                
                pattern = new RegExp(escaped, flags);
            }
        } catch (e) {
            console.error('Invalid search pattern:', e);
            return null;
        }

        return pattern;
    }

    /**
     * Perform the find operation
     */
    performFind() {
        const searchText = this.findInput.value;
        this.clearHighlights();
        this.matches = [];
        this.currentMatchIndex = -1;

        if (!searchText) {
            this.updateMatchCount();
            return;
        }

        const content = this.getContent();
        const pattern = this.buildSearchPattern(searchText);
        
        if (!pattern) {
            this.matchCount.textContent = 'Invalid pattern';
            this.matchCount.classList.add('error');
            return;
        }

        this.matchCount.classList.remove('error');

        // Find all matches
        let match;
        while ((match = pattern.exec(content)) !== null) {
            this.matches.push({
                start: match.index,
                end: match.index + match[0].length,
                text: match[0]
            });
            
            // Prevent infinite loop with zero-length matches
            if (match[0].length === 0) {
                pattern.lastIndex++;
            }
        }

        this.updateMatchCount();
        
        // Navigate to first match if any
        if (this.matches.length > 0) {
            this.currentMatchIndex = 0;
            this.highlightCurrentMatch();
        }
    }

    /**
     * Update the match count display
     */
    updateMatchCount() {
        const count = this.matches.length;
        if (count === 0) {
            this.matchCount.textContent = this.findInput.value ? 'No results' : '0 results';
        } else if (count === 1) {
            this.matchCount.textContent = '1 result';
        } else {
            const current = this.currentMatchIndex >= 0 ? this.currentMatchIndex + 1 : 0;
            this.matchCount.textContent = `${current} of ${count}`;
        }
    }

    /**
     * Navigate to the next match
     */
    findNext() {
        if (this.matches.length === 0) {
            this.performFind();
            return;
        }

        this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
        this.highlightCurrentMatch();
        this.updateMatchCount();
    }

    /**
     * Navigate to the previous match
     */
    findPrevious() {
        if (this.matches.length === 0) {
            this.performFind();
            return;
        }

        this.currentMatchIndex = (this.currentMatchIndex - 1 + this.matches.length) % this.matches.length;
        this.highlightCurrentMatch();
        this.updateMatchCount();
    }

    /**
     * Highlight and scroll to the current match
     */
    highlightCurrentMatch() {
        if (this.currentMatchIndex < 0 || this.currentMatchIndex >= this.matches.length) {
            return;
        }

        const match = this.matches[this.currentMatchIndex];
        const editor = this.getActiveEditor();
        
        if (!editor) return;

        if (editor.tagName === 'TEXTAREA') {
            // Select the match in textarea
            editor.focus();
            editor.setSelectionRange(match.start, match.end);
            
            // Scroll to selection
            this.scrollTextareaToSelection(editor, match.start);
        } else {
            // For contenteditable, use Selection API
            this.selectTextInContentEditable(editor, match.start, match.end);
        }
    }

    /**
     * Scroll a textarea to show the selection
     * @param {HTMLTextAreaElement} textarea - The textarea element
     * @param {number} position - The character position to scroll to
     */
    scrollTextareaToSelection(textarea, position) {
        const text = textarea.value.substring(0, position);
        const lines = text.split('\n');
        const lineNumber = lines.length - 1;
        
        // Calculate approximate scroll position
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20;
        const scrollTop = lineNumber * lineHeight - textarea.clientHeight / 2;
        
        textarea.scrollTop = Math.max(0, scrollTop);
    }

    /**
     * Select text in a contenteditable element
     * @param {HTMLElement} element - The contenteditable element
     * @param {number} start - Start position
     * @param {number} end - End position
     */
    selectTextInContentEditable(element, start, end) {
        const range = document.createRange();
        const selection = window.getSelection();
        
        let currentPos = 0;
        let startNode = null;
        let startOffset = 0;
        let endNode = null;
        let endOffset = 0;
        
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
        
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLength = node.textContent.length;
            
            if (!startNode && currentPos + nodeLength >= start) {
                startNode = node;
                startOffset = start - currentPos;
            }
            
            if (!endNode && currentPos + nodeLength >= end) {
                endNode = node;
                endOffset = end - currentPos;
                break;
            }
            
            currentPos += nodeLength;
        }
        
        if (startNode && endNode) {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Scroll into view
            const rect = range.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                element.scrollTop += rect.top - element.clientHeight / 2;
            }
        }
    }

    /**
     * Clear all search highlights
     */
    clearHighlights() {
        // For now, we rely on selection highlighting
        // Could implement custom highlight marks in the future
    }

    /**
     * Replace the current match
     */
    replaceCurrent() {
        if (this.currentMatchIndex < 0 || this.matches.length === 0) {
            return;
        }

        const replaceText = this.replaceInput.value;
        const match = this.matches[this.currentMatchIndex];
        const content = this.getContent();
        
        // Replace the match
        const newContent = content.substring(0, match.start) + replaceText + content.substring(match.end);
        this.setContent(newContent);
        
        // Update matches with adjusted positions
        const lengthDiff = replaceText.length - match.text.length;
        
        // Remove the current match and adjust positions of subsequent matches
        this.matches.splice(this.currentMatchIndex, 1);
        
        for (let i = this.currentMatchIndex; i < this.matches.length; i++) {
            this.matches[i].start += lengthDiff;
            this.matches[i].end += lengthDiff;
        }
        
        // Adjust current index
        if (this.matches.length === 0) {
            this.currentMatchIndex = -1;
        } else if (this.currentMatchIndex >= this.matches.length) {
            this.currentMatchIndex = 0;
        }
        
        this.updateMatchCount();
        
        // Highlight next match if available
        if (this.matches.length > 0) {
            this.highlightCurrentMatch();
        }
    }

    /**
     * Replace all matches
     */
    replaceAll() {
        if (this.matches.length === 0) {
            return;
        }

        const searchText = this.findInput.value;
        const replaceText = this.replaceInput.value;
        const content = this.getContent();
        
        const pattern = this.buildSearchPattern(searchText);
        if (!pattern) return;

        const replacedCount = this.matches.length;
        const newContent = content.replace(pattern, replaceText);
        
        this.setContent(newContent);
        
        // Clear matches
        this.matches = [];
        this.currentMatchIndex = -1;
        
        this.matchCount.textContent = `Replaced ${replacedCount} occurrence${replacedCount !== 1 ? 's' : ''}`;
        
        // Re-search after a delay to show the result
        setTimeout(() => {
            this.performFind();
        }, 1500);
    }

    /**
     * Destroy the find/replace instance
     */
    destroy() {
        if (this.dialog && this.dialog.parentNode) {
            this.dialog.parentNode.removeChild(this.dialog);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FindReplace;
}
