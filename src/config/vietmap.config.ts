const VIETMAP_SERVICES_KEY = import.meta.env.VITE_VIETMAP_SERVICES_KEY || '';

const VIETMAP_TILEMAP_KEY = import.meta.env.VITE_VIETMAP_TILEMAP_KEY || '';

export const VIETMAP_CONFIG = {
    API_KEY: VIETMAP_SERVICES_KEY,
    SERVICES_KEY: VIETMAP_SERVICES_KEY,
    TILEMAP_KEY: VIETMAP_TILEMAP_KEY,

    // Style URL — dùng để hiển thị bản đồ
    STYLE_URL: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_TILEMAP_KEY}`,

    // Tile URL — đi qua proxy để tránh CORS (dev: Vite proxy, prod: Vercel rewrite)
    TILE_URL: `/vietmap/tm/{z}/{x}/{y}.png?apikey=${VIETMAP_TILEMAP_KEY}`,

    // API Endpoints
    SEARCH_URL: 'https://maps.vietmap.vn/api/search/v4',
    AUTOCOMPLETE_URL: 'https://maps.vietmap.vn/api/autocomplete/v4',
    PLACE_DETAIL_URL: 'https://maps.vietmap.vn/api/place/v4',
    REVERSE_GEOCODING_URL: 'https://maps.vietmap.vn/api/reverse/v4',
    ROUTING_URL: 'https://maps.vietmap.vn/api/route',
};
