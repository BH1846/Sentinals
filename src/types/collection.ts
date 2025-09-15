export interface CollectionRecord {
  id: string;
  collectorId: string;
  herbType: string;
  quantity: number;
  photos: string[]; // Base64 encoded images
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timestamp: string;
  synced: number; // 0 = unsynced, 1 = synced
  syncedAt?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  pendingCount: number;
  error?: string;
}