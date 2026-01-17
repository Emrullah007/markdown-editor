/**
 * Jest Test Setup
 * Configures the test environment with mocks and polyfills
 */

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: jest.fn(index => {
            return Object.keys(store)[index] || null;
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock IndexedDB
const indexedDBMock = {
    open: jest.fn(() => ({
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: {
            objectStoreNames: {
                contains: jest.fn(() => false)
            },
            createObjectStore: jest.fn(() => ({
                createIndex: jest.fn()
            })),
            transaction: jest.fn(() => ({
                objectStore: jest.fn(() => ({
                    add: jest.fn(() => ({ onsuccess: null, onerror: null })),
                    get: jest.fn(() => ({ onsuccess: null, onerror: null })),
                    getAll: jest.fn(() => ({ onsuccess: null, onerror: null })),
                    delete: jest.fn(() => ({ onsuccess: null, onerror: null }))
                }))
            }))
        }
    }))
};

Object.defineProperty(window, 'indexedDB', {
    value: indexedDBMock
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: jest.fn(() => Promise.resolve()),
        readText: jest.fn(() => Promise.resolve(''))
    }
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    }))
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
class MockFileReader {
    constructor() {
        this.result = null;
        this.onload = null;
        this.onerror = null;
    }

    readAsDataURL(file) {
        setTimeout(() => {
            this.result = 'data:image/png;base64,mockbase64data';
            if (this.onload) this.onload();
        }, 0);
    }

    readAsText(file) {
        setTimeout(() => {
            this.result = '# Mock content';
            if (this.onload) this.onload();
        }, 0);
    }
}

global.FileReader = MockFileReader;

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
});
