import { useEffect, useRef } from 'react';
import { VIETMAP_CONFIG } from '@/config/vietmap.config';

// Khai báo type cho vietmapgl (khi dùng CDN)
declare const vietmapgl: any;

interface VietMapViewProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    markers?: Array<{
        id: string;
        lat: number;
        lng: number;
        title: string;
        color?: string;
    }>;
    className?: string;
    interactive?: boolean;
    onMarkerClick?: (marker: any) => void;
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
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainer.current || typeof vietmapgl === 'undefined') return;

        // Khởi tạo map
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

        // Thêm markers khi map ready
        map.on('load', () => {
            // Thêm lớp Raster giống hệt như phiên bản Mobile yêu cầu
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
            markers.forEach((m) => {
                // Tạo marker element
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

                // Tạo popup
                const popup = new vietmapgl.Popup({ offset: 25 })
                    .setHTML(`<strong>${m.title}</strong>`);

                // Thêm marker vào map
                new vietmapgl.Marker({ element: el })
                    .setLngLat([m.lng, m.lat])
                    .setPopup(popup)
                    .addTo(map);

                if (onMarkerClick) {
                    el.addEventListener('click', () => onMarkerClick(m));
                }
            });

            // Auto-fit bounds nếu có nhiều markers
            if (markers.length > 1) {
                const bounds = new vietmapgl.LngLatBounds();
                markers.forEach((m) => bounds.extend([m.lng, m.lat]));
                map.fitBounds(bounds, { padding: 60 });
            }
        });

        // Cleanup
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [latitude, longitude, zoom, markers, interactive, onMarkerClick]);

    return (
        <div
            ref={mapContainer}
            className={className}
            style={{ width: '100%', height: '400px', borderRadius: '12px' }}
        />
    );
}
