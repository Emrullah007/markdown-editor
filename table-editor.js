/**
 * TableEditor - Visual table editor with inline editing, drag-and-drop, alignment, and grid picker
 * @class
 */
class TableEditor {
    /**
     * Create a TableEditor instance
     * @param {MarkdownEditor} editorInstance - Reference to the main MarkdownEditor
     */
    constructor(editorInstance) {
        this.editorInstance = editorInstance;
        this.activeTable = null;
        this.activeTableElement = null;
        this.activeTableMarkdownRange = null;
        this.isOpen = false;
        this.gridPickerOpen = false;
        this.contextMenuOpen = false;

        // Drag state
        this.isDragging = false;
        this.dragType = null;
        this.dragIndex = null;
        this.dragStartY = 0;
        this.dragStartX = 0;

        // Grid picker state
        this.gridHoverRow = 0;
        this.gridHoverCol = 0;
        this.gridPickerCallback = null;

        // Context menu state
        this.contextRowIndex = -1;
        this.contextColIndex = -1;

        // Editing state
        this.editingCell = null;
        this.editingRowIndex = -1;
        this.editingColIndex = -1;

        // DOM elements (created in init)
        this.gridPickerEl = null;
        this.overlayEl = null;
        this.contextMenuEl = null;
        this.dropIndicator = null;

        this.init();
    }

    // ========================================
    // Initialization
    // ========================================

