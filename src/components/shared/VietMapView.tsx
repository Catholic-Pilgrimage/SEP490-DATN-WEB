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
    // Thông tin mở rộng cho popup
    coverImage?: string;
    address?: string;
    type?: string;
    isActive?: boolean;
}

interface VietMapViewProps {
    latitude: number;
    longitude: number;
    zoom?: number;
    markers?: VietMapMarker[];
    className?: string;
    interactive?: boolean;
    onMarkerClick?: (marker: VietMapMarker) => void;
    onViewDetail?: (markerId: string) => void;
}

export default function VietMapView({
    latitude,
    longitude,
    zoom = 14,
    markers = [],
    className = '',
    interactive = true,
    onMarkerClick,
    onViewDetail,
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
        // Xử lý click nút "Xem chi tiết" trong popup
        const handlePopupClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('view-detail-btn')) {
                const siteId = target.getAttribute('data-site-id');
                if (siteId && onViewDetail) {
                    onViewDetail(siteId);
                }
            }
        };

        // Thêm event listener cho document (vì popup được render trong DOM)
        document.addEventListener('click', handlePopupClick);

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

            // Chuyển đổi type sang tiếng Việt
            const typeTranslations: Record<string, string> = {
                'church': 'Nhà thờ',
                'shrine': 'Đền',
                'monastery': 'Tu viện',
                'center': 'Trung tâm',
                'other': 'Khác'
            };
            const typeLabel = m.type ? (typeTranslations[m.type] || m.type) : 'Địa điểm';

            const popupHtml = `
                <div style="min-width: 220px; max-width: 260px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
                    <!-- Ảnh bìa -->
                    <div style="position: relative; width: 100%; height: 100px; overflow: hidden;">
                        ${m.coverImage
                    ? `<img src="${m.coverImage}" alt="${m.title}" style="width: 100%; height: 100%; object-fit: cover;" />`
                    : `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #d4af37 0%, #8a6d1c 50%, #5c4a1f 100%); display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 56px;">⛪</span>
                               </div>`
                }
                        <!-- Lớp phủ gradient -->
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 60px; background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);"></div>
                    </div>
                    
                    <!-- Nội dung -->
                    <div style="padding: 16px;">
                        <!-- Tiêu đề -->
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #1a1a1a; line-height: 1.4;">${m.title}</h3>
                        
                        <!-- Địa chỉ -->
                        <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            <svg style="width: 16px; height: 16px; color: #d4af37; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span style="font-size: 13px; color: #555; line-height: 1.5;">${m.address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                        
                        <!-- Tags: Loại và Trạng thái -->
                        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: linear-gradient(135deg, #e8d5a3 0%, #d4af37 100%); color: #5c4a1f; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                ${typeLabel}
                            </span>
                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: ${m.isActive ? 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)' : 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)'}; color: white; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    ${m.isActive
                    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
                }
                                </svg>
                                ${m.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                            </span>
                        </div>
                        
                        <!-- Nút xem chi tiết -->
                        <button 
                            class="view-detail-btn"
                            data-site-id="${m.id}"
                            style="width: 100%; padding: 12px 20px; background: linear-gradient(135deg, #8a6d1c 0%, #d4af37 50%, #b8962e 100%); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(139, 109, 28, 0.3);"
                            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(139, 109, 28, 0.5)';"
                            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(139, 109, 28, 0.3)';"
                        >
                            <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            Xem chi tiết
                            <svg style="width: 16px; height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            const popup = new vietmapgl.Popup({
                offset: 12,
                maxWidth: '280px',
                closeButton: true,
            }).setHTML(popupHtml);

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

        // Cleanup event listener
        return () => {
            document.removeEventListener('click', handlePopupClick);
        };
    }, [onMarkerClick, onViewDetail]);

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
