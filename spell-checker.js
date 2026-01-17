/**
 * Spell Checker Module
 * Provides toggle for browser's built-in spell checking
 * @module SpellChecker
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * @class SpellChecker
 * Handles spell checking functionality
 */
class SpellChecker {
    /**
     * Create a SpellChecker instance
     * @param {MarkdownEditor} editor - The main editor instance
     */
    constructor(editor) {
        this.editor = editor;
        this.enabled = false;
        
        this.init();
    }

    /**
     * Initialize spell checker
     */
    init() {
        this.createToggleButton();
        this.loadPreference();
    }

    /**
     * Create the spell checker toggle button
     */
    createToggleButton() {
        const headerActions = document.querySelector('.header-actions');
        
        // Create spell check button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'spellCheckBtn';
        this.toggleBtn.className = 'btn btn-icon';
        this.toggleBtn.title = 'Toggle Spell Check';
        this.toggleBtn.setAttribute('aria-label', 'Toggle spell checking');
        this.toggleBtn.innerHTML = '📖';
        
        // Insert before typewriter mode button
        const typewriterBtn = document.getElementById('typewriterModeBtn');
        if (typewriterBtn) {
            headerActions.insertBefore(this.toggleBtn, typewriterBtn);
        } else {
            const themePicker = headerActions.querySelector('.theme-picker');
            headerActions.insertBefore(this.toggleBtn, themePicker);
        }

        // Add click listener
        this.toggleBtn.addEventListener('click', () => this.toggle());
    }

    /**
     * Toggle spell checking on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        this.applySpellCheck();
        this.savePreference();
        this.updateUI();
    }

    /**
     * Enable spell checking
     */
    enable() {
        this.enabled = true;
        this.applySpellCheck();
        this.savePreference();
        this.updateUI();
    }

    /**
     * Disable spell checking
     */
    disable() {
        this.enabled = false;
        this.applySpellCheck();
        this.savePreference();
        this.updateUI();
    }

    /**
     * Apply spell check setting to editors
     */
    applySpellCheck() {
        // Apply to markdown textarea
        this.editor.editor.spellcheck = this.enabled;
        
        // Apply to rich text editor
        this.editor.richTextEditorElement.spellcheck = this.enabled;
        
        // Force re-render by blurring and refocusing
        const activeElement = document.activeElement;
        if (activeElement === this.editor.editor || 
            activeElement === this.editor.richTextEditorElement) {
            activeElement.blur();
            setTimeout(() => activeElement.focus(), 0);
        }
    }

    /**
     * Update UI to reflect current state
     */
    updateUI() {
        this.toggleBtn.classList.toggle('active', this.enabled);
        this.toggleBtn.title = this.enabled 
            ? 'Spell Check: ON (click to disable)' 
            : 'Spell Check: OFF (click to enable)';
        this.toggleBtn.innerHTML = this.enabled ? '📗' : '📖';
    }

    /**
     * Check if spell checking is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Save preference to localStorage
     */
    savePreference() {
        localStorage.setItem('markdown-editor-spell-check', this.enabled);
    }

    /**
     * Load saved preference
     */
    loadPreference() {
        const saved = localStorage.getItem('markdown-editor-spell-check');
        if (saved === 'true') {
            this.enabled = true;
            this.applySpellCheck();
            this.updateUI();
        }
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpellChecker;
}
