# Contributing to Markdown Editor

Thank you for your interest in contributing to Markdown Editor! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be considerate and constructive in your communications.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on GitHub with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots (if applicable)
- Browser and OS information

### Suggesting Enhancements

We welcome feature suggestions! Please open an issue with:
- A clear description of the proposed feature
- Use cases and benefits
- Any implementation ideas (optional)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly in multiple browsers
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description of your changes

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Emrullah007/markdown-editor.git
cd markdown-editor
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server
```

3. Make your changes and test locally

## Coding Standards

### JavaScript
- Use ES6+ features (const/let, arrow functions, async/await)
- Follow camelCase naming convention
- Add comments for complex logic
- Handle errors gracefully
- Sanitize all user input to prevent XSS

### HTML
- Use semantic HTML5 elements
- Include accessibility attributes (aria-labels, alt text)
- Maintain proper indentation (4 spaces)

### CSS
- Use CSS custom properties for theming
- Follow BEM-like naming for components
- Support both light and dark modes
- Ensure responsive design

### Security
- Always sanitize HTML output using DOMPurify
- Never use `innerHTML` with unsanitized content
- Validate user input before processing
- Follow Content Security Policy guidelines

## Testing Checklist

Before submitting a pull request, please verify:

- [ ] Works in Chrome, Firefox, and Safari
- [ ] Dark mode functions correctly
- [ ] Mobile responsive design maintained
- [ ] Auto-save works as expected
- [ ] Export features (MD/HTML) work correctly
- [ ] Rich text and markdown modes both function properly
- [ ] Images can be pasted, dragged, and uploaded
- [ ] Tables render correctly
- [ ] No console errors
- [ ] No security vulnerabilities introduced

## Project Structure

```
markdown-editor/
├── index.html              # Main HTML structure
├── app.js                  # Core application logic
├── markdown-parser.js      # Markdown parsing utilities
├── rich-text-editor.js     # Rich text editor functionality
├── styles.css              # All styling
├── README.md               # Project documentation
├── LICENSE                 # MIT License
└── CONTRIBUTING.md         # This file
```

## Key Libraries Used

- **Marked.js** - Markdown to HTML conversion
- **Turndown.js** - HTML to Markdown conversion
- **Highlight.js** - Syntax highlighting for code blocks
- **DOMPurify** - XSS protection and HTML sanitization

## Questions?

If you have questions about contributing, feel free to:
- Open an issue for discussion
- Contact the maintainer at [emrullahcelik.com](https://www.emrullahcelik.com/)

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Markdown Editor! 🚀
