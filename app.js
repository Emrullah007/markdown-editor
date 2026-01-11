// Markdown Editor Application
// Main application logic

class MarkdownEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.saveStatus = document.getElementById('saveStatus');

        // Rich text editor elements
        this.richTextEditorElement = document.getElementById('richTextEditor');
        this.richTextEditor = null;
        this.currentMode = 'markdown'; // 'markdown' or 'richtext'
        this.richTextToolbar = document.getElementById('richTextToolbar');

        // Storage keys
        this.STORAGE_KEY = 'markdown-editor-content';
        this.DARK_MODE_KEY = 'markdown-editor-dark-mode';

        // Auto-save timer
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000; // 2 seconds

        // Initialize
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadContent();
        this.loadDarkModePreference();

        // Initialize rich text editor
        this.richTextEditor = new RichTextEditor(
            this.richTextEditorElement,
            this
        );

        this.updatePreview();
    }

    setupEventListeners() {
        // Editor input - live preview
        this.editor.addEventListener('input', () => {
            this.updatePreview();
            this.scheduleAutoSave();
        });

        // Mode toggle
        document.getElementById('modeToggle').addEventListener('click', () => {
            this.toggleMode();
        });

        // Rich text editor input
        this.richTextEditorElement.addEventListener('input', () => {
            this.handleRichTextInput();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearEditor();
        });

        // Rich text toolbar buttons
        this.setupRichTextToolbar();

        // Download buttons
        document.getElementById('downloadMdBtn').addEventListener('click', () => {
            this.downloadMarkdown();
        });

        document.getElementById('downloadHtmlBtn').addEventListener('click', () => {
            this.downloadHtml();
        });

        // Copy buttons
        document.getElementById('copyMdBtn').addEventListener('click', () => {
            this.copyMarkdown();
        });

        document.getElementById('copyHtmlBtn').addEventListener('click', () => {
            this.copyHtml();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+S or Cmd+S to download markdown
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.downloadMarkdown();
            }
        });

        // Setup resizer
        this.setupResizer();
    }

    updatePreview() {
        const markdown = this.editor.value;
        const html = markdownParser.parse(markdown);
        this.preview.innerHTML = html;
    }

    toggleMode() {
        if (this.currentMode === 'markdown') {
            // Switch to rich text mode
            this.currentMode = 'richtext';

            // Convert markdown to HTML and set in rich text editor
            const markdown = this.editor.value;
            this.richTextEditor.setContent(markdown);

            // Toggle visibility
            this.editor.style.display = 'none';
            this.richTextEditorElement.style.display = 'block';
            this.richTextToolbar.style.display = 'flex';

            // Update UI
            document.getElementById('modeToggle').innerHTML = '📝 Switch to Markdown';
            document.getElementById('editorModeLabel').textContent = 'Rich Text Editor';

        } else {
            // Switch to markdown mode
            this.currentMode = 'markdown';

            // Convert HTML to markdown and set in textarea
            const markdown = this.richTextEditor.getMarkdown();
            this.editor.value = markdown;

            // Toggle visibility
            this.editor.style.display = 'block';
            this.richTextEditorElement.style.display = 'none';
            this.richTextToolbar.style.display = 'none';

            // Update UI
            document.getElementById('modeToggle').innerHTML = '📝 Switch to Rich Text';
            document.getElementById('editorModeLabel').textContent = 'Markdown Editor';

            // Update preview
            this.updatePreview();
        }
    }

    handleRichTextInput() {
        // Convert to markdown and update preview
        const markdown = this.richTextEditor.getMarkdown();
        const html = markdownParser.parse(markdown);
        this.preview.innerHTML = html;

        // Schedule auto-save
        this.scheduleAutoSave();
    }

    setupRichTextToolbar() {
        // Bold, italic, underline, strikethrough
        document.getElementById('boldBtn').addEventListener('click', () =>
            this.richTextEditor.formatText('bold'));
        document.getElementById('italicBtn').addEventListener('click', () =>
            this.richTextEditor.formatText('italic'));
        document.getElementById('underlineBtn').addEventListener('click', () =>
            this.richTextEditor.formatText('underline'));
        document.getElementById('strikeBtn').addEventListener('click', () =>
            this.richTextEditor.formatText('strikeThrough'));

        // Headings
        document.getElementById('headingSelect').addEventListener('change', (e) => {
            this.richTextEditor.applyHeading(e.target.value);
            e.target.value = 'p'; // Reset to normal
        });

        // Lists
        document.getElementById('bulletListBtn').addEventListener('click', () =>
            this.richTextEditor.insertList('ul'));
        document.getElementById('numberListBtn').addEventListener('click', () =>
            this.richTextEditor.insertList('ol'));
        document.getElementById('checkListBtn').addEventListener('click', () =>
            this.richTextEditor.insertList('checklist'));

        // Insert elements
        document.getElementById('linkBtn').addEventListener('click', () =>
            this.richTextEditor.insertLink());
        document.getElementById('imageBtn').addEventListener('click', () =>
            this.richTextEditor.insertImage());
        document.getElementById('tableBtn').addEventListener('click', () =>
            this.richTextEditor.insertTable());
        document.getElementById('codeBlockBtn').addEventListener('click', () =>
            this.richTextEditor.insertCodeBlock());
    }

    scheduleAutoSave() {
        // Clear existing timer
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // Set new timer
        this.autoSaveTimer = setTimeout(() => {
            this.saveContent();
        }, this.autoSaveDelay);

        this.updateSaveStatus('Typing...');
    }

    saveContent() {
        let content;
        if (this.currentMode === 'markdown') {
            content = this.editor.value;
        } else {
            // Save as markdown (converted from rich text)
            content = this.richTextEditor.getMarkdown();
        }

        try {
            localStorage.setItem(this.STORAGE_KEY, content);
            this.updateSaveStatus('Saved');

            // Reset status after 2 seconds
            setTimeout(() => {
                this.updateSaveStatus('Auto-save enabled');
            }, 2000);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            this.updateSaveStatus('Save failed');
        }
    }

    loadContent() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);

            if (saved) {
                this.editor.value = saved;
            } else {
                // Load default sample content
                this.editor.value = this.getDefaultContent();
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.editor.value = this.getDefaultContent();
        }
    }

    getDefaultContent() {
        return `# Welcome to Markdown Editor! 📝

A modern, feature-rich markdown editor with live preview.

## Features

- ✨ **Live Preview** - See your markdown rendered in real-time
- 💾 **Auto-save** - Your work is automatically saved to browser storage
- 🌙 **Dark Mode** - Easy on the eyes with dark theme
- 📥 **Export** - Download as .md or .html
- 📋 **Copy** - Copy markdown or HTML to clipboard
- 🎨 **Syntax Highlighting** - Beautiful code blocks
- 📱 **Responsive** - Works great on mobile too

## Markdown Guide

### Headers
Use \`#\` for headers (h1 through h6)

### Emphasis
- **Bold text** with \`**double asterisks**\`
- *Italic text* with \`*single asterisks*\`
- ~~Strikethrough~~ with \`~~tildes~~\`

### Lists

**Unordered:**
- Item 1
- Item 2
  - Nested item
  - Another nested item

**Ordered:**
1. First item
2. Second item
3. Third item

### Links and Images
- [Link text](https://example.com)
- ![Alt text](https://via.placeholder.com/150)

### Code

Inline code: \`const x = 10;\`

Code block:
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Blockquotes
> This is a blockquote.
> It can span multiple lines.

### Tables
| Feature | Supported |
|---------|-----------|
| Tables | ✓ |
| GFM | ✓ |
| Syntax Highlighting | ✓ |

### Task Lists
- [x] Completed task
- [ ] Pending task
- [ ] Another task

---

**Start typing to see your markdown come to life!** 🚀
`;
    }

    updateSaveStatus(message) {
        this.saveStatus.textContent = message;
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');

        // Update button emoji
        const btn = document.getElementById('darkModeToggle');
        btn.textContent = isDark ? '☀️' : '🌙';

        // Save preference
        localStorage.setItem(this.DARK_MODE_KEY, isDark);
    }

    loadDarkModePreference() {
        const isDark = localStorage.getItem(this.DARK_MODE_KEY) === 'true';

        // Check system preference if no saved preference
        if (localStorage.getItem(this.DARK_MODE_KEY) === null) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').textContent = '☀️';
            }
        } else if (isDark) {
            document.body.classList.add('dark-mode');
            document.getElementById('darkModeToggle').textContent = '☀️';
        }
    }

    clearEditor() {
        if (confirm('Are you sure you want to clear the editor? This action cannot be undone.')) {
            if (this.currentMode === 'markdown') {
                this.editor.value = '';
            } else {
                this.richTextEditorElement.innerHTML = '';
            }
            this.updatePreview();
            this.saveContent();
        }
    }

    downloadMarkdown() {
        let content;
        if (this.currentMode === 'markdown') {
            content = this.editor.value;
        } else {
            content = this.richTextEditor.getMarkdown();
        }
        const blob = new Blob([content], { type: 'text/markdown' });
        this.downloadFile(blob, 'document.md');
    }

    downloadHtml() {
        let markdown;
        if (this.currentMode === 'markdown') {
            markdown = this.editor.value;
        } else {
            markdown = this.richTextEditor.getMarkdown();
        }
        const html = markdownParser.getHtmlDocument(markdown, 'Markdown Export');
        const blob = new Blob([html], { type: 'text/html' });
        this.downloadFile(blob, 'document.html');
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async copyMarkdown() {
        let content;
        if (this.currentMode === 'markdown') {
            content = this.editor.value;
        } else {
            content = this.richTextEditor.getMarkdown();
        }
        try {
            await navigator.clipboard.writeText(content);
            this.showCopySuccess('Markdown copied!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showCopyError();
        }
    }

    async copyHtml() {
        let markdown;
        if (this.currentMode === 'markdown') {
            markdown = this.editor.value;
        } else {
            markdown = this.richTextEditor.getMarkdown();
        }
        try {
            const html = markdownParser.parse(markdown);
            await navigator.clipboard.writeText(html);
            this.showCopySuccess('HTML copied!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showCopyError();
        }
    }

    showCopySuccess(message) {
        const originalStatus = this.saveStatus.textContent;
        this.updateSaveStatus(message);
        setTimeout(() => {
            this.updateSaveStatus(originalStatus);
        }, 2000);
    }

    showCopyError() {
        alert('Failed to copy to clipboard. Please try again.');
    }

    setupResizer() {
        const resizer = document.querySelector('.resizer');
        const editorPane = document.querySelector('.editor-pane');
        const previewPane = document.querySelector('.preview-pane');
        const container = document.querySelector('.main-content');

        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.body.style.cursor = 'col-resize';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const containerRect = container.getBoundingClientRect();
            const offsetX = e.clientX - containerRect.left;
            const percentage = (offsetX / containerRect.width) * 100;

            // Limit between 20% and 80%
            if (percentage > 20 && percentage < 80) {
                editorPane.style.flex = `0 0 ${percentage}%`;
                previewPane.style.flex = `0 0 ${100 - percentage}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = 'default';
            }
        });
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MarkdownEditor();
});
