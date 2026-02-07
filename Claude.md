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
├── styles.css              # Complete styling with 8 themes, responsive design
├── app.js                  # Core application logic, state management, UI controls
├── markdown-parser.js      # Markdown parsing wrapper using Marked.js
├── rich-text-editor.js     # Rich text editor functionality and toolbar
├── image-storage.js        # IndexedDB wrapper for efficient image storage
├── history-manager.js      # Undo/redo history management
├── find-replace.js         # Find & Replace functionality with regex support
├── pdf-export.js           # PDF export using jsPDF and html2canvas
├── tests/                  # Unit tests
│   ├── setup.js            # Jest configuration and mocks
│   ├── history-manager.test.js
│   ├── find-replace.test.js
│   └── image-storage.test.js
├── docs/                   # Documentation
│   ├── VERCEL_SPEED_INSIGHTS.md
│   └── VERCEL_WEB_ANALYTICS.md
├── package.json            # Project metadata and test scripts
├── vercel.json             # Vercel deployment config
├── LICENSE                 # MIT License
├── CONTRIBUTING.md         # Contribution guidelines
├── SECURITY.md             # Security policy
├── README.md               # User-facing documentation
└── Claude.md               # This file - AI context & changelog
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

## Changelog

### v1.2.0 (January 2026)
Major feature update with writing enhancements and PWA support:

**New Features:**
- ✅ **Markdown Syntax Highlighting** - Real-time syntax coloring in editor textarea
- ✅ **Auto-pair Characters** - Automatically close brackets, quotes, and markdown syntax
- ✅ **Statistics Panel** - Detailed document analytics (words, sentences, reading level)
- ✅ **Markdown Templates** - 10 built-in templates (Meeting Notes, Blog Post, README, etc.)
- ✅ **PWA Support** - Install as app, offline support with service worker

**Code Quality:**
- ✅ **E2E Tests** - Playwright test suite for full user flow testing

**Files Added:**
- `syntax-highlighter.js` - Markdown syntax highlighting
- `auto-pair.js` - Auto-pair characters
- `statistics-panel.js` - Detailed statistics
- `templates.js` - Template library
- `sw.js` - Service worker for PWA
- `manifest.json` - PWA manifest
- `playwright.config.js` - Playwright configuration
- `e2e/editor.spec.js` - E2E test suite

### v1.1.0 (January 2026)
Major feature update with extensive enhancements:

**New Features:**
- ✅ **Find & Replace** - Full search with regex, case-sensitive, and whole word options
- ✅ **PDF Export** - Download documents as PDF using jsPDF and html2canvas
- ✅ **Custom Themes** - 8 beautiful themes (Light, Dark, Ocean, Forest, Sunset, Lavender, Rose, Mint)
- ✅ **Lazy Loading Images** - IntersectionObserver-based lazy loading for better performance
- ✅ **Keyboard Shortcuts** - Ctrl+F (Find), Ctrl+H (Find & Replace)

**Code Quality:**
- ✅ **JSDoc Comments** - All JavaScript files documented with JSDoc
- ✅ **Unit Tests** - Jest test suite for HistoryManager, FindReplace, and ImageStorage
- ✅ **Accessibility** - Improved keyboard navigation in rich text toolbar

**Files Added:**
- `find-replace.js` - Find & Replace functionality
- `pdf-export.js` - PDF export module
- `tests/setup.js` - Jest configuration
- `tests/history-manager.test.js` - HistoryManager unit tests
- `tests/find-replace.test.js` - FindReplace unit tests
- `tests/image-storage.test.js` - ImageStorage unit tests

### v1.0.0 (Initial Release)
- Dual editor modes (Markdown & Rich Text)
- Live preview with GitHub Flavored Markdown
- Auto-save to localStorage
- Undo/Redo with history management
- Dark mode with system preference detection
- Image support with IndexedDB storage
- Export as Markdown, HTML
- Resizable split-pane layout
- Fullscreen mode
- Word count statistics

---

## Roadmap

### ✅ Completed (v1.2.0)
| Feature | Description | Status |
|---------|-------------|--------|
| Markdown Syntax Highlighting | Highlight markdown syntax in editor textarea | ✅ Done |
| Auto-pair Characters | Auto-close brackets, quotes, markdown syntax | ✅ Done |
| Statistics Panel | Detailed stats (paragraphs, sentences, reading level) | ✅ Done |
| PWA/Offline Support | Service worker for offline usage | ✅ Done |
| Markdown Templates | Quick-insert templates (10 templates) | ✅ Done |
| E2E Tests | Playwright tests for full user flows | ✅ Done |

### 🚀 Future Considerations
| Feature | Description | Status |
|---------|-------------|--------|
| Multiple Tabs/Files | Work on multiple documents simultaneously | 🔲 Planned |
| Custom Theme Builder | Let users create their own themes | 🔲 Planned |
| Table Editor | Visual drag-and-drop table editing | 🔲 Planned |
| Vim/Emacs Keybindings | Optional keybinding modes | 🔲 Planned |
| Export to Word | Export documents as .docx | 🔲 Planned |
| Collaborative Editing | Real-time collaboration (requires backend) | 🔲 Future |
| Cloud Sync | Save to cloud storage (requires backend) | 🔲 Future |

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
