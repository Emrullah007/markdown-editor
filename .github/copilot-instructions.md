# GitHub Copilot Instructions for Markdown Editor

## Project Overview

This is a modern, feature-rich markdown and rich text editor built with vanilla JavaScript. The application provides dual editor modes (Markdown and Rich Text WYSIWYG), live preview, syntax highlighting, and export capabilities. It is designed as a Progressive Web App (PWA) that works offline and can be installed as a standalone application.

**Target Users**: Writers, developers, students, and anyone who needs a powerful markdown editing tool.

**Core Features**: Dual editor modes, live preview, auto-save, undo/redo, find & replace, custom themes, export to MD/HTML/PDF, image support, PWA support.

## Technology Stack

- **HTML5** - Semantic markup with Content Security Policy (CSP)
- **CSS3** - Modern styling with CSS Grid, Flexbox, and CSS Variables for theming
- **Vanilla JavaScript (ES6+)** - No frameworks; pure JavaScript implementation
- **Marked.js v11.1.1** - Fast markdown to HTML parsing
- **Turndown.js v7.1.2** - HTML to Markdown conversion  
- **Highlight.js** - Syntax highlighting for code blocks in preview
- **DOMPurify v3.2.4+** - XSS protection and HTML sanitization
- **IndexedDB** - Client-side image storage (up to 10MB per image)
- **LocalStorage** - Document auto-save and theme persistence
- **Service Worker** - Offline support and PWA functionality
- **Jest v29.7.0** - Unit testing framework
- **Playwright v1.40.0** - End-to-end testing framework

## Coding Standards

### JavaScript

- **Use ES6+ features exclusively**: const/let (never var), arrow functions, async/await, template literals, destructuring
- **Naming conventions**:
  - camelCase for variables and functions
  - PascalCase for class names (if used)
  - UPPERCASE_SNAKE_CASE for constants that never change
- **Prefer functional programming**: Pure functions when possible, avoid side effects
- **Error handling**: Always use try/catch for async operations and operations that may fail
- **Comments**: Add JSDoc-style comments for functions; inline comments only for complex logic
- **Avoid global scope pollution**: Use modules or IIFEs to encapsulate functionality
- **Event listeners**: Always remove event listeners when they're no longer needed to prevent memory leaks

### HTML

- **Use semantic HTML5 elements**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- **Accessibility first**:
  - Include ARIA labels and roles for interactive elements
  - Provide alt text for all images
  - Ensure keyboard navigation works for all interactive elements
  - Use proper heading hierarchy (h1 → h2 → h3, etc.)
- **Indentation**: Use 4 spaces consistently
- **Security**: Follow Content Security Policy (CSP) directives defined in index.html

### CSS

- **Use CSS custom properties** (CSS variables) for all theme-related values
- **Naming**: Follow BEM-like naming for component styles (e.g., `.editor__toolbar-button`)
- **Organization**: Group related styles together, add section comments
- **Theming**: Support all 8 themes (Light, Dark, Ocean, Forest, Sunset, Lavender, Rose, Mint)
- **Responsive design**: Use mobile-first approach with appropriate breakpoints
- **Modern features**: Utilize CSS Grid, Flexbox, and modern CSS features
- **Avoid inline styles**: All styling should be in styles.css

## Security Guidelines

**CRITICAL SECURITY RULES - MUST FOLLOW:**

- **Always sanitize HTML** using DOMPurify before inserting into the DOM
- **Never use `innerHTML`** with unsanitized content; always sanitize first with `DOMPurify.sanitize()`
- **Validate user input** before processing, especially for URLs, file uploads, and user-generated content
- **URL validation**: Block dangerous protocols (javascript:, data:, vbscript:, file:); only allow http://, https://, and mailto:
- **XSS protection**: All user-generated HTML must pass through DOMPurify
- **Content Security Policy**: Follow the CSP defined in index.html; do not weaken it
- **No eval()**: Never use eval() or Function() constructor with user input
- **Local storage**: Never store sensitive information in localStorage or IndexedDB
- **Image uploads**: Validate file types and sizes before processing

### Security Implementation Examples

```javascript
// ✅ CORRECT: Sanitize before inserting HTML
const sanitized = DOMPurify.sanitize(userInput);
element.innerHTML = sanitized;

// ❌ INCORRECT: Direct innerHTML assignment
element.innerHTML = userInput; // NEVER DO THIS

// ✅ CORRECT: URL validation
function isValidUrl(url) {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.startsWith('http://') || 
           lowerUrl.startsWith('https://') || 
           lowerUrl.startsWith('mailto:');
}

// ❌ INCORRECT: No URL validation
const link = `<a href="${userUrl}">Click</a>`; // Vulnerable to javascript: protocol
```

## Testing Guidelines

### Unit Tests (Jest)

- **Location**: All unit tests go in the `tests/` directory with `.test.js` extension
- **Framework**: Use Jest v29.7.0 with jsdom environment
- **Test file naming**: Match the source file name (e.g., `history-manager.js` → `history-manager.test.js`)
- **Coverage**: Aim for good coverage of core functionality
- **Run tests**: Use `npm test` for single run, `npm run test:watch` for watch mode
- **Setup**: Common test setup goes in `tests/setup.js`

### E2E Tests (Playwright)

- **Location**: E2E tests go in the `e2e/` directory with `.spec.js` extension  
- **Framework**: Use Playwright v1.40.0
- **Run tests**: Use `npm run test:e2e` for headless, `npm run test:e2e:headed` for headed mode
- **Focus**: Test critical user workflows (editing, preview, export, find/replace)

### Testing Best Practices

