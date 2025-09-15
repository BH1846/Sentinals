import { CollectionRecord } from '../types/collection';

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbName = 'herbal-collector';
  private version = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Handle version upgrades
        const oldVersion = event.oldVersion;
        
        if (!db.objectStoreNames.contains('collections')) {
          const store = db.createObjectStore('collections', { keyPath: 'id' });
          store.createIndex('synced', 'synced', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        } else if (oldVersion < 1) {
          // Handle schema updates for existing stores if needed
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          const store = transaction?.objectStore('collections');
          if (store && !store.indexNames.contains('synced')) {
            store.createIndex('synced', 'synced', { unique: false });
          }
        }
      };
    });
  }

  async saveRecord(record: CollectionRecord): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['collections'], 'readwrite');
      const store = transaction.objectStore('collections');
      const request = store.put(record);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllRecords(): Promise<CollectionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['collections'], 'readonly');
      const store = transaction.objectStore('collections');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getUnsyncedRecords(): Promise<CollectionRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['collections'], 'readonly');
      const store = transaction.objectStore('collections');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(0));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async markAsSynced(recordId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const record = await this.getRecord(recordId);
    if (record) {
      record.synced = 1;
      record.syncedAt = new Date().toISOString();
      await this.saveRecord(record);
    }
  }

  private async getRecord(id: string): Promise<CollectionRecord | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['collections'], 'readonly');
      const store = transaction.objectStore('collections');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }
}

export const dbService = new IndexedDBService();