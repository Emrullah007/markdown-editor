/**
 * Markdown Templates Module
 * Provides quick-insert templates for common document types
 * @module Templates
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * @class Templates
 * Handles markdown template functionality
 */
class Templates {
    /**
     * Create a Templates instance
     * @param {MarkdownEditor} editor - The main editor instance
     */
    constructor(editor) {
        this.editor = editor;
        this.templates = this.getDefaultTemplates();
        
        this.init();
    }

    /**
     * Initialize templates functionality
     */
    init() {
        this.createUI();
        this.setupEventListeners();
    }

    /**
     * Get default template definitions
     * @returns {Object[]} Array of template objects
     */
    getDefaultTemplates() {
        return [
            {
                id: 'meeting-notes',
                name: 'Meeting Notes',
                icon: '📋',
                category: 'Business',
                content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 

## Agenda
1. 
2. 
3. 

## Discussion Points

### Topic 1

### Topic 2

## Action Items
- [ ] 
- [ ] 
- [ ] 

## Next Steps

## Next Meeting
**Date:** 
**Time:** 
`
            },
            {
                id: 'blog-post',
                name: 'Blog Post',
                icon: '📝',
                category: 'Writing',
                content: `# Blog Post Title

*Published on ${new Date().toLocaleDateString()}*

![Featured Image](url)

## Introduction

Your introduction paragraph here...

## Main Content

### Section 1

Content for section 1...

### Section 2

Content for section 2...

## Conclusion

Your conclusion here...

---

**Tags:** #tag1 #tag2 #tag3

**Author:** Your Name
`
            },
            {
                id: 'project-readme',
                name: 'Project README',
                icon: '📦',
                category: 'Development',
                content: `# Project Name

Brief description of your project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
const project = require('project-name');

// Example usage
\`\`\`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| option1 | string | '' | Description |
| option2 | boolean | false | Description |

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing\`)
5. Open a Pull Request

## License

MIT © [Your Name](https://your-website.com)
`
            },
            {
                id: 'todo-list',
                name: 'Todo List',
                icon: '✅',
                category: 'Productivity',
                content: `# Todo List

## Today's Tasks

### High Priority 🔴
- [ ] 
- [ ] 

### Medium Priority 🟡
- [ ] 
- [ ] 

### Low Priority 🟢
- [ ] 
- [ ] 

## This Week

- [ ] Monday: 
- [ ] Tuesday: 
- [ ] Wednesday: 
- [ ] Thursday: 
- [ ] Friday: 

## Notes

`
            },
            {
                id: 'bug-report',
                name: 'Bug Report',
                icon: '🐛',
                category: 'Development',
                content: `# Bug Report

## Description
A clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- **OS:** 
- **Browser:** 
- **Version:** 

## Additional Context
Any other context about the problem.
`
            },
            {
                id: 'feature-request',
                name: 'Feature Request',
                icon: '💡',
                category: 'Development',
                content: `# Feature Request

## Summary
Brief summary of the feature.

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Screenshots, mockups, or examples.

## Priority
- [ ] Critical
- [ ] High
- [ ] Medium
- [ ] Low
`
            },
            {
                id: 'weekly-report',
                name: 'Weekly Report',
                icon: '📊',
                category: 'Business',
                content: `# Weekly Report

**Week of:** ${new Date().toLocaleDateString()}
**Author:** 

## Summary

Brief summary of the week...

## Accomplishments

- ✅ 
- ✅ 
- ✅ 

## In Progress

- 🔄 
- 🔄 

## Blockers

- ❌ 

## Next Week's Goals

1. 
2. 
3. 

## Metrics

| Metric | This Week | Last Week | Change |
|--------|-----------|-----------|--------|
| | | | |

## Notes

`
            },
            {
                id: 'documentation',
                name: 'Documentation',
                icon: '📚',
                category: 'Development',
                content: `# Documentation Title

## Overview

Brief overview of the topic.

## Prerequisites

- Prerequisite 1
- Prerequisite 2

## Getting Started

### Step 1

Description and code example:

\`\`\`javascript
// Code example
\`\`\`

### Step 2

Description and code example.

## API Reference

### Method Name

\`\`\`javascript
methodName(param1, param2)
\`\`\`

**Parameters:**
- \`param1\` (Type) - Description
- \`param2\` (Type) - Description

**Returns:** Description of return value

**Example:**
\`\`\`javascript
const result = methodName('value1', 'value2');
\`\`\`

## FAQ

### Question 1?

Answer 1.

### Question 2?

Answer 2.

## See Also

- [Related Link 1](url)
- [Related Link 2](url)
`
            },
            {
                id: 'journal',
                name: 'Daily Journal',
                icon: '📔',
                category: 'Personal',
                content: `# Journal Entry

**Date:** ${new Date().toLocaleDateString()}
**Mood:** 

## Morning Reflection

How am I feeling today?

## Goals for Today

1. 
2. 
3. 

## Gratitude

I'm grateful for:
- 
- 
- 

## Evening Reflection

What went well today?

What could have gone better?

What did I learn?

## Tomorrow

What do I want to focus on tomorrow?
`
            },
            {
                id: 'recipe',
                name: 'Recipe',
                icon: '🍳',
                category: 'Personal',
                content: `# Recipe Name

![Recipe Photo](url)

**Prep Time:** 
**Cook Time:** 
**Servings:** 

## Description

Brief description of the dish.

## Ingredients

- [ ] Ingredient 1
- [ ] Ingredient 2
- [ ] Ingredient 3

## Instructions

1. **Step 1:** 
2. **Step 2:** 
3. **Step 3:** 

## Tips

- Tip 1
- Tip 2

## Nutrition (per serving)

| | Amount |
|---|---|
| Calories | |
| Protein | |
| Carbs | |
| Fat | |

## Notes

`
            }
        ];
    }

