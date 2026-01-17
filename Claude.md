# Claude.md - Markdown Editor Project

## Project Overview

This is a modern, feature-rich markdown and rich text editor built with vanilla JavaScript, HTML, and CSS. The application provides dual editor modes (Markdown and Rich Text), live preview, syntax highlighting, and export capabilities—all running entirely in the browser with no backend required.

## Architecture

### Core Technologies
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JavaScript
- **Marked.js** - Markdown to HTML parsing
- **Turndown.js** - HTML to Markdown conversion
- **Highlight.js** - Code syntax highlighting
- **DOMPurify** - XSS protection and HTML sanitization

### Design Principles
- No build process required - just open `index.html` in a browser
- Client-side only - uses localStorage for persistence
- Responsive design for desktop, tablet, and mobile
- Security-first with Content Security Policy and DOMPurify sanitization

## File Structure

```
markdown-editor/
├── index.html              # Main HTML structure, includes all library CDNs
├── styles.css              # Complete styling with dark mode, responsive design
├── app.js                  # Core application logic, state management, UI controls
├── markdown-parser.js      # Markdown parsing wrapper using Marked.js
├── rich-text-editor.js     # Rich text editor functionality and toolbar
├── image-storage.js        # IndexedDB wrapper for efficient image storage
├── history-manager.js      # Undo/redo history management
├── package.json            # Project metadata
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
├── SECURITY.md             # Security policy
├── .gitignore              # Git ignore rules
├── README.md               # User-facing documentation
└── Claude.md               # This file - AI context
```

## Key Files and Their Responsibilities

### index.html
- HTML5 semantic structure
- Content Security Policy headers
- CDN imports for all libraries (Marked, Turndown, Highlight.js, DOMPurify)
- Editor and preview panes with resizable divider
- Toolbar with export and mode toggle buttons
- Rich text formatting toolbar

### styles.css
- CSS Grid and Flexbox layouts
- CSS Variables for theming (light/dark mode)
- Responsive breakpoints for mobile, tablet, desktop
- Syntax highlighting theme integration
- Print styles
- Fullscreen mode styles

### app.js
Main application controller that handles:
- Editor mode switching (Markdown ↔ Rich Text)
- Auto-save to localStorage (2-second debounce)
- Dark mode toggle with system preference detection
- Import functionality (open .md, .markdown, .txt files from disk)
- Export functionality (download .md, .html, copy to clipboard)
- Undo/redo integration with keyboard shortcuts
- Word count, character count, and reading time statistics
- Keyboard shortcuts (Ctrl/Cmd+S, Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, etc.)
- Pane resizing
- Fullscreen mode for editor and preview
- State synchronization between editor and preview
- IndexedDB initialization and image loading

### markdown-parser.js
Wrapper for Marked.js that:
- Configures GitHub Flavored Markdown (GFM)
- Enables syntax highlighting via Highlight.js
- Sanitizes output with DOMPurify for XSS protection
- Handles code block rendering

### rich-text-editor.js
Rich text editing capabilities:
- WYSIWYG toolbar (bold, italic, underline, headings, lists)
- Image insertion (paste, drag-drop, file upload)
- Table creation dialog
- Code block insertion
- Link insertion
- contenteditable element management
- HTML to Markdown conversion on mode switch
- IndexedDB integration for image storage

