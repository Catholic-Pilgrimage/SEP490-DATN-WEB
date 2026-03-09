const VIETMAP_SERVICES_KEY =
    import.meta.env.VITE_VIETMAP_SERVICES_KEY ||
    'd5b3bd4feac2aa13517d1572016d247c8484495fe1c7124b';

const VIETMAP_TILEMAP_KEY =
    import.meta.env.VITE_VIETMAP_TILEMAP_KEY ||
    '3c6b56cab2559a893244e06142b981787f5392c789195a4a';

export const VIETMAP_CONFIG = {
    API_KEY: VIETMAP_SERVICES_KEY,
    SERVICES_KEY: VIETMAP_SERVICES_KEY,
    TILEMAP_KEY: VIETMAP_TILEMAP_KEY,

    // Style URL — dùng để hiển thị bản đồ
    STYLE_URL: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_TILEMAP_KEY}`,

    // Tile URL — dùng cho raster tiles (fallback)
    TILE_URL: `https://maps.vietmap.vn/api/tm/{z}/{x}/{y}.png?apikey=${VIETMAP_TILEMAP_KEY}`,

    // API Endpoints
    SEARCH_URL: 'https://maps.vietmap.vn/api/search/v4',
    AUTOCOMPLETE_URL: 'https://maps.vietmap.vn/api/autocomplete/v4',
    PLACE_DETAIL_URL: 'https://maps.vietmap.vn/api/place/v4',
    REVERSE_GEOCODING_URL: 'https://maps.vietmap.vn/api/reverse/v4',
    ROUTING_URL: 'https://maps.vietmap.vn/api/route',
};