    /**
     * Create the templates UI
     */
    createUI() {
        // Create templates button in toolbar
        const toolbarGroup = document.querySelector('.toolbar-group:nth-child(1)');
        
        this.templatesBtn = document.createElement('button');
        this.templatesBtn.id = 'templatesBtn';
        this.templatesBtn.className = 'btn';
        this.templatesBtn.title = 'Insert Template';
        this.templatesBtn.setAttribute('aria-label', 'Insert template');
        this.templatesBtn.innerHTML = '<span class="icon">📄</span> Templates';
        
        toolbarGroup.appendChild(this.templatesBtn);

        // Create templates modal
        this.modal = document.createElement('div');
        this.modal.id = 'templatesModal';
        this.modal.className = 'templates-modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-label', 'Template picker');
        
        this.modal.innerHTML = `
            <div class="templates-content">
                <div class="templates-header">
                    <h2>📄 Insert Template</h2>
                    <button class="templates-close-btn" aria-label="Close">&times;</button>
                </div>
                <div class="templates-search">
                    <input type="text" id="templateSearch" placeholder="Search templates..." aria-label="Search templates">
                </div>
                <div class="templates-categories">
                    <button class="category-btn active" data-category="all">All</button>
                    ${this.getCategories().map(cat => 
                        `<button class="category-btn" data-category="${cat}">${cat}</button>`
                    ).join('')}
                </div>
                <div class="templates-grid" id="templatesGrid">
                    ${this.renderTemplates()}
                </div>
                <div class="templates-footer">
                    <p>Click a template to insert it at the cursor position</p>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Cache elements
        this.searchInput = document.getElementById('templateSearch');
        this.templatesGrid = document.getElementById('templatesGrid');
    }

    /**
     * Get unique categories from templates
     * @returns {string[]}
     */
    getCategories() {
        const categories = [...new Set(this.templates.map(t => t.category))];
        return categories.sort();
    }

    /**
     * Render template cards
     * @param {string} filter - Category filter
     * @param {string} search - Search term
     * @returns {string} HTML string
     */
    renderTemplates(filter = 'all', search = '') {
        let filtered = this.templates;

        if (filter !== 'all') {
            filtered = filtered.filter(t => t.category === filter);
        }

        if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(term) || 
                t.category.toLowerCase().includes(term)
            );
        }

        if (filtered.length === 0) {
            return '<div class="no-templates">No templates found</div>';
        }

        return filtered.map(template => `
            <div class="template-card" data-template-id="${template.id}" tabindex="0" role="button">
                <div class="template-icon">${template.icon}</div>
                <div class="template-info">
                    <h3>${template.name}</h3>
                    <span class="template-category">${template.category}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Open modal
        this.templatesBtn.addEventListener('click', () => this.open());

