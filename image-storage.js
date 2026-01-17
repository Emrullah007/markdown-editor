// Image Storage Module
// Handles image persistence using IndexedDB

class ImageStorage {
    constructor() {
        this.dbName = 'MarkdownEditorDB';
        this.storeName = 'images';
        this.dbVersion = 1;
        this.db = null;
    }

    // Initialize IndexedDB
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    // Create index for timestamp to help with cleanup
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Store an image and return its ID
    async storeImage(imageData, metadata = {}) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const id = this.generateImageId();
            const timestamp = Date.now();

            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);

            const imageRecord = {
                id,
                data: imageData, // base64 data URL
                timestamp,
                ...metadata
            };

            const request = objectStore.add(imageRecord);

            request.onsuccess = () => {
                resolve(id);
            };

            request.onerror = () => {
                console.error('Error storing image:', request.error);
                reject(request.error);
            };
        });
    }

    // Retrieve an image by ID
    async getImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error retrieving image:', request.error);
                reject(request.error);
            };
        });
    }

    // Get all images
    async getAllImages() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                console.error('Error retrieving all images:', request.error);
                reject(request.error);
            };
        });
    }

    // Delete an image by ID
    async deleteImage(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                console.error('Error deleting image:', request.error);
                reject(request.error);
            };
        });
    }

    // Clean up unused images (images not referenced in markdown)
    async cleanupUnusedImages(markdown) {
        try {
            const allImages = await this.getAllImages();
            const usedImageIds = this.extractImageIdsFromMarkdown(markdown);

            for (const image of allImages) {
                if (!usedImageIds.has(image.id)) {
                    await this.deleteImage(image.id);
                    console.log('Cleaned up unused image:', image.id);
                }
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Extract image IDs from markdown content
    extractImageIdsFromMarkdown(markdown) {
        const imageIds = new Set();
        // Match both formats: ![alt](image://id) and ![alt](indexed://id)
        const regex = /!\[([^\]]*)\]\((image|indexed):\/\/([a-zA-Z0-9-]+)\)/g;
        let match;

        while ((match = regex.exec(markdown)) !== null) {
            imageIds.add(match[3]); // The ID is in capture group 3
        }

        return imageIds;
    }

    // Generate a unique image ID
    generateImageId() {
        return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    // Convert base64 images in markdown to IndexedDB references
    async convertBase64ImagesToIndexedDB(markdown) {
        // Match base64 data URLs in markdown images
        const base64Regex = /!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+)\)/g;
        let match;
        let updatedMarkdown = markdown;
        const conversions = [];

        // Collect all base64 images first
        while ((match = base64Regex.exec(markdown)) !== null) {
            const alt = match[1];
            const base64Data = match[2];
            conversions.push({ alt, base64Data, fullMatch: match[0] });
        }

        // Convert each base64 image to IndexedDB
        for (const conv of conversions) {
            try {
                const imageId = await this.storeImage(conv.base64Data, { alt: conv.alt });
                const newImageRef = `![${conv.alt}](indexed://${imageId})`;
                updatedMarkdown = updatedMarkdown.replace(conv.fullMatch, newImageRef);
            } catch (error) {
                console.error('Error converting base64 image to IndexedDB:', error);
                // Keep the original base64 image if conversion fails
            }
        }

        return updatedMarkdown;
    }

    // Get storage usage statistics
    async getStorageStats() {
        try {
            const allImages = await this.getAllImages();
            let totalSize = 0;

            for (const image of allImages) {
                // Approximate size calculation (base64 data length)
                totalSize += image.data.length;
            }

            return {
                imageCount: allImages.length,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            };
        } catch (error) {
            console.error('Error calculating storage stats:', error);
            return { imageCount: 0, totalSize: 0, totalSizeMB: '0.00' };
        }
    }
}

// Create global instance
const imageStorage = new ImageStorage();
