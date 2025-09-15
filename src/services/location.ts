export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export class LocationService {
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  async requestPermission(): Promise<boolean> {
    if (!navigator.geolocation) return false;
    
    try {
      await this.getCurrentLocation();
      return true;
    } catch {
      return false;
    }
  }
}

export const locationService = new LocationService();