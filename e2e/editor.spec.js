// @ts-check
const { test, expect } = require('@playwright/test');

async function gotoEditor(page) {
    await page.goto('/');
    await page.waitForSelector('#editor');
    await page.waitForFunction(() => window.__markdownEditorReady === true);
}

test.describe('Markdown Editor', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
    });

    test('should load the editor', async ({ page }) => {
        await expect(page).toHaveTitle(/Markdown Editor/);
        await expect(page.locator('.logo')).toContainText('Markdown Editor');
    });

    test('should have default content', async ({ page }) => {
        const editor = page.locator('#editor');
        const content = await editor.inputValue();
        expect(content).toContain('Welcome to Markdown Editor');
    });

    test('should start with cursor at the beginning of content', async ({ page }) => {
        // Verify the editor starts with cursor at position 0 and scroll at top
        const editorState = await page.evaluate(() => {
            const editor = document.getElementById('editor');
            return {
                scrollTop: editor.scrollTop,
                selectionStart: editor.selectionStart,
                selectionEnd: editor.selectionEnd,
                valueLength: editor.value.length
            };
        });
        
        // Cursor should be at the beginning
        expect(editorState.selectionStart).toBe(0);
        expect(editorState.selectionEnd).toBe(0);
        
        // Scroll should be at the top
        expect(editorState.scrollTop).toBe(0);
        
        // Content should exist (not empty)
        expect(editorState.valueLength).toBeGreaterThan(0);
    });

    test('should update preview when typing', async ({ page }) => {
        const editor = page.locator('#editor');
        
        // Clear and type new content
        await editor.fill('# Hello World\n\nThis is a test.');
        
        // Wait for preview update
        await page.waitForTimeout(500);
        
        // Check preview
        const preview = page.locator('#preview');
        await expect(preview.locator('h1')).toContainText('Hello World');
        await expect(preview.locator('p')).toContainText('This is a test');
    });

    test('should show word count', async ({ page }) => {
        const editor = page.locator('#editor');
        
        // Type some content
        await editor.fill('One two three four five');
        
        // Wait for stats update
        await page.waitForTimeout(500);
        
        // Check word count
        const wordCount = page.locator('#wordCount');
        await expect(wordCount).toContainText('5 words');
    });

    test('should toggle to rich text mode', async ({ page }) => {
        const modeToggle = page.locator('#modeToggle');
        
        // Click mode toggle
        await modeToggle.click();
        
        // Rich text editor should be visible
        await expect(page.locator('#richTextEditor')).toBeVisible();
        
        // Markdown textarea should be hidden
        await expect(page.locator('#editor')).toBeHidden();
        
        // Toggle back
        await modeToggle.click();
        await expect(page.locator('#editor')).toBeVisible();
    });
});

test.describe('Theme Switching', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
    });

    test('should switch themes', async ({ page }) => {
        // Open theme picker
        await page.click('#themePickerBtn');
        
        // Wait for dropdown
        await expect(page.locator('.theme-picker-dropdown')).toBeVisible();
        
        // Select dark theme
        await page.click('[data-theme="dark"]');
        
        // Check body has dark mode class
        await expect(page.locator('body')).toHaveClass(/dark-mode/);
        
        // Open and select ocean theme
        await page.click('#themePickerBtn');
        await page.click('[data-theme="ocean"]');
        
        await expect(page.locator('body')).toHaveClass(/theme-ocean/);
    });
});

test.describe('Find and Replace', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
        // Set some content
        await page.locator('#editor').fill('Hello world. Hello again. Goodbye world.');
    });

    test('should open find dialog with keyboard shortcut', async ({ page }) => {
        await page.keyboard.press('Control+f');
        
        // Find dialog should be visible
        await expect(page.locator('.find-replace-dialog')).toBeVisible();
    });

    test('should find text', async ({ page }) => {
        // Open find dialog
        await page.click('#findReplaceBtn');
        
        // Type search term
        await page.fill('#findInput', 'Hello');
        
        // Should show match count
        await expect(page.locator('.match-count')).toContainText('2');
    });

    test('should replace text', async ({ page }) => {
        // Open find/replace
        await page.keyboard.press('Control+h');
        
        // Enter find and replace terms
        await page.fill('#findInput', 'Hello');
        await page.fill('#replaceInput', 'Hi');
        
        // Click replace all
        await page.click('button:has-text("Replace All")');
        
        // Check content was replaced
        const editor = page.locator('#editor');
        const content = await editor.inputValue();
        expect(content).not.toContain('Hello');
        expect(content).toContain('Hi');
    });
});

