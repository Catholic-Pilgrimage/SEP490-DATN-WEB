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
        'common.restore': 'Khôi phục',
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
        'verification.requests': 'yêu cầu',

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

        // Shift Submissions
        'shifts.title': 'Lịch trực Local Guide',
        'shifts.subtitle': 'Xem lịch làm việc của Local Guides theo thời gian',
        'shifts.allGuides': 'Tất cả Local Guide',
        'shifts.selectDay': 'Chọn một ngày',
        'shifts.selectDayDesc': 'Click vào ngày trên lịch để xem chi tiết ca làm việc',
        'shifts.noShiftsDay': 'trong ngày này',
        'shifts.shiftCount': 'ca làm việc',
        'common.today': 'Hôm nay',
        'common.year': 'Năm',
        'common.month': 'Tháng',
        'common.week': 'Tuần',
        'common.details': 'Chi tiết',
        'common.close': 'Đóng',
        'common.approve': 'Duyệt',
        'common.reject': 'Từ chối',

        'shifts.detailTitle': 'Chi tiết Shift Submission',

        // Media Content
        'media.title': 'Media Content',
        'media.subtitle': 'Quản lý hình ảnh và video của site',
        'media.filterType': 'Tất cả loại',
        'media.filterStatus': 'Tất cả trạng thái',
        'media.filterActive': 'Tất cả (Active/Deleted)',
        'media.activeTrue': 'Đang hoạt động',
        'media.activeFalse': 'Đã xóa',
        'media.emptyTitle': 'Chưa có media nào',
        'media.emptyDesc': 'Các Local Guide chưa upload media cho site',
        'media.view': 'Xem',
        'media.openInNewTab': 'Mở trong tab mới',
        'media.showing': 'Hiển thị',
        'media.to': 'đến',
        'media.of': 'trong tổng số',


        // Shift Details
        'shifts.typeNew': 'Đăng ký mới',
        'shifts.typeChange': 'Thay đổi lịch',
        'shifts.weekStart': 'Tuần bắt đầu',
        'shifts.totalShifts': 'Tổng số ca',
        'shifts.shiftsList': 'Các ca làm việc',
        'shifts.changes': 'Các thay đổi',
        'shifts.changeNew': 'Thêm mới',
        'shifts.changeRemoved': 'Xóa',
        'shifts.changeModified': 'Thay đổi',
        'shifts.changeReason': 'Lý do thay đổi',
        'shifts.rejectionReason': 'Lý do từ chối',
        'shifts.enterRejectionReason': 'Nhập lý do từ chối',
        'shifts.rejectionPlaceholder': 'Vui lòng nhập lý do từ chối...',
        'shifts.createdAt': 'Tạo lúc',
        'shifts.approvedAt': 'Duyệt lúc',
        'shifts.confirmReject': 'Xác nhận từ chối',
        'shifts.confirmApproveMsg': 'Bạn có chắc muốn duyệt submission này?',
        'shifts.reasonRequired': 'Vui lòng nhập lý do từ chối',

        // Content Management Tabs
        'content.tab.media': 'Media',
        'content.tab.schedules': 'Lịch lễ',
        'content.tab.events': 'Sự kiện',
        'content.tab.nearby': 'Địa điểm lân cận',

        // Schedule Content
        'schedule.title': 'Lịch lễ',
        'schedule.subtitle': 'Quản lý lịch lễ của site',
        'schedule.empty': 'Chưa có lịch lễ nào',
        'schedule.emptyDesc': 'Các Local Guide chưa tạo lịch lễ cho site',
        'schedule.loadError': 'Không thể tải danh sách lịch lễ',
        'schedule.allDays': 'Tất cả ngày',
        'schedule.detailTitle': 'Chi tiết Lịch lễ',
        'schedule.massTime': 'Giờ lễ',
        'schedule.daysOfWeek': 'Các ngày trong tuần',
        'schedule.note': 'Ghi chú',
        'schedule.noNote': '(Không có ghi chú)',
        'schedule.hide': 'Ẩn lịch lễ',
        'schedule.restore': 'Khôi phục',

        // Event Content
        'event.title': 'Sự kiện',
        'event.subtitle': 'Quản lý sự kiện của site',
        'event.empty': 'Chưa có sự kiện nào',
        'event.emptyDesc': 'Các Local Guide chưa tạo sự kiện cho site',
        'event.loadError': 'Không thể tải danh sách sự kiện',
        'event.description': 'Mô tả',
        'event.noDescription': '(Không có mô tả)',
        'event.date': 'Ngày',
        'event.time': 'Giờ',
        'event.location': 'Địa điểm',
        'event.banner': 'Banner',
        'event.openBanner': 'Mở banner trong tab mới',

        // Nearby Place Content
        'nearby.title': 'Địa điểm lân cận',
        'nearby.subtitle': 'Quản lý địa điểm lân cận của site',
        'nearby.empty': 'Chưa có địa điểm lân cận nào',
        'nearby.emptyDesc': 'Các Local Guide chưa đề xuất địa điểm lân cận',
        'nearby.loadError': 'Không thể tải danh sách địa điểm',
        'nearby.allCategories': 'Tất cả danh mục',
        'nearby.address': 'Địa chỉ',
        'nearby.latitude': 'Vĩ độ (Lat)',
        'nearby.longitude': 'Kinh độ (Lng)',
        'nearby.phone': 'Số điện thoại',
        'nearby.proposer': 'Người đề xuất',
        'nearby.reviewedAt': 'Ngày duyệt',

        // Shared Content Keys
        'content.allStatus': 'Tất cả trạng thái',
        'content.allActive': 'Tất cả (Active/Deleted)',
        'content.deleted': 'Đã xóa',
        'content.activeTrue': 'Đang hoạt động',
        'content.activeFalse': 'Đã xóa',
        'content.detail': 'Chi tiết',
        'content.createdAt': 'Ngày tạo',
        'content.updatedAt': 'Cập nhật',
        'content.rejectionReason': 'Lý do từ chối',
        'content.enterRejectionReason': 'Nhập lý do từ chối',
        'content.rejectionPlaceholder': 'Vui lòng nhập lý do từ chối...',
        'content.confirmReject': 'Xác nhận từ chối',
        'content.reasonRequired': 'Vui lòng nhập lý do từ chối',
        'content.confirmApproveMsg': 'Bạn có chắc muốn duyệt nội dung này?',
        'content.hide': 'Ẩn',
        'content.restore': 'Khôi phục',

        'common.error': 'Đã xảy ra lỗi',
        'content.approve': 'Duyệt',
        'content.reject': 'Từ chối',

        // Table Headers (Schedule)
        'table.scheduleCode': 'Mã',
        'table.day': 'Ngày',
        'table.time': 'Giờ',
        'table.note': 'Ghi chú',
        'table.creator': 'Người tạo',

        // Category labels
        'category.food': 'Ẩm thực',
        'category.lodging': 'Lưu trú',
        'category.medical': 'Y tế',

        // Toast Notifications
        'toast.loginSuccess': 'Đăng nhập thành công!',
        'toast.welcomeBack': 'Chào mừng trở lại, hệ thống đã sẵn sàng.',
        'toast.logoutSuccess': 'Đăng xuất thành công!',
        'toast.logoutMessage': 'Hẹn gặp lại bạn sớm.',
        'toast.editSiteSuccess': 'Cập nhật địa điểm thành công!',
        'toast.editSiteSuccessMsg': 'Thông tin địa điểm đã được lưu.',
        'toast.editSiteFailed': 'Cập nhật thất bại!',
        'toast.editSiteFailedMsg': 'Không thể cập nhật thông tin địa điểm.',
        'toast.deleteSiteSuccess': 'Xóa địa điểm thành công!',
        'toast.deleteSiteSuccessMsg': 'Địa điểm đã được chuyển sang trạng thái tạm ngưng.',
        'toast.deleteSiteFailed': 'Xóa thất bại!',
        'toast.deleteSiteFailedMsg': 'Không thể xóa địa điểm này.',
        'toast.restoreSiteSuccess': 'Khôi phục địa điểm thành công!',
        'toast.restoreSiteSuccessMsg': 'Địa điểm đã hoạt động trở lại.',
        'toast.restoreSiteFailed': 'Khôi phục thất bại!',
        'toast.restoreSiteFailedMsg': 'Không thể khôi phục địa điểm này.',
        'toast.refreshSuccess': 'Làm mới thành công!',
        'toast.refreshSuccessMsg': 'Dữ liệu đã được cập nhật mới nhất.',

        // User Management Toast & Modal
        'user.banTitle': 'Khóa người dùng',
        'user.unbanTitle': 'Mở khóa người dùng',
        'user.banConfirm': 'Bạn có chắc chắn muốn khóa người dùng này? Họ sẽ không thể truy cập vào hệ thống.',
        'user.unbanConfirm': 'Bạn có chắc chắn muốn mở khóa người dùng này? Họ sẽ lấy lại quyền truy cập vào hệ thống.',
        'user.banButton': 'Khóa người dùng',
        'user.unbanButton': 'Mở khóa người dùng',
        'toast.updateUserSuccess': 'Cập nhật thông tin thành công!',
        'toast.updateUserFailed': 'Cập nhật thất bại!',
        'toast.banUserSuccess': 'Đã khóa người dùng thành công.',
        'toast.unbanUserSuccess': 'Đã mở khóa người dùng thành công.',
        'toast.banUserFailed': 'Khóa người dùng thất bại.',
        'toast.unbanUserFailed': 'Mở khóa người dùng thất bại.',
        'toast.approveSuccess': 'Phê duyệt thành công!',
        'toast.approveSuccessMsg': 'Yêu cầu xác minh đã được phê duyệt.',
        'toast.approveFailed': 'Phê duyệt thất bại!',
        'toast.rejectSuccess': 'Từ chối thành công!',
        'toast.rejectSuccessMsg': 'Yêu cầu xác minh đã bị từ chối.',
        'toast.rejectFailed': 'Từ chối thất bại!',
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
        'common.restore': 'Restore',
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
        'verification.requests': 'requests',

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

        // Shift Submissions
        'shifts.title': 'Local Guide Shifts',
        'shifts.subtitle': 'View Local Guide work schedules over time',
        'shifts.allGuides': 'All Local Guides',
        'shifts.selectDay': 'Select a date',
        'shifts.selectDayDesc': 'Click on a date to view shift details',
        'shifts.noShiftsDay': 'on this day',
        'shifts.shiftCount': 'shift(s)',
        'common.today': 'Today',
        'common.year': 'Year',
        'common.month': 'Month',
        'common.week': 'Week',
        'common.details': 'Details',
        'common.close': 'Close',
        'common.approve': 'Approve',
        'common.reject': 'Reject',

        'shifts.detailTitle': 'Shift Submission Details',
        'shifts.typeNew': 'New Registration',
        'shifts.typeChange': 'Schedule Change',
        'shifts.weekStart': 'Week Start',
        'shifts.totalShifts': 'Total Shifts',
        'shifts.shiftsList': 'Shift List',
        'shifts.changes': 'Changes',
        'shifts.changeNew': 'New',
        'shifts.changeRemoved': 'Removed',
        'shifts.changeModified': 'Modified',
        'shifts.changeReason': 'Reason for Change',
        'shifts.rejectionReason': 'Rejection Reason',
        'shifts.enterRejectionReason': 'Enter Rejection Reason',
        'shifts.rejectionPlaceholder': 'Please enter rejection reason...',
        'shifts.createdAt': 'Created At',
        'shifts.approvedAt': 'Approved At',
        'shifts.confirmReject': 'Confirm Reject',
        'shifts.confirmApproveMsg': 'Are you sure you want to approve this submission?',
        'shifts.reasonRequired': 'Rejection reason is required',

        // Media Content
        'media.title': 'Media Content',
        'media.subtitle': 'Manage site images and videos',
        'media.filterType': 'All Types',
        'media.filterStatus': 'All Status',
        'media.filterActive': 'All (Active/Deleted)',
        'media.activeTrue': 'Active',
        'media.activeFalse': 'Deleted',
        'media.emptyTitle': 'No media yet',
        'media.emptyDesc': 'Local Guides have not uploaded any media yet',
        'media.view': 'View',
        'media.openInNewTab': 'Open in new tab',
        'media.showing': 'Showing',
        'media.to': 'to',
        'media.of': 'of',

        // Content Management Tabs
        'content.tab.media': 'Media',
        'content.tab.schedules': 'Schedules',
        'content.tab.events': 'Events',
        'content.tab.nearby': 'Nearby Places',

        // Schedule Content
        'schedule.title': 'Schedules',
        'schedule.subtitle': 'Manage site schedules',
        'schedule.empty': 'No schedules yet',
        'schedule.emptyDesc': 'Local Guides have not created any schedules',
        'schedule.loadError': 'Failed to load schedule list',
        'schedule.allDays': 'All Days',
        'schedule.detailTitle': 'Schedule Details',
        'schedule.massTime': 'Mass Time',
        'schedule.daysOfWeek': 'Days of the Week',
        'schedule.note': 'Note',
        'schedule.noNote': '(No note)',
        'schedule.hide': 'Hide Schedule',
        'schedule.restore': 'Restore',

        // Event Content
        'event.title': 'Events',
        'event.subtitle': 'Manage site events',
        'event.empty': 'No events yet',
        'event.emptyDesc': 'Local Guides have not created any events',
        'event.loadError': 'Failed to load event list',
        'event.description': 'Description',
        'event.noDescription': '(No description)',
        'event.date': 'Date',
        'event.time': 'Time',
        'event.location': 'Location',
        'event.banner': 'Banner',
        'event.openBanner': 'Open banner in new tab',

        // Nearby Place Content
        'nearby.title': 'Nearby Places',
        'nearby.subtitle': 'Manage nearby places of site',
        'nearby.empty': 'No nearby places yet',
        'nearby.emptyDesc': 'Local Guides have not suggested any nearby places',
        'nearby.loadError': 'Failed to load place list',
        'nearby.allCategories': 'All Categories',
        'nearby.address': 'Address',
        'nearby.latitude': 'Latitude (Lat)',
        'nearby.longitude': 'Longitude (Lng)',
        'nearby.phone': 'Phone',
        'nearby.proposer': 'Proposer',
        'nearby.reviewedAt': 'Reviewed At',

        // Shared Content Keys
        'content.allStatus': 'All Status',
        'content.allActive': 'All (Active/Deleted)',
        'content.deleted': 'Deleted',
        'content.activeTrue': 'Active',
        'content.activeFalse': 'Deleted',
        'content.detail': 'Details',
        'content.createdAt': 'Created At',
        'content.updatedAt': 'Updated',
        'content.rejectionReason': 'Rejection Reason',
        'content.enterRejectionReason': 'Enter Rejection Reason',
        'content.rejectionPlaceholder': 'Please enter rejection reason...',
        'content.confirmReject': 'Confirm Reject',
        'content.reasonRequired': 'Rejection reason is required',
        'content.confirmApproveMsg': 'Are you sure you want to approve this content?',
        'content.hide': 'Hide',
        'content.restore': 'Restore',

        'common.error': 'An error occurred',
        'content.approve': 'Approve',
        'content.reject': 'Reject',

        // Table Headers (Schedule)
        'table.scheduleCode': 'Code',
        'table.day': 'Day',
        'table.time': 'Time',
        'table.note': 'Note',
        'table.creator': 'Creator',

        // Category labels
        'category.food': 'Food',
        'category.lodging': 'Lodging',
        'category.medical': 'Medical',

        // Toast Notifications
        'toast.loginSuccess': 'Login successful!',
        'toast.welcomeBack': 'Welcome back, the system is ready.',
        'toast.logoutSuccess': 'Logged out successfully!',
        'toast.logoutMessage': 'See you again soon.',
        'toast.editSiteSuccess': 'Site updated successfully!',
        'toast.editSiteSuccessMsg': 'Site information has been saved.',
        'toast.editSiteFailed': 'Update failed!',
        'toast.editSiteFailedMsg': 'Could not update site information.',
        'toast.deleteSiteSuccess': 'Site deleted successfully!',
        'toast.deleteSiteSuccessMsg': 'The site has been marked as inactive.',
        'toast.deleteSiteFailed': 'Delete failed!',
        'toast.deleteSiteFailedMsg': 'Could not delete this site.',
        'toast.restoreSiteSuccess': 'Site restored successfully!',
        'toast.restoreSiteSuccessMsg': 'The site is now active again.',
        'toast.restoreSiteFailed': 'Restore failed!',
        'toast.restoreSiteFailedMsg': 'Could not restore this site.',
        'toast.refreshSuccess': 'Refreshed successfully!',
        'toast.refreshSuccessMsg': 'Data has been updated to the latest version.',

        // User Management Toast & Modal
        'user.banTitle': 'Ban User',
        'user.unbanTitle': 'Unban User',
        'user.banConfirm': 'Are you sure you want to ban this user? They will not be able to access the system.',
        'user.unbanConfirm': 'Are you sure you want to unban this user? They will regain access to the system.',
        'user.banButton': 'Ban User',
        'user.unbanButton': 'Unban User',
        'toast.updateUserSuccess': 'User updated successfully!',
        'toast.updateUserFailed': 'Failed to update user!',
        'toast.banUserSuccess': 'User banned successfully.',
        'toast.unbanUserSuccess': 'User unbanned successfully.',
        'toast.banUserFailed': 'Failed to ban user.',
        'toast.unbanUserFailed': 'Failed to unban user.',
        'toast.approveSuccess': 'Approved successfully!',
        'toast.approveSuccessMsg': 'The verification request has been approved.',
        'toast.approveFailed': 'Approval failed!',
        'toast.rejectSuccess': 'Rejected successfully!',
        'toast.rejectSuccessMsg': 'The verification request has been rejected.',
        'toast.rejectFailed': 'Rejection failed!',
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
