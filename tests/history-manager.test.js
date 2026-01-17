/**
 * History Manager Tests
 * Unit tests for undo/redo functionality
 */

// Import the module for testing
const fs = require('fs');
const path = require('path');

// Load the history-manager.js file
const historyManagerCode = fs.readFileSync(
    path.join(__dirname, '../history-manager.js'),
    'utf8'
);

// Execute the code to get HistoryManager class
eval(historyManagerCode);

describe('HistoryManager', () => {
    let manager;

    beforeEach(() => {
        manager = new HistoryManager();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('constructor', () => {
        it('should initialize with empty history', () => {
            expect(manager.history).toEqual([]);
            expect(manager.currentIndex).toBe(-1);
        });

        it('should have default max history size of 100', () => {
            expect(manager.maxHistorySize).toBe(100);
        });

        it('should have default debounce delay of 1000ms', () => {
            expect(manager.debounceDelay).toBe(1000);
        });
    });

    describe('pushState', () => {
        it('should add state immediately when immediate=true', () => {
            manager.pushState('content 1', true);
            expect(manager.history).toEqual(['content 1']);
            expect(manager.currentIndex).toBe(0);
        });

        it('should debounce state pushes by default', () => {
            manager.pushState('content 1');
            expect(manager.history).toEqual([]);

            jest.advanceTimersByTime(1000);
            expect(manager.history).toEqual(['content 1']);
        });

        it('should not add duplicate consecutive states', () => {
            manager.pushState('content 1', true);
            manager.pushState('content 1', true);
            expect(manager.history).toEqual(['content 1']);
        });

        it('should clear future history when adding after undo', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            manager.pushState('state 3', true);
            
            manager.undo();
            manager.pushState('state 4', true);

            expect(manager.history).toEqual(['state 1', 'state 2', 'state 4']);
        });

        it('should limit history to maxHistorySize', () => {
            manager.maxHistorySize = 3;
            
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            manager.pushState('state 3', true);
            manager.pushState('state 4', true);

            expect(manager.history.length).toBe(3);
            expect(manager.history).toEqual(['state 2', 'state 3', 'state 4']);
        });
    });

    describe('undo', () => {
        it('should return null when no history', () => {
            expect(manager.undo()).toBeNull();
        });

        it('should return null at the beginning of history', () => {
            manager.pushState('state 1', true);
            expect(manager.undo()).toBeNull();
        });

        it('should return previous state', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            
            expect(manager.undo()).toBe('state 1');
            expect(manager.currentIndex).toBe(0);
        });

        it('should flush pending debounced state', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2'); // debounced
            
            manager.undo();
            expect(manager.debounceTimer).toBeNull();
        });
    });

    describe('redo', () => {
        it('should return null when no future history', () => {
            manager.pushState('state 1', true);
            expect(manager.redo()).toBeNull();
        });

        it('should return next state after undo', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            manager.undo();
            
            expect(manager.redo()).toBe('state 2');
            expect(manager.currentIndex).toBe(1);
        });
    });

    describe('canUndo', () => {
        it('should return false with empty history', () => {
            expect(manager.canUndo()).toBe(false);
        });

        it('should return false at beginning of history', () => {
            manager.pushState('state 1', true);
            expect(manager.canUndo()).toBe(false);
        });

        it('should return true when undo is possible', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            expect(manager.canUndo()).toBe(true);
        });
    });

    describe('canRedo', () => {
        it('should return false with empty history', () => {
            expect(manager.canRedo()).toBe(false);
        });

        it('should return false at end of history', () => {
            manager.pushState('state 1', true);
            expect(manager.canRedo()).toBe(false);
        });

        it('should return true after undo', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            manager.undo();
            expect(manager.canRedo()).toBe(true);
        });
    });

    describe('getCurrentState', () => {
        it('should return null with empty history', () => {
            expect(manager.getCurrentState()).toBeNull();
        });

        it('should return current state', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            expect(manager.getCurrentState()).toBe('state 2');
        });
    });

    describe('clear', () => {
        it('should clear all history', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            manager.clear();

            expect(manager.history).toEqual([]);
            expect(manager.currentIndex).toBe(-1);
        });

        it('should clear pending debounce timer', () => {
            manager.pushState('state 1');
            manager.clear();
            expect(manager.debounceTimer).toBeNull();
        });
    });

    describe('getStats', () => {
        it('should return correct statistics', () => {
            manager.pushState('state 1', true);
            manager.pushState('state 2', true);
            manager.pushState('state 3', true);
            manager.undo();

            const stats = manager.getStats();
            expect(stats).toEqual({
                historySize: 3,
                currentIndex: 1,
                canUndo: true,
                canRedo: true
            });
        });
    });
});