        // Close modal
        this.modal.querySelector('.templates-close-btn').addEventListener('click', () => this.close());
        
        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('visible')) {
                this.close();
            }
        });

        // Search
        this.searchInput.addEventListener('input', () => this.filterTemplates());

        // Category filter
        this.modal.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.modal.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterTemplates();
            });
        });

        // Template selection
        this.templatesGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.template-card');
            if (card) {
                this.insertTemplate(card.dataset.templateId);
            }
        });

        // Keyboard navigation for template cards
        this.templatesGrid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.template-card');
                if (card) {
                    e.preventDefault();
                    this.insertTemplate(card.dataset.templateId);
                }
            }
        });
    }

    /**
     * Open the templates modal
     */
    open() {
        this.modal.classList.add('visible');
        this.searchInput.focus();
    }

    /**
     * Close the templates modal
     */
    close() {
        this.modal.classList.remove('visible');
        this.searchInput.value = '';
        this.filterTemplates();
    }

    /**
     * Filter templates based on search and category
     */
    filterTemplates() {
        const search = this.searchInput.value;
        const activeCategory = this.modal.querySelector('.category-btn.active').dataset.category;
        this.templatesGrid.innerHTML = this.renderTemplates(activeCategory, search);
    }

    /**
     * Insert a template into the editor
     * @param {string} templateId - Template ID to insert
     */
    insertTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        if (this.editor.currentMode === 'markdown') {
            const textarea = this.editor.editor;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            
            // Insert template at cursor
            const before = text.substring(0, start);
            const after = text.substring(end);
            
            // Add newlines if needed
            const prefix = before.length > 0 && !before.endsWith('\n\n') ? '\n\n' : '';
            const suffix = after.length > 0 && !after.startsWith('\n\n') ? '\n\n' : '';
            
            textarea.value = before + prefix + template.content + suffix + after;
            
            // Position cursor at start of template
            const newPos = start + prefix.length;
            textarea.selectionStart = newPos;
            textarea.selectionEnd = newPos;
            
            // Trigger input event
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            textarea.focus();
            
            // Update syntax highlighter
            if (this.editor.syntaxHighlighter) {
                this.editor.syntaxHighlighter.update();
            }
        } else {
            // Rich text mode - convert to HTML and insert
            const html = markdownParser.parse(template.content);
            const richEditor = this.editor.richTextEditorElement;
            
            // Insert at cursor
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                
                const div = document.createElement('div');
                div.innerHTML = html;
                
                const fragment = document.createDocumentFragment();
                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }
                
                range.insertNode(fragment);
            } else {
                richEditor.innerHTML += html;
            }
            
            richEditor.dispatchEvent(new Event('input', { bubbles: true }));
            richEditor.focus();
        }

        this.close();
    }

    /**
     * Add a custom template
     * @param {Object} template - Template object
     */
    addTemplate(template) {
        if (!template.id || !template.name || !template.content) {
            console.error('Template must have id, name, and content');
            return;
        }
        
        template.icon = template.icon || '📄';
        template.category = template.category || 'Custom';
        
        this.templates.push(template);
        this.filterTemplates();
    }

    /**
     * Remove a template
     * @param {string} templateId - Template ID
     */
    removeTemplate(templateId) {
        this.templates = this.templates.filter(t => t.id !== templateId);
        this.filterTemplates();
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Templates;
}
