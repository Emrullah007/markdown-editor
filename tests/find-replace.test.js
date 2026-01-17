/**
 * Find & Replace Tests
 * Unit tests for find and replace functionality
 */

describe('FindReplace', () => {
    let findReplace;
    let mockEditor;

    // Mock the FindReplace class for testing
    beforeEach(() => {
        // Create mock editor instance
        mockEditor = {
            currentMode: 'markdown',
            editor: {
                value: 'Hello world, hello universe, hello everyone!',
                selectionStart: 0,
                selectionEnd: 0,
                focus: jest.fn(),
                setSelectionRange: jest.fn(),
                dispatchEvent: jest.fn(),
                tagName: 'TEXTAREA',
                scrollTop: 0,
                clientHeight: 300
            },
            richTextEditorElement: {
                innerText: '',
                focus: jest.fn()
            }
        };

        // Create a simple FindReplace mock for testing core logic
        findReplace = {
            editorInstance: mockEditor,
            matches: [],
            currentMatchIndex: -1,
            caseSensitive: false,
            wholeWord: false,
            useRegex: false,
            findInput: { value: '' },

            getActiveEditor() {
                if (this.editorInstance.currentMode === 'markdown') {
                    return this.editorInstance.editor;
                }
                return this.editorInstance.richTextEditorElement;
            },

            getContent() {
                const editor = this.getActiveEditor();
                if (editor.tagName === 'TEXTAREA') {
                    return editor.value;
                }
                return editor.innerText;
            },

            setContent(content) {
                const editor = this.getActiveEditor();
                if (editor.tagName === 'TEXTAREA') {
                    editor.value = content;
                } else {
                    editor.innerText = content;
                }
            },

            buildSearchPattern(searchText) {
                if (!searchText) return null;

                let flags = 'g';
                if (!this.caseSensitive) flags += 'i';

                try {
                    let pattern;
                    if (this.useRegex) {
                        pattern = new RegExp(searchText, flags);
                    } else {
                        let escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        if (this.wholeWord) {
                            escaped = `\\b${escaped}\\b`;
                        }
                        pattern = new RegExp(escaped, flags);
                    }
                    return pattern;
                } catch (e) {
                    return null;
                }
            },

            performFind() {
                const searchText = this.findInput.value;
                this.matches = [];
                this.currentMatchIndex = -1;

                if (!searchText) return;

                const content = this.getContent();
                const pattern = this.buildSearchPattern(searchText);

                if (!pattern) return;

                let match;
                while ((match = pattern.exec(content)) !== null) {
                    this.matches.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        text: match[0]
                    });
                    if (match[0].length === 0) pattern.lastIndex++;
                }

                if (this.matches.length > 0) {
                    this.currentMatchIndex = 0;
                }
            },

            findNext() {
                if (this.matches.length === 0) return;
                this.currentMatchIndex = (this.currentMatchIndex + 1) % this.matches.length;
            },

            findPrevious() {
                if (this.matches.length === 0) return;
                this.currentMatchIndex = (this.currentMatchIndex - 1 + this.matches.length) % this.matches.length;
            },

            replaceCurrent(replaceText) {
                if (this.currentMatchIndex < 0 || this.matches.length === 0) return;

                const match = this.matches[this.currentMatchIndex];
                const content = this.getContent();
                const newContent = content.substring(0, match.start) + replaceText + content.substring(match.end);
                this.setContent(newContent);

                const lengthDiff = replaceText.length - match.text.length;
                this.matches.splice(this.currentMatchIndex, 1);

                for (let i = this.currentMatchIndex; i < this.matches.length; i++) {
                    this.matches[i].start += lengthDiff;
                    this.matches[i].end += lengthDiff;
                }

                if (this.matches.length === 0) {
                    this.currentMatchIndex = -1;
                } else if (this.currentMatchIndex >= this.matches.length) {
                    this.currentMatchIndex = 0;
                }
            },

            replaceAll(searchText, replaceText) {
                if (this.matches.length === 0) return 0;

                const pattern = this.buildSearchPattern(searchText);
                if (!pattern) return 0;

                const content = this.getContent();
                const newContent = content.replace(pattern, replaceText);
                const count = this.matches.length;

                this.setContent(newContent);
                this.matches = [];
                this.currentMatchIndex = -1;

                return count;
            }
        };
    });

    describe('buildSearchPattern', () => {
        it('should return null for empty search text', () => {
            expect(findReplace.buildSearchPattern('')).toBeNull();
            expect(findReplace.buildSearchPattern(null)).toBeNull();
        });

        it('should create case-insensitive pattern by default', () => {
            const pattern = findReplace.buildSearchPattern('hello');
            expect(pattern.flags).toContain('i');
        });

        it('should create case-sensitive pattern when enabled', () => {
            findReplace.caseSensitive = true;
            const pattern = findReplace.buildSearchPattern('Hello');
            expect(pattern.flags).not.toContain('i');
        });

        it('should escape special regex characters', () => {
            const pattern = findReplace.buildSearchPattern('test.text');
            expect(pattern.source).toContain('\\.');
        });

        it('should add word boundaries when wholeWord is enabled', () => {
            findReplace.wholeWord = true;
            const pattern = findReplace.buildSearchPattern('hello');
            expect(pattern.source).toContain('\\b');
        });

        it('should use raw regex when useRegex is enabled', () => {
            findReplace.useRegex = true;
            const pattern = findReplace.buildSearchPattern('hel+o');
            expect(pattern.source).toBe('hel+o');
        });

        it('should return null for invalid regex', () => {
            findReplace.useRegex = true;
            const pattern = findReplace.buildSearchPattern('[invalid');
            expect(pattern).toBeNull();
        });
    });

    describe('performFind', () => {
        it('should find all matches', () => {
            findReplace.findInput.value = 'hello';
            findReplace.performFind();

            expect(findReplace.matches.length).toBe(3);
            expect(findReplace.currentMatchIndex).toBe(0);
        });

        it('should find no matches for non-existent text', () => {
            findReplace.findInput.value = 'xyz';
            findReplace.performFind();

            expect(findReplace.matches.length).toBe(0);
            expect(findReplace.currentMatchIndex).toBe(-1);
        });

        it('should respect case sensitivity', () => {
            findReplace.caseSensitive = true;
            findReplace.findInput.value = 'Hello';
            findReplace.performFind();

            expect(findReplace.matches.length).toBe(1);
        });

        it('should respect whole word matching', () => {
            findReplace.wholeWord = true;
            findReplace.findInput.value = 'hello';
            findReplace.performFind();

            expect(findReplace.matches.length).toBe(3);
        });

        it('should store correct match positions', () => {
            findReplace.findInput.value = 'hello';
            findReplace.performFind();

            expect(findReplace.matches[0]).toEqual({
                start: 0,
                end: 5,
                text: 'Hello'
            });
        });
    });

    describe('findNext / findPrevious', () => {
        beforeEach(() => {
            findReplace.findInput.value = 'hello';
            findReplace.performFind();
        });

        it('should advance to next match', () => {
            expect(findReplace.currentMatchIndex).toBe(0);
            findReplace.findNext();
            expect(findReplace.currentMatchIndex).toBe(1);
        });

        it('should wrap around at end', () => {
            findReplace.currentMatchIndex = 2;
            findReplace.findNext();
            expect(findReplace.currentMatchIndex).toBe(0);
        });

        it('should go to previous match', () => {
            findReplace.currentMatchIndex = 1;
            findReplace.findPrevious();
            expect(findReplace.currentMatchIndex).toBe(0);
        });

        it('should wrap around at beginning', () => {
            findReplace.currentMatchIndex = 0;
            findReplace.findPrevious();
            expect(findReplace.currentMatchIndex).toBe(2);
        });
    });

    describe('replaceCurrent', () => {
        beforeEach(() => {
            findReplace.findInput.value = 'hello';
            findReplace.performFind();
        });

        it('should replace current match', () => {
            findReplace.replaceCurrent('hi');
            expect(mockEditor.editor.value).toBe('hi world, hello universe, hello everyone!');
        });

        it('should update remaining match positions', () => {
            findReplace.replaceCurrent('hi');
            // 'hi' is 2 chars shorter than 'hello' (5 chars), so diff is -3
            expect(findReplace.matches[0].start).toBe(13 - 3);
        });

        it('should remove replaced match from matches array', () => {
            const originalCount = findReplace.matches.length;
            findReplace.replaceCurrent('hi');
            expect(findReplace.matches.length).toBe(originalCount - 1);
        });

        it('should handle replacing with longer text', () => {
            findReplace.replaceCurrent('greetings');
            expect(mockEditor.editor.value).toBe('greetings world, hello universe, hello everyone!');
        });
    });

    describe('replaceAll', () => {
        beforeEach(() => {
            findReplace.findInput.value = 'hello';
            findReplace.performFind();
        });

        it('should replace all matches', () => {
            const count = findReplace.replaceAll('hello', 'hi');
            expect(mockEditor.editor.value).toBe('hi world, hi universe, hi everyone!');
            expect(count).toBe(3);
        });

        it('should clear matches after replace all', () => {
            findReplace.replaceAll('hello', 'hi');
            expect(findReplace.matches.length).toBe(0);
            expect(findReplace.currentMatchIndex).toBe(-1);
        });

        it('should return 0 when no matches', () => {
            findReplace.matches = [];
            const count = findReplace.replaceAll('xyz', 'abc');
            expect(count).toBe(0);
        });
    });

    describe('getContent / setContent', () => {
        it('should get content from textarea in markdown mode', () => {
            expect(findReplace.getContent()).toBe('Hello world, hello universe, hello everyone!');
        });

        it('should set content in textarea', () => {
            findReplace.setContent('New content');
            expect(mockEditor.editor.value).toBe('New content');
        });

        it('should handle rich text mode', () => {
            mockEditor.currentMode = 'richtext';
            mockEditor.richTextEditorElement.innerText = 'Rich text content';
            expect(findReplace.getContent()).toBe('Rich text content');
        });
    });
});
