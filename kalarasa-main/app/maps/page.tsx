'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression, Icon, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Museum {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  distance?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

export default function MapsPage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userIcon, setUserIcon] = useState<Icon | null>(null);
  const [museumIcon, setMuseumIcon] = useState<Icon | null>(null);
  const [nearestMuseumIcon, setNearestMuseumIcon] = useState<Icon | null>(null);
  const [selectedMuseumIcon, setSelectedMuseumIcon] = useState<Icon | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Initialize icons after component mounts
  useEffect(() => {
    const initIcons = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix for default markers
      const defaultIconProto = L.Icon.Default.prototype as { _getIconUrl?: string };
      if ('_getIconUrl' in defaultIconProto) {
        delete defaultIconProto._getIconUrl;
      }
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // User location icon (blue)
      const userLocationIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Museum icon (green)
      const museumMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Nearest museum icon (red)
      const nearestMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Selected museum icon (orange)
      const selectedMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [30, 49],
        iconAnchor: [15, 49],
        popupAnchor: [1, -42],
        shadowSize: [49, 49]
      });

      setUserIcon(userLocationIcon);
      setMuseumIcon(museumMarkerIcon);
      setNearestMuseumIcon(nearestMarkerIcon);
      setSelectedMuseumIcon(selectedMarkerIcon);
    };

    initIcons();
  }, []);

  // Get user's geolocation on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
          // Default to a location if geolocation fails
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York City
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setUserLocation({ lat: 40.7128, lng: -74.0060 }); // Default location
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find nearest museums using Nominatim API
  const findNearestMuseums = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);
    setMuseums([]);
    setSelectedMuseum(null);

    try {
      // Create a bounding box around user location (approximately 10km radius)
      const radius = 0.09; // roughly 10km in degrees
      const bbox = `${userLocation.lng - radius},${userLocation.lat - radius},${userLocation.lng + radius},${userLocation.lat + radius}`;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=museum+art&bounded=1&viewbox=${bbox}&limit=20&addressdetails=1&extratags=1`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch museums');
      }

      const data = await response.json();
      
      // Filter for art museums and museums with art-related tags
      const artMuseums = data.filter((place: {
        display_name?: string;
        type?: string;
        extratags?: Record<string, string>;
        lat: string;
        lon: string;
        place_id: string;
      }) => {
        const name = place.display_name?.toLowerCase() || '';
        const type = place.type?.toLowerCase() || '';
        const tags = place.extratags || {};
        
        return (
          type === 'museum' ||
          name.includes('art') ||
          name.includes('gallery') ||
          tags.tourism === 'museum' ||
          tags.museum === 'art' ||
          name.includes('fine arts') ||
          name.includes('contemporary')
        );
      });

      if (artMuseums.length === 0) {
        setError('No art museums found in your area.');
      } else {
        // Calculate distances and sort by distance
        const museumsWithDistance = artMuseums.map((museum: {
          display_name: string;
          lat: string;
          lon: string;
          place_id: string;
          distance?: number;
        }) => ({
          ...museum,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            parseFloat(museum.lat),
            parseFloat(museum.lon)
          )
        }));

        museumsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        setMuseums(museumsWithDistance);
      }
    } catch (err) {
      setError('Failed to fetch nearby museums. Please try again.');
      console.error('Error fetching museums:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get museum name from display_name
  const getMuseumName = (museum: Museum): string => {
    return museum.name || museum.display_name.split(',')[0];
  };

  // Get museum address from display_name
  const getMuseumAddress = (museum: Museum): string => {
    const parts = museum.display_name.split(',');
    return parts.slice(1).join(',').trim();
  };

  // Handle museum selection
  const selectMuseum = (museum: Museum) => {
    setSelectedMuseum(museum);
    // Center map on selected museum
    if (mapRef.current) {
      mapRef.current.setView([parseFloat(museum.lat), parseFloat(museum.lon)], 15);
    }
  };

  const nearestMuseum = museums.length > 0 ? museums[0] : null;

  if (!userLocation) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Getting your location...</h2>
          <p className="text-gray-600">Please allow location access for the best experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Floating Controls */}
        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
          <button
            onClick={findNearestMuseums}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Find Art Museums
              </>
            )}
          </button>

          {museums.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 max-w-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Found {museums.length} museums</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Your location</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Nearest museum</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Other museums</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="absolute top-6 right-6 z-[1000] bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-r-xl shadow-lg max-w-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <MapContainer
          center={[userLocation.lat, userLocation.lng] as LatLngExpression}
          zoom={13}
          className="h-full w-full rounded-l-2xl"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userIcon && (
            <Marker
              position={[userLocation.lat, userLocation.lng] as LatLngExpression}
              icon={userIcon}
            >
              <Popup>
                <div className="text-center font-medium">
                  📍 Your Location
                </div>
              </Popup>
            </Marker>
          )}

          {/* Museum Markers */}
          {museums.map((museum) => {
            const isNearest = nearestMuseum?.place_id === museum.place_id;
            const isSelected = selectedMuseum?.place_id === museum.place_id;
            let icon = museumIcon;
            
            if (isSelected && selectedMuseumIcon) {
              icon = selectedMuseumIcon;
            } else if (isNearest && nearestMuseumIcon) {
              icon = nearestMuseumIcon;
            }
            
            if (!icon) return null;

            return (
              <Marker
                key={museum.place_id}
                position={[parseFloat(museum.lat), parseFloat(museum.lon)] as LatLngExpression}
                icon={icon}
                eventHandlers={{
                  click: () => selectMuseum(museum),
                }}
              >
                <Popup>
                  <div className="min-w-[250px]">
                    <h3 className="font-semibold text-lg mb-2">
                      {getMuseumName(museum)}
                      {isNearest && (
                        <span className="ml-2 text-red-500 text-sm font-medium">(Nearest)</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {museum.distance?.toFixed(1)} km away
                    </p>
                    <a
                      href={`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${museum.lat},${museum.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Get Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-blue-300 text-black p-6">
          <h1 className="text-2xl font-bold mb-2">Kalarasa's Museum Finder</h1>
          <p className="text-grey-700">Discover art museums near you</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-6 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}

          {!loading && museums.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No museums found</h3>
              <p className="text-sm">Click "Find Art Museums" to discover nearby cultural venues</p>
            </div>
          )}

          {/* Selected Museum Details */}
          {selectedMuseum && (
            <div className="border-b border-gray-200 bg-orange-50 p-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                  ★
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {getMuseumName(selectedMuseum)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {getMuseumAddress(selectedMuseum)}
                  </p>
                  <p className="text-sm font-medium text-orange-600 mb-3">
                    🚗 {selectedMuseum.distance?.toFixed(1)} km away
                  </p>
                  <a
                    href={`https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedMuseum.lat},${selectedMuseum.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-g-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Navigate
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Museums List */}
          {museums.length > 0 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Nearby Art Museums ({museums.length})
              </h2>
              <div className="space-y-3">
                {museums.map((museum, index) => {
                  const isNearest = index === 0;
                  const isSelected = selectedMuseum?.place_id === museum.place_id;
                  
                  return (
                    <div
                      key={museum.place_id}
                      onClick={() => selectMuseum(museum)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected 
                          ? 'border-orange-300 bg-orange-50 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                          isSelected ? 'bg-orange-500' : isNearest ? 'bg-red-500' : 'bg-green-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 mb-1 truncate">
                            {getMuseumName(museum)}
                            {isNearest && (
                              <span className="ml-2 text-red-500 text-xs font-medium">(Nearest)</span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {getMuseumAddress(museum)}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-indigo-600">
                              🚗 {museum.distance?.toFixed(1)} km
                            </span>
                            {isSelected && (
                              <span className="text-xs text-orange-600 font-medium">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Click on any museum in the list or map to view details
          </p>
        </div>
      </div>
    </div>
  );
}