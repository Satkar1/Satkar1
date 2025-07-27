import { useState, useEffect } from 'react';
import { getLocationFromAddress, getCurrentLocation } from '@/lib/geolocation';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getCurrentLocation();
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const setLocationFromAddress = async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getLocationFromAddress(address);
      setLocation({
        ...coords,
        address,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to geocode address');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Try to get location on mount
    requestLocation();
  }, []);

  return {
    location,
    error,
    loading,
    requestLocation,
    setLocationFromAddress,
    setLocation,
  };
}
