import React, { useState } from 'react';
import { Plus, MapPin, Clock, Camera, User, ArrowLeft, Check } from 'lucide-react';
import { CollectionRecord } from '../types/collection';
import { locationService } from '../services/location';
import { dbService } from '../services/database';

interface CollectionFormProps {
  onRecordAdded: () => void;
}

const HERB_TYPES = [
  'Basil',
  'Chamomile', 
  'Lavender',
  'Mint',
  'Oregano',
  'Rosemary',
  'Sage',
  'Thyme',
  'Other'
];

export const CollectionForm: React.FC<CollectionFormProps> = ({ onRecordAdded }) => {
  const [collectorId, setCollectorId] = useState(() => 
    localStorage.getItem('collectorId') || ''
  );
  const [herbType, setHerbType] = useState('');
  const [customHerb, setCustomHerb] = useState('');
  const [quantity, setQuantity] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<CollectionRecord | null>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setPhotos(prev => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Get current location
      const location = await locationService.getCurrentLocation();
      
      // Save collector ID to localStorage for future use
      localStorage.setItem('collectorId', collectorId);
      
      // Create record
      const record: CollectionRecord = {
        id: crypto.randomUUID(),
        collectorId,
        herbType: herbType === 'Other' ? customHerb : herbType,
        quantity: parseFloat(quantity),
        photos,
        location,
        timestamp: new Date().toISOString(),
        synced: 0
      };

      setPendingRecord(record);
      setShowConfirmation(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to prepare record');
    }
  };

  const handleConfirmSubmit = async () => {
    if (!pendingRecord) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Save to local database
      await dbService.saveRecord(pendingRecord);

      // Reset form
      setCollectorId(localStorage.getItem('collectorId') || '');
      setHerbType('');
      setCustomHerb('');
      setQuantity('');
      setPhotos([]);
      setShowConfirmation(false);
      setPendingRecord(null);
      
      // Notify parent
      onRecordAdded();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setShowConfirmation(false);
    setPendingRecord(null);
  };

  const isFormValid = collectorId && herbType && quantity && (!herbType.includes('Other') || customHerb);

  if (showConfirmation && pendingRecord) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleBackToForm}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Confirm Collection</h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Collector</h3>
            <p className="text-lg">{pendingRecord.collectorId}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Herb Type</h3>
            <p className="text-lg">{pendingRecord.herbType}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Quantity</h3>
            <p className="text-lg font-bold text-green-600">{pendingRecord.quantity} kg</p>
          </div>

          {pendingRecord.photos.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Photos ({pendingRecord.photos.length})</h3>
              <div className="grid grid-cols-2 gap-2">
                {pendingRecord.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Collection photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Location & Time</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>
                  {pendingRecord.location.latitude.toFixed(4)}, {pendingRecord.location.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{new Date(pendingRecord.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBackToForm}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-lg transition-colors"
          >
            Back to Edit
          </button>
          <button
            onClick={handleConfirmSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : (
              <>
                <Check className="w-6 h-6" />
                Confirm & Save
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 text-center">New Collection</h2>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      )}

      {/* Collector ID */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          <User className="w-5 h-5 inline mr-2" />
          Collector ID
        </label>
        <input
          type="text"
          value={collectorId}
          onChange={(e) => setCollectorId(e.target.value)}
          placeholder="Enter your collector ID..."
          className="w-full text-lg p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
          required
        />
      </div>

      {/* Herb Type Selection */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          Herb Type
        </label>
        <select
          value={herbType}
          onChange={(e) => setHerbType(e.target.value)}
          className="w-full text-lg p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
          required
        >
          <option value="">Select herb type...</option>
          {HERB_TYPES.map(herb => (
            <option key={herb} value={herb}>{herb}</option>
          ))}
        </select>
      </div>

      {/* Custom Herb Input */}
      {herbType === 'Other' && (
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Specify Herb
          </label>
          <input
            type="text"
            value={customHerb}
            onChange={(e) => setCustomHerb(e.target.value)}
            placeholder="Enter herb name..."
            className="w-full text-lg p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all"
            required
          />
        </div>
      )}

      {/* Quantity Input */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          Batch Quantity (kg)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0.0"
          className="w-full text-xl p-4 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all text-center"
          required
        />
      </div>

      {/* Photo Capture */}
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-3">
          <Camera className="w-5 h-5 inline mr-2" />
          Photos (Optional)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
          id="photo-input"
        />
        <label
          htmlFor="photo-input"
          className="w-full bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Camera className="w-6 h-6 text-gray-600" />
          <span className="text-gray-600">Take Photos</span>
        </label>
        
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-captured data info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">GPS location will be captured automatically</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Timestamp will be recorded automatically</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xl font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-6 h-6" />
        Review Collection
      </button>
    </form>
  );
};