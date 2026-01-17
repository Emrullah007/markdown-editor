# Markdown Editor

A modern, feature-rich markdown and rich text editor with live preview, syntax highlighting, and export capabilities. Built with vanilla JavaScript, HTML, and CSS.

![Markdown Editor](https://img.shields.io/badge/Editor-Markdown-blue)
![Rich Text](https://img.shields.io/badge/Editor-Rich%20Text-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- **Dual Editor Modes** - Toggle between Markdown and Rich Text (WYSIWYG) editing
- **Live Preview** - Real-time markdown rendering as you type
- **Auto-save** - Automatic saving to browser's local storage every 2 seconds
- **Undo/Redo** - Full history management with Ctrl+Z and Ctrl+Shift+Z shortcuts
- **Dark Mode** - Eye-friendly dark theme with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Fullscreen Mode** - Expand editor or preview to fullscreen for focused work
- **Word Count** - Live statistics showing word count, character count, and reading time

### Import/Export Options
- Import Markdown files (.md, .markdown, .txt) from disk
- Download as Markdown (.md)
- Download as HTML (.html)
- Copy markdown to clipboard
- Copy HTML to clipboard

### Editor Features
- **Resizable split-pane layout** - Drag the divider between editor and preview
- **GitHub Flavored Markdown (GFM)** support
- **Syntax highlighting** for code blocks (powered by Highlight.js)
- **Rich Text Toolbar** - Bold, italic, underline, headings, lists, and more
- **Image Support** - Paste from clipboard, drag-and-drop, or upload files
- **Table Insertion** - Create tables with custom rows and columns
- **Code Blocks** - Insert formatted code with syntax highlighting
- **Link & Image Insertion** - Easy insertion with prompts
- **Keyboard shortcuts** - Ctrl/Cmd+S to download
- **Security** - XSS protection with DOMPurify sanitization

## Technology Stack

- **HTML5** - Semantic structure with Content Security Policy
- **CSS3** - Modern styling with CSS Grid, Flexbox, and CSS Variables
- **Vanilla JavaScript (ES6+)** - No frameworks required
- **Marked.js** - Markdown to HTML parsing
- **Turndown.js** - HTML to Markdown conversion
- **Highlight.js** - Code syntax highlighting
- **DOMPurify** - XSS protection and HTML sanitization

## Getting Started

### Installation

1. Clone this repository or download the files
2. Open `index.html` in your web browser
3. Start typing markdown in the left pane
4. See the live preview in the right pane

No build process or dependencies installation required! Just open and use.

### Usage

1. **Choose Editor Mode** - Toggle between Markdown and Rich Text editing
2. **Write Content** - Type your content in the editor pane (left side)
3. **View Preview** - See the rendered HTML in the preview pane (right side)
4. **Format Text** - Use the rich text toolbar for formatting (in Rich Text mode)
5. **Toggle Dark Mode** - Click the moon/sun icon in the header
6. **Export Your Work** - Use the toolbar buttons to download or copy
7. **Fullscreen** - Click the fullscreen icon on editor or preview for focused work

### Keyboard Shortcuts

- `Ctrl+S` (or `Cmd+S` on Mac) - Download markdown file
- `Ctrl+Z` (or `Cmd+Z` on Mac) - Undo
- `Ctrl+Shift+Z` or `Ctrl+Y` (or `Cmd+Shift+Z` / `Cmd+Y` on Mac) - Redo
- `Ctrl+B` (or `Cmd+B` on Mac) - Bold (in Rich Text mode)
- `Ctrl+I` (or `Cmd+I` on Mac) - Italic (in Rich Text mode)
- `Ctrl+U` (or `Cmd+U` on Mac) - Underline (in Rich Text mode)
- `Ctrl+K` (or `Cmd+K` on Mac) - Insert link (in Rich Text mode)
- `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) - Strikethrough (in Rich Text mode)

## Supported Markdown Features

- Headers (H1-H6)
- Bold, italic, strikethrough
- Ordered and unordered lists
- Nested lists
- Links and images
- Inline code and code blocks
- Syntax highlighting for code
- Blockquotes
- Tables
- Task lists (checkboxes)
- Horizontal rules
- GitHub Flavored Markdown extensions

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires JavaScript enabled and support for:
- ES6+ features
- LocalStorage API
- Clipboard API (for copy functions)

## Project Structure

```
markdown-editor/
├── index.html              # Main HTML file
├── styles.css              # CSS styling with dark mode
├── app.js                  # Core application logic
├── markdown-parser.js      # Markdown parsing wrapper
├── rich-text-editor.js     # Rich text editor functionality
├── image-storage.js        # IndexedDB image storage
├── history-manager.js      # Undo/redo history management
├── package.json            # Project metadata
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## Features in Detail

### Auto-save
Your content is automatically saved to the browser's localStorage every 2 seconds after you stop typing. When you return to the editor, your previous work is automatically restored.

### Undo/Redo
Full history management with support for up to 100 states. Use Ctrl+Z to undo and Ctrl+Shift+Z or Ctrl+Y to redo. History is debounced to avoid saving every keystroke, creating a smooth editing experience.

### Dark Mode
Toggle between light and dark themes. Your preference is saved and will be remembered on your next visit. The editor also detects your system's color scheme preference on first load.

### Import
Open markdown files directly from your disk. Supports .md, .markdown, and .txt files. The editor will prompt you before replacing existing content.

### Export
- **Download .md** - Save your markdown as a file
- **Download .html** - Export as a standalone HTML document with embedded styles
- **Copy MD** - Copy raw markdown to clipboard
- **Copy HTML** - Copy rendered HTML to clipboard

### Word Count
Live statistics display in the footer showing:
- **Word count** - Total number of words in your document
- **Character count** - Total characters (excluding whitespace)
- **Reading time** - Estimated reading time based on 200 words per minute

### Image Storage
Images are stored efficiently in IndexedDB instead of localStorage, supporting files up to 10MB. Images are automatically loaded when you reopen your documents.

### Resizable Panes
Drag the divider between the editor and preview panes to adjust their sizes according to your preference.

## Future Enhancements

Potential features for future versions:
- PDF export
- Multiple file/tab support
- Custom themes and theme builder
- Vim/Emacs keybindings
- Markdown templates library
- Collaborative editing (requires backend)
- Cloud sync (requires backend)
- Spell checker
- Find and replace functionality

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

Ways to contribute:
- Report bugs and suggest features
- Submit pull requests for improvements
- Improve documentation
- Share the project with others

Please review our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

Built with:
- [Marked.js](https://marked.js.org/) - Fast markdown parser
- [Turndown.js](https://github.com/mixmark-io/turndown) - HTML to Markdown conversion
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting
- [DOMPurify](https://github.com/cure53/DOMPurify) - XSS protection
- Created by [Emrullah Celik](https://www.emrullahcelik.com/)
- Developed with [Claude Code](https://claude.com/claude-code)

---

**Start editing and see the magic happen!** ✨

For questions or support, visit the [GitHub repository](https://github.com/Emrullah007/markdown-editor).
