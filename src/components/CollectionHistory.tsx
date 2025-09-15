import React from 'react';
import { MapPin, Clock, Leaf } from 'lucide-react';
import { CollectionRecord } from '../types/collection';

interface CollectionHistoryProps {
  records: CollectionRecord[];
}

export const CollectionHistory: React.FC<CollectionHistoryProps> = ({ records }) => {
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No collections recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Collection History</h2>
      
      <div className="space-y-4">
        {sortedRecords.map(record => (
          <div
            key={record.id}
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Collector: {record.collectorId}</p>
                <h3 className="text-lg font-semibold text-gray-800">{record.herbType}</h3>
                <p className="text-xl font-bold text-green-600">{record.quantity} kg</p>
              </div>
              
              <div className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-full ${record.synced === 1 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm text-gray-500">
                  {record.synced === 1 ? 'Synced' : 'Pending'}
                </span>
              </div>
            </div>
            
            {record.photos.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">{record.photos.length} photo(s)</p>
                <div className="flex gap-2 overflow-x-auto">
                  {record.photos.map((photo, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={photo}
                      alt={`Collection photo ${photoIndex + 1}`}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(record.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>
                  {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                  {record.location.accuracy && (
                    <span className="text-gray-400"> (±{Math.round(record.location.accuracy)}m)</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};