    init() {
        this.createGridPicker();
        this.createOverlay();
        this.createContextMenu();
        this.createDropIndicator();
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        document.addEventListener('click', (e) => {
            if (this.gridPickerOpen && !this.gridPickerEl.contains(e.target)) {
                const tableBtn = document.getElementById('tableBtn');
                const mdTableBtn = document.getElementById('markdownTableBtn');
                if (e.target !== tableBtn && !tableBtn?.contains(e.target) &&
                    e.target !== mdTableBtn && !mdTableBtn?.contains(e.target)) {
                    this.closeGridPicker();
                }
            }
            if (this.contextMenuOpen && !this.contextMenuEl.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.contextMenuOpen) this.hideContextMenu();
                else if (this.gridPickerOpen) this.closeGridPicker();
                else if (this.isOpen) this.closeEditor(false);
            }
        });
    }

    // ========================================
    // Markdown Table Parser & Serializer
    // ========================================

    /**
     * Parse a markdown table string into TableData
     * @param {string} text - Markdown table text
     * @returns {{ headers: string[], rows: string[][], alignments: string[] } | null}
     */
    static parseMarkdownTable(text) {
        const lines = text.trim().split('\n').filter(l => l.trim());
        if (lines.length < 2) return null;

        const parseRow = (line) => {
            // Handle escaped pipes
            const cells = [];
            let current = '';
            let i = 0;
            const trimmed = line.trim();
            // Skip leading pipe
            if (trimmed.startsWith('|')) i = 1;
            const end = trimmed.endsWith('|') ? trimmed.length - 1 : trimmed.length;

            while (i < end) {
                if (trimmed[i] === '\\' && i + 1 < end && trimmed[i + 1] === '|') {
                    current += '|';
                    i += 2;
                } else if (trimmed[i] === '|') {
                    cells.push(current.trim());
                    current = '';
                    i++;
                } else {
                    current += trimmed[i];
                    i++;
                }
            }
            cells.push(current.trim());
            return cells;
        };

        const headers = parseRow(lines[0]);

        // Parse separator row for alignments
        const separators = parseRow(lines[1]);
        const isSeparator = separators.every(s => /^:?-+:?$/.test(s.trim()));
        if (!isSeparator) return null;

        const alignments = separators.map(sep => {
            const t = sep.trim();
            if (t.startsWith(':') && t.endsWith(':')) return 'center';
            if (t.endsWith(':')) return 'right';
            if (t.startsWith(':')) return 'left';
            return 'none';
        });

        const rows = [];
        for (let i = 2; i < lines.length; i++) {
            const row = parseRow(lines[i]);
            // Pad or trim to match header count
            while (row.length < headers.length) row.push('');
            if (row.length > headers.length) row.length = headers.length;
            rows.push(row);
        }

        return { headers, rows, alignments };
    }

    /**
     * Serialize TableData to a formatted markdown table string
     * @param {{ headers: string[], rows: string[][], alignments: string[] }} tableData
     * @returns {string}
     */
    static serializeToMarkdown(tableData) {
        const { headers, rows, alignments } = tableData;

        const escapeCell = (text) => (text || '').replace(/\|/g, '\\|');

        // Calculate column widths
        const colWidths = headers.map((h, i) => {
            let max = escapeCell(h).length;
            for (const row of rows) {
                const cellLen = escapeCell(row[i] || '').length;
                if (cellLen > max) max = cellLen;
            }
            return Math.max(max, 3);
        });

        const padCell = (text, width) => {
            const t = escapeCell(text || '');
            return t + ' '.repeat(Math.max(0, width - t.length));
        };

        const formatRow = (cells) => {
            return '| ' + cells.map((c, i) => padCell(c, colWidths[i])).join(' | ') + ' |';
        };

        const separatorRow = '| ' + colWidths.map((w, i) => {
            const align = alignments[i] || 'none';
            if (align === 'center') return ':' + '-'.repeat(Math.max(1, w - 2)) + ':';
            if (align === 'right') return '-'.repeat(Math.max(1, w - 1)) + ':';
            if (align === 'left') return ':' + '-'.repeat(Math.max(1, w - 1));
            return '-'.repeat(w);
        }).join(' | ') + ' |';

        const lines = [
            formatRow(headers),
            separatorRow,
            ...rows.map(row => formatRow(row))
        ];

        return lines.join('\n');
    }

    /**
     * Parse an HTML table element into TableData
     * @param {HTMLTableElement} tableElement
     * @returns {{ headers: string[], rows: string[][], alignments: string[] }}
     */
    static parseHTMLTable(tableElement) {
        const headers = [];
        const rows = [];
        const alignments = [];

        const headerCells = tableElement.querySelectorAll('thead th, thead td');
        if (headerCells.length > 0) {
            headerCells.forEach((cell) => {
                headers.push(cell.textContent.trim());
                alignments.push(cell.style.textAlign || 'none');
            });
        }

        const bodyRows = tableElement.querySelectorAll('tbody tr');
        bodyRows.forEach(tr => {
            const cells = [];
            tr.querySelectorAll('td, th').forEach(cell => {
                cells.push(cell.textContent.trim());
            });
            rows.push(cells);
        });

        // If no thead, treat first row as header
        if (headers.length === 0) {
            const allRows = tableElement.querySelectorAll('tr');
            if (allRows.length > 0) {
                allRows[0].querySelectorAll('td, th').forEach((cell) => {
                    headers.push(cell.textContent.trim());
                    alignments.push(cell.style.textAlign || 'none');
                });
                for (let i = 1; i < allRows.length; i++) {
                    const cells = [];
                    allRows[i].querySelectorAll('td, th').forEach(cell => {
                        cells.push(cell.textContent.trim());
                    });
                    rows.push(cells);
                }
            }
        }

        return { headers, rows, alignments };
    }

    /**
     * Serialize TableData to an HTML table string
     * @param {{ headers: string[], rows: string[][], alignments: string[] }} tableData
     * @returns {string}
     */
    static serializeToHTML(tableData) {
        const { headers, rows, alignments } = tableData;

        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };

        const alignStyle = (i) => {
            const a = alignments[i];
            return (a && a !== 'none') ? ` style="text-align: ${a}"` : '';
        };

        let html = '<table role="grid"><thead><tr>';
        headers.forEach((h, i) => {
            html += `<th scope="col"${alignStyle(i)}>${escapeHtml(h)}</th>`;
        });
        html += '</tr></thead><tbody>';

        rows.forEach(row => {
            html += '<tr>';
            row.forEach((cell, i) => {
                html += `<td${alignStyle(i)}>${escapeHtml(cell)}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    // ========================================
    // Grid Picker
    // ========================================

    createGridPicker() {
        this.gridPickerEl = document.createElement('div');
        this.gridPickerEl.className = 'table-grid-picker';
        this.gridPickerEl.setAttribute('role', 'dialog');
        this.gridPickerEl.setAttribute('aria-label', 'Select table dimensions');
        this.gridPickerEl.style.display = 'none';

        const header = document.createElement('div');
        header.className = 'table-grid-picker-header';
        header.innerHTML = '<span class="table-grid-label">Insert Table</span><span class="table-grid-size">0 x 0</span>';
        this.gridPickerEl.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'table-grid';
        grid.setAttribute('role', 'grid');

        for (let r = 0; r < 8; r++) {
            const row = document.createElement('div');
            row.className = 'table-grid-row';
            row.setAttribute('role', 'row');
            for (let c = 0; c < 10; c++) {
                const cell = document.createElement('div');
                cell.className = 'table-grid-cell';
                cell.setAttribute('role', 'gridcell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('mouseenter', () => this.handleGridHover(r, c));
                cell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleGridSelect(r + 1, c + 1);
                });
                row.appendChild(cell);
            }
            grid.appendChild(row);
        }

        this.gridPickerEl.appendChild(grid);
        document.body.appendChild(this.gridPickerEl);
    }

    openGridPicker(callback, anchorElement) {
        this.gridPickerCallback = callback;
        this.gridHoverRow = 0;
        this.gridHoverCol = 0;

        // Position below anchor
        const rect = anchorElement.getBoundingClientRect();
        this.gridPickerEl.style.top = (rect.bottom + 4) + 'px';
        this.gridPickerEl.style.left = rect.left + 'px';
        this.gridPickerEl.style.display = 'block';
        this.gridPickerOpen = true;

        // Reset highlighting
        this.updateGridHighlight(0, 0);
    }

    closeGridPicker() {
        this.gridPickerEl.style.display = 'none';
        this.gridPickerOpen = false;
        this.gridPickerCallback = null;
    }

    handleGridHover(row, col) {
        this.gridHoverRow = row;
        this.gridHoverCol = col;
        this.updateGridHighlight(row, col);
    }

    handleGridSelect(rows, cols) {
        const cb = this.gridPickerCallback;
        this.closeGridPicker();
        if (cb) cb(rows, cols);
    }

    updateGridHighlight(hoverRow, hoverCol) {
        const cells = this.gridPickerEl.querySelectorAll('.table-grid-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            cell.classList.toggle('highlighted', r <= hoverRow && c <= hoverCol);
        });
        const sizeLabel = this.gridPickerEl.querySelector('.table-grid-size');
        if (sizeLabel) {
            sizeLabel.textContent = `${hoverCol + 1} x ${hoverRow + 1}`;
        }
    }

    // ========================================
    // Table Editor Overlay
    // ========================================

    createOverlay() {
        this.overlayEl = document.createElement('div');
        this.overlayEl.className = 'table-editor-overlay';
        this.overlayEl.style.display = 'none';
        this.overlayEl.setAttribute('role', 'dialog');
        this.overlayEl.setAttribute('aria-modal', 'true');
        this.overlayEl.setAttribute('aria-label', 'Table Editor');

        this.overlayEl.innerHTML = `
            <div class="table-editor-panel">
                <div class="table-editor-header">
                    <h3>Table Editor</h3>
                    <div class="table-editor-header-actions">
                        <button class="btn btn-primary table-editor-done" aria-label="Save and close">Done</button>
                        <button class="btn table-editor-cancel" aria-label="Cancel and close">Cancel</button>
                    </div>
                </div>
                <div class="table-editor-toolbar">
                    <button class="btn btn-icon table-add-row" title="Add row below" aria-label="Add row below">+ Row</button>
                    <button class="btn btn-icon table-add-col" title="Add column right" aria-label="Add column to the right">+ Column</button>
                    <button class="btn btn-icon table-del-row" title="Delete selected row" aria-label="Delete current row">- Row</button>
                    <button class="btn btn-icon table-del-col" title="Delete selected column" aria-label="Delete current column">- Column</button>
                </div>
                <div class="table-editor-body">
                    <table class="table-editor-table" role="grid"></table>
                </div>
                <div class="table-editor-footer">
                    <span class="table-editor-status"></span>
                </div>
            </div>
        `;

        // Event listeners
        this.overlayEl.querySelector('.table-editor-done').addEventListener('click', () => this.closeEditor(true));
        this.overlayEl.querySelector('.table-editor-cancel').addEventListener('click', () => this.closeEditor(false));
        this.overlayEl.querySelector('.table-add-row').addEventListener('click', () => {
            const idx = this.editingRowIndex >= 0 ? this.editingRowIndex : this.activeTable.rows.length - 1;
            this.addRow(idx);
        });
        this.overlayEl.querySelector('.table-add-col').addEventListener('click', () => {
            const idx = this.editingColIndex >= 0 ? this.editingColIndex : this.activeTable.headers.length - 1;
            this.addColumn(idx);
        });
        this.overlayEl.querySelector('.table-del-row').addEventListener('click', () => {
            if (this.editingRowIndex >= 0) this.deleteRow(this.editingRowIndex);
        });
        this.overlayEl.querySelector('.table-del-col').addEventListener('click', () => {
            if (this.editingColIndex >= 0) this.deleteColumn(this.editingColIndex);
        });

        // Click backdrop to cancel
        this.overlayEl.addEventListener('click', (e) => {
            if (e.target === this.overlayEl) this.closeEditor(false);
        });

        document.body.appendChild(this.overlayEl);
    }

    /**
     * Open the table editor overlay
     * @param {{ headers: string[], rows: string[][], alignments: string[] }} tableData
     * @param {{ mode: string, element?: HTMLElement, range?: { start: number, end: number } }} context
     */
    openEditor(tableData, context) {
        this.activeTable = JSON.parse(JSON.stringify(tableData)); // Deep copy
        this.editorContext = context;
        this.isOpen = true;
        this.editingRowIndex = -1;
        this.editingColIndex = -1;
        this.overlayEl.style.display = 'flex';
        this.renderEditorTable();
        // Focus first cell
        setTimeout(() => {
            const firstCell = this.overlayEl.querySelector('.table-editor-table td, .table-editor-table th');
            if (firstCell) firstCell.click();
        }, 100);
    }

    /**
     * Close the table editor overlay
     * @param {boolean} save - Whether to save changes
     */
    closeEditor(save) {
        if (!this.isOpen) return;

        // Clean up any active key handler before committing
        this._cleanupActiveKeyHandler();

        // Commit any active cell edit
        if (this.editingCell) {
            this.commitCellEdit();
        }

        if (save && this.activeTable) {
            if (this.editorContext?.mode === 'markdown') {
                this.syncToMarkdownEditor();
            } else {
                this.syncToRichTextEditor();
            }
        }

        this.isOpen = false;
        this.activeTable = null;
        this.activeTableElement = null;
        this.activeTableMarkdownRange = null;
        this.editorContext = null;
        this.overlayEl.style.display = 'none';
    }

    renderEditorTable() {
        const table = this.overlayEl.querySelector('.table-editor-table');
        const { headers, rows, alignments } = this.activeTable;
        table.innerHTML = '';

        // Column drag handles row
        const colDragRow = document.createElement('tr');
        colDragRow.className = 'table-editor-col-drag-row';
        // Empty cell for row drag handle column
        const emptyTh = document.createElement('th');
        emptyTh.className = 'table-editor-corner';
        colDragRow.appendChild(emptyTh);

        headers.forEach((_, ci) => {
            const dragTh = document.createElement('th');
            dragTh.className = 'table-editor-col-drag-cell';
            const handle = document.createElement('span');
            handle.className = 'table-drag-handle table-drag-handle-col';
            handle.textContent = '\u2630';
            handle.title = 'Drag to reorder column';
            handle.setAttribute('aria-label', `Drag to reorder column ${ci + 1}`);
            handle.addEventListener('mousedown', (e) => this.startDrag('column', ci, e));
            dragTh.appendChild(handle);
            colDragRow.appendChild(dragTh);
        });
        table.appendChild(colDragRow);

        // Header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        // Empty cell for row drag handle column
        const cornerCell = document.createElement('th');
        cornerCell.className = 'table-editor-corner';
        headerRow.appendChild(cornerCell);

        headers.forEach((h, ci) => {
            const th = document.createElement('th');
            th.className = 'table-editor-header-cell';
            th.dataset.col = ci;

            // Alignment button
            const alignBtn = document.createElement('button');
            alignBtn.className = 'table-align-btn';
            alignBtn.title = 'Toggle alignment';
            alignBtn.setAttribute('aria-label', `Column ${ci + 1} alignment: ${alignments[ci] || 'none'}`);
            alignBtn.innerHTML = this.getAlignmentIcon(alignments[ci] || 'none');
            alignBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cycleAlignment(ci);
            });
            th.appendChild(alignBtn);

            // Header text
            const textSpan = document.createElement('span');
            textSpan.className = 'table-editor-cell-text';
            textSpan.textContent = h;
            th.appendChild(textSpan);

            th.addEventListener('click', () => {
                this.editingColIndex = ci;
                this.editingRowIndex = -1;
                this.makeEditable(th, -1, ci);
            });

            th.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, -1, ci);
            });

            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body rows
        const tbody = document.createElement('tbody');
        rows.forEach((row, ri) => {
            const tr = document.createElement('tr');
            tr.dataset.row = ri;

            // Row drag handle
            const dragTd = document.createElement('td');
            dragTd.className = 'table-editor-row-drag-cell';
            const handle = document.createElement('span');
            handle.className = 'table-drag-handle table-drag-handle-row';
            handle.textContent = '\u2630';
            handle.title = 'Drag to reorder row';
            handle.setAttribute('aria-label', `Drag to reorder row ${ri + 1}`);
            handle.addEventListener('mousedown', (e) => this.startDrag('row', ri, e));
            dragTd.appendChild(handle);
            tr.appendChild(dragTd);

            row.forEach((cell, ci) => {
                const td = document.createElement('td');
                td.className = 'table-editor-cell';
                td.dataset.row = ri;
                td.dataset.col = ci;

                const textSpan = document.createElement('span');
                textSpan.className = 'table-editor-cell-text';
                textSpan.textContent = cell;
                td.appendChild(textSpan);

                td.addEventListener('click', () => {
                    this.editingRowIndex = ri;
                    this.editingColIndex = ci;
                    this.makeEditable(td, ri, ci);
                });

                td.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showContextMenu(e, ri, ci);
                });

                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        this.updateStatus();
    }

    updateStatus() {
        const status = this.overlayEl.querySelector('.table-editor-status');
        if (status && this.activeTable) {
            status.textContent = `${this.activeTable.rows.length} rows \u00d7 ${this.activeTable.headers.length} columns`;
        }
    }

    // ========================================
    // Inline Cell Editing
    // ========================================

    makeEditable(cell, rowIndex, colIndex) {
        // Commit previous edit
        if (this.editingCell && this.editingCell !== cell) {
            this.commitCellEdit();
        }

        const textSpan = cell.querySelector('.table-editor-cell-text');
        if (!textSpan) return;

        textSpan.contentEditable = 'true';
        textSpan.focus();
        this.editingCell = cell;
        this.editingRowIndex = rowIndex;
        this.editingColIndex = colIndex;

        // Select all text
        const range = document.createRange();
        range.selectNodeContents(textSpan);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        // Add active class
        cell.classList.add('editing');

        // Handle keyboard navigation
        const keyHandler = (e) => {
            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    this.commitCellEdit();
                    if (e.shiftKey) {
                        this.navigateCell(rowIndex, colIndex, 'prev');
                    } else {
                        this.navigateCell(rowIndex, colIndex, 'next');
                    }
                    break;
                case 'Enter':
                    if (!e.shiftKey) {
                        e.preventDefault();
                        this.commitCellEdit();
                        this.navigateCell(rowIndex, colIndex, 'down');
                    }
                    break;
                case 'ArrowUp':
                    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        // Only navigate if at start of text
                        const sel = window.getSelection();
                        if (sel.anchorOffset === 0) {
                            e.preventDefault();
                            this.commitCellEdit();
                            this.navigateCell(rowIndex, colIndex, 'up');
                        }
                    }
                    break;
                case 'ArrowDown':
                    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        const sel = window.getSelection();
                        const text = textSpan.textContent;
                        if (sel.anchorOffset === text.length) {
                            e.preventDefault();
                            this.commitCellEdit();
                            this.navigateCell(rowIndex, colIndex, 'down');
                        }
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    // Revert
                    if (rowIndex === -1) {
                        textSpan.textContent = this.activeTable.headers[colIndex];
                    } else {
                        textSpan.textContent = this.activeTable.rows[rowIndex][colIndex];
                    }
                    textSpan.contentEditable = 'false';
                    cell.classList.remove('editing');
                    this.editingCell = null;
                    break;
            }
        };

        textSpan.addEventListener('keydown', keyHandler);
        textSpan.addEventListener('blur', () => {
            textSpan.removeEventListener('keydown', keyHandler);
            if (this.editingCell === cell) {
                this.commitCellEdit();
            }
        }, { once: true });

        // Store reference for cleanup if blur never fires
        this._activeKeyHandler = { element: textSpan, handler: keyHandler };
    }

    commitCellEdit() {
        if (!this.editingCell) return;

        const textSpan = this.editingCell.querySelector('.table-editor-cell-text');
        if (!textSpan) return;

        const value = textSpan.textContent.trim();
        const ri = this.editingRowIndex;
        const ci = this.editingColIndex;

        if (ri === -1) {
            // Header cell
            this.activeTable.headers[ci] = value;
        } else {
            this.activeTable.rows[ri][ci] = value;
        }

        textSpan.contentEditable = 'false';
        this.editingCell.classList.remove('editing');
        this.editingCell = null;
    }

    navigateCell(fromRow, fromCol, direction) {
        const { headers, rows } = this.activeTable;
        const colCount = headers.length;
        let targetRow = fromRow;
        let targetCol = fromCol;

        switch (direction) {
            case 'next':
                targetCol++;
                if (targetCol >= colCount) {
                    targetCol = 0;
                    targetRow++;
                    if (targetRow >= rows.length) {
                        // Auto-add row
                        this.addRow(rows.length - 1);
                        targetRow = rows.length - 1;
                    }
                }
                break;
            case 'prev':
                targetCol--;
                if (targetCol < 0) {
                    targetCol = colCount - 1;
                    targetRow--;
                }
                if (targetRow < -1) {
                    targetRow = -1;
                    targetCol = 0;
                }
                break;
            case 'down':
                targetRow++;
                if (targetRow >= rows.length) {
                    this.addRow(rows.length - 1);
                    targetRow = rows.length - 1;
                }
                break;
            case 'up':
                targetRow--;
                if (targetRow < -1) targetRow = -1;
                break;
        }

        // Find the target cell in the DOM
        const table = this.overlayEl.querySelector('.table-editor-table');
        let cell;
        if (targetRow === -1) {
            cell = table.querySelector(`thead th.table-editor-header-cell[data-col="${targetCol}"]`);
        } else {
            cell = table.querySelector(`tbody td[data-row="${targetRow}"][data-col="${targetCol}"]`);
        }
        if (cell) {
            this.editingRowIndex = targetRow;
            this.editingColIndex = targetCol;
            this.makeEditable(cell, targetRow, targetCol);
        }
    }

    // ========================================
    // Column Alignment
    // ========================================

    cycleAlignment(colIndex) {
        const order = ['none', 'left', 'center', 'right'];
        const current = this.activeTable.alignments[colIndex] || 'none';
        const idx = order.indexOf(current);
        this.activeTable.alignments[colIndex] = order[(idx + 1) % order.length];
        this.renderEditorTable();
    }

    getAlignmentIcon(alignment) {
        switch (alignment) {
            case 'left': return '<span class="align-icon align-left-icon">\u2261</span>';
            case 'center': return '<span class="align-icon align-center-icon">\u2261</span>';
            case 'right': return '<span class="align-icon align-right-icon">\u2261</span>';
            default: return '<span class="align-icon align-none-icon">\u2261</span>';
        }
    }

    // ========================================
    // Row / Column Operations
    // ========================================

    addRow(afterIndex) {
        const colCount = this.activeTable.headers.length;
        const newRow = Array(colCount).fill('');
        this.activeTable.rows.splice(afterIndex + 1, 0, newRow);
        this.renderEditorTable();
    }

    deleteRow(index) {
        if (this.activeTable.rows.length <= 1) return;
        this.activeTable.rows.splice(index, 1);
        if (this.editingRowIndex >= this.activeTable.rows.length) {
            this.editingRowIndex = this.activeTable.rows.length - 1;
        }
        this.renderEditorTable();
    }

    addColumn(afterIndex) {
        this.activeTable.headers.splice(afterIndex + 1, 0, 'Header');
        this.activeTable.alignments.splice(afterIndex + 1, 0, 'none');
        for (const row of this.activeTable.rows) {
            row.splice(afterIndex + 1, 0, '');
        }
        this.renderEditorTable();
    }

    deleteColumn(index) {
        if (this.activeTable.headers.length <= 1) return;
        this.activeTable.headers.splice(index, 1);
        this.activeTable.alignments.splice(index, 1);
        for (const row of this.activeTable.rows) {
            row.splice(index, 1);
        }
        if (this.editingColIndex >= this.activeTable.headers.length) {
            this.editingColIndex = this.activeTable.headers.length - 1;
        }
        this.renderEditorTable();
    }

    // ========================================
    // Context Menu
    // ========================================

    createContextMenu() {
        this.contextMenuEl = document.createElement('div');
        this.contextMenuEl.className = 'table-context-menu';
        this.contextMenuEl.setAttribute('role', 'menu');
        this.contextMenuEl.style.display = 'none';

        const items = [
            { label: 'Insert Row Above', action: 'insertRowAbove', icon: '\u2191' },
            { label: 'Insert Row Below', action: 'insertRowBelow', icon: '\u2193' },
            { label: 'Delete Row', action: 'deleteRow', icon: '\u2717' },
            { type: 'separator' },
            { label: 'Insert Column Left', action: 'insertColLeft', icon: '\u2190' },
            { label: 'Insert Column Right', action: 'insertColRight', icon: '\u2192' },
            { label: 'Delete Column', action: 'deleteCol', icon: '\u2717' },
            { type: 'separator' },
            { label: 'Align Left', action: 'alignLeft', icon: '\u2261' },
            { label: 'Align Center', action: 'alignCenter', icon: '\u2261' },
            { label: 'Align Right', action: 'alignRight', icon: '\u2261' },
        ];

        items.forEach(item => {
            if (item.type === 'separator') {
                const sep = document.createElement('div');
                sep.className = 'table-context-menu-separator';
                sep.setAttribute('role', 'separator');
                this.contextMenuEl.appendChild(sep);
                return;
            }

            const menuItem = document.createElement('button');
            menuItem.className = 'table-context-menu-item';
            menuItem.setAttribute('role', 'menuitem');
            menuItem.innerHTML = `<span class="table-context-icon">${item.icon}</span> ${item.label}`;
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleContextAction(item.action);
                this.hideContextMenu();
            });
            this.contextMenuEl.appendChild(menuItem);
        });

        document.body.appendChild(this.contextMenuEl);
    }

    showContextMenu(event, rowIndex, colIndex) {
        this.contextRowIndex = rowIndex;
        this.contextColIndex = colIndex;
        this.editingRowIndex = rowIndex;
        this.editingColIndex = colIndex;

        this.contextMenuEl.style.left = event.clientX + 'px';
        this.contextMenuEl.style.top = event.clientY + 'px';
        this.contextMenuEl.style.display = 'block';
        this.contextMenuOpen = true;

        // Ensure menu is within viewport
        const rect = this.contextMenuEl.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            this.contextMenuEl.style.left = (window.innerWidth - rect.width - 8) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            this.contextMenuEl.style.top = (window.innerHeight - rect.height - 8) + 'px';
        }
    }

    hideContextMenu() {
        this.contextMenuEl.style.display = 'none';
        this.contextMenuOpen = false;
    }

    handleContextAction(action) {
        const ri = this.contextRowIndex;
        const ci = this.contextColIndex;

        switch (action) {
            case 'insertRowAbove':
                this.addRow(ri === -1 ? -1 : ri - 1);
                break;
            case 'insertRowBelow':
                this.addRow(ri === -1 ? -1 : ri);
                break;
            case 'deleteRow':
                if (ri >= 0) this.deleteRow(ri);
                break;
            case 'insertColLeft':
                this.addColumn(ci - 1);
                break;
            case 'insertColRight':
                this.addColumn(ci);
                break;
            case 'deleteCol':
                this.deleteColumn(ci);
                break;
            case 'alignLeft':
                this.activeTable.alignments[ci] = 'left';
                this.renderEditorTable();
                break;
            case 'alignCenter':
                this.activeTable.alignments[ci] = 'center';
                this.renderEditorTable();
                break;
            case 'alignRight':
                this.activeTable.alignments[ci] = 'right';
                this.renderEditorTable();
                break;
        }
    }

    // ========================================
    // Drag and Drop
    // ========================================

    createDropIndicator() {
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'table-drop-indicator';
        this.dropIndicator.style.display = 'none';
        document.body.appendChild(this.dropIndicator);
    }

    startDrag(type, index, event) {
        event.preventDefault();
        this.isDragging = true;
        this.dragType = type;
        this.dragIndex = index;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;

        // Add dragging class
        if (type === 'row') {
            const row = this.overlayEl.querySelector(`tbody tr[data-row="${index}"]`);
            if (row) row.classList.add('dragging');
        } else {
            const cells = this.overlayEl.querySelectorAll(`[data-col="${index}"]`);
            cells.forEach(c => c.classList.add('dragging'));
        }

        const moveHandler = (e) => this.handleDrag(e);
        const upHandler = (e) => {
            this.endDrag(e);
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }

    handleDrag(event) {
        if (!this.isDragging) return;

        const table = this.overlayEl.querySelector('.table-editor-table');
        const tableRect = table.getBoundingClientRect();

        if (this.dragType === 'row') {
            // Show horizontal drop indicator
            const trs = this.overlayEl.querySelectorAll('tbody tr');
            let targetIndex = -1;
            let insertY = 0;

            trs.forEach((tr, i) => {
                const trRect = tr.getBoundingClientRect();
                const midY = trRect.top + trRect.height / 2;
                if (event.clientY > midY) {
                    targetIndex = i;
                    insertY = trRect.bottom;
                } else if (targetIndex === -1 && i === 0) {
                    targetIndex = -1;
                    insertY = trRect.top;
                }
            });

            if (targetIndex === -1 && trs.length > 0) {
                insertY = trs[0].getBoundingClientRect().top;
                targetIndex = -1;
            }

            this.dropIndicator.className = 'table-drop-indicator horizontal';
            this.dropIndicator.style.display = 'block';
            this.dropIndicator.style.top = insertY + 'px';
            this.dropIndicator.style.left = tableRect.left + 'px';
            this.dropIndicator.style.width = tableRect.width + 'px';
            this.dropIndicator.style.height = '3px';
            this.dragTargetIndex = targetIndex;
        } else {
            // Show vertical drop indicator
            const headerCells = this.overlayEl.querySelectorAll('thead th.table-editor-header-cell');
            let targetIndex = -1;
            let insertX = 0;

            headerCells.forEach((th, i) => {
                const thRect = th.getBoundingClientRect();
                const midX = thRect.left + thRect.width / 2;
                if (event.clientX > midX) {
                    targetIndex = i;
                    insertX = thRect.right;
                } else if (targetIndex === -1 && i === 0) {
                    targetIndex = -1;
                    insertX = thRect.left;
                }
            });

            if (targetIndex === -1 && headerCells.length > 0) {
                insertX = headerCells[0].getBoundingClientRect().left;
                targetIndex = -1;
            }

            this.dropIndicator.className = 'table-drop-indicator vertical';
            this.dropIndicator.style.display = 'block';
            this.dropIndicator.style.left = insertX + 'px';
            this.dropIndicator.style.top = tableRect.top + 'px';
            this.dropIndicator.style.width = '3px';
            this.dropIndicator.style.height = tableRect.height + 'px';
            this.dragTargetIndex = targetIndex;
        }
    }

    endDrag(event) {
        if (!this.isDragging) return;

        this.dropIndicator.style.display = 'none';

        // Remove dragging classes
        this.overlayEl.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));

        const from = this.dragIndex;
        let to = this.dragTargetIndex !== undefined ? this.dragTargetIndex : from;

        if (this.dragType === 'row') {
            // Adjust for the drag direction
            if (to >= from) {
                // Moving down, no adjustment needed
            } else {
                to = to + 1;
            }
            if (to !== from && to >= 0 && to < this.activeTable.rows.length) {
                this.reorderRow(from, to);
            }
        } else {
            if (to >= from) {
                // Moving right
            } else {
                to = to + 1;
            }
            if (to !== from && to >= 0 && to < this.activeTable.headers.length) {
                this.reorderColumn(from, to);
            }
        }

        this.isDragging = false;
        this.dragType = null;
        this.dragIndex = null;
        this.dragTargetIndex = null;
    }

    reorderRow(fromIndex, toIndex) {
        const [removed] = this.activeTable.rows.splice(fromIndex, 1);
        this.activeTable.rows.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, removed);
        this.renderEditorTable();
    }

    reorderColumn(fromIndex, toIndex) {
        const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex;

        const [header] = this.activeTable.headers.splice(fromIndex, 1);
        this.activeTable.headers.splice(adjustedTo, 0, header);

        const [align] = this.activeTable.alignments.splice(fromIndex, 1);
        this.activeTable.alignments.splice(adjustedTo, 0, align);

        for (const row of this.activeTable.rows) {
            const [cell] = row.splice(fromIndex, 1);
            row.splice(adjustedTo, 0, cell);
        }

        this.renderEditorTable();
    }

    // ========================================
    // Sync to Editors
    // ========================================

    syncToMarkdownEditor() {
        const markdown = TableEditor.serializeToMarkdown(this.activeTable);
        const editor = this.editorInstance.editor;

        if (this.editorContext?.range) {
            const { start, end } = this.editorContext.range;
            const text = editor.value;
            editor.value = text.substring(0, start) + markdown + text.substring(end);
            editor.selectionStart = start;
            editor.selectionEnd = start + markdown.length;
        } else {
            // Insert at cursor
            const start = editor.selectionStart;
            const text = editor.value;
            const before = text.substring(0, start);
            const after = text.substring(start);
            const prefix = before.endsWith('\n') || before === '' ? '' : '\n';
            const suffix = after.startsWith('\n') || after === '' ? '' : '\n';
            editor.value = before + prefix + markdown + suffix + after;
            editor.selectionStart = start + prefix.length;
            editor.selectionEnd = start + prefix.length + markdown.length;
        }

        // Trigger update
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    syncToRichTextEditor() {
        const html = TableEditor.serializeToHTML(this.activeTable);

        if (this.activeTableElement) {
            this.activeTableElement.outerHTML = html;
        } else {
            // Insert at cursor
            document.execCommand('insertHTML', false, html);
        }

        // Trigger update
        const richEditor = this.editorInstance.richTextEditorElement;
        richEditor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // ========================================
    // Table Detection (Markdown Mode)
    // ========================================

    /**
     * Detect a markdown table at the current cursor position in the textarea
     * @returns {{ text: string, startLine: number, endLine: number, start: number, end: number } | null}
     */
    detectTableAtCursor() {
        const editor = this.editorInstance.editor;
        const text = editor.value;
        const cursorPos = editor.selectionStart;

        // Find which line the cursor is on
        const lines = text.split('\n');
        let charCount = 0;
        let cursorLine = 0;
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= cursorPos) {
                cursorLine = i;
                break;
            }
            charCount += lines[i].length + 1; // +1 for newline
        }

        // Check if current line looks like a table row
        const isTableLine = (line) => /^\|.*\|$/.test(line.trim());

        if (!isTableLine(lines[cursorLine])) return null;

        // Expand upward to find start of table
        let startLine = cursorLine;
        while (startLine > 0 && isTableLine(lines[startLine - 1])) {
            startLine--;
        }

        // Expand downward to find end of table
        let endLine = cursorLine;
        while (endLine < lines.length - 1 && isTableLine(lines[endLine + 1])) {
            endLine++;
        }

        // Need at least 2 lines (header + separator)
        if (endLine - startLine < 1) return null;

        // Calculate character positions
        let start = 0;
        for (let i = 0; i < startLine; i++) {
            start += lines[i].length + 1;
        }
        let end = start;
        for (let i = startLine; i <= endLine; i++) {
            end += lines[i].length + (i < endLine ? 1 : 0);
        }

        const tableText = lines.slice(startLine, endLine + 1).join('\n');

        return { text: tableText, startLine, endLine, start, end };
    }

    /**
     * Open the table editor for the table at the cursor in markdown mode
     */
    editTableAtCursor() {
        const detected = this.detectTableAtCursor();
        if (!detected) return false;

        const tableData = TableEditor.parseMarkdownTable(detected.text);
        if (!tableData) return false;

        this.openEditor(tableData, {
            mode: 'markdown',
            range: { start: detected.start, end: detected.end }
        });
        return true;
    }

    /**
     * Open the table editor for an HTML table element in rich text mode
     * @param {HTMLTableElement} tableElement
     */
    editHTMLTable(tableElement) {
        const tableData = TableEditor.parseHTMLTable(tableElement);
        this.activeTableElement = tableElement;
        this.openEditor(tableData, { mode: 'richtext', element: tableElement });
    }

    /**
     * Insert a new table with the given dimensions
     * @param {number} rows - Number of rows (including header)
     * @param {number} cols - Number of columns
     */
    insertNewTable(rows, cols) {
        const tableData = {
            headers: Array.from({ length: cols }, (_, i) => `Header ${i + 1}`),
            rows: Array.from({ length: Math.max(1, rows - 1) }, () => Array(cols).fill('')),
            alignments: Array(cols).fill('none')
        };

        const mode = this.editorInstance.currentMode;

        if (mode === 'markdown') {
            const markdown = TableEditor.serializeToMarkdown(tableData);
            const editor = this.editorInstance.editor;
            const start = editor.selectionStart;
            const text = editor.value;
            const before = text.substring(0, start);
            const after = text.substring(start);
            const prefix = before.endsWith('\n') || before === '' ? '' : '\n\n';
            const suffix = after.startsWith('\n') || after === '' ? '' : '\n\n';
            editor.value = before + prefix + markdown + suffix + after;
            editor.dispatchEvent(new Event('input', { bubbles: true }));

            // Calculate range for the newly inserted table
            const tableStart = start + prefix.length;
            const tableEnd = tableStart + markdown.length;
            editor.selectionStart = tableStart;
            editor.selectionEnd = tableEnd;

            // Open editor for the new table
            this.openEditor(tableData, {
                mode: 'markdown',
                range: { start: tableStart, end: tableEnd }
            });
        } else {
            const html = TableEditor.serializeToHTML(tableData);
            document.execCommand('insertHTML', false, html);
            this.editorInstance.richTextEditorElement.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // ========================================
    // Cleanup
    // ========================================

    destroy() {
        this._cleanupActiveKeyHandler();
        if (this.gridPickerEl) this.gridPickerEl.remove();
        if (this.overlayEl) this.overlayEl.remove();
        if (this.contextMenuEl) this.contextMenuEl.remove();
        if (this.dropIndicator) this.dropIndicator.remove();
    }

    _cleanupActiveKeyHandler() {
        if (this._activeKeyHandler) {
            this._activeKeyHandler.element.removeEventListener('keydown', this._activeKeyHandler.handler);
            this._activeKeyHandler = null;
        }
    }
}
