import { useCallback, useEffect, useRef, useState } from 'react';
import { VIETMAP_CONFIG } from '@/config/vietmap.config';
import { Loader2, MapPin } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const vietmapgl: any;

export interface LocationResult {
    latitude: number;
    longitude: number;
    address: string;
    district: string;
    province: string;
}

interface MapLocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (location: LocationResult) => void;
    className?: string;
}

export default function MapLocationPicker({
    initialLat = 10.7769,
    initialLng = 106.7009,
    onLocationSelect,
    className = '',
}: MapLocationPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markerRef = useRef<any>(null);
    // Store callback in ref to avoid stale closure
    const onLocationSelectRef = useRef(onLocationSelect);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [loading, setLoading] = useState(false);
    const [hint, setHint] = useState('Click vào bản đồ để chọn vị trí');

    // Keep ref up to date
    useEffect(() => {
        onLocationSelectRef.current = onLocationSelect;
    }, [onLocationSelect]);

    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        setLoading(true);
        setHint('Đang lấy thông tin địa chỉ...');
        try {
            const url = `/vietmap/reverse/v4?apikey=${VIETMAP_CONFIG.API_KEY}&lat=${lat}&lng=${lng}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // VietMap reverse geocode returns an array
            const item = Array.isArray(data) ? data[0] : data;


            if (!item) throw new Error('Empty response');

            // VietMap response fields: display, name, address, district, city/province
            const address = item.display ?? item.name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            const district = item.district ?? '';
            // VietMap uses "city" for province/city name
            const province = item.city ?? item.province ?? '';

            setHint('✓ Vị trí đã được chọn');
            onLocationSelectRef.current({ latitude: lat, longitude: lng, address, district, province });
        } catch (err) {
            console.warn('[MapLocationPicker] reverse geocode error:', err);
            setHint('✓ Vị trí đã chọn (không lấy được địa chỉ)');
            // Still update lat/lng even if address lookup fails
            onLocationSelectRef.current({
                latitude: lat,
                longitude: lng,
                address: '',
                district: '',
                province: '',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    function createMarkerEl() {
        const el = document.createElement('div');
        el.style.cssText = `
            width: 36px; height: 36px;
            background: #d4af37;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            cursor: grab;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        `;
        return el;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const placeMarker = useCallback((map: any, lat: number, lng: number) => {
        if (markerRef.current) {
            markerRef.current.remove();
        }
        const el = createMarkerEl();
        markerRef.current = new vietmapgl.Marker({ element: el, draggable: true })
            .setLngLat([lng, lat])
            .addTo(map);

        markerRef.current.on('dragend', () => {
            const lngLat = markerRef.current.getLngLat();
            // Debounce 500ms để tránh spam API khi kéo liên tục
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                reverseGeocode(lngLat.lat, lngLat.lng);
            }, 500);
        });
    }, [reverseGeocode]);

    useEffect(() => {
        if (!mapContainer.current || typeof vietmapgl === 'undefined') return;

        const map = new vietmapgl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                name: 'empty',
                sources: {},
                layers: [
                    {
                        id: 'background',
                        type: 'background',
                        paint: { 'background-color': '#fdf8f0' },
                    },
                ],
            },
            center: [initialLng, initialLat],
            zoom: 13,
            interactive: true,
        });

        map.addControl(new vietmapgl.NavigationControl(), 'top-right');
        mapRef.current = map;

        map.on('load', () => {
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

            // Place initial marker if coordinates given
            if (initialLat && initialLng) {
                placeMarker(map, initialLat, initialLng);
            }
        });

        // Click to pick location
        map.on('click', (e: { lngLat: { lat: number; lng: number } }) => {
            const { lat, lng } = e.lngLat;
            placeMarker(map, lat, lng);
            reverseGeocode(lat, lng);
        });

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cập nhật map và marker khi initialLat/initialLng thay đổi (vd: từ geocode địa chỉ)
    useEffect(() => {
        const map = mapRef.current;
        if (!map || typeof initialLat !== 'number' || typeof initialLng !== 'number') return;

        const doUpdate = () => {
            try {
                map.flyTo({ center: [initialLng, initialLat], zoom: 14, duration: 800 });
                placeMarker(map, initialLat, initialLng);
            } catch {
                // Map có thể chưa sẵn sàng
            }
        };

        if (typeof map.isStyleLoaded === 'function' && map.isStyleLoaded()) {
            doUpdate();
        } else {
            map.once?.('load', doUpdate);
            const id = setTimeout(doUpdate, 300);
            return () => clearTimeout(id);
        }
    }, [initialLat, initialLng, placeMarker]);

    return (
        <div className={`relative rounded-xl overflow-hidden border border-[#d4af37]/30 ${className}`}>
            <div ref={mapContainer} style={{ width: '100%', height: '300px' }} />

            {/* Hint bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2 text-sm text-slate-600 border-t border-[#d4af37]/20">
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#d4af37] shrink-0" />
                ) : (
                    <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                )}
                <span>{hint}</span>
            </div>
        </div>
    );
}
