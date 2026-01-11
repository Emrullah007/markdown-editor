# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

This project implements several security measures:

### XSS Protection
- **DOMPurify Sanitization**: All HTML output is sanitized using DOMPurify with a strict whitelist
- **Content Security Policy**: CSP headers restrict script and style sources
- **No eval() or Function()**: Code doesn't use dangerous JavaScript functions
- **Safe innerHTML usage**: All user-generated content is sanitized before rendering

### Data Protection
- **Client-side only**: All data is stored locally in browser's localStorage
- **No server communication**: No data is sent to external servers
- **Base64 image encoding**: Images are embedded as data URIs, not uploaded

### External Dependencies
- All CDN resources use HTTPS with SRI (Subresource Integrity) recommended
- Libraries used:
  - Marked.js (Markdown parsing)
  - Turndown.js (HTML to Markdown)
  - Highlight.js (Syntax highlighting)
  - DOMPurify (XSS protection)

## Security Best Practices for Users

1. **Keep browsers updated**: Use the latest version of modern browsers
2. **Review localStorage data**: Clear localStorage if you've pasted sensitive information
3. **Use HTTPS**: When deploying, always use HTTPS
4. **Verify integrity**: Check that CDN resources load correctly

## Known Limitations

- **localStorage size**: Limited to ~5-10MB depending on browser
- **Client-side only**: No server-side validation or backup
- **Browser security**: Relies on browser's security model
