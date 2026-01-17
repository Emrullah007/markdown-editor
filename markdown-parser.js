/**
 * Markdown Parser Module
 * Wrapper around Marked.js with custom configuration and syntax highlighting
 * @module MarkdownParser
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * Class representing the Markdown Parser
 * Provides markdown to HTML conversion with GitHub Flavored Markdown support
 * and syntax highlighting for code blocks
 * @class
 */
class MarkdownParser {
    /**
     * Create a MarkdownParser instance
     * Initializes Marked.js with custom configuration and renderer
     */
    constructor() {
        this.initializeMarked();
    }

    /**
     * HTML escape utility for security
     * Prevents XSS attacks by escaping special HTML characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text safe for HTML insertion
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Initialize Marked.js with custom options and renderer
     * Sets up GitHub Flavored Markdown support and syntax highlighting
     * @private
     */
    initializeMarked() {
        // Configure marked options for GFM support
        marked.setOptions({
            gfm: true,          // GitHub Flavored Markdown
            breaks: true,       // Convert \n to <br>
            headerIds: true,    // Add IDs to headers
            mangle: false,      // Don't escape autolinks
            sanitize: false,    // Let DOMPurify handle sanitization
            smartLists: true,   // Smart list behavior
            smartypants: true,  // Convert quotes to smart quotes
            xhtml: false        // Don't use XHTML self-closing tags
        });

        // Create custom renderer for enhanced output
        const renderer = new marked.Renderer();

        /**
         * Custom code block rendering with syntax highlighting
         * Uses Highlight.js for language-specific highlighting
         * @param {string} code - The code content
         * @param {string} language - The programming language
         * @returns {string} HTML string with highlighted code
         */
        renderer.code = function(code, language) {
            if (language && hljs.getLanguage(language)) {
                try {
                    const highlighted = hljs.highlight(code, { language }).value;
                    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
                } catch (err) {
                    console.error('Highlighting error:', err);
                }
            }
            // Fallback to auto-detection
            try {
                const highlighted = hljs.highlightAuto(code).value;
                return `<pre><code class="hljs">${highlighted}</code></pre>`;
            } catch (err) {
                return `<pre><code>${this.escape(code)}</code></pre>`;
            }
        };

        /**
         * Custom inline code rendering with proper escaping
         * @param {string} code - The inline code content
         * @returns {string} HTML string with escaped code
         */
        renderer.codespan = (code) => {
            return `<code>${this.escapeHtml(code)}</code>`;
        };

        /**
         * Custom image rendering to handle IndexedDB images
         * Supports both regular URLs and IndexedDB image references
         * @param {string} href - Image URL or IndexedDB reference
         * @param {string} title - Image title attribute
         * @param {string} text - Image alt text
         * @returns {string} HTML img element
         */
        renderer.image = (href, title, text) => {
            // Check if this is an IndexedDB image reference
            if (href.startsWith('indexed://')) {
                const imageId = href.substring('indexed://'.length);
                const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
                const altAttr = text ? this.escapeHtml(text) : '';
                // Return a placeholder that will be replaced with actual image data
                return `<img src="loading" alt="${altAttr}"${titleAttr} data-image-id="${imageId}" class="indexed-image" loading="lazy">`;
            }

            // Standard image rendering with escaping
            const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
            const altAttr = text ? this.escapeHtml(text) : '';
            return `<img src="${this.escapeHtml(href)}" alt="${altAttr}"${titleAttr} style="max-width: 100%;" loading="lazy">`;
        };

        // Set the custom renderer
        marked.use({ renderer });
    }

    /**
     * Parse markdown string to HTML
     * @param {string} markdown - Markdown content to parse
     * @returns {string} HTML string
     */
    parse(markdown) {
        if (!markdown || markdown.trim() === '') {
            return '<p class="placeholder">Start typing to see the preview...</p>';
        }

        try {
            return marked.parse(markdown);
        } catch (error) {
            console.error('Markdown parsing error:', error);
            return `<p style="color: var(--danger-color);">Error parsing markdown: ${error.message}</p>`;
        }
    }

    /**
     * Generate a complete HTML document from markdown
     * Includes styling for export purposes
     * @param {string} markdown - Markdown content to convert
     * @param {string} [title='Markdown Export'] - Document title
     * @returns {string} Complete HTML document
     */
    getHtmlDocument(markdown, title = 'Markdown Export') {
        const content = this.parse(markdown);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        img { max-width: 100%; height: auto; }
        code {
            background-color: #f4f4f4;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        pre {
            background-color: #f6f8fa;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        pre code {
            background-color: transparent;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 1rem;
            color: #666;
            margin: 1rem 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 0.5rem;
            text-align: left;
        }
        table th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        h1, h2 {
            border-bottom: 1px solid #eee;
            padding-bottom: 0.3rem;
        }
    </style>
</head>
<body>
${content}
</body>
</html>`;
    }
}

/**
 * Global markdown parser instance
 * @type {MarkdownParser}
 */
const markdownParser = new MarkdownParser();