test.describe('Templates', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
    });

    test('should open templates modal', async ({ page }) => {
        await page.click('#templatesBtn');
        
        await expect(page.locator('.templates-modal')).toBeVisible();
        await expect(page.locator('.template-card')).toHaveCount(10); // 10 default templates
    });

    test('should filter templates by category', async ({ page }) => {
        await page.click('#templatesBtn');
        
        // Click Development category
        await page.click('.category-btn:has-text("Development")');
        
        // Should show only development templates
        const cards = page.locator('.template-card');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(10);
    });

    test('should insert template', async ({ page }) => {
        // Clear editor first
        await page.locator('#editor').fill('');
        
        // Open templates
        await page.click('#templatesBtn');
        
        // Click a template
        await page.click('.template-card:first-child');
        
        // Modal should close
        await expect(page.locator('.templates-modal')).toBeHidden();
        
        // Editor should have content
        const editor = page.locator('#editor');
        const content = await editor.inputValue();
        expect(content.length).toBeGreaterThan(0);
    });
});

test.describe('Export Functions', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
        await page.locator('#editor').fill('# Test Export\n\nSome content here.');
    });

    test('should copy markdown to clipboard', async ({ page }, testInfo) => {
        test.skip(['firefox', 'webkit'].includes(testInfo.project.name), 'Clipboard read is not supported.');
        // Grant clipboard permissions
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        
        await page.click('#copyMdBtn');
        
        // Check clipboard content
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toContain('# Test Export');
    });

    test('should copy HTML to clipboard', async ({ page }, testInfo) => {
        test.skip(['firefox', 'webkit'].includes(testInfo.project.name), 'Clipboard read is not supported.');
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        
        await page.click('#copyHtmlBtn');
        
        const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
        expect(clipboardText).toContain('<h1>');
    });
});

test.describe('Undo/Redo', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
    });

    test('should undo changes', async ({ page }) => {
        const editor = page.locator('#editor');
        
        // Get initial content
        const initialContent = await editor.inputValue();
        
        // Make a change
        await editor.fill('New content');
        await page.waitForTimeout(1500); // Wait for history to be saved
        
        // Undo
        await page.keyboard.press('Control+z');
        
        // Content should be restored
        const restoredContent = await editor.inputValue();
        expect(restoredContent).toBe(initialContent);
    });

    test('should redo changes', async ({ page }) => {
        const editor = page.locator('#editor');
        
        // Make changes
        await editor.fill('First change');
        await page.waitForTimeout(1500);
        
        await editor.fill('Second change');
        await page.waitForTimeout(1500);
        
        // Undo twice
        await page.keyboard.press('Control+z');
        await page.keyboard.press('Control+z');
        
        // Redo once
        await page.keyboard.press('Control+Shift+z');
        
        const content = await editor.inputValue();
        expect(content).toBe('First change');
    });
});

test.describe('Focus Mode', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
    });

    test('should toggle focus mode', async ({ page }) => {
        // Click focus mode button
        await page.click('#focusModeBtn');
        
        // Body should have focus-mode class
        await expect(page.locator('body')).toHaveClass(/focus-mode/);
        
        // Click again to disable
        await page.click('#focusModeBtn');
        await expect(page.locator('body')).not.toHaveClass(/focus-mode/);
    });
});

test.describe('Statistics Panel', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
        await page.locator('#editor').fill('This is a test. This has two sentences.');
    });

    test('should open statistics panel', async ({ page }) => {
        // Click on word count to open panel
        await page.click('#wordCount');
        
        // Statistics panel should be visible
        await expect(page.locator('#statisticsPanel')).toBeVisible();
    });

    test('should show correct statistics', async ({ page }) => {
        await page.click('#wordCount');
        
        // Wait for stats to update
        await page.waitForTimeout(500);
        
        // Check word count
        await expect(page.locator('#statWords')).toContainText('8');
        
        // Check sentence count
        await expect(page.locator('#statSentences')).toContainText('2');
    });
});

test.describe('Auto-pair', () => {
    test.beforeEach(async ({ page }) => {
        await gotoEditor(page);
        await page.locator('#editor').fill('');
    });

    test('should auto-close brackets', async ({ page }) => {
        const editor = page.locator('#editor');
        await editor.focus();
        
        // Type opening bracket
        await page.keyboard.type('(');
        
        const content = await editor.inputValue();
        expect(content).toBe('()');
    });

    test('should auto-close quotes', async ({ page }) => {
        const editor = page.locator('#editor');
        await editor.focus();
        
        await page.keyboard.type('"');
        
        const content = await editor.inputValue();
        expect(content).toBe('""');
    });
});

test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await gotoEditor(page);
        
        // Editor should be visible
        await expect(page.locator('#editor')).toBeVisible();
        
        // Preview should be visible (stacked vertically on mobile)
        await expect(page.locator('#preview')).toBeVisible();
    });
});
