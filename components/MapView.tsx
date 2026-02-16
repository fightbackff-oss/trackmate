import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User, UserStatus } from '../types';

// Custom Marker HTML generation
const createCustomMarkerHtml = (user: User, isCurrentUser: boolean) => {
  const isOnline = user.status === UserStatus.ONLINE;
  const batteryColor = user.batteryLevel > 20 ? '#22c55e' : '#ef4444'; 
  const timeString = isCurrentUser ? 'You' : user.status === UserStatus.MOVING ? 'Moving' : '2m ago';
  
  return `
    <div class="relative w-12 h-12">
      <div class="w-12 h-12 rounded-full border-[3px] ${isCurrentUser ? 'border-blue-500' : 'border-white'} shadow-md overflow-hidden bg-gray-200 box-border">
        <img src="${user.avatar}" class="w-full h-full object-cover" />
      </div>
      <div class="absolute -top-1 -right-2 bg-black/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center border border-white/20">
         <span class="w-1 h-2 mr-0.5 rounded-[1px] bg-[${batteryColor}]"></span>
         ${user.batteryLevel}%
      </div>
      <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[${isOnline ? '#22c55e' : '#94a3b8'}] border-2 border-white rounded-full"></div>
      <div class="absolute -bottom-7 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <div class="bg-black/80 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-lg border border-white/10 shadow-sm flex flex-col items-center leading-tight">
           <span class="font-bold">${user.name.split(' ')[0]}</span>
           <span class="text-[8px] text-gray-300">${timeString}</span>
        </div>
      </div>
    </div>
  `;
};

const createIcon = (user: User, isCurrentUser: boolean) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: createCustomMarkerHtml(user, isCurrentUser),
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Component to handle map center updates without full re-render
const MapController = ({ 
  userLocation, 
  onMapReady 
}: { 
  userLocation: { lat: number; lng: number } | null;
  onMapReady?: (map: L.Map) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);

  // Initial center only, subsequent moves are handled by app logic flying to location
  useEffect(() => {
      if(userLocation && !map.getCenter()) {
          map.setView([userLocation.lat, userLocation.lng], 13);
      }
  }, []); // Run once on mount if location available

  return null;
};

interface MapViewProps {
  currentUser: User;
  friends: User[];
  userLocation: { lat: number; lng: number } | null;
  onMapReady?: (map: L.Map) => void;
  mapType: 'street' | 'satellite';
  filteredFriendIds?: string[];
}

const MapView: React.FC<MapViewProps> = ({ 
  currentUser, 
  friends, 
  userLocation, 
  onMapReady, 
  mapType,
  filteredFriendIds 
}) => {
  const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco
  const center = userLocation || defaultCenter;

  const tileUrl = mapType === 'street' 
    ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  return (
    <div className="w-full h-full relative bg-[#0B1120]">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full outline-none"
        zoomControl={false}
        attributionControl={false}
      >
        <MapController userLocation={userLocation} onMapReady={onMapReady} />
        
        <TileLayer url={tileUrl} />

        {/* Current User Marker */}
        {userLocation && currentUser.isSharing && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createIcon(currentUser, true)}
            zIndexOffset={1000}
          />
        )}

        {/* Friend Markers */}
        {friends.map((friend) => {
          if (!friend.location || !friend.isSharing) return null;
          // Filter if search is active
          if (filteredFriendIds && filteredFriendIds.length > 0 && !filteredFriendIds.includes(friend.id)) return null;

          return (
            <Marker
              key={friend.id}
              position={[friend.location.lat, friend.location.lng]}
              icon={createIcon(friend, false)}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;