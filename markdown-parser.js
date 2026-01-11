// Markdown Parser Module
// Wrapper around Marked.js with custom configuration

class MarkdownParser {
    constructor() {
        this.initializeMarked();
    }

    initializeMarked() {
        // Configure marked options
        marked.setOptions({
            gfm: true, // GitHub Flavored Markdown
            breaks: true, // Convert \n to <br>
            headerIds: true,
            mangle: false,
            sanitize: false, // We trust the user input
            smartLists: true,
            smartypants: true, // Convert quotes to smart quotes
            xhtml: false
        });

        // Custom renderer for code blocks with syntax highlighting
        const renderer = new marked.Renderer();

        // Override code block rendering
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

        // Override inline code rendering
        renderer.codespan = function(code) {
            return `<code>${code}</code>`;
        };

        // Set the custom renderer
        marked.use({ renderer });
    }

    // Parse markdown to HTML
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

    // Get raw HTML (for export)
    getHtmlDocument(markdown, title = 'Markdown Export') {
        const content = this.parse(markdown);

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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

// Create global instance
const markdownParser = new MarkdownParser();
