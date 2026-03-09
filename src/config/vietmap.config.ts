const VIETMAP_API_KEY =
    import.meta.env.VITE_VIETMAP_API_KEY ||
    'd5b3bd4feac2aa13517d1572016d247c8484495fe1c7124b';

export const VIETMAP_CONFIG = {
    API_KEY: VIETMAP_API_KEY,

    // Style URL — dùng để hiển thị bản đồ
    STYLE_URL: `https://maps.vietmap.vn/api/maps/light/styles.json?apikey=${VIETMAP_API_KEY}`,

    // Tile URL — dùng cho raster tiles (fallback)
    TILE_URL: `https://maps.vietmap.vn/api/tm/{z}/{x}/{y}.png?apikey=${VIETMAP_API_KEY}`,

    // API Endpoints
    SEARCH_URL: 'https://maps.vietmap.vn/api/search/v4',
    AUTOCOMPLETE_URL: 'https://maps.vietmap.vn/api/autocomplete/v4',
    PLACE_DETAIL_URL: 'https://maps.vietmap.vn/api/place/v4',
    REVERSE_GEOCODING_URL: 'https://maps.vietmap.vn/api/reverse/v4',
    ROUTING_URL: 'https://maps.vietmap.vn/api/route',
};
