import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    vi: {
        // Sidebar
        'menu.dashboard': 'Tổng quan',
        'menu.sites': 'Quản lý Sites',
        'menu.mysite': 'Site của tôi',
        'menu.users': 'Quản lý Users',
        'menu.verifications': 'Xác minh',
        'menu.sos': 'SOS Khẩn cấp',
        'menu.guides': 'Hướng dẫn viên',
        'menu.content': 'Duyệt nội dung',
        'menu.analytics': 'Thống kê',
        'menu.profile': 'Hồ sơ',
        'menu.settings': 'Cài đặt',
        'menu.shifts': 'Lịch trực',

        // TopBar
        'search.placeholder': 'Tìm kiếm sites, users, nội dung...',
        'nav.dashboard': 'Tổng quan',

        // Common
        'common.profile': 'Hồ sơ',
        'common.settings': 'Cài đặt',
        'common.signOut': 'Đăng xuất',
        'common.refresh': 'Làm mới',
        'common.cancel': 'Hủy',
        'common.save': 'Lưu thay đổi',
        'common.delete': 'Xóa',
        'common.edit': 'Chỉnh sửa',
        'common.view': 'Xem',
        'common.active': 'Hoạt động',
        'common.inactive': 'Không hoạt động',
        'portal.admin': 'Portal Quản trị',
        'portal.manager': 'Portal Quản lý',

        // Site Management
        'sites.title': 'Quản lý Sites',
        'sites.subtitle': 'Quản lý các điểm hành hương trên toàn Việt Nam',
        'sites.searchPlaceholder': 'Tìm theo tên, mã, hoặc địa chỉ...',
        'sites.allRegions': 'Tất cả vùng',
        'sites.allTypes': 'Tất cả loại',
        'sites.allStatus': 'Tất cả trạng thái',
        'sites.noSites': 'Không tìm thấy site nào',
        'sites.showing': 'Đang hiển thị',
        'sites.to': 'đến',
        'sites.of': 'trong tổng số',
        'sites.sites': 'sites',

        // Regions
        'region.bac': 'Miền Bắc',
        'region.trung': 'Miền Trung',
        'region.nam': 'Miền Nam',

        // Site Types
        'type.church': 'Nhà thờ',
        'type.shrine': 'Đền thánh',
        'type.monastery': 'Tu viện',
        'type.center': 'Trung tâm',
        'type.other': 'Khác',

        // Delete Modal
        'delete.title': 'Xóa Site',
        'delete.confirm': 'Bạn có chắc chắn muốn xóa site này? Hành động này sẽ đánh dấu site là không hoạt động.',
        'delete.deleting': 'Đang xóa...',
        'delete.deleteSite': 'Xóa Site',

        // Edit Modal
        'edit.title': 'Chỉnh sửa Site',
        'edit.basicInfo': 'Thông tin cơ bản',
        'edit.name': 'Tên',
        'edit.type': 'Loại',
        'edit.region': 'Vùng',
        'edit.patronSaint': 'Bổn mạng',
        'edit.description': 'Mô tả',
        'edit.history': 'Lịch sử',
        'edit.location': 'Vị trí',
        'edit.address': 'Địa chỉ',
        'edit.district': 'Quận/Huyện',
        'edit.province': 'Tỉnh/Thành phố',
        'edit.latitude': 'Vĩ độ',
        'edit.longitude': 'Kinh độ',
        'edit.coverImage': 'Ảnh bìa',
        'edit.uploadImage': 'Nhấn để tải ảnh mới',
        'edit.contactInfo': 'Thông tin liên hệ',
        'edit.phone': 'Điện thoại',
        'edit.email': 'Email',
        'edit.openingHours': 'Giờ mở cửa',
        'edit.siteActive': 'Site đang hoạt động',
        'edit.saving': 'Đang lưu...',

        // User Management
        'users.title': 'Quản lý Người dùng',
        'users.subtitle': 'Quản lý tất cả người dùng trong hệ thống',
        'users.searchPlaceholder': 'Tìm theo email, tên, hoặc điện thoại...',
        'users.allRoles': 'Tất cả vai trò',
        'users.allStatus': 'Tất cả trạng thái',
        'users.noUsers': 'Không tìm thấy người dùng',
        'users.showing': 'Hiển thị',
        'users.to': 'đến',
        'users.of': 'trong tổng số',
        'users.users': 'người dùng',

        // Verification Requests
        'verification.title': 'Yêu cầu xác thực',
        'verification.subtitle': 'Quản lý yêu cầu xác thực site từ khách hành hương',
        'verification.searchPlaceholder': 'Tìm theo mã hoặc tên site...',
        'verification.noRequests': 'Không tìm thấy yêu cầu xác thực',

        // Table Headers
        'table.user': 'Người dùng',
        'table.email': 'Email',
        'table.phone': 'Điện thoại',
        'table.role': 'Vai trò',
        'table.status': 'Trạng thái',
        'table.created': 'Ngày tạo',
        'table.actions': 'Thao tác',
        'table.code': 'Mã',
        'table.site': 'Địa điểm',
        'table.applicant': 'Người nộp',

        // User Roles
        'role.admin': 'Quản trị viên',
        'role.manager': 'Quản lý',
        'role.pilgrim': 'Khách hành hương',
        'role.localGuide': 'Hướng dẫn viên',

        // User Status
        'status.active': 'Hoạt động',
        'status.banned': 'Bị khóa',

        // Ban/Unban
        'ban.title': 'Khóa tài khoản',
        'unban.title': 'Mở khóa tài khoản',
        'ban.confirm': 'Bạn có chắc chắn muốn khóa người dùng này? Họ sẽ không thể truy cập hệ thống.',
        'unban.confirm': 'Bạn có chắc chắn muốn mở khóa người dùng này? Họ sẽ có thể truy cập hệ thống.',
        'ban.processing': 'Đang xử lý...',
        'ban.banUser': 'Khóa tài khoản',
        'ban.unbanUser': 'Mở khóa',

        // User Detail Modal
        'userDetail.dateOfBirth': 'Ngày sinh',
        'userDetail.language': 'Ngôn ngữ',
        'userDetail.siteId': 'Mã Site',
        'userDetail.site': 'Site',
        'userDetail.created': 'Ngày tạo',
        'userDetail.updated': 'Cập nhật',
        'userDetail.verified': 'Xác thực',

        // User Edit Modal
        'userEdit.title': 'Chỉnh sửa người dùng',
        'userEdit.fullName': 'Họ và tên',
        'userEdit.cancel': 'Hủy',
        'userEdit.saving': 'Đang lưu...',
        'userEdit.saveChanges': 'Lưu thay đổi',
        'userEdit.cannotChangeAdmin': 'Không thể đổi vai trò quản trị viên',
        'userEdit.enterSiteUuid': 'Nhập UUID site',

        // Modal Common
        'modal.editSite': 'Chỉnh sửa Site',
        'modal.siteDetails': 'Chi tiết Site',
        'modal.loading': 'Đang tải...',
        'modal.retry': 'Thử lại',
        'modal.errorLoading': 'Không thể tải thông tin site',

        // Days of Week
        'day.monday': 'Thứ Hai',
        'day.tuesday': 'Thứ Ba',
        'day.wednesday': 'Thứ Tư',
        'day.thursday': 'Thứ Năm',
        'day.friday': 'Thứ Sáu',
        'day.saturday': 'Thứ Bảy',
        'day.sunday': 'Chủ Nhật',

        // Detail Modal Tabs
        'tab.info': 'Thông tin',
        'tab.localGuides': 'Hướng dẫn viên',
        'tab.shifts': 'Lịch trực',
        'tab.media': 'Media',
        'tab.schedules': 'Lịch lễ',
        'tab.events': 'Sự kiện',
        'tab.nearbyPlaces': 'Địa điểm lân cận',

        // Detail Modal Info
        'detail.typeLabel': 'Loại',
        'detail.regionLabel': 'Vùng miền',
        'detail.statusLabel': 'Trạng thái',
        'detail.patronSaintLabel': 'Bổn mạng',
        'detail.description': 'Mô tả',
        'detail.history': 'Lịch sử',
        'detail.location': 'Vị trí',
        'detail.openInMaps': 'Mở trong Google Maps',
        'detail.openingHours': 'Giờ mở cửa',
        'detail.contact': 'Liên hệ',
        'detail.createdAt': 'Ngày tạo',
        'detail.updatedAt': 'Cập nhật',
        'detail.noDescription': 'Không có mô tả',
        'detail.noHistory': 'Không có lịch sử',
        'detail.noData': 'Không có dữ liệu',
        'detail.createdBy': 'Tạo bởi',

        // Local Guide
        'localGuide.workingAtSite': 'Hướng dẫn viên đang làm việc tại site này',
        'localGuide.noGuides': 'Chưa có Hướng dẫn viên',
        'localGuide.noGuidesAssigned': 'Site này chưa có Hướng dẫn viên nào được phân công',

        // Pagination
        'pagination.page': 'Trang',

        // Status
        'status.pending': 'Chờ duyệt',
        'status.approved': 'Đã duyệt',
        'status.rejected': 'Từ chối',
        'status.allStatus': 'Tất cả trạng thái',

        // Shifts Tab
        'shifts.shiftRegistrations': 'đăng ký lịch trực',
        'shifts.noShifts': 'Chưa có lịch trực',
        'shifts.noShiftsDesc': 'Chưa có đăng ký lịch trực nào cho site này',

        // Media Tab
        'media.items': 'media',
        'media.noMedia': 'Chưa có media',
        'media.noMediaDesc': 'Chưa có hình ảnh hoặc video nào được tải lên',
        'media.allTypes': 'Tất cả loại',
        'media.image': 'Hình ảnh',
        'media.video': 'Video',
        'media.panorama': 'Panorama',

        // Schedules Tab
        'schedules.items': 'lịch lễ',
        'schedules.noSchedules': 'Chưa có lịch lễ',
        'schedules.noSchedulesDesc': 'Chưa có lịch lễ nào được tạo',

        // Events Tab
        'events.items': 'sự kiện',
        'events.noEvents': 'Chưa có sự kiện',
        'events.noEventsDesc': 'Chưa có sự kiện nào được tạo',

        // Nearby Places Tab
        'nearbyPlaces.items': 'địa điểm lân cận',
        'nearbyPlaces.noPlaces': 'Chưa có địa điểm lân cận',
        'nearbyPlaces.noPlacesDesc': 'Chưa có địa điểm lân cận nào được thêm',
        'nearbyPlaces.allCategories': 'Tất cả loại',
        'nearbyPlaces.food': 'Ẩm thực',
        'nearbyPlaces.lodging': 'Lưu trú',
        'nearbyPlaces.medical': 'Y tế',

        // Verification Detail Modal
        'verificationDetail.title': 'Chi tiết yêu cầu xác thực',
        'verificationDetail.siteInfo': 'Thông tin địa điểm',
        'verificationDetail.introduction': 'Giới thiệu',
        'verificationDetail.certificate': 'Chứng chỉ',
        'verificationDetail.viewCertificate': 'Xem chứng chỉ',
        'verificationDetail.rejectionReason': 'Lý do từ chối',
        'verificationDetail.applicant': 'Người nộp đơn',
        'verificationDetail.reviewedBy': 'Được duyệt bởi',
        'verificationDetail.verified': 'Đã xác thực',
        'verificationDetail.approve': 'Duyệt',
        'verificationDetail.reject': 'Từ chối',
        'verificationDetail.approving': 'Đang duyệt...',
        'verificationDetail.rejecting': 'Đang từ chối...',
        'verificationDetail.confirmReject': 'Xác nhận từ chối',
        'verificationDetail.rejectionReasonRequired': 'Lý do từ chối *',
        'verificationDetail.enterRejectionReason': 'Nhập lý do từ chối...',
        'verificationDetail.unknown': 'Không rõ',

        // MySite (Manager)
        'mySite.title': 'Địa điểm của tôi',
        'mySite.subtitle': 'Quản lý thông tin địa điểm hành hương',
        'mySite.noSiteTitle': 'Bạn chưa có địa điểm nào',
        'mySite.noSiteDesc': 'Tạo địa điểm đầu tiên của bạn để bắt đầu quản lý và thu hút người hành hương.',
        'mySite.createNew': 'Tạo địa điểm mới',
        'mySite.note': 'Lưu ý: Mỗi Manager chỉ được quản lý 1 địa điểm',
        'mySite.retry': 'Thử lại',
        'mySite.active': 'Đang hoạt động',
        'mySite.inactive': 'Tạm ngưng',
        'mySite.patronSaint': 'Bổn mạng',
        'mySite.description': 'Mô tả',
        'mySite.history': 'Lịch sử',
        'mySite.openingHours': 'Giờ mở cửa',
        'mySite.contactInfo': 'Thông tin liên hệ',
        'mySite.createdAt': 'Ngày tạo',
        'mySite.updatedAt': 'Cập nhật',

        // Site Types
        'siteType.church': 'Nhà thờ',
        'siteType.shrine': 'Đền thánh',
        'siteType.monastery': 'Tu viện',
        'siteType.center': 'Trung tâm',
        'siteType.other': 'Khác',

        // Site Form Modal (Manager)
        'siteForm.createTitle': 'Tạo địa điểm mới',
        'siteForm.editTitle': 'Chỉnh sửa địa điểm',
        'siteForm.createSubtitle': 'Điền thông tin để tạo địa điểm',
        'siteForm.editSubtitle': 'Cập nhật thông tin địa điểm',
        'siteForm.basicInfo': 'Thông tin cơ bản',
        'siteForm.name': 'Tên địa điểm',
        'siteForm.type': 'Loại địa điểm',
        'siteForm.region': 'Miền',
        'siteForm.patronSaint': 'Bổn mạng',
        'siteForm.description': 'Mô tả',
        'siteForm.history': 'Lịch sử',
        'siteForm.location': 'Vị trí',
        'siteForm.address': 'Địa chỉ',
        'siteForm.province': 'Tỉnh/Thành phố',
        'siteForm.district': 'Quận/Huyện',
        'siteForm.latitude': 'Vĩ độ',
        'siteForm.longitude': 'Kinh độ',
        'siteForm.coverImage': 'Ảnh bìa',
        'siteForm.selectImage': 'Chọn ảnh',
        'siteForm.openingHours': 'Giờ mở cửa',
        'siteForm.contactInfo': 'Thông tin liên hệ',
        'siteForm.phone': 'Điện thoại',
        'siteForm.email': 'Email',
        'siteForm.processing': 'Đang xử lý...',
        'siteForm.createButton': 'Tạo địa điểm',

        // Local Guides (Manager)
        'localGuides.title': 'Hướng dẫn viên địa phương',
        'localGuides.subtitle': 'Quản lý đội ngũ hướng dẫn viên địa phương',
        'localGuides.searchPlaceholder': 'Tìm kiếm theo tên, email hoặc số điện thoại...',
        'localGuides.addGuide': 'Thêm Hướng dẫn viên',
        'localGuides.errorLoad': 'Không thể tải danh sách Hướng dẫn viên',
        'localGuides.errorNoSite': 'Bạn cần tạo địa điểm trước khi quản lý Hướng dẫn viên',
        'localGuides.noGuidesTitle': 'Chưa có Hướng dẫn viên nào',
        'localGuides.noGuidesDesc': 'Bắt đầu thêm Hướng dẫn viên để hỗ trợ người hành hương tại địa điểm của bạn',
        'localGuides.addFirst': 'Thêm Hướng dẫn viên đầu tiên',
        'localGuides.table.guide': 'Hướng dẫn viên',
        'localGuides.table.contact': 'Liên hệ',
        'localGuides.table.status': 'Trạng thái',
        'localGuides.table.created': 'Ngày tạo',
        'localGuides.table.actions': 'Thao tác',
        'localGuides.banTooltip': 'Cấm Hướng dẫn viên',
        'localGuides.unbanTooltip': 'Kích hoạt lại Hướng dẫn viên',
        'localGuides.ban': 'Cấm',
        'localGuides.unban': 'Kích hoạt',
        'localGuides.confirmBan': 'Bạn có chắc muốn cấm Hướng dẫn viên "{name}"?',
        'localGuides.confirmUnban': 'Bạn có chắc muốn kích hoạt lại Hướng dẫn viên "{name}"?',
        'localGuides.updateSuccess': 'Cập nhật trạng thái thành công',
        'localGuides.updateError': 'Không thể cập nhật trạng thái',
    },
    en: {
        // Sidebar
        'menu.dashboard': 'Dashboard',
        'menu.sites': 'Sites Management',
        'menu.mysite': 'My Site',
        'menu.users': 'User Management',
        'menu.verifications': 'Verifications',
        'menu.sos': 'SOS Emergency',
        'menu.guides': 'My Guides',
        'menu.content': 'Content Review',
        'menu.analytics': 'Analytics',
        'menu.profile': 'Profile',
        'menu.settings': 'Settings',
        'menu.shifts': 'Shift Submissions',

        // TopBar
        'search.placeholder': 'Search sites, users, content...',
        'nav.dashboard': 'Dashboard',

        // Common
        'common.profile': 'Profile',
        'common.settings': 'Settings',
        'common.signOut': 'Sign Out',
        'common.refresh': 'Refresh',
        'common.cancel': 'Cancel',
        'common.save': 'Save Changes',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.view': 'View',
        'common.active': 'Active',
        'common.inactive': 'Inactive',
        'portal.admin': 'Admin Portal',
        'portal.manager': 'Manager Portal',

        // Site Management
        'sites.title': 'Site Management',
        'sites.subtitle': 'Manage pilgrimage sites across Vietnam',
        'sites.searchPlaceholder': 'Search by name, code, or address...',
        'sites.allRegions': 'All Regions',
        'sites.allTypes': 'All Types',
        'sites.allStatus': 'All Status',
        'sites.noSites': 'No sites found',
        'sites.showing': 'Showing',
        'sites.to': 'to',
        'sites.of': 'of',
        'sites.sites': 'sites',

        // Regions
        'region.bac': 'Northern',
        'region.trung': 'Central',
        'region.nam': 'Southern',

        // Site Types
        'type.church': 'Church',
        'type.shrine': 'Shrine',
        'type.monastery': 'Monastery',
        'type.center': 'Center',
        'type.other': 'Other',

        // Delete Modal
        'delete.title': 'Delete Site',
        'delete.confirm': 'Are you sure you want to delete this site? This action will mark the site as inactive (soft delete).',
        'delete.deleting': 'Deleting...',
        'delete.deleteSite': 'Delete Site',

        // Edit Modal
        'edit.title': 'Edit Site',
        'edit.basicInfo': 'Basic Information',
        'edit.name': 'Name',
        'edit.type': 'Type',
        'edit.region': 'Region',
        'edit.patronSaint': 'Patron Saint',
        'edit.description': 'Description',
        'edit.history': 'History',
        'edit.location': 'Location',
        'edit.address': 'Address',
        'edit.district': 'District',
        'edit.province': 'Province',
        'edit.latitude': 'Latitude',
        'edit.longitude': 'Longitude',
        'edit.coverImage': 'Cover Image',
        'edit.uploadImage': 'Click to upload new image',
        'edit.contactInfo': 'Contact Info',
        'edit.phone': 'Phone',
        'edit.email': 'Email',
        'edit.openingHours': 'Opening Hours',
        'edit.siteActive': 'Site is Active',
        'edit.saving': 'Saving...',

        // User Management
        'users.title': 'User Management',
        'users.subtitle': 'Manage all users in the system',
        'users.searchPlaceholder': 'Search by email, name, or phone...',
        'users.allRoles': 'All Roles',
        'users.allStatus': 'All Status',
        'users.noUsers': 'No users found',
        'users.showing': 'Showing',
        'users.to': 'to',
        'users.of': 'of',
        'users.users': 'users',

        // Verification Requests
        'verification.title': 'Verification Requests',
        'verification.subtitle': 'Manage site verification requests from pilgrims',
        'verification.searchPlaceholder': 'Search by code or site name...',
        'verification.noRequests': 'No verification requests found',

        // Table Headers
        'table.user': 'User',
        'table.email': 'Email',
        'table.phone': 'Phone',
        'table.role': 'Role',
        'table.status': 'Status',
        'table.created': 'Created',
        'table.actions': 'Actions',
        'table.code': 'Code',
        'table.site': 'Site',
        'table.applicant': 'Applicant',

        // User Roles
        'role.admin': 'Admin',
        'role.manager': 'Manager',
        'role.pilgrim': 'Pilgrim',
        'role.localGuide': 'Local Guide',

        // User Status
        'status.active': 'Active',
        'status.banned': 'Banned',

        // Ban/Unban
        'ban.title': 'Ban User',
        'unban.title': 'Unban User',
        'ban.confirm': 'Are you sure you want to ban this user? They will not be able to access the system.',
        'unban.confirm': 'Are you sure you want to unban this user? They will regain access to the system.',
        'ban.processing': 'Processing...',
        'ban.banUser': 'Ban User',
        'ban.unbanUser': 'Unban User',

        // User Detail Modal
        'userDetail.dateOfBirth': 'Date of Birth',
        'userDetail.language': 'Language',
        'userDetail.siteId': 'Site ID',
        'userDetail.site': 'Site',
        'userDetail.created': 'Created',
        'userDetail.updated': 'Updated',
        'userDetail.verified': 'Verified',

        // User Edit Modal
        'userEdit.title': 'Edit User',
        'userEdit.fullName': 'Full Name',
        'userEdit.cancel': 'Cancel',
        'userEdit.saving': 'Saving...',
        'userEdit.saveChanges': 'Save Changes',
        'userEdit.cannotChangeAdmin': 'Cannot change admin role',
        'userEdit.enterSiteUuid': 'Enter site UUID',

        // Modal Common
        'modal.editSite': 'Edit Site',
        'modal.siteDetails': 'Site Details',
        'modal.loading': 'Loading...',
        'modal.retry': 'Retry',
        'modal.errorLoading': 'Failed to load site information',

        // Days of Week
        'day.monday': 'Monday',
        'day.tuesday': 'Tuesday',
        'day.wednesday': 'Wednesday',
        'day.thursday': 'Thursday',
        'day.friday': 'Friday',
        'day.saturday': 'Saturday',
        'day.sunday': 'Sunday',

        // Detail Modal Tabs
        'tab.info': 'Info',
        'tab.localGuides': 'Local Guides',
        'tab.shifts': 'Shifts',
        'tab.media': 'Media',
        'tab.schedules': 'Schedules',
        'tab.events': 'Events',
        'tab.nearbyPlaces': 'Nearby Places',

        // Detail Modal Info
        'detail.typeLabel': 'Type',
        'detail.regionLabel': 'Region',
        'detail.statusLabel': 'Status',
        'detail.patronSaintLabel': 'Patron Saint',
        'detail.description': 'Description',
        'detail.history': 'History',
        'detail.location': 'Location',
        'detail.openInMaps': 'Open in Google Maps',
        'detail.openingHours': 'Opening Hours',
        'detail.contact': 'Contact',
        'detail.createdAt': 'Created',
        'detail.updatedAt': 'Updated',
        'detail.noDescription': 'No description',
        'detail.noHistory': 'No history',
        'detail.noData': 'No data available',
        'detail.createdBy': 'Created by',

        // Local Guide
        'localGuide.workingAtSite': 'Local Guide(s) working at this site',
        'localGuide.noGuides': 'No Local Guides',
        'localGuide.noGuidesAssigned': 'No Local Guide has been assigned to this site',

        // Pagination
        'pagination.page': 'Page',

        // Status
        'status.pending': 'Pending',
        'status.approved': 'Approved',
        'status.rejected': 'Rejected',
        'status.allStatus': 'All Status',

        // Shifts Tab
        'shifts.shiftRegistrations': 'shift registration(s)',
        'shifts.noShifts': 'No shifts',
        'shifts.noShiftsDesc': 'No shift registrations for this site yet',

        // Media Tab
        'media.items': 'media item(s)',
        'media.noMedia': 'No media',
        'media.noMediaDesc': 'No images or videos have been uploaded',
        'media.allTypes': 'All Types',
        'media.image': 'Image',
        'media.video': 'Video',
        'media.panorama': 'Panorama',

        // Schedules Tab
        'schedules.items': 'schedule(s)',
        'schedules.noSchedules': 'No schedules',
        'schedules.noSchedulesDesc': 'No schedules have been created',

        // Events Tab
        'events.items': 'event(s)',
        'events.noEvents': 'No events',
        'events.noEventsDesc': 'No events have been created',

        // Nearby Places Tab
        'nearbyPlaces.items': 'nearby place(s)',
        'nearbyPlaces.noPlaces': 'No nearby places',
        'nearbyPlaces.noPlacesDesc': 'No nearby places have been added',
        'nearbyPlaces.allCategories': 'All Categories',
        'nearbyPlaces.food': 'Food',
        'nearbyPlaces.lodging': 'Lodging',
        'nearbyPlaces.medical': 'Medical',

        // Verification Detail Modal
        'verificationDetail.title': 'Verification Request Detail',
        'verificationDetail.siteInfo': 'Site Information',
        'verificationDetail.introduction': 'Introduction',
        'verificationDetail.certificate': 'Certificate',
        'verificationDetail.viewCertificate': 'View Certificate',
        'verificationDetail.rejectionReason': 'Rejection Reason',
        'verificationDetail.applicant': 'Applicant',
        'verificationDetail.reviewedBy': 'Reviewed By',
        'verificationDetail.verified': 'Verified',
        'verificationDetail.approve': 'Approve',
        'verificationDetail.reject': 'Reject',
        'verificationDetail.approving': 'Approving...',
        'verificationDetail.rejecting': 'Rejecting...',
        'verificationDetail.confirmReject': 'Confirm Reject',
        'verificationDetail.rejectionReasonRequired': 'Rejection Reason *',
        'verificationDetail.enterRejectionReason': 'Enter the reason for rejection...',
        'verificationDetail.unknown': 'Unknown',

        // MySite (Manager)
        'mySite.title': 'My Site',
        'mySite.subtitle': 'Manage your pilgrimage site information',
        'mySite.noSiteTitle': 'You don\'t have any site yet',
        'mySite.noSiteDesc': 'Create your first site to start managing and attracting pilgrims.',
        'mySite.createNew': 'Create New Site',
        'mySite.note': 'Note: Each Manager can only manage 1 site',
        'mySite.retry': 'Retry',
        'mySite.active': 'Active',
        'mySite.inactive': 'Inactive',
        'mySite.patronSaint': 'Patron Saint',
        'mySite.description': 'Description',
        'mySite.history': 'History',
        'mySite.openingHours': 'Opening Hours',
        'mySite.contactInfo': 'Contact Information',
        'mySite.createdAt': 'Created',
        'mySite.updatedAt': 'Updated',

        // Site Types
        'siteType.church': 'Church',
        'siteType.shrine': 'Shrine',
        'siteType.monastery': 'Monastery',
        'siteType.center': 'Center',
        'siteType.other': 'Other',

        // Site Form Modal (Manager)
        'siteForm.createTitle': 'Create New Site',
        'siteForm.editTitle': 'Edit Site',
        'siteForm.createSubtitle': 'Fill in the information to create a site',
        'siteForm.editSubtitle': 'Update site information',
        'siteForm.basicInfo': 'Basic Information',
        'siteForm.name': 'Site Name',
        'siteForm.type': 'Site Type',
        'siteForm.region': 'Region',
        'siteForm.patronSaint': 'Patron Saint',
        'siteForm.description': 'Description',
        'siteForm.history': 'History',
        'siteForm.location': 'Location',
        'siteForm.address': 'Address',
        'siteForm.province': 'Province/City',
        'siteForm.district': 'District',
        'siteForm.latitude': 'Latitude',
        'siteForm.longitude': 'Longitude',
        'siteForm.coverImage': 'Cover Image',
        'siteForm.selectImage': 'Select Image',
        'siteForm.openingHours': 'Opening Hours',
        'siteForm.contactInfo': 'Contact Information',
        'siteForm.phone': 'Phone',
        'siteForm.email': 'Email',
        'siteForm.processing': 'Processing...',
        'siteForm.createButton': 'Create Site',

        // Local Guides (Manager)
        'localGuides.title': 'Local Guides',
        'localGuides.subtitle': 'Manage your local guide team',
        'localGuides.searchPlaceholder': 'Search by name, email or phone...',
        'localGuides.addGuide': 'Add Local Guide',
        'localGuides.errorLoad': 'Failed to load Local Guide list',
        'localGuides.errorNoSite': 'You need to create a site before managing Local Guides',
        'localGuides.noGuidesTitle': 'No Local Guides yet',
        'localGuides.noGuidesDesc': 'Start adding Local Guides to support pilgrims at your site',
        'localGuides.addFirst': 'Add First Local Guide',
        'localGuides.table.guide': 'Local Guide',
        'localGuides.table.contact': 'Contact',
        'localGuides.table.status': 'Status',
        'localGuides.table.created': 'Created At',
        'localGuides.table.actions': 'Actions',
        'localGuides.banTooltip': 'Ban Local Guide',
        'localGuides.unbanTooltip': 'Reactivate Local Guide',
        'localGuides.ban': 'Ban',
        'localGuides.unban': 'Activate',
        'localGuides.confirmBan': 'Are you sure you want to ban Local Guide "{name}"?',
        'localGuides.confirmUnban': 'Are you sure you want to reactivate Local Guide "{name}"?',
        'localGuides.updateSuccess': 'Status updated successfully',
        'localGuides.updateError': 'Failed to update status',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved === 'en' || saved === 'vi') ? saved : 'vi';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
