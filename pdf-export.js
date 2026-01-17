/**
 * PDF Export Module
 * Provides PDF export functionality using browser's print to PDF feature
 * and optional html2pdf.js library for direct PDF generation
 * @module PDFExport
 */

/**
 * Class representing the PDF Export functionality
 */
class PDFExport {
    /**
     * Create a PDFExport instance
     * @param {MarkdownEditor} editorInstance - Reference to the main editor instance
     */
    constructor(editorInstance) {
        /** @type {MarkdownEditor} Reference to the main editor */
        this.editorInstance = editorInstance;
        
        /** @type {boolean} Whether html2pdf library is available */
        this.html2pdfAvailable = typeof html2pdf !== 'undefined';
    }

    /**
     * Export the current document as PDF
     * Uses html2pdf if available, falls back to browser print dialog
     * @param {Object} options - Export options
     * @param {string} options.filename - Output filename (default: 'document.pdf')
     * @param {string} options.pageSize - Page size (default: 'a4')
     * @param {string} options.orientation - Page orientation (default: 'portrait')
     * @param {Object} options.margins - Page margins in mm
     */
    async exportPDF(options = {}) {
        const {
            filename = 'document.pdf',
            pageSize = 'a4',
            orientation = 'portrait',
            margins = { top: 15, right: 15, bottom: 15, left: 15 }
        } = options;

        // Get markdown content
        let markdown;
        if (this.editorInstance.currentMode === 'markdown') {
            markdown = this.editorInstance.editor.value;
        } else {
            markdown = this.editorInstance.richTextEditor.getMarkdown();
        }

        if (!markdown.trim()) {
            alert('The document is empty. Please add some content before exporting.');
            return;
        }

        // Generate HTML content
        const htmlContent = this.generatePDFHtml(markdown);

        if (this.html2pdfAvailable) {
            // Use html2pdf for direct PDF generation
            await this.exportWithHtml2Pdf(htmlContent, { filename, pageSize, orientation, margins });
        } else {
            // Fall back to print dialog
            this.exportWithPrint(htmlContent);
        }
    }

    /**
     * Generate HTML document optimized for PDF export
     * @param {string} markdown - The markdown content
     * @returns {string} Complete HTML document
     */
    generatePDFHtml(markdown) {
        const content = markdownParser.parse(markdown);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <style>
        @page {
            margin: 15mm;
            size: A4;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: white;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1a1a1a;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            page-break-after: avoid;
        }
        
        h1 {
            font-size: 24pt;
            border-bottom: 2px solid #333;
            padding-bottom: 0.3em;
        }
        
        h2 {
            font-size: 18pt;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.2em;
        }
        
        h3 { font-size: 14pt; }
        h4 { font-size: 12pt; }
        h5 { font-size: 11pt; }
        h6 { font-size: 10pt; color: #666; }
        
        p {
            margin: 0.8em 0;
            orphans: 3;
            widows: 3;
        }
        
        a {
            color: #0066cc;
            text-decoration: none;
        }
        
        a::after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            color: #666;
        }
        
        a[href^="#"]::after,
        a[href^="mailto:"]::after {
            content: "";
        }
        
        ul, ol {
            margin: 0.8em 0;
            padding-left: 2em;
        }
        
        li {
            margin: 0.3em 0;
        }
        
        li > ul, li > ol {
            margin: 0.2em 0;
        }
        
        code {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            border: 1px solid #e0e0e0;
        }
        
        pre {
            background: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 1em;
            overflow-x: auto;
            page-break-inside: avoid;
            margin: 1em 0;
        }
        
        pre code {
            background: none;
            padding: 0;
            border: none;
            font-size: 0.85em;
            line-height: 1.5;
        }
        
        blockquote {
            margin: 1em 0;
            padding: 0.5em 1em;
            border-left: 4px solid #ddd;
            background: #fafafa;
            color: #555;
            font-style: italic;
            page-break-inside: avoid;
        }
        
        blockquote p {
            margin: 0.5em 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ccc;
            padding: 0.5em 0.75em;
            text-align: left;
        }
        
        th {
            background: #f0f0f0;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background: #fafafa;
        }
        
        img {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
        }
        
        hr {
            border: none;
            border-top: 1px solid #ccc;
            margin: 2em 0;
        }
        
        /* Task lists */
        input[type="checkbox"] {
            margin-right: 0.5em;
        }
        
        /* Print-specific styles */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            a {
                color: #000;
            }
            
            pre, blockquote {
                border: 1px solid #ccc;
            }
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
    }

    /**
     * Export PDF using html2pdf library
     * @param {string} htmlContent - The HTML content
     * @param {Object} options - Export options
     */
    async exportWithHtml2Pdf(htmlContent, options) {
        const { filename, pageSize, orientation, margins } = options;
        
        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '210mm'; // A4 width
        document.body.appendChild(container);

        try {
            const opt = {
                margin: [margins.top, margins.right, margins.bottom, margins.left],
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: pageSize, 
                    orientation: orientation 
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await html2pdf().set(opt).from(container.querySelector('body') || container).save();
            
            this.showExportSuccess('PDF exported successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Failed to export PDF. Trying print dialog...');
            this.exportWithPrint(htmlContent);
        } finally {
            document.body.removeChild(container);
        }
    }

    /**
     * Export PDF using browser print dialog
     * @param {string} htmlContent - The HTML content
     */
    exportWithPrint(htmlContent) {
        // Open new window with content
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        if (!printWindow) {
            alert('Please allow pop-ups to export PDF.');
            return;
        }

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };

        this.showExportSuccess('Print dialog opened. Select "Save as PDF" to export.');
    }

    /**
     * Show export success message
     * @param {string} message - Success message
     */
    showExportSuccess(message) {
        const saveStatus = document.getElementById('saveStatus');
        if (saveStatus) {
            const originalText = saveStatus.textContent;
            saveStatus.textContent = message;
            setTimeout(() => {
                saveStatus.textContent = originalText;
            }, 3000);
        }
    }

    /**
     * Open PDF export dialog with options
     */
    openExportDialog() {
        // For now, export directly with default options
        // Could be expanded to show a modal with export options
        this.exportPDF({
            filename: this.generateFilename(),
            pageSize: 'a4',
            orientation: 'portrait'
        });
    }

    /**
     * Generate a filename based on document content
     * @returns {string} Generated filename
     */
    generateFilename() {
        let markdown;
        if (this.editorInstance.currentMode === 'markdown') {
            markdown = this.editorInstance.editor.value;
        } else {
            markdown = this.editorInstance.richTextEditor.getMarkdown();
        }

        // Try to extract title from first heading
        const titleMatch = markdown.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            // Sanitize filename
            const title = titleMatch[1]
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 50);
            
            if (title) {
                return `${title}.pdf`;
            }
        }

        // Default filename with timestamp
        const now = new Date();
        const timestamp = now.toISOString().split('T')[0];
        return `document-${timestamp}.pdf`;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFExport;
}
