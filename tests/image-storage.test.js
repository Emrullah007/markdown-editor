/**
 * Image Storage Tests
 * Unit tests for IndexedDB image storage functionality
 */

describe('ImageStorage', () => {
    let imageStorage;

    // Mock ImageStorage class for testing
    beforeEach(() => {
        imageStorage = {
            dbName: 'MarkdownEditorDB',
            storeName: 'images',
            dbVersion: 1,
            db: null,
            images: new Map(), // Mock in-memory storage

            generateImageId() {
                return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            },

            async storeImage(imageData, metadata = {}) {
                const id = this.generateImageId();
                const timestamp = Date.now();
                const record = { id, data: imageData, timestamp, ...metadata };
                this.images.set(id, record);
                return id;
            },

            async getImage(id) {
                return this.images.get(id);
            },

            async getAllImages() {
                return Array.from(this.images.values());
            },

            async deleteImage(id) {
                this.images.delete(id);
            },

            extractImageIdsFromMarkdown(markdown) {
                const imageIds = new Set();
                const regex = /!\[([^\]]*)\]\((image|indexed):\/\/([a-zA-Z0-9-]+)\)/g;
                let match;
                while ((match = regex.exec(markdown)) !== null) {
                    imageIds.add(match[3]);
                }
                return imageIds;
            },

            async cleanupUnusedImages(markdown) {
                const allImages = await this.getAllImages();
                const usedImageIds = this.extractImageIdsFromMarkdown(markdown);
                const deleted = [];

                for (const image of allImages) {
                    if (!usedImageIds.has(image.id)) {
                        await this.deleteImage(image.id);
                        deleted.push(image.id);
                    }
                }
                return deleted;
            },

            async getStorageStats() {
                const allImages = await this.getAllImages();
                let totalSize = 0;

                for (const image of allImages) {
                    totalSize += image.data.length;
                }

                return {
                    imageCount: allImages.length,
                    totalSize,
                    totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
                };
            }
        };
    });

    describe('generateImageId', () => {
        it('should generate unique IDs', () => {
            const id1 = imageStorage.generateImageId();
            const id2 = imageStorage.generateImageId();
            expect(id1).not.toBe(id2);
        });

        it('should start with img- prefix', () => {
            const id = imageStorage.generateImageId();
            expect(id.startsWith('img-')).toBe(true);
        });
    });

    describe('storeImage', () => {
        it('should store image and return ID', async () => {
            const imageData = 'data:image/png;base64,abc123';
            const id = await imageStorage.storeImage(imageData);

            expect(id).toBeTruthy();
            expect(id.startsWith('img-')).toBe(true);
        });

        it('should store image with metadata', async () => {
            const imageData = 'data:image/png;base64,abc123';
            const metadata = { alt: 'Test image', fileName: 'test.png' };
            const id = await imageStorage.storeImage(imageData, metadata);

            const stored = await imageStorage.getImage(id);
            expect(stored.alt).toBe('Test image');
            expect(stored.fileName).toBe('test.png');
        });

        it('should store timestamp', async () => {
            const before = Date.now();
            const id = await imageStorage.storeImage('data:image/png;base64,abc');
            const after = Date.now();

            const stored = await imageStorage.getImage(id);
            expect(stored.timestamp).toBeGreaterThanOrEqual(before);
            expect(stored.timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe('getImage', () => {
        it('should retrieve stored image', async () => {
            const imageData = 'data:image/png;base64,abc123';
            const id = await imageStorage.storeImage(imageData);

            const retrieved = await imageStorage.getImage(id);
            expect(retrieved.data).toBe(imageData);
        });

        it('should return undefined for non-existent ID', async () => {
            const retrieved = await imageStorage.getImage('non-existent-id');
            expect(retrieved).toBeUndefined();
        });
    });

    describe('getAllImages', () => {
        it('should return empty array when no images', async () => {
            const images = await imageStorage.getAllImages();
            expect(images).toEqual([]);
        });

        it('should return all stored images', async () => {
            await imageStorage.storeImage('data:image/png;base64,img1');
            await imageStorage.storeImage('data:image/png;base64,img2');
            await imageStorage.storeImage('data:image/png;base64,img3');

            const images = await imageStorage.getAllImages();
            expect(images.length).toBe(3);
        });
    });

    describe('deleteImage', () => {
        it('should delete image by ID', async () => {
            const id = await imageStorage.storeImage('data:image/png;base64,abc');
            await imageStorage.deleteImage(id);

            const retrieved = await imageStorage.getImage(id);
            expect(retrieved).toBeUndefined();
        });

        it('should not throw for non-existent ID', async () => {
            await expect(imageStorage.deleteImage('non-existent')).resolves.not.toThrow();
        });
    });

    describe('extractImageIdsFromMarkdown', () => {
        it('should extract indexed:// format IDs', () => {
            const markdown = '![Alt](indexed://img-123-abc)';
            const ids = imageStorage.extractImageIdsFromMarkdown(markdown);

            expect(ids.has('img-123-abc')).toBe(true);
        });

        it('should extract image:// format IDs', () => {
            const markdown = '![Alt](image://img-456-def)';
            const ids = imageStorage.extractImageIdsFromMarkdown(markdown);

            expect(ids.has('img-456-def')).toBe(true);
        });

        it('should extract multiple IDs', () => {
            const markdown = `
                ![Image 1](indexed://img-1)
                ![Image 2](indexed://img-2)
                ![Image 3](image://img-3)
            `;
            const ids = imageStorage.extractImageIdsFromMarkdown(markdown);

            expect(ids.size).toBe(3);
        });

        it('should return empty set for no images', () => {
            const markdown = '# Heading\n\nSome text without images.';
            const ids = imageStorage.extractImageIdsFromMarkdown(markdown);

            expect(ids.size).toBe(0);
        });

        it('should not extract regular URL images', () => {
            const markdown = '![Alt](https://example.com/image.png)';
            const ids = imageStorage.extractImageIdsFromMarkdown(markdown);

            expect(ids.size).toBe(0);
        });
    });

    describe('cleanupUnusedImages', () => {
        it('should delete images not in markdown', async () => {
            const id1 = await imageStorage.storeImage('data:image/png;base64,used');
            const id2 = await imageStorage.storeImage('data:image/png;base64,unused');

            const markdown = `![Used](indexed://${id1})`;
            const deleted = await imageStorage.cleanupUnusedImages(markdown);

            expect(deleted).toContain(id2);
            expect(deleted).not.toContain(id1);
        });

        it('should keep all images when all are used', async () => {
            const id1 = await imageStorage.storeImage('data:image/png;base64,img1');
            const id2 = await imageStorage.storeImage('data:image/png;base64,img2');

            const markdown = `![1](indexed://${id1})\n![2](indexed://${id2})`;
            const deleted = await imageStorage.cleanupUnusedImages(markdown);

            expect(deleted.length).toBe(0);
        });
    });

    describe('getStorageStats', () => {
        it('should return correct stats for empty storage', async () => {
            const stats = await imageStorage.getStorageStats();

            expect(stats.imageCount).toBe(0);
            expect(stats.totalSize).toBe(0);
            expect(stats.totalSizeMB).toBe('0.00');
        });

        it('should calculate correct size', async () => {
            const data1 = 'a'.repeat(1000); // 1000 bytes
            const data2 = 'b'.repeat(2000); // 2000 bytes

            await imageStorage.storeImage(data1);
            await imageStorage.storeImage(data2);

            const stats = await imageStorage.getStorageStats();

            expect(stats.imageCount).toBe(2);
            expect(stats.totalSize).toBe(3000);
        });
    });
});
