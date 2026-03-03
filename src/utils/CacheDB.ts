export interface CacheItem {
  chapterId: string;
  bookId: string;
  content: string;
}

export class CacheDB {
  private dbName = "BookDownloaderDB";
  private storeName = "chapters";
  private version = 2;

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (db.objectStoreNames.contains(this.storeName)) {
          if (event.oldVersion < 2) {
            db.deleteObjectStore(this.storeName);
          }
        }
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "chapterId",
          });
          store.createIndex("bookId", "bookId", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async getAll(bookId: string): Promise<Map<string, CacheItem>> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.index("bookId").getAll(bookId);

        request.onsuccess = () => {
          const items = request.result || [];
          resolve(new Map(items.map((item) => [item.chapterId, item])));
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.error("CacheDB getAll error:", e);
      return new Map();
    }
  }

  async get(chapterId: string): Promise<CacheItem | undefined> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readonly");
        const store = transaction.objectStore(this.storeName);
        const request = store.get(chapterId);

        request.onsuccess = () => {
          resolve(request.result || undefined);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.error("CacheDB get error:", e);
      return undefined;
    }
  }

  async set(chapterId: string, bookId: string, content: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ chapterId, bookId, content });

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.error("CacheDB set error:", e);
    }
  }
}

export const cacheDB = new CacheDB();
