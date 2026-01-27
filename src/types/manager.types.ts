// ============ MANAGER TYPES ============
// Types for Manager-specific APIs

import { SiteType, SiteRegion, SiteOpeningHours, SiteContactInfo } from './admin.types';

// Creator info in manager site response
export interface SiteCreator {
    id: string;
    full_name: string;
    email: string;
}

// GET /api/manager/sites - Response (Manager's site)
export interface ManagerSite {
    id: string;
    code: string;
    name: string;
    description: string | null;
    history: string | null;
    address: string;
    province: string;
    district: string | null;
    latitude: string;
    longitude: string;
    region: SiteRegion;
    type: SiteType;
    patron_saint: string | null;
    cover_image: string | null;
    opening_hours: SiteOpeningHours | null;
    contact_info: SiteContactInfo | null;
    is_active: boolean;
    created_by: SiteCreator;
    created_at: string;
    updated_at: string;
}

// POST /api/manager/sites - Create Site Request Data
export interface CreateManagerSiteData {
    name: string;
    description?: string;
    history?: string;
    address: string;
    province: string;
    district?: string;
    latitude: number;
    longitude: number;
    region: SiteRegion;
    type: SiteType;
    patron_saint?: string;
    cover_image?: File | null;
    opening_hours?: SiteOpeningHours;
    contact_info?: SiteContactInfo;
}

// PUT /api/manager/sites - Update Site Request Data (same as create)
export type UpdateManagerSiteData = Partial<CreateManagerSiteData>;

// ============ LOCAL GUIDE TYPES ============

// Local Guide status - chỉ có 2 trạng thái theo API
// - active: đang hoạt động
// - banned: bị cấm/khóa
export type LocalGuideStatus = 'active' | 'banned';

// Local Guide item in list
export interface LocalGuide {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    status: LocalGuideStatus;
    created_at: string;
}

// GET /api/manager/local-guides - Query params
export interface LocalGuideListParams {
    page?: number;
    limit?: number;
    status?: LocalGuideStatus | '';
    search?: string;
}

// GET /api/manager/local-guides - Response
export interface LocalGuideListResponse {
    data: LocalGuide[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// POST /api/manager/local-guides - Request body
// Đây là dữ liệu gửi lên khi tạo Local Guide mới
export interface CreateLocalGuideData {
    email: string;      // Email bắt buộc - Local Guide sẽ nhận password qua email này
    full_name: string;  // Họ tên bắt buộc
    phone?: string;     // SĐT tùy chọn
}

// POST /api/manager/local-guides - Response
// Đây là dữ liệu server trả về sau khi tạo thành công
export interface CreateLocalGuideResponse {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    role: string;
    status: LocalGuideStatus;
    site: {
        id: string;
        code: string;
        name: string;
    };
    created_at: string;
}

// PATCH /api/manager/local-guides/{id}/status - Request body
// Dùng để ban hoặc unban Local Guide
export interface UpdateLocalGuideStatusData {
    status: LocalGuideStatus;  // 'active' hoặc 'banned'
}

// PATCH /api/manager/local-guides/{id}/status - Response
export interface UpdateLocalGuideStatusResponse {
    id: string;
    email: string;
    full_name: string;
    status: LocalGuideStatus;
}
