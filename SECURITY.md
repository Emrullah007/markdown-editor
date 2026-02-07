# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |

## Security Features

This project implements several security measures:

### XSS Protection
- **DOMPurify Sanitization**: All HTML output is sanitized using DOMPurify v3.2.4+ with a strict whitelist
- **Content Security Policy**: Strict CSP headers with minimal 'unsafe-inline' usage
- **No eval() or Function()**: Code doesn't use dangerous JavaScript functions
- **Safe innerHTML usage**: All user-generated content is sanitized before rendering
- **Input Validation**: URL and user input validation to block dangerous protocols and XSS patterns
- **execCommand usage**: The editor uses `document.execCommand`; commands and values should be carefully reviewed for safety

### Data Protection
- **Client-side only**: All data is stored locally in browser's localStorage and IndexedDB
- **No server communication**: No data is sent to external servers (except optional analytics)
- **Base64 image encoding**: Images are stored in IndexedDB as data URIs

### External Dependencies
- All resources are served locally from `/libs` directory
- Libraries used:
  - Marked.js (Markdown parsing)
  - Turndown.js (HTML to Markdown)
  - Highlight.js (Syntax highlighting)
  - DOMPurify v3.2.4+ (XSS protection)

### URL Validation
- Blocks dangerous protocols: `javascript:`, `data:`, `vbscript:`, `file:`, `about:`, `blob:`, `filesystem:`
- Blocks XSS patterns in URLs: `<script`, `onerror=`, `onclick=`, `onload=`
- Only allows safe protocols: `http:`, `https:`, `mailto:`, and relative URLs

### Input Sanitization
- Table size limits (max 20 rows × 10 columns)
- Language identifier sanitization (alphanumeric, dash, underscore only)
- Image size validation (max 10MB per image)
- File type validation for image uploads

## Security Best Practices for Users

1. **Keep browsers updated**: Use the latest version of modern browsers
2. **Review localStorage data**: Clear localStorage if you've pasted sensitive information
3. **Use HTTPS**: When deploying, always use HTTPS
4. **Regular updates**: Keep the application updated to get latest security patches

## Known Limitations

- **localStorage size**: Limited to ~5-10MB depending on browser
- **IndexedDB size**: Typically 50MB+ but varies by browser
- **Client-side only**: No server-side validation or backup
- **Browser security**: Relies on browser's security model

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:
1. Opening a security advisory on GitHub
2. Emailing the maintainer (if email is provided in package.json)
3. **DO NOT** create a public issue for security vulnerabilities

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.
