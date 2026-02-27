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

// ============ SHIFT SUBMISSION TYPES ============

// Trạng thái của Shift Submission
// - pending: đang chờ duyệt
// - approved: đã duyệt
// - rejected: đã từ chối
export type ShiftSubmissionStatus = 'pending' | 'approved' | 'rejected';

// Loại submission
// - new: submission mới
// - change: thay đổi lịch (có previous_submission_id)
export type ShiftSubmissionType = 'new' | 'change';

// Thông tin 1 ca làm việc trong submission
export interface Shift {
    id: string;
    submission_id: string;
    day_of_week: number;        // 0=CN, 1=T2, 2=T3, ... 6=T7
    start_time: string;         // Giờ bắt đầu (HH:mm:ss)
    end_time: string;           // Giờ kết thúc (HH:mm:ss)
    created_at: string;
}

// Thông tin Local Guide trong submission
export interface ShiftSubmissionGuide {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    phone: string | null;
}

// 1 Shift Submission đầy đủ
export interface ShiftSubmission {
    id: string;
    guide_id: string;
    site_id: string;
    code: string | null;
    week_start_date: string;        // Ngày bắt đầu tuần (YYYY-MM-DD)
    submission_type: ShiftSubmissionType;
    change_reason: string | null;   // Lý do thay đổi (nếu type = 'change')
    previous_submission_id: string | null;
    status: ShiftSubmissionStatus;
    total_shifts: number;           // Tổng số ca trong tuần
    rejection_reason: string | null; // Lý do từ chối (nếu rejected)
    approved_by: string | null;     // ID của người duyệt
    approved_at: string | null;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
    guide: ShiftSubmissionGuide;    // Thông tin Local Guide
    shifts: Shift[];                // Danh sách các ca làm việc
}

// GET /api/manager/local-guides/shift-submissions - Query params
export interface ShiftSubmissionListParams {
    page?: number;
    limit?: number;
    guide_id?: string;              // Lọc theo Local Guide
    status?: ShiftSubmissionStatus | ''; // Lọc theo trạng thái
    week_start_date?: string;       // Lọc theo tuần (YYYY-MM-DD)
}

