// Rich Text Editor
// Handles WYSIWYG editing with HTML to Markdown conversion

class RichTextEditor {
    constructor(editorElement, markdownEditor) {
        this.editor = editorElement;
        this.markdownEditor = markdownEditor;
        this.turndownService = null;
        this.init();
    }

    init() {
        this.setupTurndown();
        this.setupPasteHandler();
        this.setupDragDropHandler();
    }

    setupTurndown() {
        // Configure Turndown for HTML → Markdown conversion
        this.turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-',
            emDelimiter: '*',
            strongDelimiter: '**',
        });

        // Use GFM plugin for tables, strikethrough, task lists
        if (window.turndownPluginGfm) {
            const gfm = window.turndownPluginGfm.gfm;
            this.turndownService.use(gfm);
        }

        // Keep existing rules and add custom handling
        this.turndownService.keep(['u']); // Keep underline as HTML since markdown doesn't support it
    }

    // ===== Formatting Commands =====

    formatText(command, value = null) {
        document.execCommand(command, false, value);
        this.editor.focus();
    }

    applyHeading(tag) {
        if (tag === 'p') {
            document.execCommand('formatBlock', false, '<p>');
        } else {
            document.execCommand('formatBlock', false, `<${tag}>`);
        }
        this.editor.focus();
    }

    insertList(type) {
        if (type === 'ul') {
            document.execCommand('insertUnorderedList', false, null);
        } else if (type === 'ol') {
            document.execCommand('insertOrderedList', false, null);
        } else if (type === 'checklist') {
            // Insert a task list item
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const li = document.createElement('li');
                li.style.listStyle = 'none';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.marginRight = '0.5rem';

                const textNode = document.createTextNode(' Task item');

                li.appendChild(checkbox);
                li.appendChild(textNode);

                // Check if we're already in a list
                let parent = range.commonAncestorContainer;
                while (parent && parent !== this.editor) {
                    if (parent.tagName === 'UL' || parent.tagName === 'OL') {
                        range.insertNode(li);
                        this.editor.focus();
                        return;
                    }
                    parent = parent.parentNode;
                }

                // Create new list
                const ul = document.createElement('ul');
                ul.appendChild(li);
                range.insertNode(ul);
            }
        }
        this.editor.focus();
    }

    insertLink() {
        const url = prompt('Enter URL:');
        if (url) {
            const text = prompt('Enter link text:', url);
            if (text !== null) {
                const link = `<a href="${url}">${text || url}</a>`;
                document.execCommand('insertHTML', false, link);
            }
        }
        this.editor.focus();
    }

    insertImage() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.insertImageFromFile(file);
            }
        };

        input.click();
    }

    insertTable() {
        const rows = prompt('Number of rows:', '3');
        const cols = prompt('Number of columns:', '3');

        if (!rows || !cols || isNaN(rows) || isNaN(cols)) return;

        const rowCount = parseInt(rows);
        const colCount = parseInt(cols);

        let tableHTML = '<table><thead><tr>';

        // Header row
        for (let c = 0; c < colCount; c++) {
            tableHTML += '<th>Header ' + (c + 1) + '</th>';
        }
        tableHTML += '</tr></thead><tbody>';

        // Body rows
        for (let r = 0; r < rowCount - 1; r++) {
            tableHTML += '<tr>';
            for (let c = 0; c < colCount; c++) {
                tableHTML += '<td>Cell</td>';
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';

        // Insert at cursor
        document.execCommand('insertHTML', false, tableHTML);
        this.editor.focus();
    }

    insertCodeBlock() {
        const language = prompt('Enter programming language (optional):', 'javascript');
        const pre = document.createElement('pre');
        const code = document.createElement('code');

        if (language) {
            code.className = `language-${language}`;
        }

        code.textContent = '// Enter your code here';
        pre.appendChild(code);

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.insertNode(pre);

            // Add a paragraph after for easier editing
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            pre.parentNode.insertBefore(p, pre.nextSibling);
        }

        this.editor.focus();
    }

    // ===== Conversion Methods =====

    getMarkdown() {
        return this.turndownService.turndown(this.editor.innerHTML);
    }

    setContent(markdown) {
        const html = markdownParser.parse(markdown);
        this.editor.innerHTML = html;
    }

    // ===== Image Handling =====

    setupPasteHandler() {
        this.editor.addEventListener('paste', async (event) => {
            const items = event.clipboardData.items;

            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    event.preventDefault();
                    const file = item.getAsFile();
                    await this.insertImageFromFile(file);
                    break;
                }
            }
        });
    }

    setupDragDropHandler() {
        this.editor.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        this.editor.addEventListener('drop', async (e) => {
            e.preventDefault();

            const files = e.dataTransfer.files;
            for (let file of files) {
                if (file.type.indexOf('image') !== -1) {
                    await this.insertImageFromFile(file);
                }
            }
        });
    }

    async insertImageFromFile(file) {
        try {
            const base64 = await this.imageToBase64(file);
            const img = document.createElement('img');
            img.src = base64;
            img.alt = file.name || 'Pasted image';
            img.style.maxWidth = '100%';

            // Insert at cursor
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(img);

                // Move cursor after image
                range.setStartAfter(img);
                range.setEndAfter(img);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                // If no selection, append to end
                this.editor.appendChild(img);
            }
        } catch (error) {
            console.error('Error inserting image:', error);
            alert('Failed to insert image. Please try again.');
        }
    }

    imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
