
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import { IoNavigate } from 'react-icons/io5';
import { FaChurch } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server';
import { Church } from '../App';
import { useI18n } from '../lib/i18n';

// --- TYPE DEFINITIONS ---
// Church type is imported from App.tsx

// --- CHILD COMPONENTS ---

/**
 * Manages the user's real-time location marker and keeps the parent component
 * updated with the latest position via a callback.
 */
const UserLocationManager: React.FC<{ onPositionChange: (pos: L.LatLng) => void }> = ({ onPositionChange }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Initial position fetch
    navigator.geolocation.getCurrentPosition(
      location => {
        const latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
        if (!position) { // Only fly to initial position once
          map.flyTo(latlng, 15);
        }
        setPosition(latlng);
        onPositionChange(latlng);
      },
      () => console.error("Could not get initial user location."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    
    // Continuous position watch
    const successCallback = (location: GeolocationPosition) => {
      const latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
      setPosition(latlng);
      onPositionChange(latlng);
    };
    const errorCallback = (err: GeolocationPositionError) => console.error("Error watching user location:", err.message);
    const options: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
    
    watchIdRef.current = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [map, onPositionChange]);

  const handleRecenter = () => {
    if (position) map.flyTo(position, 16);
  };

  const userIcon = new L.DivIcon({
    html: `<div class="relative w-10 h-10 flex justify-center items-center"><div class="absolute w-4 h-4 rounded-full bg-cyan-400 animate-pulse-shrink"></div><div class="relative w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-md"></div></div>`,
    className: 'custom-div-icon', iconSize: [40, 40], iconAnchor: [20, 20],
  });

  return (
    <>
      {position && <Marker position={position} icon={userIcon} />}
      <div className="absolute bottom-4 left-4 z-[1000] md:bottom-auto md:top-24 md:left-6">
        <button onClick={handleRecenter} className="bg-white p-3 rounded-full shadow-lg" aria-label="Recenter map">
          <IoNavigate className="h-6 w-6 text-teal-500" />
        </button>
      </div>
    </>
  );
};

const MapEffects: React.FC<{ churches: Church[], userPosition: L.LatLng | null, selectedChurch: Church | null, isInitialLoad: boolean }> = ({ churches, userPosition, selectedChurch, isInitialLoad }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedChurch) {
            map.flyTo([selectedChurch.lat, selectedChurch.lng], 16, { animate: true, duration: 0.5 });
        }
    }, [selectedChurch, map]);

    useEffect(() => {
        if (isInitialLoad || churches.length === 0) return;

        const bounds = L.latLngBounds(churches.map(c => [c.lat, c.lng]));
        if (userPosition) {
            bounds.extend(userPosition);
        }
        if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true, duration: 0.5 });
        }
    }, [churches, map, userPosition, isInitialLoad]);

    useMapEvents({
        dragstart: () => {
             // Optional: close detail panel on map drag if desired
        },
    });

    return null;
}

const ChurchMarkers: React.FC<{ churches: Church[], selectedChurch: Church | null, onSelectChurch: (church: Church) => void }> = ({ churches, selectedChurch, onSelectChurch }) => {
  const map = useMap();

  const churchIcon = useMemo(() => new L.DivIcon({
    html: ReactDOMServer.renderToString(
      <div className="bg-[#8d1c1c] p-2 rounded-full shadow-md flex items-center justify-center">
        <FaChurch className="text-white w-4 h-4" />
      </div>
    ),
    className: 'custom-div-icon', iconSize: [32, 32], iconAnchor: [16, 16],
  }), []);

  const selectedChurchIcon = useMemo(() => new L.DivIcon({
    html: ReactDOMServer.renderToString(
      <div className="bg-teal-500 p-2 rounded-full shadow-lg flex items-center justify-center ring-2 ring-white">
        <FaChurch className="text-white w-5 h-5" />
      </div>
    ),
    className: 'custom-div-icon', iconSize: [36, 36], iconAnchor: [18, 18],
  }), []);

  useEffect(() => {
    if (typeof (L as any).markerClusterGroup !== 'function') {
      console.error("Leaflet.markercluster module failed to load.");
      return;
    }

    const markerCluster = (L as any).markerClusterGroup({
      iconCreateFunction: () => churchIcon,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
    });

    const churchLayers: { [key: string]: L.Marker } = {};

    churches.forEach(church => {
        const isSelected = selectedChurch?.id === church.id;
        const marker = L.marker([church.lat, church.lng], { icon: isSelected ? selectedChurchIcon : churchIcon });
        marker.on('click', () => onSelectChurch(church));
        churchLayers[church.id] = marker;
        if (!isSelected) { // Don't add selected marker to cluster, show it on top
          markerCluster.addLayer(marker);
        }
    });

    map.addLayer(markerCluster);
    
    // Add selected marker separately to ensure it's on top
    if (selectedChurch && churchLayers[selectedChurch.id]) {
      const selectedMarker = churchLayers[selectedChurch.id];
      selectedMarker.addTo(map);
    }

    return () => {
        if (map.hasLayer(markerCluster)) map.removeLayer(markerCluster);
        Object.values(churchLayers).forEach(layer => {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });
    };
  }, [churches, map, churchIcon, selectedChurch, selectedChurchIcon, onSelectChurch]);

  return null;
};


// --- MAIN MAP COMPONENT ---

interface MapProps {
  churches: Church[];
  selectedChurch: Church | null;
  onSelectChurch: (church: Church | null) => void;
  userPosition: L.LatLng | null;
  onPositionChange: (pos: L.LatLng) => void;
  isInitialLoad: boolean;
}

const MapComponent: React.FC<MapProps> = (props) => {
  const { churches, selectedChurch, onSelectChurch, userPosition, onPositionChange, isInitialLoad } = props;
  const { t } = useI18n();
  const defaultPosition: [number, number] = [10.8370, 106.6654];

  return (
    <div className="relative h-full w-full">
      <div className="h-full w-full filter grayscale-[80%] sepia-[20%] hue-rotate-[320deg] brightness-95 contrast-100">
        <MapContainer center={defaultPosition} zoom={13} scrollWheelZoom={true} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          <UserLocationManager onPositionChange={onPositionChange} />
          <ChurchMarkers churches={churches} selectedChurch={selectedChurch} onSelectChurch={onSelectChurch} />
          <MapEffects churches={churches} userPosition={userPosition} selectedChurch={selectedChurch} isInitialLoad={isInitialLoad} />
        </MapContainer>
      </div>
      {churches.length > 0 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] text-black text-xs font-semibold" style={{ textShadow: '0 0 3px white, 0 0 3px white' }}>
          {t('map.updatedChurches', { count: churches.length })}
        </div>
      )}
    </div>
  );
};

export default MapComponent;