- Write tests before fixing bugs (TDD when appropriate)
- Test edge cases and error conditions
- Mock external dependencies (localStorage, IndexedDB, fetch)
- Keep tests focused and independent
- Use descriptive test names that explain what is being tested

```javascript
// ✅ GOOD: Descriptive test name
test('should restore cursor position after undo operation', () => { ... });

// ❌ BAD: Vague test name  
test('undo works', () => { ... });
```

## File Structure and Patterns

### Module Organization

Each feature module (e.g., `history-manager.js`, `find-replace.js`) should:
- Export a single object or set of related functions
- Be self-contained with minimal dependencies
- Include proper error handling
- Document public APIs with JSDoc comments

### Main Application Files

- **app.js** - Core application logic, initialization, event handling
- **index.html** - Main HTML structure, loads all dependencies in correct order
- **styles.css** - All CSS including 8 theme definitions
- **markdown-parser.js** - Wrapper for Marked.js markdown parsing
- **rich-text-editor.js** - Rich text (WYSIWYG) editing functionality
- **sw.js** - Service worker for PWA/offline support

### Library Loading Order

Libraries must be loaded from `/libs` in this specific order (see index.html):
1. marked.min.js
2. purify.min.js  
3. turndown.js
4. turndown-plugin-gfm.js
5. highlight.min.js
6. Application modules (app.js, etc.)

## Common Patterns

### LocalStorage Usage

```javascript
// Save to localStorage with error handling
try {
    localStorage.setItem('key', JSON.stringify(data));
} catch (e) {
    console.error('Failed to save to localStorage:', e);
}

// Load from localStorage
const data = JSON.parse(localStorage.getItem('key') || 'null');
```

### Cursor Position Management

```javascript
// Prevent cursor jump to end after setting textarea value
textarea.value = newContent;
textarea.setSelectionRange(0, 0); // Move cursor to start
```

### Event Listener Pattern

```javascript
// Store references for cleanup
const handleClick = (e) => { ... };
element.addEventListener('click', handleClick);

// Cleanup when needed
element.removeEventListener('click', handleClick);
```

## Build and Development Commands

- **No build step required** - This is a vanilla JavaScript application
- **Serve locally**: `npm run serve` (uses http-server on port 8080)
- **Run unit tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch`
- **Run tests with coverage**: `npm run test:coverage`
- **Run E2E tests**: `npm run test:e2e`
- **Run E2E tests with UI**: `npm run test:e2e:ui`

## Code Style Examples

### ✅ Preferred Patterns

```javascript
// Use const/let, not var
const API_KEY = 'constant-value';
let userInput = '';

// Arrow functions for callbacks
element.addEventListener('click', (e) => {
    e.preventDefault();
    handleAction();
});

// Template literals for strings
const message = `Hello, ${userName}! You have ${count} items.`;

// Destructuring
const { width, height } = element.getBoundingClientRect();

// Async/await for asynchronous operations
async function saveDocument() {
    try {
        await imageStorage.saveAllImages();
        localStorage.setItem('document', content);
    } catch (error) {
        console.error('Save failed:', error);
    }
}

// Pure functions when possible
function calculateReadingTime(wordCount) {
    return Math.ceil(wordCount / 200); // 200 words per minute
}
```

### ❌ Patterns to Avoid

```javascript
// Don't use var
var count = 0; // Use const or let

// Don't use function declarations when arrow functions are clearer
element.addEventListener('click', function(e) { ... }); // Use arrow function

// Don't concatenate strings
const message = 'Hello, ' + userName + '!'; // Use template literals

// Don't use innerHTML without sanitization
element.innerHTML = userInput; // Always use DOMPurify.sanitize()

// Don't ignore errors
async function save() {
    await operation(); // Always wrap in try/catch
}
```

## Accessibility Requirements

- All interactive elements must be keyboard accessible
- Use proper ARIA labels for screen readers
- Maintain focus management (especially in modals and dialogs)
- Ensure sufficient color contrast in all themes
- Test with keyboard-only navigation

## Performance Considerations

- Use debouncing for auto-save (currently 2 seconds)
- Lazy load images in preview using Intersection Observer API
- Minimize DOM manipulations; batch updates when possible
- Clean up unused images from IndexedDB periodically
- Use requestAnimationFrame for smooth animations

## Documentation Standards

- Keep README.md up to date with new features
- Update CONTRIBUTING.md if development process changes
- Document breaking changes in Claude.md changelog
- Add JSDoc comments for public APIs and complex functions
- Include usage examples in documentation

## Common Tasks

### Adding a New Feature Module

1. Create new `.js` file in root directory
2. Follow existing module pattern (export object with methods)
3. Add unit tests in `tests/` directory
4. Update index.html to load the new script
5. Update README.md with feature documentation
6. Add appropriate event listeners in app.js

### Adding a New Theme

1. Add theme definition in styles.css under `/* Themes */` section
2. Define all CSS custom properties for the theme
3. Add theme to theme selector in index.html
4. Update README.md theme table
5. Test all UI components with the new theme

### Fixing a Security Vulnerability

1. Identify the vulnerability and affected code
2. Write a test that demonstrates the vulnerability
3. Implement the fix using DOMPurify or proper validation
4. Verify the test passes
5. Update security documentation if needed
6. Document in SECURITY.md if it's a disclosed vulnerability

## Questions or Clarifications?

If you're unsure about any coding decision:
- Check existing code for similar patterns
- Review CONTRIBUTING.md guidelines
- Prioritize security and accessibility
- Maintain consistency with the vanilla JavaScript approach
- When in doubt, keep it simple and maintainable
