/**
 * Typewriter Mode Module
 * Keeps the cursor line vertically centered in the editor
 * Creates a typewriter-like writing experience
 * @module TypewriterMode
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * @class TypewriterMode
 * Handles typewriter mode functionality
 */
class TypewriterMode {
    /**
     * Create a TypewriterMode instance
     * @param {MarkdownEditor} editor - The main editor instance
     */
    constructor(editor) {
        this.editor = editor;
        this.enabled = false;
        this.scrollOffset = 0.4; // Position cursor at 40% from top
        this.animationFrame = null;
        
        this.init();
    }

    /**
     * Initialize typewriter mode
     */
    init() {
        this.createToggleButton();
        this.setupEventListeners();
    }

    /**
     * Create the typewriter mode toggle button
     */
    createToggleButton() {
        const headerActions = document.querySelector('.header-actions');
        
        // Create typewriter mode button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'typewriterModeBtn';
        this.toggleBtn.className = 'btn btn-icon';
        this.toggleBtn.title = 'Toggle Typewriter Mode';
        this.toggleBtn.setAttribute('aria-label', 'Toggle typewriter mode for centered cursor');
        this.toggleBtn.innerHTML = '⌨️';
        
        // Insert before focus mode button
        const focusModeBtn = document.getElementById('focusModeBtn');
        if (focusModeBtn) {
            headerActions.insertBefore(this.toggleBtn, focusModeBtn);
        } else {
            const themePicker = headerActions.querySelector('.theme-picker');
            headerActions.insertBefore(this.toggleBtn, themePicker);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle button click
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });

        // Keyboard shortcut (Ctrl+Shift+T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Listen for input in markdown editor
        const markdownEditor = this.editor.editor;
        markdownEditor.addEventListener('input', () => this.scrollToCursor());
        markdownEditor.addEventListener('click', () => this.scrollToCursor());
        markdownEditor.addEventListener('keyup', (e) => {
            if (['ArrowUp', 'ArrowDown', 'Enter', 'Backspace', 'Delete'].includes(e.key)) {
                this.scrollToCursor();
            }
        });

        // Listen for input in rich text editor
        const richTextEditor = this.editor.richTextEditorElement;
        richTextEditor.addEventListener('input', () => this.scrollToCursorRichText());
        richTextEditor.addEventListener('click', () => this.scrollToCursorRichText());
        richTextEditor.addEventListener('keyup', () => this.scrollToCursorRichText());
    }

    /**
     * Toggle typewriter mode on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        document.body.classList.toggle('typewriter-mode', this.enabled);
        
        // Update button appearance
        this.toggleBtn.classList.toggle('active', this.enabled);
        this.toggleBtn.title = this.enabled ? 'Exit Typewriter Mode (Ctrl+Shift+T)' : 'Typewriter Mode (Ctrl+Shift+T)';
        
        if (this.enabled) {
            this.scrollToCursor();
            this.scrollToCursorRichText();
        }
        
        // Save preference
        localStorage.setItem('markdown-editor-typewriter-mode', this.enabled);
    }

    /**
     * Enable typewriter mode
     */
    enable() {
        if (!this.enabled) {
            this.toggle();
        }
    }

    /**
     * Disable typewriter mode
     */
    disable() {
        if (this.enabled) {
            this.toggle();
        }
    }

    /**
     * Check if typewriter mode is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Scroll to keep cursor centered in markdown editor
     */
    scrollToCursor() {
        if (!this.enabled || this.editor.currentMode !== 'markdown') return;

        // Cancel any pending animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.animationFrame = requestAnimationFrame(() => {
            const textarea = this.editor.editor;
            const cursorPos = textarea.selectionStart;
            const text = textarea.value;
            
            // Calculate cursor line number
            const textBeforeCursor = text.substring(0, cursorPos);
            const cursorLine = textBeforeCursor.split('\n').length;
            
            // Get line height
            const computedStyle = window.getComputedStyle(textarea);
            const lineHeight = parseFloat(computedStyle.lineHeight) || 
                              parseFloat(computedStyle.fontSize) * 1.6;
            
            // Calculate cursor Y position
            const cursorY = (cursorLine - 1) * lineHeight;
            
            // Calculate target scroll position (cursor at scrollOffset from top)
            const viewportHeight = textarea.clientHeight;
            const targetScroll = cursorY - (viewportHeight * this.scrollOffset);
            
            // Smooth scroll
            this.smoothScroll(textarea, targetScroll);
        });
    }

    /**
     * Scroll to keep cursor centered in rich text editor
     */
    scrollToCursorRichText() {
        if (!this.enabled || this.editor.currentMode !== 'richtext') return;

        // Cancel any pending animation
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        this.animationFrame = requestAnimationFrame(() => {
            const editor = this.editor.richTextEditorElement;
            const selection = window.getSelection();
            
            if (!selection.rangeCount) return;
            
            const range = selection.getRangeAt(0);
            
            // Get cursor position
            const rect = range.getBoundingClientRect();
            const editorRect = editor.getBoundingClientRect();
            
            // Calculate relative position
            const cursorY = rect.top - editorRect.top + editor.scrollTop;
            
            // Calculate target scroll position
            const viewportHeight = editor.clientHeight;
            const targetScroll = cursorY - (viewportHeight * this.scrollOffset);
            
            // Smooth scroll
            this.smoothScroll(editor, targetScroll);
        });
    }

    /**
     * Smooth scroll to target position
     * @param {HTMLElement} element - Element to scroll
     * @param {number} target - Target scroll position
     */
    smoothScroll(element, target) {
        const start = element.scrollTop;
        const distance = target - start;
        
        // Don't animate small movements
        if (Math.abs(distance) < 10) {
            element.scrollTop = target;
            return;
        }
        
        const duration = 150; // ms
        let startTime = null;
        
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const easing = 1 - Math.pow(1 - progress, 3);
            
            element.scrollTop = start + (distance * easing);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Load saved preference
     */
    loadPreference() {
        const saved = localStorage.getItem('markdown-editor-typewriter-mode');
        if (saved === 'true') {
            this.toggle();
        }
    }

    /**
     * Set scroll offset (where cursor appears vertically)
     * @param {number} offset - Value between 0 (top) and 1 (bottom)
     */
    setScrollOffset(offset) {
        this.scrollOffset = Math.max(0, Math.min(1, offset));
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TypewriterMode;
}
