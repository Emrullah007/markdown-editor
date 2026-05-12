# Markdown Editor

A modern, feature-rich markdown and rich text editor with live preview, syntax highlighting, and export capabilities. Built with vanilla JavaScript, HTML, and CSS.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-brightgreen)](https://markdown-editor-hazel.vercel.app/)
![Markdown Editor](https://img.shields.io/badge/Editor-Markdown-blue)
![Rich Text](https://img.shields.io/badge/Editor-Rich%20Text-purple)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-1.2.1-brightgreen)
![PWA](https://img.shields.io/badge/PWA-Installable-blue)

## Features

### Core Functionality
- **Dual Editor Modes** - Toggle between Markdown and Rich Text (WYSIWYG) editing
- **Live Preview** - Real-time markdown rendering as you type
- **Auto-save** - Automatic saving to browser's local storage every 2 seconds
- **Undo/Redo** - Full history management with Ctrl+Z and Ctrl+Shift+Z shortcuts
- **Find & Replace** - Powerful search with regex support, case sensitivity, and whole word matching
- **Custom Themes** - 8 beautiful themes including Light, Dark, Ocean, Forest, Sunset, Lavender, Rose, and Mint
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Fullscreen Mode** - Expand editor or preview to fullscreen for focused work
- **Word Count** - Live statistics showing word count, character count, and reading time
- **PWA Support** - Install as a standalone app, works offline

### Writing Enhancements
- **Markdown Syntax Highlighting** - Real-time syntax coloring in the editor
- **Auto-pair Characters** - Automatically close brackets, quotes, and markdown syntax
- **Statistics Panel** - Detailed document analytics with reading level
- **Markdown Templates** - 10 built-in templates for common document types

### Import/Export Options
- Import Markdown files (.md, .markdown, .txt) from disk
- Download as Markdown (.md)
- **Download as PDF** - Export your document as a PDF file
- Copy markdown to clipboard
- Copy HTML to clipboard

### Editor Features
- **Resizable split-pane layout** - Drag the divider between editor and preview
- **GitHub Flavored Markdown (GFM)** support
- **Syntax highlighting** for code blocks (powered by Highlight.js)
- **Rich Text Toolbar** - Bold, italic, underline, headings, lists, and more
- **Image Support** - Paste from clipboard, drag-and-drop, or upload files
- **Lazy Loading Images** - Optimized image loading for better performance
- **Table Insertion** - Create tables with custom rows and columns
- **Code Blocks** - Insert formatted code with syntax highlighting
- **Link & Image Insertion** - Easy insertion with prompts
- **Keyboard shortcuts** - Comprehensive keyboard support
- **Security** - XSS protection with DOMPurify sanitization

### Accessibility
- Full keyboard navigation support
- ARIA labels and roles throughout
- Screen reader friendly
- Focus management

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
5. **Change Theme** - Click the Theme button to choose from 8 beautiful themes
6. **Find & Replace** - Press Ctrl+F to search, Ctrl+H for find & replace
7. **Export Your Work** - Use the toolbar buttons to download or copy
8. **Fullscreen** - Click the fullscreen icon on editor or preview for focused work

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `⌘+S` | Download markdown file |
| `Ctrl+F` / `⌘+F` | Open Find dialog |
| `Ctrl+H` / `⌘+H` | Open Find & Replace dialog |
| `Ctrl+Z` / `⌘+Z` | Undo |
| `Ctrl+Shift+Z` / `⌘+Shift+Z` | Redo |
| `Ctrl+Y` / `⌘+Y` | Redo (alternative) |
| `Ctrl+B` / `⌘+B` | Bold (Rich Text mode) |
| `Ctrl+I` / `⌘+I` | Italic (Rich Text mode) |
| `Ctrl+U` / `⌘+U` | Underline (Rich Text mode) |
| `Ctrl+K` / `⌘+K` | Insert link (Rich Text mode) |
| `Ctrl+Shift+X` / `⌘+Shift+X` | Strikethrough (Rich Text mode) |

### Find & Replace Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Find next |
| `Shift+Enter` | Find previous |
| `Escape` | Close dialog |

## Themes

The editor comes with 8 beautiful built-in themes:

| Theme | Description |
|-------|-------------|
| **Light** | Clean, bright default theme |
| **Dark** | Easy on the eyes for low-light environments |
| **Ocean** | Deep blue tones inspired by the sea |
| **Forest** | Natural green hues for a calm experience |
| **Sunset** | Warm orange and red tones |
| **Lavender** | Soft purple aesthetic |
| **Rose** | Light pink theme with red accents |
| **Mint** | Fresh green and teal combination |

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
- IndexedDB API
- Clipboard API (for copy functions)
- Intersection Observer API (for lazy loading)

## Project Structure

```
markdown-editor/
├── index.html              # Main HTML file
├── styles.css              # CSS styling with themes
├── app.js                  # Core application logic
├── markdown-parser.js      # Markdown parsing wrapper
├── rich-text-editor.js     # Rich text editor functionality
├── image-storage.js        # IndexedDB image storage
├── history-manager.js      # Undo/redo history management
├── find-replace.js         # Find & Replace functionality
├── pdf-export.js           # PDF export functionality
├── syntax-highlighter.js   # Markdown syntax highlighting
├── auto-pair.js            # Auto-pair characters
├── statistics-panel.js     # Detailed statistics panel
├── templates.js            # Markdown templates library
├── sw.js                   # Service worker for PWA
├── manifest.json           # PWA manifest
├── package.json            # Project metadata and scripts
├── playwright.config.js    # E2E test configuration
├── tests/                  # Unit tests (Jest)
│   ├── setup.js
│   ├── history-manager.test.js
│   ├── find-replace.test.js
│   └── image-storage.test.js
├── e2e/                    # E2E tests (Playwright)
│   └── editor.spec.js
├── docs/                   # Documentation
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
├── Claude.md               # AI context & changelog
└── README.md               # This file
```

## Features in Detail

### Find & Replace
Powerful search functionality with:
- Case-sensitive search option
- Whole word matching
- Regular expression support
- Navigate between matches
- Replace single or all occurrences
- Works in both Markdown and Rich Text modes

### Auto-save
Your content is automatically saved to the browser's localStorage every 2 seconds after you stop typing. When you return to the editor, your previous work is automatically restored.

### Undo/Redo
Full history management with support for up to 100 states. Use Ctrl+Z to undo and Ctrl+Shift+Z or Ctrl+Y to redo. History is debounced to avoid saving every keystroke, creating a smooth editing experience.

### Custom Themes
Toggle between 8 beautiful themes. Your preference is saved and will be remembered on your next visit. The editor also detects your system's color scheme preference on first load.

### Import
Open markdown files directly from your disk. Supports .md, .markdown, and .txt files. The editor will prompt you before replacing existing content.

### Export
- **Download .md** - Save your markdown as a file
- **Download .html** - Export as a standalone HTML document with embedded styles
- **Download .pdf** - Export as a PDF document (uses print dialog or html2pdf if available)
- **Copy MD** - Copy raw markdown to clipboard
- **Copy HTML** - Copy rendered HTML to clipboard

### Word Count
Live statistics display in the footer showing:
- **Word count** - Total number of words in your document
- **Character count** - Total characters (excluding whitespace)
- **Reading time** - Estimated reading time based on 200 words per minute

### Image Storage
Images are stored efficiently in IndexedDB instead of localStorage, supporting files up to 10MB. Images are:
- Automatically loaded when you reopen your documents
- Lazy-loaded for better performance
- Cleaned up when no longer referenced

### Resizable Panes
Drag the divider between the editor and preview panes to adjust their sizes according to your preference.

## Development

### Running Tests

```bash
# Install dev dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Roadmap

### ✅ Recently Added (v1.2.0)
- Markdown Syntax Highlighting
- Auto-pair Characters
- Statistics Panel with Reading Level
- Markdown Templates (10 templates)
- PWA/Offline Support
- E2E Tests with Playwright

### 🚀 Future
- Multiple file/tab support
- Custom theme builder
- Visual table editor
- Vim/Emacs keybindings
- Export to Word (.docx)
- Collaborative editing (requires backend)
- Cloud sync (requires backend)

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