### image-storage.js
IndexedDB wrapper for efficient image storage:
- Stores images in IndexedDB instead of localStorage
- Supports images up to 10MB (increased from 2MB with localStorage)
- Automatic image cleanup for unused images
- Storage statistics tracking
- Converts base64 data URLs to indexed references (indexed://id)
- Provides better storage management without localStorage quota issues

### history-manager.js
Undo/redo functionality manager:
- Maintains history stack of editor states
- Supports up to 100 history states
- Debounced state saving (1 second) to avoid recording every keystroke
- Undo with Ctrl+Z (or Cmd+Z on Mac)
- Redo with Ctrl+Shift+Z, Ctrl+Y (or Cmd equivalents on Mac)
- Works seamlessly with both Markdown and Rich Text modes
- Automatic button state updates based on history availability

## Features

### Core Functionality
1. **Dual Editor Modes** - Markdown or Rich Text (WYSIWYG)
2. **Live Preview** - Real-time rendering with debounced updates
3. **Auto-save** - Every 2 seconds to localStorage
4. **Undo/Redo** - Full history management with keyboard shortcuts
5. **Dark Mode** - System preference detection + manual toggle
6. **Fullscreen Mode** - For editor or preview pane
7. **Responsive Design** - Works on all devices
8. **Word Count Statistics** - Live word count, character count, and reading time

### Import/Export Options
- **Import**: Open .md, .markdown, or .txt files from disk
- **Download as .md file**: Save your work as Markdown
- **Download as .html file**: Export as standalone HTML with embedded CSS
- **Copy markdown to clipboard**: Quick copy for sharing
- **Copy HTML to clipboard**: Copy rendered HTML

### Editor Features
- Resizable split-pane (drag divider)
- Syntax highlighting for code blocks (50+ languages)
- Image support (paste/drag-drop/upload) with IndexedDB storage
- Images up to 10MB supported
- Table insertion
- GitHub Flavored Markdown support
- Task lists with checkboxes
- XSS protection with DOMPurify
- URL validation for safe links

## Development Guidelines

### Code Style
- Use vanilla JavaScript (ES6+)
- No build tools or transpilation
- Keep dependencies to minimum (only essential libraries via CDN)
- Maintain security with DOMPurify sanitization
- Use CSS Variables for theming
- Follow semantic HTML5 practices

### Security Considerations
- All user content is sanitized with DOMPurify before rendering
- Content Security Policy is enforced
- No eval() or unsafe dynamic code execution
- localStorage is used for text content persistence (no server/database)
- Images are stored in IndexedDB with indexed references
- Image uploads are converted to base64 data URLs and stored locally
- URL validation prevents javascript:, data:, and other dangerous protocols in links

### Browser Compatibility
- Target: Modern browsers (Chrome, Firefox, Safari, Edge, Opera)
- Requires: ES6+, localStorage, IndexedDB, Clipboard API
- Graceful degradation for older browsers

## Common Tasks

### Adding a New Export Format
1. Add button to toolbar in `index.html`
2. Create export function in `app.js`
3. Handle format conversion (use existing libraries where possible)
4. Trigger download or copy to clipboard

### Adding a Rich Text Toolbar Button
1. Add button to toolbar in `index.html`
2. Create handler function in `rich-text-editor.js`
3. Use `document.execCommand()` or custom implementation
4. Update toolbar state on selection change

### Adding a New Theme
1. Add CSS variables in `styles.css`
2. Create theme toggle logic in `app.js`
3. Save preference to localStorage
4. Update theme switcher UI

### Modifying Markdown Rendering
1. Update configuration in `markdown-parser.js`
2. Modify Marked.js options or renderer
3. Update DOMPurify allowlist if needed
4. Test XSS protection

## State Management

The application uses a simple state management pattern:
- Current editor mode (markdown/richtext) stored in `currentEditorMode`
- Content stored in localStorage key `markdown-editor-content`
- Dark mode preference in localStorage key `markdown-editor-dark-mode`
- Images stored in IndexedDB (database: `MarkdownEditorDB`, store: `images`)
- Auto-save triggered via debounced input events (2-second delay)
- State is restored on page load from localStorage and IndexedDB

## Testing Considerations

When making changes, test:
1. **Cross-browser compatibility** - Chrome, Firefox, Safari, Edge
2. **Responsive behavior** - Mobile, tablet, desktop breakpoints
3. **Dark mode** - Toggle and system preference detection
4. **Export functions** - All 4 export options work correctly
5. **Auto-save** - Content persists across page reloads
6. **XSS protection** - Malicious input is sanitized
7. **Markdown rendering** - All GFM features render correctly
8. **Rich text editing** - Toolbar buttons and conversions work
9. **Image handling** - Paste, drag-drop, upload all work
10. **Keyboard shortcuts** - Ctrl/Cmd+S triggers download

## Future Enhancement Ideas

Based on the roadmap in README.md:
- PDF export capability
- Import markdown files from disk
- Multiple file/tab support
- Custom theme builder
- Vim/Emacs keybindings option
- Markdown templates library
- Word count and reading time statistics
- Collaborative editing (requires backend)
- Cloud sync (requires backend)

## Troubleshooting

### Common Issues
- **Content not saving**: Check localStorage quota (usually 5-10MB for text)
- **Images not saving**: Check IndexedDB availability and quota (usually 50MB+)
- **Syntax highlighting not working**: Verify Highlight.js CDN loaded
- **Export not working**: Check browser Clipboard API permissions
- **Images not displaying**: Verify IndexedDB is initialized and images are stored correctly
- **Dark mode not persisting**: Check localStorage access

### Security Notes
- Never disable DOMPurify sanitization
- Maintain Content Security Policy headers
- Avoid adding `eval()` or `innerHTML` without sanitization
- Review any new library additions for security vulnerabilities

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Quick checklist:
- Test in multiple browsers
- Maintain vanilla JavaScript (no framework dependencies)
- Keep security in mind (sanitize all user input)
- Update README.md if adding user-facing features
- Follow existing code style and patterns
- Keep performance optimized (it's a client-side app)

## License

MIT License - See [LICENSE](LICENSE) file.

---

**Built with Claude Code** - This project was developed using Claude Code, Anthropic's AI-powered development assistant.
