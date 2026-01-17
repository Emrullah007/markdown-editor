/**
 * History Manager Module
 * Handles undo/redo functionality for the markdown editor
 * @module HistoryManager
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * Class representing the History Manager for undo/redo operations
 * Maintains a stack of editor states and provides navigation through history
 * @class
 */
class HistoryManager {
    /**
     * Create a HistoryManager instance
     * Initializes empty history stack and configuration
     */
    constructor() {
        /**
         * Array of saved editor states
         * @type {string[]}
         * @private
         */
        this.history = [];

        /**
         * Current position in history stack (-1 means no history)
         * @type {number}
         * @private
         */
        this.currentIndex = -1;

        /**
         * Maximum number of history states to keep
         * @type {number}
         * @default 100
         */
        this.maxHistorySize = 100;

        /**
         * Timer reference for debouncing history pushes
         * @type {number|null}
         * @private
         */
        this.debounceTimer = null;

        /**
         * Delay in milliseconds before saving a state (debounce)
         * @type {number}
         * @default 1000
         */
        this.debounceDelay = 1000;
    }

    /**
     * Push a new state to history with optional debouncing
     * Debouncing prevents saving every keystroke, creating smoother UX
     * @param {string} content - The editor content to save
     * @param {boolean} [immediate=false] - If true, saves immediately without debouncing
     */
    pushState(content, immediate = false) {
        // Clear any pending debounced push
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        if (immediate) {
            this._pushStateInternal(content);
        } else {
            // Debounce pushes to avoid recording every keystroke
            this.debounceTimer = setTimeout(() => {
                this._pushStateInternal(content);
                this.debounceTimer = null;
            }, this.debounceDelay);
        }
    }

    /**
     * Internal method to push state to history
     * Handles deduplication and history size limiting
     * @param {string} content - The editor content to save
     * @private
     */
    _pushStateInternal(content) {
        // Don't add if content is the same as current state
        if (this.currentIndex >= 0 && this.history[this.currentIndex] === content) {
            return;
        }

        // If we're not at the end of history, remove everything after current position
        // This creates a new branch in history when user makes changes after undoing
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push(content);
        this.currentIndex++;

        // Limit history size to prevent memory issues
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    /**
     * Undo to previous state
     * @returns {string|null} The previous state content, or null if at beginning
     */
    undo() {
        // Flush any pending debounced state
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        if (this.canUndo()) {
            this.currentIndex--;
            return this.history[this.currentIndex];
        }
        return null;
    }

    /**
     * Redo to next state
     * @returns {string|null} The next state content, or null if at end
     */
    redo() {
        // Flush any pending debounced state
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        if (this.canRedo()) {
            this.currentIndex++;
            return this.history[this.currentIndex];
        }
        return null;
    }

    /**
     * Check if undo operation is available
     * @returns {boolean} True if undo is possible
     */
    canUndo() {
        return this.currentIndex > 0;
    }

    /**
     * Check if redo operation is available
     * @returns {boolean} True if redo is possible
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Get the current state without modifying history
     * @returns {string|null} Current state content, or null if no history
     */
    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex];
        }
        return null;
    }

    /**
     * Clear all history
     * Useful when loading new content or resetting editor
     */
    clear() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Get history statistics for debugging
     * @returns {Object} Statistics object
     * @property {number} historySize - Number of states in history
     * @property {number} currentIndex - Current position in history
     * @property {boolean} canUndo - Whether undo is available
     * @property {boolean} canRedo - Whether redo is available
     */
    getStats() {
        return {
            historySize: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }
}

/**
 * Global history manager instance
 * @type {HistoryManager}
 */
const historyManager = new HistoryManager();
