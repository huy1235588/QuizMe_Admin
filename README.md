# 🎯 QuizMe Admin

> Hệ thống quản trị dành cho nền tảng Quiz trực tuyến QuizMe

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Ant Design](https://img.shields.io/badge/Ant_Design-5.24.8-blue?style=flat-square&logo=ant-design)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue?style=flat-square&logo=tailwindcss)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Documentation](#-api-documentation)
- [Đa ngôn ngữ](#-đa-ngôn-ngữ)
- [Deploy](#-deploy)
- [Đóng góp](#-đóng-góp)

## 🚀 Giới thiệu

QuizMe Admin là hệ thống quản trị dành cho nền tảng quiz trực tuyến, được xây dựng với Next.js 15 và React 19. Ứng dụng cung cấp giao diện quản lý toàn diện cho việc quản lý quiz, câu hỏi, người dùng và thống kê.

## ✨ Tính năng chính

### 🎮 Quản lý Quiz
- ✅ Tạo, chỉnh sửa và xóa quiz
- ✅ Quản lý câu hỏi cho từng quiz
- ✅ Phân loại quiz theo danh mục
- ✅ Thống kê hiệu suất quiz
- ✅ Quiz thịnh hành

### 👥 Quản lý Người dùng
- ✅ Xem danh sách người dùng
- ✅ Chỉnh sửa thông tin người dùng
- ✅ Thống kê người dùng hoạt động
- ✅ Top người dùng xuất sắc

### 📊 Dashboard & Thống kê
- ✅ Tổng quan hệ thống
- ✅ Biểu đồ thống kê tương tác
- ✅ Báo cáo chi tiết

### 🔐 Xác thực & Bảo mật
- ✅ Đăng nhập/Đăng xuất
- ✅ Quản lý phiên đăng nhập
- ✅ Protected routes
- ✅ Đồng bộ token

### 🌐 Đa ngôn ngữ
- ✅ Hỗ trợ Tiếng Việt và Tiếng Anh
- ✅ Chuyển đổi ngôn ngữ động

## 🛠 Công nghệ sử dụng

### Frontend Framework
- **Next.js 15.3.1** - React framework với App Router
- **React 19** - Thư viện UI component
- **TypeScript 5** - Type safety

### UI & Styling
- **Ant Design 5.24.8** - Component library
- **TailwindCSS 4** - Utility-first CSS framework
- **React Icons** - Icon library

### State Management & API
- **Axios 1.8.4** - HTTP client
- **React Context** - State management
- **Custom Hooks** - Logic encapsulation

### Charts & Visualization
- **ECharts 5.6.0** - Thư viện biểu đồ
- **Ant Design Charts** - Wrapper cho ECharts

### Internationalization
- **Next-intl 4.1.0** - Đa ngôn ngữ

### Developer Experience
- **Next.js Turbopack** - Fast bundler
- **ESLint** - Code linting

## 🔧 Cài đặt

### Yêu cầu hệ thống
- Node.js ≥ 18.0.0
- npm/yarn/pnpm/bun

### Cài đặt dependencies
```bash
# Sử dụng npm
npm install

# Hoặc yarn
yarn install

# Hoặc pnpm
pnpm install

# Hoặc bun
bun install
```

### Chạy development server
```bash
# Với Turbopack (khuyến nghị)
npm run dev

# Hoặc các package manager khác
yarn dev
pnpm dev
bun dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Build cho production
```bash
npm run build
npm run start
```

## 📁 Cấu trúc dự án

```
QuizMe_Admin/
├── 📂 docs/                    # Tài liệu API và hướng dẫn
│   ├── API_REQUEST_GUIDELINES.md
│   ├── QUIZ_API_EXAMPLES.md
│   └── USER_API_DOCUMENTATION.md
├── 📂 lang/                    # Files đa ngôn ngữ
│   ├── en.json                 # Tiếng Anh
│   └── vi.json                 # Tiếng Việt
├── 📂 public/                  # Static assets
├── 📂 src/
│   ├── 📂 api/                 # API helper classes
│   │   ├── authAPI.ts
│   │   ├── questionAPI.ts
│   │   ├── quizAPI.ts
│   │   └── userAPI.ts
│   ├── 📂 app/                 # Next.js App Router
│   │   ├── 📂 dashboard/       # Trang dashboard
│   │   ├── 📂 quizzes/         # Quản lý quiz
│   │   ├── 📂 users/           # Quản lý người dùng
│   │   ├── 📂 categories/      # Quản lý danh mục
│   │   └── 📂 login/           # Đăng nhập
│   ├── 📂 components/          # React components
│   │   ├── 📂 quizzes/         # Quiz components
│   │   └── 📂 users/           # User components
│   ├── 📂 contexts/            # React contexts
│   ├── 📂 hooks/               # Custom hooks
│   ├── 📂 services/            # API services
│   ├── 📂 types/               # TypeScript types
│   └── 📂 utils/               # Utility functions
├── 📄 next.config.ts           # Next.js configuration
├── 📄 tailwind.config.ts       # TailwindCSS configuration
└── 📄 tsconfig.json           # TypeScript configuration
```

## 📚 API Documentation

Dự án sử dụng kiến trúc layered để quản lý API:

### 🔧 API Layer Structure
```
api/ (Helper classes) → services/ (Core logic) → hooks/ (React integration) → components/ (UI)
```

### 📖 Chi tiết Documentation
- [API Request Guidelines](./docs/API_REQUEST_GUIDELINES.md) - Hướng dẫn tạo API requests
- [Quiz API Examples](./docs/QUIZ_API_EXAMPLES.md) - Ví dụ về Quiz API
- [User API Documentation](./docs/USER_API_DOCUMENTATION.md) - Tài liệu User API

### 🔑 Core Services
- **authService** - Xác thực và phân quyền
- **quizService** - Quản lý quiz và câu hỏi
- **userService** - Quản lý người dùng
- **categoryService** - Quản lý danh mục

## 🌐 Đa ngôn ngữ

Ứng dụng hỗ trợ đa ngôn ngữ với next-intl:

### Ngôn ngữ được hỗ trợ
- 🇺🇸 **English** (`en`)
- 🇻🇳 **Tiếng Việt** (`vi`)

### Cấu trúc translation files
```json
{
  "common": { /* Từ khóa chung */ },
  "navigation": { /* Menu điều hướng */ },
  "dashboard": { /* Trang dashboard */ },
  "quiz": { /* Quản lý quiz */ },
  "user": { /* Quản lý người dùng */ }
}
```

## 🎨 Theme & Styling

### Design System
- **Ant Design** - Component library chính
- **TailwindCSS** - Utility classes
- **Theme Context** - Quản lý theme động

### Color Palette
- Primary: Blue tones
- Success: Green tones  
- Warning: Orange tones
- Error: Red tones
