import React from 'react';
import { Wifi, WifiOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { SyncStatus } from '../types/collection';

interface StatusIndicatorProps {
  status: SyncStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="w-5 h-5 text-red-500" />;
    }
    
    if (status.isSyncing) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    
    if (status.error) {
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    }
    
    if (status.pendingCount === 0) {
      return <Check className="w-5 h-5 text-green-500" />;
    }
    
    return <Wifi className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (!status.isOnline) {
      return `Offline • ${status.pendingCount} pending`;
    }
    
    if (status.isSyncing) {
      return 'Syncing...';
    }
    
    if (status.error) {
      return 'Sync error';
    }
    
    if (status.pendingCount === 0) {
      return 'All synced';
    }
    
    return `${status.pendingCount} pending sync`;
  };

  const getStatusColor = () => {
    if (!status.isOnline || status.error) return 'bg-red-50 border-red-200';
    if (status.isSyncing) return 'bg-blue-50 border-blue-200';
    if (status.pendingCount === 0) return 'bg-green-50 border-green-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${getStatusColor()}`}>
      {getStatusIcon()}
      <div>
        <p className="text-sm font-medium text-gray-800">{getStatusText()}</p>
        {status.lastSyncAt && (
          <p className="text-xs text-gray-500">
            Last: {new Date(status.lastSyncAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
};