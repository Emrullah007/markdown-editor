# Markdown Editor

A modern, feature-rich markdown editor with live preview, syntax highlighting, and export capabilities. Built with vanilla JavaScript, HTML, and CSS.

![Markdown Editor](https://img.shields.io/badge/Editor-Markdown-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- **Live Preview** - Real-time markdown rendering as you type
- **Auto-save** - Automatic saving to browser's local storage every 2 seconds
- **Dark Mode** - Eye-friendly dark theme with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### Export Options
- Download as Markdown (.md)
- Download as HTML (.html)
- Copy markdown to clipboard
- Copy HTML to clipboard

### Editor Features
- Resizable split-pane layout (drag the divider)
- GitHub Flavored Markdown (GFM) support
- Syntax highlighting for code blocks (powered by Highlight.js)
- Support for tables, task lists, and more
- Keyboard shortcuts (Ctrl+S to download)
- Clear editor with confirmation dialog

## Technology Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS Grid, Flexbox, and CSS Variables
- **Vanilla JavaScript (ES6+)** - No frameworks required
- **Marked.js** - Markdown parsing library
- **Highlight.js** - Code syntax highlighting

## Getting Started

### Installation

1. Clone this repository or download the files
2. Open `index.html` in your web browser
3. Start typing markdown in the left pane
4. See the live preview in the right pane

No build process or dependencies installation required! Just open and use.

### Usage

1. **Write Markdown** - Type your markdown in the editor pane (left side)
2. **View Preview** - See the rendered HTML in the preview pane (right side)
3. **Toggle Dark Mode** - Click the moon/sun icon in the header
4. **Export Your Work** - Use the toolbar buttons to download or copy
5. **Clear Editor** - Click the "Clear" button to start fresh

### Keyboard Shortcuts

- `Ctrl+S` (or `Cmd+S` on Mac) - Download markdown file

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
├── index.html           # Main HTML file
├── styles.css           # CSS styling with dark mode
├── app.js              # Application logic
├── markdown-parser.js  # Markdown parsing wrapper
├── package.json        # Project metadata
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Features in Detail

### Auto-save
Your content is automatically saved to the browser's localStorage every 2 seconds after you stop typing. When you return to the editor, your previous work is automatically restored.

### Dark Mode
Toggle between light and dark themes. Your preference is saved and will be remembered on your next visit. The editor also detects your system's color scheme preference on first load.

### Export
- **Download .md** - Save your markdown as a file
- **Download .html** - Export as a standalone HTML document with embedded styles
- **Copy MD** - Copy raw markdown to clipboard
- **Copy HTML** - Copy rendered HTML to clipboard

### Resizable Panes
Drag the divider between the editor and preview panes to adjust their sizes according to your preference.

## Future Enhancements

Potential features for future versions:
- PDF export
- Import markdown files
- Multiple file/tab support
- Custom themes
- Vim/Emacs keybindings
- Markdown templates
- Word count and reading time
- Collaborative editing
- Cloud sync

## Contributing

This is a demonstration project created with Claude Code. Feel free to fork and enhance!

## License

MIT License - Feel free to use this project for any purpose.

## Credits

Built with:
- [Marked.js](https://marked.js.org/) - Fast markdown parser
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting
- Created with [Claude Code](https://claude.com/claude-code)

---

**Start editing and see the magic happen!** ✨

Created on 2026-01-10
