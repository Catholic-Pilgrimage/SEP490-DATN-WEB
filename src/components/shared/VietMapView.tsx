import { useCallback, useEffect, useRef } from 'react';
import { VIETMAP_CONFIG } from '@/config/vietmap.config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const vietmapgl: any;

export interface VietMapMarker {
    id: string;
    lat: number;
    lng: number;
    title: string;
    color?: string;
}

interface VietMapViewProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    markers?: VietMapMarker[];
    className?: string;
    interactive?: boolean;
    onMarkerClick?: (marker: VietMapMarker) => void;
}

export default function VietMapView({
    latitude,
    longitude,
    zoom = 14,
    markers = [],
    className = '',
    interactive = true,
    onMarkerClick,
}: VietMapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markersRef = useRef<any[]>([]);

    // Clear all markers from map
    const clearMarkers = useCallback(() => {
        markersRef.current.forEach((marker) => {
            try {
                marker.remove();
            } catch {
                // Marker may already be removed
            }
        });
        markersRef.current = [];
    }, []);

    // Add markers to map
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addMarkers = useCallback((map: any, markerList: VietMapMarker[]) => {
        markerList.forEach((m) => {
            // Create marker element
            const el = document.createElement('div');
            el.className = 'vietmap-marker';
            el.style.cssText = `
                width: 32px; height: 32px;
                background: ${m.color || '#c8a951'};
                border: 2px solid white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            el.innerHTML = '📍';

            // Create popup
            const popup = new vietmapgl.Popup({ offset: 25 })
                .setHTML(`<strong>${m.title}</strong>`);

            // Add marker to map
            const marker = new vietmapgl.Marker({ element: el })
                .setLngLat([m.lng, m.lat])
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);

            if (onMarkerClick) {
                el.addEventListener('click', () => onMarkerClick(m));
            }
        });

        // Auto-fit bounds if multiple markers
        if (markerList.length > 1) {
            const bounds = new vietmapgl.LngLatBounds();
            markerList.forEach((m) => bounds.extend([m.lng, m.lat]));
            map.fitBounds(bounds, { padding: 60 });
        }
    }, [onMarkerClick]);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || typeof vietmapgl === 'undefined') return;

        // Clear existing markers first
        clearMarkers();

        // Initialize map
        const map = new vietmapgl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                name: "empty",
                sources: {},
                layers: [
                    {
                        id: "background",
                        type: "background",
                        paint: { "background-color": "#fdf8f0" },
                    },
                ],
            },
            center: [longitude, latitude],
            zoom,
            interactive,
        });

        // Navigation controls
        map.addControl(new vietmapgl.NavigationControl(), 'top-right');

        mapRef.current = map;

        // Add markers when map is ready
        map.on('load', () => {
            // Add Raster layer for map tiles
            map.addSource('vietmap-raster', {
                type: 'raster',
                tiles: [VIETMAP_CONFIG.TILE_URL],
                tileSize: 256,
            });
            map.addLayer({
                id: 'vietmap-raster-layer',
                type: 'raster',
                source: 'vietmap-raster',
                paint: { 'raster-opacity': 1 },
            });

            // Add initial markers
            addMarkers(map, markers);
        });

        // Cleanup
        return () => {
            clearMarkers();
            map.remove();
            mapRef.current = null;
        };
    }, [latitude, longitude, zoom, interactive, clearMarkers, addMarkers, markers]);

    // Update markers when markers prop changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Check if map style is loaded
        if (map.isStyleLoaded && map.isStyleLoaded()) {
            clearMarkers();
            addMarkers(map, markers);
        } else if (map.once) {
            map.once('load', () => {
                clearMarkers();
                addMarkers(map, markers);
            });
        }
    }, [markers, clearMarkers, addMarkers]);

    return (
        <div
            ref={mapContainer}
            className={className}
            style={{ width: '100%', height: '400px', borderRadius: '12px' }}
        />
    );
}