// GET /api/manager/local-guides/shift-submissions - Response
export interface ShiftSubmissionListResponse {
    data: ShiftSubmission[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// ============ SHIFT SUBMISSION DETAIL TYPES ============

// Thông tin thay đổi lịch (diff) - dùng khi submission_type = 'change'
// Hiển thị sự khác biệt giữa lịch cũ và lịch mới
export interface ShiftChange {
    day_of_week: number;
    old: {                      // Ca cũ (null nếu là ca mới)
        start_time: string;
        end_time: string;
    } | null;
    new: {                      // Ca mới (null nếu bị xóa)
        start_time: string;
        end_time: string;
    } | null;
    is_changed: boolean;        // Ca đã thay đổi giờ
    is_new: boolean;            // Ca mới thêm
    is_removed: boolean;        // Ca bị xóa
}

// GET /api/manager/local-guides/shift-submissions/{id} - Response
// Chi tiết submission, bao gồm diff nếu là thay đổi
export interface ShiftSubmissionDetail extends ShiftSubmission {
    changes: ShiftChange[] | null;  // null nếu submission_type = 'new'
}

// ============ UPDATE SHIFT SUBMISSION STATUS ============

// PATCH /api/manager/local-guides/shift-submissions/{id}/status - Request
// Duyệt hoặc từ chối submission
export interface UpdateShiftSubmissionStatusData {
    status: 'approved' | 'rejected';
    rejection_reason?: string;  // Bắt buộc khi status = 'rejected'
}

// PATCH /api/manager/local-guides/shift-submissions/{id}/status - Response
// Trả về submission đã cập nhật
export type UpdateShiftSubmissionStatusResponse = ShiftSubmission;

// ============================================================================
// MANAGER CONTENT - MEDIA
// ============================================================================

// Loại media: hình ảnh, video, 3d model
export type MediaType = 'image' | 'video' | 'model_3d';

// Trạng thái duyệt content (dùng chung cho Media, Schedule, Event, NearbyPlace)
export type ContentStatus = 'pending' | 'approved' | 'rejected';

// Thông tin người tạo
export interface ContentCreator {
    id: string;
    full_name: string;
    email: string;
}

// GET /api/manager/content/media - Media item
export interface Media {
    id: string;
    site_id: string;
    code: string;                   // Mã media (VD: IMG0115001, VID0115001)
    url: string;                    // URL của media (cloudinary hoặc youtube)
    type: MediaType;                // 'image' | 'video' | 'model_3d'
    caption: string;                // Mô tả media
    status: ContentStatus;          // 'pending' | 'approved' | 'rejected'
    rejection_reason: string | null;
    is_active: boolean;             // false = đã xóa mềm
    created_by: string;
    created_at: string;
    updated_at: string;
    creator: ContentCreator;        // Thông tin người tạo
}

// GET /api/manager/content/media - Query params
export interface MediaListParams {
    page?: number;
    limit?: number;
    type?: MediaType | '';          // Lọc theo loại media
    status?: ContentStatus | '';    // Lọc theo trạng thái duyệt
    is_active?: boolean;            // Lọc theo active (true = đang hoạt động, false = đã xóa)
}

// GET /api/manager/content/media - Response
export interface MediaListResponse {
    data: Media[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// PATCH /api/manager/content/media/{id}/status - Request
// Duyệt hoặc từ chối media
export interface UpdateMediaStatusData {
    status: 'approved' | 'rejected';
    rejection_reason?: string;  // Bắt buộc khi status = 'rejected'
}

// PATCH /api/manager/content/media/{id}/status - Response
// Trả về media đã cập nhật
export type UpdateMediaStatusResponse = Media;

// PATCH /api/manager/content/media/{id}/is-active - Request
// Ẩn hoặc khôi phục media (soft delete/restore)
export interface ToggleMediaActiveData {
    is_active: boolean;  // true = khôi phục, false = ẩn (soft delete)
}

// PATCH /api/manager/content/media/{id}/is-active - Response
// Trả về media đã cập nhật
export type ToggleMediaActiveResponse = Media;

// POST /api/manager/content/media/3d-model - Request Data
export interface Upload3DModelData {
    file: File;
    caption?: string;
}

// POST /api/manager/content/media/3d-model - Response
export interface Upload3DModelResponse extends Media { }

// =====================================================================
// SCHEDULE MANAGEMENT TYPES
// =====================================================================

// GET /api/manager/content/schedules - Response item
// Mỗi schedule là một lịch lễ của site
export interface Schedule {
    id: string;
    site_id: string;
    code: string;
    days_of_week: number[];  // 0=CN, 1=T2, ..., 6=T7
    time: string;            // "17:30:00"
    note: string;
    status: ContentStatus;
    rejection_reason: string | null;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    creator?: ContentCreator;
}

// GET /api/manager/content/schedules - Query params
export interface ScheduleListParams {
    page?: number;
    limit?: number;
    status?: ContentStatus;
    day_of_week?: number;    // 0=CN, 1=T2, ..., 6=T7
    is_active?: boolean;
}

// GET /api/manager/content/schedules - Response
export interface ScheduleListResponse {
    data: Schedule[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// PATCH /api/manager/content/schedules/{id}/status - Request
export interface UpdateScheduleStatusData {
    status: 'approved' | 'rejected';
    rejection_reason?: string;
}

// PATCH /api/manager/content/schedules/{id}/status - Response
export type UpdateScheduleStatusResponse = Schedule;

// PATCH /api/manager/content/schedules/{id}/is-active - Request
export interface ToggleScheduleActiveData {
    is_active: boolean;
}

// PATCH /api/manager/content/schedules/{id}/is-active - Response
export type ToggleScheduleActiveResponse = Schedule;

// =====================================================================
// EVENT MANAGEMENT TYPES
// =====================================================================

// GET /api/manager/content/events - Response item
// Mỗi event là một sự kiện của site
export interface Event {
    id: string;
    site_id: string;
    code: string;
    name: string;
    description: string;
    start_date: string;       // "2026-01-29"
    end_date: string;         // "2026-01-31"
    start_time: string;       // "18:00:00"
    end_time: string;         // "22:00:00"
    location: string;
    banner_url: string | null;
    status: ContentStatus;
    rejection_reason: string | null;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    creator?: ContentCreator;
}

// GET /api/manager/content/events - Query params
export interface EventListParams {
    page?: number;
    limit?: number;
    status?: ContentStatus;
    is_active?: boolean;
}

// GET /api/manager/content/events - Response
export interface EventListResponse {
    data: Event[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// PATCH /api/manager/content/events/{id}/status - Request
export interface UpdateEventStatusData {
    status: 'approved' | 'rejected';
    rejection_reason?: string;
}

// PATCH /api/manager/content/events/{id}/status - Response
export type UpdateEventStatusResponse = Event;

// PATCH /api/manager/content/events/{id}/is-active - Request
export interface ToggleEventActiveData {
    is_active: boolean;
}

// PATCH /api/manager/content/events/{id}/is-active - Response
export type ToggleEventActiveResponse = Event;

// =====================================================================
// NEARBY PLACE MANAGEMENT TYPES
// =====================================================================

// Category của địa điểm lân cận
export type NearbyPlaceCategory = 'food' | 'lodging' | 'medical';

// GET /api/manager/content/nearby-places - Response item
export interface NearbyPlace {
    id: string;
    site_id: string;
    code: string;
    proposed_by: string;
    name: string;
    category: NearbyPlaceCategory;
    address: string;
    latitude: string;
    longitude: string;
    distance_meters: number;
    phone: string | null;
    description: string | null;
    status: ContentStatus;
    rejection_reason: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    is_active: boolean;
    created_at: string;
    proposer?: ContentCreator;
}

// GET /api/manager/content/nearby-places - Query params
export interface NearbyPlaceListParams {
    page?: number;
    limit?: number;
    status?: ContentStatus;
    category?: NearbyPlaceCategory;
    is_active?: boolean;
}

// GET /api/manager/content/nearby-places - Response
export interface NearbyPlaceListResponse {
    data: NearbyPlace[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// PATCH /api/manager/content/nearby-places/{id}/status - Request
export interface UpdateNearbyPlaceStatusData {
    status: 'approved' | 'rejected';
    rejection_reason?: string;
}

// PATCH /api/manager/content/nearby-places/{id}/status - Response
export type UpdateNearbyPlaceStatusResponse = NearbyPlace;

// PATCH /api/manager/content/nearby-places/{id}/is-active - Request
export interface ToggleNearbyPlaceActiveData {
    is_active: boolean;
}

// PATCH /api/manager/content/nearby-places/{id}/is-active - Response
export type ToggleNearbyPlaceActiveResponse = NearbyPlace;
