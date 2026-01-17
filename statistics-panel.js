/**
 * Statistics Panel Module
 * Provides detailed document statistics including reading level analysis
 * @module StatisticsPanel
 * @author Emrullah Celik
 * @version 1.0.0
 */

/**
 * @class StatisticsPanel
 * Handles the statistics panel functionality
 */
class StatisticsPanel {
    /**
     * Create a StatisticsPanel instance
     * @param {MarkdownEditor} editor - The main editor instance
     */
    constructor(editor) {
        this.editor = editor;
        this.isOpen = false;
        this.updateTimer = null;
        
        this.init();
    }

    /**
     * Initialize the statistics panel
     */
    init() {
        this.createPanel();
        this.setupEventListeners();
        this.updateStats();
    }

    /**
     * Create the statistics panel UI
     */
    createPanel() {
        // Make word count clickable
        this.wordCountElement = document.getElementById('wordCount');
        this.wordCountElement.classList.add('stats-clickable');
        this.wordCountElement.title = 'Click for detailed statistics';
        this.wordCountElement.setAttribute('role', 'button');
        this.wordCountElement.setAttribute('tabindex', '0');

        // Create the expanded panel
        this.panel = document.createElement('div');
        this.panel.id = 'statisticsPanel';
        this.panel.className = 'statistics-panel';
        this.panel.setAttribute('role', 'dialog');
        this.panel.setAttribute('aria-label', 'Document statistics');
        
        this.panel.innerHTML = `
            <div class="stats-panel-header">
                <h3>📊 Document Statistics</h3>
                <button class="stats-close-btn" aria-label="Close statistics panel">&times;</button>
            </div>
            <div class="stats-panel-content">
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value" id="statWords">0</span>
                        <span class="stat-label">Words</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="statChars">0</span>
                        <span class="stat-label">Characters</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="statCharsNoSpace">0</span>
                        <span class="stat-label">Chars (no spaces)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="statSentences">0</span>
                        <span class="stat-label">Sentences</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="statParagraphs">0</span>
                        <span class="stat-label">Paragraphs</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="statLines">0</span>
                        <span class="stat-label">Lines</span>
                    </div>
                </div>
                <div class="stats-divider"></div>
                <div class="stats-grid stats-time">
                    <div class="stat-item">
                        <span class="stat-value" id="statReadTime">0</span>
                        <span class="stat-label">Read time (min)</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" id="statSpeakTime">0</span>
                        <span class="stat-label">Speak time (min)</span>
                    </div>
                </div>
                <div class="stats-divider"></div>
                <div class="reading-level">
                    <h4>Reading Level</h4>
                    <div class="reading-level-content">
                        <div class="level-meter">
                            <div class="level-fill" id="levelFill"></div>
                            <div class="level-indicator" id="levelIndicator"></div>
                        </div>
                        <div class="level-labels">
                            <span>Easy</span>
                            <span>Medium</span>
                            <span>Hard</span>
                        </div>
                        <div class="level-details">
                            <span id="readingLevelText">Calculating...</span>
                            <span id="fleschScore" class="flesch-score"></span>
                        </div>
                    </div>
                </div>
                <div class="stats-divider"></div>
                <div class="stats-breakdown">
                    <h4>Breakdown</h4>
                    <div class="breakdown-items">
                        <div class="breakdown-item">
                            <span class="breakdown-label">Headers</span>
                            <span class="breakdown-value" id="statHeaders">0</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Links</span>
                            <span class="breakdown-value" id="statLinks">0</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Images</span>
                            <span class="breakdown-value" id="statImages">0</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Code blocks</span>
                            <span class="breakdown-value" id="statCodeBlocks">0</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Lists</span>
                            <span class="breakdown-value" id="statLists">0</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="breakdown-label">Tables</span>
                            <span class="breakdown-value" id="statTables">0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert panel after footer
        const footer = document.querySelector('.footer');
        footer.parentNode.insertBefore(this.panel, footer.nextSibling);

        // Cache element references
        this.cacheElements();
    }

    /**
     * Cache DOM element references
     */
    cacheElements() {
        this.elements = {
            words: document.getElementById('statWords'),
            chars: document.getElementById('statChars'),
            charsNoSpace: document.getElementById('statCharsNoSpace'),
            sentences: document.getElementById('statSentences'),
            paragraphs: document.getElementById('statParagraphs'),
            lines: document.getElementById('statLines'),
            readTime: document.getElementById('statReadTime'),
            speakTime: document.getElementById('statSpeakTime'),
            levelFill: document.getElementById('levelFill'),
            levelIndicator: document.getElementById('levelIndicator'),
            readingLevelText: document.getElementById('readingLevelText'),
            fleschScore: document.getElementById('fleschScore'),
            headers: document.getElementById('statHeaders'),
            links: document.getElementById('statLinks'),
            images: document.getElementById('statImages'),
            codeBlocks: document.getElementById('statCodeBlocks'),
            lists: document.getElementById('statLists'),
            tables: document.getElementById('statTables')
        };
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Click on word count to open panel
        this.wordCountElement.addEventListener('click', () => this.toggle());
        this.wordCountElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close button
        this.panel.querySelector('.stats-close-btn').addEventListener('click', () => this.close());

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.panel.contains(e.target) && 
                !this.wordCountElement.contains(e.target)) {
                this.close();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Update stats on editor input
        const markdownEditor = this.editor.editor;
        markdownEditor.addEventListener('input', () => this.scheduleUpdate());

        const richTextEditor = this.editor.richTextEditorElement;
        richTextEditor.addEventListener('input', () => this.scheduleUpdate());
    }

    /**
     * Schedule a stats update (debounced)
     */
    scheduleUpdate() {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        this.updateTimer = setTimeout(() => this.updateStats(), 300);
    }

    /**
     * Toggle panel open/closed
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * Open the statistics panel
     */
    open() {
        this.isOpen = true;
        this.panel.classList.add('visible');
        this.wordCountElement.classList.add('active');
        this.updateStats();
    }

    /**
     * Close the statistics panel
     */
    close() {
        this.isOpen = false;
        this.panel.classList.remove('visible');
        this.wordCountElement.classList.remove('active');
    }

    /**
     * Update all statistics
     */
    updateStats() {
        const text = this.getText();
        const stats = this.calculateStats(text);
        const markdown = this.getMarkdown();
        const mdStats = this.calculateMarkdownStats(markdown);

        // Update basic stats
        this.elements.words.textContent = stats.words.toLocaleString();
        this.elements.chars.textContent = stats.chars.toLocaleString();
        this.elements.charsNoSpace.textContent = stats.charsNoSpace.toLocaleString();
        this.elements.sentences.textContent = stats.sentences.toLocaleString();
        this.elements.paragraphs.textContent = stats.paragraphs.toLocaleString();
        this.elements.lines.textContent = stats.lines.toLocaleString();

        // Update time estimates
        this.elements.readTime.textContent = stats.readTime;
        this.elements.speakTime.textContent = stats.speakTime;

        // Update reading level
        this.updateReadingLevel(stats.fleschScore);

        // Update markdown breakdown
        this.elements.headers.textContent = mdStats.headers;
        this.elements.links.textContent = mdStats.links;
        this.elements.images.textContent = mdStats.images;
        this.elements.codeBlocks.textContent = mdStats.codeBlocks;
        this.elements.lists.textContent = mdStats.lists;
        this.elements.tables.textContent = mdStats.tables;

        // Update footer word count
        this.wordCountElement.textContent = 
            `${stats.words} words • ${stats.charsNoSpace} characters • ${stats.readTime} min read`;
    }

    /**
     * Get clean text for analysis
     * @returns {string}
     */
    getText() {
        const markdown = this.getMarkdown();
        
        // Remove markdown syntax for text analysis
        return markdown
            .replace(/```[\s\S]*?```/g, '') // Code blocks
            .replace(/`[^`]+`/g, '') // Inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
            .replace(/^#{1,6}\s+/gm, '') // Headers
            .replace(/[*_]{1,3}/g, '') // Bold/italic
            .replace(/~~(.+?)~~/g, '$1') // Strikethrough
            .replace(/^>\s+/gm, '') // Blockquotes
            .replace(/^[-*+]\s+/gm, '') // Unordered lists
            .replace(/^\d+\.\s+/gm, '') // Ordered lists
            .replace(/^[-*_]{3,}$/gm, '') // Horizontal rules
            .replace(/\|[^|]+\|/g, '') // Tables
            .trim();
    }

    /**
     * Get raw markdown
     * @returns {string}
     */
    getMarkdown() {
        if (this.editor.currentMode === 'markdown') {
            return this.editor.editor.value;
        } else {
            return this.editor.richTextEditor.getMarkdown();
        }
    }

    /**
     * Calculate text statistics
     * @param {string} text - Clean text
     * @returns {Object} Statistics object
     */
    calculateStats(text) {
        const markdown = this.getMarkdown();
        
        // Words
        const words = text.length > 0 
            ? text.split(/\s+/).filter(w => w.length > 0).length 
            : 0;

        // Characters
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;

        // Sentences (approximate)
        const sentences = text.length > 0 
            ? (text.match(/[.!?]+(?=\s|$)/g) || []).length || 1
            : 0;

        // Paragraphs
        const paragraphs = markdown.length > 0
            ? markdown.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
            : 0;

        // Lines
        const lines = markdown.length > 0 
            ? markdown.split('\n').length 
            : 0;

        // Time estimates (200 wpm reading, 150 wpm speaking)
        const readTime = Math.ceil(words / 200) || 0;
        const speakTime = Math.ceil(words / 150) || 0;

        // Flesch-Kincaid reading ease score
        const fleschScore = this.calculateFleschScore(text, words, sentences);

        return {
            words,
            chars,
            charsNoSpace,
            sentences,
            paragraphs,
            lines,
            readTime,
            speakTime,
            fleschScore
        };
    }

    /**
     * Calculate Flesch Reading Ease score
     * @param {string} text - Text to analyze
     * @param {number} words - Word count
     * @param {number} sentences - Sentence count
     * @returns {number} Flesch score (0-100+)
     */
    calculateFleschScore(text, words, sentences) {
        if (words === 0 || sentences === 0) return 100;

        // Count syllables (approximate)
        const syllables = this.countSyllables(text);
        
        // Flesch Reading Ease formula
        const score = 206.835 - 
            (1.015 * (words / sentences)) - 
            (84.6 * (syllables / words));

        return Math.round(Math.max(0, Math.min(100, score)));
    }

    /**
     * Count syllables in text (approximate)
     * @param {string} text - Text to analyze
     * @returns {number} Syllable count
     */
    countSyllables(text) {
        const words = text.toLowerCase().match(/[a-z]+/g) || [];
        let count = 0;

        words.forEach(word => {
            // Count vowel groups
            const vowelGroups = word.match(/[aeiouy]+/g) || [];
            let syllables = vowelGroups.length;

            // Adjustments
            if (word.endsWith('e') && syllables > 1) syllables--;
            if (word.endsWith('le') && word.length > 2 && !/[aeiouy]le$/.test(word)) syllables++;
            if (syllables === 0) syllables = 1;

            count += syllables;
        });

        return count;
    }

    /**
     * Update the reading level display
     * @param {number} score - Flesch score
     */
    updateReadingLevel(score) {
        // Determine level
        let level, description;
        
        if (score >= 90) {
            level = 'Very Easy';
            description = '5th grade';
        } else if (score >= 80) {
            level = 'Easy';
            description = '6th grade';
        } else if (score >= 70) {
            level = 'Fairly Easy';
            description = '7th grade';
        } else if (score >= 60) {
            level = 'Standard';
            description = '8th-9th grade';
        } else if (score >= 50) {
            level = 'Fairly Difficult';
            description = '10th-12th grade';
        } else if (score >= 30) {
            level = 'Difficult';
            description = 'College level';
        } else {
            level = 'Very Difficult';
            description = 'College graduate';
        }

        // Update display
        this.elements.readingLevelText.textContent = `${level} (${description})`;
        this.elements.fleschScore.textContent = `Score: ${score}`;

        // Update meter (invert score so higher = harder)
        const percentage = 100 - score;
        this.elements.levelFill.style.width = `${percentage}%`;
        
        // Color based on difficulty
        let color;
        if (score >= 70) {
            color = 'var(--success-color)';
        } else if (score >= 50) {
            color = 'var(--accent-color)';
        } else {
            color = 'var(--danger-color)';
        }
        this.elements.levelFill.style.background = color;
        
        // Position indicator
        this.elements.levelIndicator.style.left = `${percentage}%`;
    }

    /**
     * Calculate markdown-specific statistics
     * @param {string} markdown - Raw markdown
     * @returns {Object} Markdown stats
     */
    calculateMarkdownStats(markdown) {
        return {
            headers: (markdown.match(/^#{1,6}\s+/gm) || []).length,
            links: (markdown.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length,
            images: (markdown.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length,
            codeBlocks: (markdown.match(/```/g) || []).length / 2,
            lists: (markdown.match(/^[-*+]\s+|^\d+\.\s+/gm) || []).length,
            tables: (markdown.match(/^\|.+\|$/gm) || []).length > 0 ? 1 : 0
        };
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StatisticsPanel;
}
