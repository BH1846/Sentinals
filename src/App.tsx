import React, { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { CollectionForm } from './components/CollectionForm';
import { CollectionHistory } from './components/CollectionHistory';
import { StatusIndicator } from './components/StatusIndicator';
import { CollectionRecord, SyncStatus } from './types/collection';
import { dbService } from './services/database';
import { syncService } from './services/sync';
import { locationService } from './services/location';

function App() {
  const [records, setRecords] = useState<CollectionRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Register service worker for PWA
      try {
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
        }
      } catch (swError) {
        console.warn('Service worker registration failed:', swError);
        // Continue initialization even if service worker fails
      }

      // Initialize database
      await dbService.init();

      // Request location permission
      const hasLocationPermission = await locationService.requestPermission();
      setLocationPermission(hasLocationPermission);

      // Initialize sync service
      syncService.init();
      const unsubscribe = syncService.subscribe(setSyncStatus);

      // Load existing records
      await loadRecords();

      setIsInitialized(true);

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const loadRecords = async () => {
    try {
      const allRecords = await dbService.getAllRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing app...</p>
        </div>
      </div>
    );
  }

  if (!locationPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <Leaf className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Location Access Required</h2>
          <p className="text-gray-600 mb-6">
            This app needs access to your location to automatically record where herbs are collected.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Grant Permission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-10 h-10 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Herbal Collector</h1>
          </div>
          <p className="text-gray-600">Track your herb collections offline and sync automatically</p>
        </div>

        {/* Sync Status */}
        <div className="mb-8">
          <StatusIndicator status={syncStatus} />
        </div>

        {/* Collection Form */}
        <div className="mb-8">
          <CollectionForm onRecordAdded={loadRecords} />
        </div>

        {/* Collection History */}
        <CollectionHistory records={records} />
      </div>
    </div>
  );
}

export default App;