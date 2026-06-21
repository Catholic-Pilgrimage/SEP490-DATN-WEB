<p align="center">
  <img src="./assets/logo.png" width="160" alt="Catholic Pilgrimage Logo">
</p>

<h1 align="center">⛪ Catholic Pilgrimage System Web Portal</h1>
<p align="center"><b>Admin & Site Manager Portal for Catholic Pilgrimage System</b></p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://github.com/Catholic-Pilgrimage/SEP490-DATN-WEB/actions"><img src="https://img.shields.io/github/actions/workflow/status/Catholic-Pilgrimage/SEP490-DATN-WEB/ci.yml?branch=main&style=for-the-badge&logo=github-actions&logoColor=white&label=CI%20Build" alt="CI Build"></a>
</p>

---

### 🗺️ Navigation / Điều hướng nhanh
* [🇬🇧 English Version](#english-version)
* [🇻🇳 Bản Tiếng Việt](#tiếng-việt-version)

---

## English Version

> [!NOTE]
> ### 📖 Introduction & Overview
> This is the React Web Management Portal of the **Catholic Pilgrimage System** (SEP490 Graduation Thesis - DATN, FPT University). Built on modern technologies like React 18, TypeScript, Vite, and Tailwind CSS, this app serves as the administrative interface for **Admins** and **Site Managers** to operate and govern the entire platform.

> [!IMPORTANT]
> ### 🛡️ Administrative Scopes (RBAC)
> Unlike the mobile app, this console is strictly accessible by the administrative roles:
> * **Site Manager**: Represents a specific pilgrimage sanctuary or church. Manages site information, lists mass/event schedules, rosters local guides, approves guide shift submissions, moderates media uploads, replies to pilgrim reviews, and uploads **3D Church Models** for spatial tour narrations.
> * **Platform Admin**: The global supervisor. Oversees verification requests (onboarding of new sites/managers/guides), monitors platform financial KPIs, reviews and manages reports, manages global Gemini AI system prompts, and audits transaction escrow states.

---

### 🚀 Key Core Modules

> [!TIP]
> ### 🎨 1. Site Manager Hub
> * **My Site**: Edit description, upload photos, coordinates, address, and manage historical descriptions.
> * **Mass & Schedule Manager**: Schedule mass times, confession slots, and special pastoral services.
> * **Shift Submissions Approval**: Review and approve shifts submitted by **Local Guides** to organize guides dynamically on site.
> * **3D Model Uploads**: Upload 3D models (using GLTF/GLB) to enable the pilgrim client's **3D Model interactive navigation** utilizing `@google/model-viewer`.

> [!CAUTION]
> ### 💳 2. Platform Admin Hub (Finance & Audits)
> * **Verification Requests**: Conduct review audits of guides and managers applying to claim specific parishes.
> * **KPIs & Finance Center**: Real-time business intelligence dashboard featuring user onboarding counts, active trips, and platform transaction revenues.
> * **Escrow & Wallet audits**: Monitor commitment deposits locked in wallets, auditing payout details and resolving disputes.
> * **AI Prompts Management**: Configure, customize, and edit system prompts used by Google Gemini AI across features (route advice, prayers generation, etc.).

> [!WARNING]
> ### 🚨 3. SOS Command Center (Real-Time Emergency Console)
> * **Real-Time GPS Alerts**: High-visibility map dashboard updating instantly via WebSocket client connections (`socket.io-client`).
> * **Guide Coordination**: View guide shift locations and dispatch nearest guide shifts to pilgrim emergency positions immediately.

---

### 📦 Technology Stack & Directory Structure

* **Framework & Tooling**: React 18 (SPA), TypeScript, Vite (build engine), Tailwind CSS.
* **Component Library**: Radix UI (accessible state primitives) combined with Tailwind animations.
* **Integrations**: Supabase JS, Socket.io-client, Lucide React (icons), Google Model Viewer (3D render).

* [src/components/dashboard/admin/](file:///d:/FPT/Ki%209/SEP490/SEP490-DATN-WEB/src/components/dashboard/admin): Admin panels (prompts, transactions, reports, user control).
* [src/components/dashboard/manager/](file:///d:/FPT/Ki%209/SEP490/SEP490-DATN-WEB/src/components/dashboard/manager): Manager features (shift rosters, 3D church viewer, mass schedules, nearby place moderation).
* [src/services/](file:///d:/FPT/Ki%209/SEP490/SEP490-DATN-WEB/src/services): API connector services (Axios client, endpoints mapping, WebSocket hooks).
* [src/contexts/](file:///d:/FPT/Ki%209/SEP490/SEP490-DATN-WEB/src/contexts): Global toast messaging and language states.

---

### 🛡️ CI/CD Pipeline (GitHub Actions)
The repository is protected by a continuous integration pipeline (`.github/workflows/ci.yml`) triggering on pushes to `main`, `master`, and `dev` branches:
* **Environment Setup**: Provisions `ubuntu-latest` running Node.js v20.
* **Sát hạch mã nguồn (Checks)**:
  * Installs dependencies via `npm ci`.
  * Runs static lint audits (`npm run lint`).
  * Runs TypeScript strict compilation and checks (`npm run typecheck`).
* **Bundle Build**: Runs Vite compilation bundle building (`npm run build`) to ensure build stability before deployments.

---

### ⚙️ Getting Started & Run

#### Prerequisites
* Node.js v18 or v20
* A running Backend API server

#### 1. Configure Environment variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

#### 2. Execute Local Server
```bash
# Install packages
npm install

# Start Vite hot-reload server
npm run dev

# Run linting
npm run lint

# Validate Typescript compile
npm run typecheck
```

---

## Tiếng Việt Version

> [!NOTE]
> ### 📖 Giới thiệu Dự án
> Đây là trang Quản trị Web (Web Management Portal) của hệ thống **Hành hương Công giáo** (Đồ án Tốt nghiệp SEP490 - DATN, Đại học FPT). Được xây dựng trên nền tảng React 18, TypeScript, Vite và Tailwind CSS, ứng dụng đóng vai trò là giao diện điều hành chính dành cho **Admin (Quản trị viên)** và **Site Manager (Quản lý địa điểm)**.

> [!IMPORTANT]
> ### 🛡️ Phân quyền Quản trị (RBAC)
> Trang web này được phân quyền nghiêm ngặt chỉ dành cho các vai trò quản trị viên:
> * **Site Manager (Quản lý địa điểm)**: Đại diện cho một Đền thánh, Giáo xứ hoặc Giáo họ cụ thể. Chịu trách nhiệm cập nhật thông tin nhà thờ, lên lịch giờ lễ, quản lý ca trực của Hướng dẫn viên địa phương, duyệt ảnh/video địa điểm, phản hồi nhận xét và đăng tải **Mô hình 3D Giáo đường** phục vụ tính năng thuyết minh ảo Audio Guide.
> * **Platform Admin (Quản trị viên hệ thống)**: Người điều hành tối cao toàn bộ nền tảng. Quản lý việc phê duyệt yêu cầu xác minh (duyệt địa điểm, duyệt quản lý/hướng dẫn viên), kiểm soát các chỉ số KPI tài chính, xử lý báo cáo vi phạm, quản trị các mẫu cấu hình lệnh Gemini AI, và kiểm duyệt các giao dịch ký quỹ của các chuyến đi.

---

### 🚀 Các Phân hệ Tính năng Chính

> [!TIP]
> ### 🎨 1. Phân hệ Quản lý Địa điểm (Site Manager Hub)
> * **My Site (Thông tin Địa điểm)**: Chỉnh sửa bài viết giới thiệu lịch sử giáo xứ, cập nhật tọa độ GPS bản đồ, địa chỉ, ảnh đại diện.
> * **Lịch trình giờ lễ & Sự kiện**: Quản lý lịch giờ giải tội, giờ dâng Lễ, các ngày lễ quan trọng và hoạt động cộng đồng.
> * **Duyệt đăng ký ca trực**: Quản lý lịch trực, duyệt hoặc từ chối các đề xuất ca trực của **Local Guide** đăng ký tại địa điểm.
> * **Đăng tải mô hình 3D**: Tải lên các file thiết kế 3D (định dạng GLB/GLTF) của Nhà thờ để hiển thị trực quan cho khách hành hương thông qua thư viện `@google/model-viewer`.

> [!CAUTION]
> ### 💳 2. Phân hệ Quản trị Toàn cục (Platform Admin Hub)
> * **Duyệt hồ sơ xác minh**: Xét duyệt kỹ lưỡng thông tin người dùng gửi yêu cầu làm Quản lý địa điểm hoặc Hướng dẫn viên.
> * **Kiểm toán Tài chính & KPIs**: Biểu đồ thống kê số lượng người dùng mới, hành trình đang thực hiện, dòng tiền và doanh thu nền tảng.
> * **Quản lý Ký quỹ & Rút tiền**: Xử lý các lệnh rút tiền từ ví của người dùng và quyết toán cọc các hành trình.
> * **Quản trị Prompt AI**: Tùy biến linh hoạt hệ thống câu lệnh (Prompts) gửi đến Google Gemini AI cho các tính năng gợi ý lộ trình, kinh nguyện.

> [!WARNING]
> ### 🚨 3. Trung tâm điều phối SOS khẩn cấp (Emergency Console)
> * **Giám sát SOS thời gian thực**: Bản đồ tương tác cập nhật liên tục vị trí phát tín hiệu SOS thông qua kết nối WebSocket (`socket.io-client`).
> * **Điều phối hướng dẫn viên**: Định vị ca trực hướng dẫn viên gần nhất và điều phối lực lượng hỗ trợ giáo dân nhanh nhất.

---

### 🛡️ Quy trình CI/CD tự động (GitHub Actions)
Repository được cấu hình quy trình tích hợp liên tục tự động (`.github/workflows/ci.yml`) kích hoạt khi có thao tác push/PR lên các nhánh `main`, `master` và `dev`:
* **Khởi tạo môi trường**: Sử dụng HĐH `ubuntu-latest` cài đặt sẵn Node.js v20.
* **Sát hạch mã nguồn tự động**:
  * Cài đặt thư viện sạch qua lệnh `npm ci`.
  * Quét lỗi cú pháp, chuẩn mã nguồn (`npm run lint`).
  * Kiểm tra lỗi biên dịch TypeScript nghiêm ngặt (`npm run typecheck`).
* **Đóng gói ứng dụng**: Biên dịch build dự án bằng Vite (`npm run build`) để đảm bảo mã nguồn sẵn sàng chạy thực tế không lỗi.

---

### ⚙️ Hướng dẫn Khởi chạy cục bộ

#### Yêu cầu cài đặt
* Node.js v18 hoặc v20
* Server Backend API đã được chạy

#### 1. Cấu hình Biến môi trường
Tạo file `.env` ở thư mục gốc dự án:
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

#### 2. Khởi động Client
```bash
# Cài đặt thư viện
npm install

# Khởi chạy Vite server
npm run dev

# Quét lỗi lint
npm run lint

# Sát hạch kiểu dữ liệu TypeScript
npm run typecheck
```

---
*Developed with ❤️ by Catholic Pilgrimage DATN Team @ FPT University.*
