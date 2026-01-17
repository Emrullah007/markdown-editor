// History Manager
// Handles undo/redo functionality for the editor

class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 100; // Maximum number of history states to keep
        this.debounceTimer = null;
        this.debounceDelay = 1000; // 1 second - don't save state more frequently than this
    }

    // Push a new state to history (debounced to avoid too many states)
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

    // Internal method to push state
    _pushStateInternal(content) {
        // Don't add if content is the same as current state
        if (this.currentIndex >= 0 && this.history[this.currentIndex] === content) {
            return;
        }

        // If we're not at the end of history, remove everything after current position
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push(content);
        this.currentIndex++;

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
    }

    // Undo to previous state
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

    // Redo to next state
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

    // Check if undo is available
    canUndo() {
        return this.currentIndex > 0;
    }

    // Check if redo is available
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    // Get current state
    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex];
        }
        return null;
    }

    // Clear all history
    clear() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.history = [];
        this.currentIndex = -1;
    }

    // Get history stats (for debugging)
    getStats() {
        return {
            historySize: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        };
    }
}

// Create global instance
const historyManager = new HistoryManager();
