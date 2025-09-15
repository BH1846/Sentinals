import { CollectionRecord, SyncStatus } from '../types/collection';
import { dbService } from './database';

class SyncService {
  private apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  init(): void {
    // Check online status
    window.addEventListener('online', () => this.syncWhenOnline());
    window.addEventListener('offline', () => this.notifyListeners());
    
    // Start periodic sync when online
    if (navigator.onLine) {
      this.startPeriodicSync();
    }
  }

  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately notify with current status
    this.notifyListeners();
    
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private async notifyListeners(): Promise<void> {
    const unsyncedRecords = await dbService.getUnsyncedRecords();
    const status: SyncStatus = {
      isOnline: navigator.onLine,
      isSyncing: false,
      pendingCount: unsyncedRecords.length,
      lastSyncAt: localStorage.getItem('lastSyncAt') || undefined
    };

    this.listeners.forEach(callback => callback(status));
  }

  private syncWhenOnline(): void {
    setTimeout(() => {
      this.syncPendingRecords();
      this.startPeriodicSync();
    }, 1000);
  }

  private startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingRecords();
      }
    }, 30000);
  }

  async syncPendingRecords(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      // Notify listeners that sync is starting
      const unsyncedRecords = await dbService.getUnsyncedRecords();
      this.listeners.forEach(callback => callback({
        isOnline: true,
        isSyncing: true,
        pendingCount: unsyncedRecords.length
      }));

      for (const record of unsyncedRecords) {
        await this.syncRecord(record);
      }

      // Update last sync time
      const now = new Date().toISOString();
      localStorage.setItem('lastSyncAt', now);

      // Notify completion
      this.notifyListeners();

    } catch (error) {
      console.error('Sync failed:', error);
      
      const unsyncedRecords = await dbService.getUnsyncedRecords();
      this.listeners.forEach(callback => callback({
        isOnline: navigator.onLine,
        isSyncing: false,
        pendingCount: unsyncedRecords.length,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    }
  }

  private async syncRecord(record: CollectionRecord): Promise<void> {
    const response = await fetch(`${this.apiUrl}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    await dbService.markAsSynced(record.id);
  }
}

export const syncService = new SyncService();