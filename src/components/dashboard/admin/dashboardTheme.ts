/**
 * Màu thương hiệu admin — đồng bộ với Verification, Site detail, v.v.
 * Vàng đồng: #8a6d1c → #d4af37, nền ấm: #f5f3ee / #faf8f3
 */
export const dash = {
  /** Viền card / panel */
  border: 'border-[#d4af37]/20',
  borderHover: 'hover:border-[#d4af37]/40',
  borderInput: 'border-[#d4af37]/30',

  /** Nền */
  bgMuted: 'bg-[#f5f3ee]',
  bgPageTint: 'bg-[#faf8f3]/50',
  bgIcon: 'bg-[#d4af37]/10',
  barTrack: 'bg-[#f5f3ee]',

  /** Chữ */
  textAccent: 'text-[#8a6d1c]',
  textAccentSoft: 'text-[#8a6d1c]/80',

  /** Nút / pill chọn */
  gradient: 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]',
  gradientShadow: 'shadow-sm shadow-[#d4af37]/25',

  /** Thanh tiến độ / biểu đồ cột */
  barFill: 'bg-gradient-to-r from-[#8a6d1c] to-[#d4af37]',

  /** Ô icon KPI (mặc định thương hiệu) */
  iconBox: 'rounded-xl border border-[#d4af37]/25 bg-[#d4af37]/10',
  iconGlyph: 'text-[#8a6d1c]',
} as const;
